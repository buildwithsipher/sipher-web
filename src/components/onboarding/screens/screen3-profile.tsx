'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowLeft, Upload, Edit2, Linkedin, Link as LinkIcon } from 'lucide-react'
import { toast } from 'sonner'
import { SkipButton } from '../enhancements/skip-button'
import { MagneticButton } from '../enhancements/magnetic-button'
import { RippleEffect } from '../enhancements/ripple-effect'
import { triggerHaptic } from '../enhancements/haptic-feedback'
import { sanitizeName, sanitizeTagline, sanitizeText, sanitizeUrl } from '@/lib/sanitize-client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface OnboardingFormData {
  handle?: string
  name?: string
  startupName?: string
  startupStage?: string
  city?: string
  tagline?: string
  websiteUrl?: string
  linkedinUrl?: string
  profilePictureUrl?: string
  startupLogoUrl?: string
  defaultVisibility?: 'public' | 'community' | 'investor'
  [key: string]: unknown
}

interface Screen3Props {
  onNext: () => void
  onBack: () => void
  onSkip?: () => void
  formData: OnboardingFormData
  setFormData: (data: OnboardingFormData) => void
}

export function OnboardingScreen3({ onNext, onBack, onSkip, formData, setFormData }: Screen3Props) {
  const [localData, setLocalData] = useState(formData)
  const [uploading, setUploading] = useState<'profile' | 'logo' | null>(null)

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
    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image'
      toast.error(errorMessage)
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
                  <img
                    src={localData.profilePictureUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
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
                <img
                  src={localData.startupLogoUrl}
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Details */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div>
                <p className="text-xs text-white/40 mb-1">Name</p>
                <p className="text-white">{sanitizeName(localData.name || '') || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Startup</p>
                <p className="text-white">{sanitizeName(localData.startupName || '') || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Stage</p>
                <p className="text-white capitalize">
                  {sanitizeText(localData.startupStage || '') || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">City</p>
                <p className="text-white">{sanitizeText(localData.city || '') || '—'}</p>
              </div>
              {localData.tagline && (
                <div>
                  <p className="text-xs text-white/40 mb-1">Tagline</p>
                  <p className="text-white italic">{sanitizeTagline(localData.tagline || '')}</p>
                </div>
              )}
              {localData.linkedinUrl && (
                <div>
                  <p className="text-xs text-white/40 mb-1">LinkedIn</p>
                  <a
                    href={localData.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#7B5CFF] hover:text-[#9B7CFF] text-sm break-all"
                  >
                    {localData.linkedinUrl}
                  </a>
                </div>
              )}
              {localData.websiteUrl && (
                <div>
                  <p className="text-xs text-white/40 mb-1">Website</p>
                  <a
                    href={localData.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#7B5CFF] hover:text-[#9B7CFF] text-sm break-all"
                  >
                    {localData.websiteUrl}
                  </a>
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
            {/* Full Name */}
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={localData.name || ''}
                onChange={e => {
                  const sanitized = sanitizeName(e.target.value)
                  setLocalData({ ...localData, name: sanitized })
                }}
                placeholder="Full Name"
                maxLength={100}
                autoComplete="name"
                inputMode="text"
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#7B5CFF]/50 focus:ring-2 focus:ring-[#7B5CFF]/20 transition-all min-h-[44px] text-base"
              />
              <Edit2 className="w-4 h-4 text-white/40 flex-shrink-0" />
            </div>

            {/* Startup Name */}
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={localData.startupName || ''}
                onChange={e => {
                  const sanitized = sanitizeName(e.target.value)
                  setLocalData({ ...localData, startupName: sanitized })
                }}
                placeholder="Startup Name"
                maxLength={100}
                autoComplete="organization"
                inputMode="text"
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#7B5CFF]/50 focus:ring-2 focus:ring-[#7B5CFF]/20 transition-all min-h-[44px] text-base"
              />
              <Edit2 className="w-4 h-4 text-white/40 flex-shrink-0" />
            </div>

            {/* Startup Stage - Dropdown */}
            <div className="flex items-center gap-3">
              <Select
                value={localData.startupStage || ''}
                onValueChange={value => {
                  setLocalData({ ...localData, startupStage: value })
                }}
              >
                <SelectTrigger className="flex-1 min-h-[44px] bg-white/10 border-white/20 text-white focus:ring-2 focus:ring-[#7B5CFF]/20">
                  <SelectValue placeholder="Startup Stage" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10">
                  <SelectItem value="idea" className="text-white focus:bg-white/10">
                    Idea
                  </SelectItem>
                  <SelectItem value="mvp" className="text-white focus:bg-white/10">
                    MVP
                  </SelectItem>
                  <SelectItem value="launched" className="text-white focus:bg-white/10">
                    Live Product
                  </SelectItem>
                  <SelectItem value="revenue" className="text-white focus:bg-white/10">
                    Revenue
                  </SelectItem>
                  <SelectItem value="scaling" className="text-white focus:bg-white/10">
                    Scaling
                  </SelectItem>
                </SelectContent>
              </Select>
              <Edit2 className="w-4 h-4 text-white/40 flex-shrink-0" />
            </div>

            {/* City */}
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={localData.city || ''}
                onChange={e => {
                  const sanitized = sanitizeText(e.target.value, 100)
                  setLocalData({ ...localData, city: sanitized })
                }}
                placeholder="City"
                maxLength={100}
                autoComplete="address-level2"
                inputMode="text"
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#7B5CFF]/50 focus:ring-2 focus:ring-[#7B5CFF]/20 transition-all min-h-[44px] text-base"
              />
              <Edit2 className="w-4 h-4 text-white/40 flex-shrink-0" />
            </div>

            {/* Tagline */}
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={localData.tagline || ''}
                onChange={e => {
                  const sanitized = sanitizeTagline(e.target.value)
                  setLocalData({ ...localData, tagline: sanitized })
                }}
                placeholder="Tagline (Optional)"
                maxLength={200}
                inputMode="text"
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#7B5CFF]/50 focus:ring-2 focus:ring-[#7B5CFF]/20 transition-all min-h-[44px] text-base"
              />
              <Edit2 className="w-4 h-4 text-white/40 flex-shrink-0" />
            </div>

            {/* Optional URL Fields */}
            <div className="pt-2 space-y-3 border-t border-white/10">
              <p className="text-sm text-white/60 mb-2">Links (Optional):</p>

              <div className="flex items-center gap-3">
                <Linkedin className="w-4 h-4 text-white/40 flex-shrink-0" />
                <input
                  type="text"
                  value={localData.linkedinUrl || ''}
                  onChange={e => {
                    setLocalData({ ...localData, linkedinUrl: e.target.value.trim() })
                  }}
                  onBlur={e => {
                    const url = e.target.value.trim()
                    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
                      // Auto-add https:// if missing
                      const sanitized = sanitizeUrl(`https://${url}`) || url
                      setLocalData({ ...localData, linkedinUrl: sanitized || url })
                    } else if (url) {
                      const sanitized = sanitizeUrl(url) || url
                      setLocalData({ ...localData, linkedinUrl: sanitized || url })
                    }
                  }}
                  placeholder="linkedin.com/in/yourprofile"
                  autoComplete="url"
                  inputMode="url"
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#7B5CFF]/50 focus:ring-2 focus:ring-[#7B5CFF]/20 transition-all min-h-[44px] text-base"
                />
                {localData.linkedinUrl && (
                  <button
                    type="button"
                    onClick={() => setLocalData({ ...localData, linkedinUrl: '' })}
                    className="text-white/40 hover:text-white/60 transition-colors p-1 flex-shrink-0"
                    aria-label="Clear LinkedIn URL"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <LinkIcon className="w-4 h-4 text-white/40 flex-shrink-0" />
                <input
                  type="text"
                  value={localData.websiteUrl || ''}
                  onChange={e => {
                    setLocalData({ ...localData, websiteUrl: e.target.value.trim() })
                  }}
                  onBlur={e => {
                    const url = e.target.value.trim()
                    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
                      // Auto-add https:// if missing
                      const sanitized = sanitizeUrl(`https://${url}`) || url
                      setLocalData({ ...localData, websiteUrl: sanitized || url })
                    } else if (url) {
                      const sanitized = sanitizeUrl(url) || url
                      setLocalData({ ...localData, websiteUrl: sanitized || url })
                    }
                  }}
                  placeholder="yourproduct.com"
                  autoComplete="url"
                  inputMode="url"
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#7B5CFF]/50 focus:ring-2 focus:ring-[#7B5CFF]/20 transition-all min-h-[44px] text-base"
                />
                {localData.websiteUrl && (
                  <button
                    type="button"
                    onClick={() => setLocalData({ ...localData, websiteUrl: '' })}
                    className="text-white/40 hover:text-white/60 transition-colors p-1 flex-shrink-0"
                    aria-label="Clear Website URL"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

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
                  onChange={e => {
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
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload('logo', file)
                  }}
                  disabled={uploading === 'logo'}
                />
              </label>
            </div>
          </div>

          {/* Navigation - Hidden on mobile (using MobileBottomNav instead) */}
          <div className="hidden md:flex items-center justify-between gap-4 pt-4">
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
