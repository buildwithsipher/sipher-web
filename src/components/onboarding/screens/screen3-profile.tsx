'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowLeft, Upload, Edit2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { SkipButton } from '../enhancements/skip-button'
import { MagneticButton } from '../enhancements/magnetic-button'
import { RippleEffect } from '../enhancements/ripple-effect'
import { triggerHaptic } from '../enhancements/haptic-feedback'
import { sanitizeName, sanitizeTagline, sanitizeText } from '@/lib/sanitize-client'

interface Screen3Props {
  onNext: () => void
  onBack: () => void
  onSkip?: () => void
  formData: any
  setFormData: (data: any) => void
}

export function OnboardingScreen3({ onNext, onBack, onSkip, formData, setFormData }: Screen3Props) {
  const [localData, setLocalData] = useState(formData)
  const [uploading, setUploading] = useState<'profile' | 'logo' | null>(null)
  const supabase = createClient()

  const handleFileUpload = async (type: 'profile' | 'logo', file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    setUploading(type)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const response = await fetch('/api/waitlist/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const { url } = await response.json()
      
      if (type === 'profile') {
        setLocalData({ ...localData, profilePictureUrl: url })
      } else {
        setLocalData({ ...localData, startupLogoUrl: url })
      }

      toast.success('Image uploaded successfully')
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Failed to upload image')
    } finally {
      setUploading(null)
    }
  }

  const handleContinue = () => {
    triggerHaptic('success')
    setFormData(localData)
    onNext()
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen flex items-center justify-center px-4 py-20 relative z-10"
    >
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8">
        {/* Left: Preview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-8 space-y-6"
        >
          <h3 className="text-xl font-semibold text-white mb-6">Live Preview</h3>
          
          <div className="space-y-6">
            {/* Profile Picture */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                {localData.profilePictureUrl ? (
                  <img src={localData.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#7B5CFF]/20" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{localData.name || 'Your Name'}</p>
                <p className="text-white/60 text-sm">{localData.startupName || 'Your Startup'}</p>
              </div>
            </div>

            {/* Startup Logo */}
            {localData.startupLogoUrl && (
              <div className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 overflow-hidden">
                <img src={localData.startupLogoUrl} alt="Logo" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Details */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div>
                <p className="text-xs text-white/40 mb-1">Name</p>
                <p className="text-white">{sanitizeName(localData.name) || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Startup</p>
                <p className="text-white">{sanitizeName(localData.startupName) || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Stage</p>
                <p className="text-white capitalize">{sanitizeText(localData.startupStage || '') || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">City</p>
                <p className="text-white">{sanitizeText(localData.city || '') || '—'}</p>
              </div>
              {localData.tagline && (
                <div>
                  <p className="text-xs text-white/40 mb-1">Tagline</p>
                  <p className="text-white italic">{sanitizeTagline(localData.tagline)}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right: Edit Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="space-y-3">
            <h2 className="text-4xl font-light text-white">Quick Profile Review</h2>
            <p className="text-white/60">Everything looks good? You can update it later.</p>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-4">
            {[
              { key: 'name', label: 'Full Name', value: localData.name, maxLength: 100, sanitize: sanitizeName },
              { key: 'startupName', label: 'Startup Name', value: localData.startupName, maxLength: 100, sanitize: sanitizeName },
              { key: 'startupStage', label: 'Stage', value: localData.startupStage, maxLength: 50, sanitize: sanitizeText },
              { key: 'city', label: 'City', value: localData.city, maxLength: 100, sanitize: sanitizeText },
              { key: 'tagline', label: 'Tagline', value: localData.tagline, maxLength: 200, sanitize: sanitizeTagline },
            ].map((field) => (
              <div key={field.key} className="flex items-center gap-3">
                <input
                  type="text"
                  value={field.value || ''}
                  onChange={(e) => {
                    const sanitized = field.sanitize 
                      ? field.sanitize(e.target.value, field.maxLength)
                      : e.target.value
                    setLocalData({ ...localData, [field.key]: sanitized })
                  }}
                  placeholder={field.label}
                  maxLength={field.maxLength}
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#7B5CFF]/50 focus:ring-2 focus:ring-[#7B5CFF]/20 transition-all min-h-[44px]"
                />
                <Edit2 className="w-4 h-4 text-white/40" />
              </div>
            ))}

            {/* Optional Uploads */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <p className="text-sm text-white/60 mb-3">Optional:</p>
              
              <label className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                <Upload className="w-5 h-5 text-white/60" />
                <span className="text-white/80 flex-1">Upload Founder Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload('profile', file)
                  }}
                  disabled={uploading === 'profile'}
                />
              </label>

              <label className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                <Upload className="w-5 h-5 text-white/60" />
                <span className="text-white/80 flex-1">Upload Startup Logo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload('logo', file)
                  }}
                  disabled={uploading === 'logo'}
                />
              </label>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4 pt-4">
            <button
              onClick={() => {
                triggerHaptic('light')
                onBack()
              }}
              className="flex items-center gap-2 px-6 py-3 text-white/60 hover:text-white transition-colors min-h-[44px]"
              aria-label="Go back to previous screen"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className="flex items-center gap-3">
              {onSkip && (
                <SkipButton
                  onSkip={() => {
                    setFormData(localData)
                    onSkip()
                  }}
                  label="Skip images"
                />
              )}

              <RippleEffect>
                <MagneticButton
                  onClick={handleContinue}
                  className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#7B5CFF] to-[#4AA8FF] text-white rounded-xl font-semibold hover:shadow-[0_0_30px_rgba(123,92,255,0.4)] transition-all duration-300 min-h-[44px]"
                >
                  Looks Good
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </MagneticButton>
              </RippleEffect>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

