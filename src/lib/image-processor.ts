import sharp from 'sharp'

export interface ProcessImageOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'jpeg' | 'png' | 'webp'
}

/**
 * Process and optimize image
 * Resizes if needed, optimizes quality, and converts format if necessary
 */
export async function processImage(
  buffer: Buffer,
  options: ProcessImageOptions = {}
): Promise<Buffer> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 85,
    format = 'webp', // WebP is more efficient
  } = options

  try {
    const image = sharp(buffer)
    const metadata = await image.metadata()

    // Determine if resize is needed
    const needsResize = 
      (metadata.width && metadata.width > maxWidth) ||
      (metadata.height && metadata.height > maxHeight)

    let processed = image

    if (needsResize) {
      processed = processed.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
    }

    // Convert and optimize based on format
    switch (format) {
      case 'webp':
        processed = processed.webp({ quality })
        break
      case 'jpeg':
        processed = processed.jpeg({ quality, mozjpeg: true })
        break
      case 'png':
        processed = processed.png({ quality, compressionLevel: 9 })
        break
    }

    return await processed.toBuffer()
  } catch (error) {
    console.error('Image processing error:', error)
    throw new Error('Failed to process image')
  }
}

/**
 * Get optimal format based on original image
 */
export function getOptimalFormat(originalFormat?: string): 'jpeg' | 'png' | 'webp' {
  if (originalFormat === 'png') {
    return 'png' // Keep PNG for transparency
  }
  return 'webp' // Use WebP for better compression
}

