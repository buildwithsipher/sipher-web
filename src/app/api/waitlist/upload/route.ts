import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { processImage, getOptimalFormat } from '@/lib/image-processor'
import { scanFile } from '@/lib/virus-scan'
import { logError, logWarn } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Rate limiting: Max 10 uploads per user per hour
    const rateLimit = checkRateLimit(user.id, 10, 60 * 60 * 1000) // 10 requests per hour
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
          },
        }
      )
    }

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'profile' or 'logo'
    const userId = formData.get('userId') as string

    if (!file || !type || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate type parameter (security: prevent path manipulation)
    if (type !== 'profile' && type !== 'logo') {
      return NextResponse.json(
        { error: 'Invalid upload type' },
        { status: 400 }
      )
    }

    // Validate userId is a valid UUID format (security: prevent path manipulation)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      )
    }

    // Verify user owns this profile (before processing)
    const { data: waitlistUser } = await supabase
      .from('waitlist_users')
      .select('email')
      .eq('id', userId)
      .single()

    if (!waitlistUser || waitlistUser.email !== user.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Validate file type (MIME type)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      )
    }

    // Validate file extension (security: whitelist approach)
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp']
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    if (!fileExt || !allowedExtensions.includes(fileExt)) {
      return NextResponse.json(
        { error: 'Invalid file extension. Only .jpg, .jpeg, .png, and .webp are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Validate file is not empty
    if (file.size === 0) {
      return NextResponse.json(
        { error: 'File is empty' },
        { status: 400 }
      )
    }

    // Basic image validation: Check file magic bytes (first few bytes)
    // This helps prevent MIME type spoofing
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer.slice(0, 12))
    
    // JPEG: FF D8 FF
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    // WebP: RIFF ... WEBP
    const isJPEG = uint8Array[0] === 0xFF && uint8Array[1] === 0xD8 && uint8Array[2] === 0xFF
    const isPNG = uint8Array[0] === 0x89 && uint8Array[1] === 0x50 && uint8Array[2] === 0x4E && uint8Array[3] === 0x47
    const isWebP = uint8Array[0] === 0x52 && uint8Array[1] === 0x49 && uint8Array[2] === 0x46 && uint8Array[3] === 0x46 &&
                   uint8Array[8] === 0x57 && uint8Array[9] === 0x45 && uint8Array[10] === 0x42 && uint8Array[11] === 0x50

    if (!isJPEG && !isPNG && !isWebP) {
      return NextResponse.json(
        { error: 'File is not a valid image. Only JPEG, PNG, and WebP images are allowed.' },
        { status: 400 }
      )
    }

    // Virus scanning
    const scanResult = await scanFile(arrayBuffer, file.type)
    if (!scanResult.safe) {
      logWarn('Virus scan failed', {
        userId: user.id,
        threat: scanResult.threat,
        action: 'file_upload_scan',
      })
      return NextResponse.json(
        { error: 'File failed security scan. Please upload a different image.' },
        { status: 400 }
      )
    }

    // Image processing: Resize and optimize
    let processedBuffer: Buffer | null = null
    let finalExt = fileExt
    let optimalFormat: 'jpeg' | 'png' | 'webp' = isPNG ? 'png' : isJPEG ? 'jpeg' : 'webp'

    try {
      const imageBuffer = Buffer.from(arrayBuffer)
      
      // Determine optimal format
      optimalFormat = getOptimalFormat(
        isPNG ? 'png' : isJPEG ? 'jpeg' : 'webp'
      )

      // Process image based on type
      if (type === 'profile') {
        // Profile pictures: 400x400 max, square
        processedBuffer = await processImage(imageBuffer, {
          maxWidth: 400,
          maxHeight: 400,
          quality: 90,
          format: optimalFormat,
        })
      } else {
        // Startup logos: 256x256 max, square
        processedBuffer = await processImage(imageBuffer, {
          maxWidth: 256,
          maxHeight: 256,
          quality: 85,
          format: optimalFormat,
        })
      }

      // Update file extension based on processed format
      finalExt = optimalFormat === 'webp' ? 'webp' : optimalFormat === 'png' ? 'png' : 'jpg'
    } catch (processingError) {
      logError('Image processing failed', processingError, {
        userId: user.id,
        type,
        action: 'image_processing',
      })
      // Continue with original file if processing fails
      processedBuffer = null
    }

    // Create file path
    const fileName = `${type}-${userId}-${Date.now()}.${finalExt}`
    const filePath = `waitlist/${type}s/${fileName}`

    // Upload to Supabase Storage (processed or original)
    const fileToUpload = processedBuffer || file
    const uploadOptions: any = {
      cacheControl: '3600',
      upsert: false,
    }

    if (processedBuffer) {
      uploadOptions.contentType = `image/${optimalFormat}`
    }

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('waitlist-assets')
      .upload(filePath, fileToUpload, uploadOptions)

    if (uploadError) {
      logError('File upload failed', uploadError, {
        userId: user.id,
        type,
        action: 'file_upload',
      })
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('waitlist-assets')
      .getPublicUrl(filePath)

    const publicUrl = urlData.publicUrl

    // Update database with new URL
    const adminSupabase = createAdminClient()
    const updateField = type === 'profile' ? 'profile_picture_url' : 'startup_logo_url'
    
    // Get old file URL before updating
    const { data: oldUser } = await adminSupabase
      .from('waitlist_users')
      .select(`${updateField}`)
      .eq('id', userId)
      .single()

    // Update database first
    const { error: updateError } = await adminSupabase
      .from('waitlist_users')
      .update({ [updateField]: publicUrl })
      .eq('id', userId)

    // Delete old file if exists (after successful update)
    if (!updateError && oldUser?.[updateField as keyof typeof oldUser]) {
      const oldUrl = oldUser[updateField as keyof typeof oldUser] as string
      if (oldUrl && oldUrl.includes('waitlist-assets')) {
        // Extract file path from URL
        const urlParts = oldUrl.split('/')
        const fileIndex = urlParts.findIndex(part => part === 'waitlist-assets')
        if (fileIndex !== -1) {
          const oldFilePath = urlParts.slice(fileIndex + 1).join('/')
          // Try to delete, but don't fail if it doesn't exist
          await supabase.storage
            .from('waitlist-assets')
            .remove([oldFilePath])
            .catch(() => {
              // Ignore errors - file might already be deleted
            })
        }
      }
    }

    if (updateError) {
      logError('Profile update failed', updateError, {
        userId: user.id,
        type,
        action: 'profile_update',
      })
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      url: publicUrl,
      optimized: processedBuffer !== null,
      originalSize: file.size,
      processedSize: processedBuffer?.length || file.size,
    })
  } catch (error) {
    logError('Unexpected upload error', error, {
      action: 'file_upload_unexpected',
    })
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
