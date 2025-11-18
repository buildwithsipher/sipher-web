'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Check } from 'lucide-react'

interface Screen4Props {
  onNext: () => void
  onBack: () => void
  data: {
    name: string
    startupName: string
    city: string
  }
  setData: (data: any) => void
}

const TOP_CITIES = [
  'Mumbai', 'Bangalore', 'Delhi', 'Hyderabad', 'Chennai',
  'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat',
  'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Other'
]

export function OnboardingScreen4({ onNext, onBack, data, setData }: Screen4Props) {
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false)
      }
    }

    if (showCityDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCityDropdown])

  const canProceed = data.name.trim() !== '' && data.startupName.trim() !== '' && data.city !== ''

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex-1 flex flex-col items-center justify-center px-4 py-20"
    >
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center space-y-2"
        >
          <h2 className="text-2xl md:text-3xl font-light text-white">
            Last step, we'll personalize your profile
          </h2>
        </motion.div>

        {/* Form Fields */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-6"
        >
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm text-white/60">Your name</label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              placeholder="Srideep Goud"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
            />
          </div>

          {/* Startup Name */}
          <div className="space-y-2">
            <label className="text-sm text-white/60">Your startup name</label>
            <input
              type="text"
              value={data.startupName}
              onChange={(e) => setData({ ...data, startupName: e.target.value })}
              placeholder="Sipher"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
            />
          </div>

          {/* City Dropdown */}
          <div className="space-y-2">
            <label className="text-sm text-white/60">City (quick select)</label>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowCityDropdown(!showCityDropdown)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white flex items-center justify-between hover:bg-white/10 transition-all"
              >
                <span className={data.city ? 'text-white' : 'text-white/30'}>
                  {data.city || 'Select city'}
                </span>
                <span className="text-white/40">▼</span>
              </button>
              {showCityDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute z-10 w-full mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden shadow-2xl max-h-60 overflow-y-auto"
                >
                  {TOP_CITIES.map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setData({ ...data, city })
                        setShowCityDropdown(false)
                      }}
                      className="w-full px-4 py-3 text-left text-white hover:bg-white/5 transition-colors flex items-center justify-between"
                    >
                      {city}
                      {data.city === city && <Check className="w-4 h-4 text-purple-500" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex items-center justify-between pt-4"
        >
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={onNext}
            disabled={!canProceed}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              canProceed
                ? 'bg-purple-500 text-white hover:bg-purple-600 hover:scale-105'
                : 'bg-white/5 text-white/30 cursor-not-allowed'
            }`}
          >
            Finish
            <Check className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}

