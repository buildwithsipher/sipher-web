'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LogOut,
  Edit2,
  Check,
  X,
  TrendingUp,
  Users,
  Calendar,
  Sparkles,
  Activity,
  MapPin,
  Briefcase,
  Link as LinkIcon,
  Linkedin,
  CheckCircle2,
  Target,
  Zap,
  Award,
  ArrowRight,
  ChevronRight,
  Clock,
  Upload,
  Plus,
  Image as ImageIcon,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Logo } from '@/components/shared/logo'
import { toast } from 'sonner'
import { format, formatDistanceToNow } from 'date-fns'

interface WaitlistUser {
  id: string
  email: string
  name: string
  startup_name: string | null
  startup_stage: string | null
  linkedin_url: string | null
  city: string | null
  what_building: string | null
  website_url: string | null
  profile_picture_url: string | null
  startup_logo_url: string | null
  status: string
  referral_code: string
  created_at: string
}

interface LiveActivity {
  id: string
  action: string
  city: string | null
  timestamp: string
}

export default function WaitlistDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [waitlistData, setWaitlistData] = useState<WaitlistUser | null>(null)
  const [position, setPosition] = useState<number>(0)
  const [displayedPosition, setDisplayedPosition] = useState<number>(0)
  const [totalUsers, setTotalUsers] = useState<number>(0)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [liveActivities, setLiveActivities] = useState<LiveActivity[]>([])
  const [communityStats, setCommunityStats] = useState({
    totalFounders: 0,
    cities: 0,
    avgStage: '',
  })
  const [editForm, setEditForm] = useState({
    name: '',
    startup_name: '',
    startup_stage: '',
    city: '',
    what_building: '',
    website_url: '',
    linkedin_url: '',
  })
  const [expandedRoadmap, setExpandedRoadmap] = useState<string[]>([])
  const [uploading, setUploading] = useState<'profile' | 'logo' | null>(null)

  useEffect(() => {
    fetchUserData()
    fetchLiveActivities()
    fetchCommunityStats()

    // Poll for live activities updates every 30 seconds
    const interval = setInterval(() => {
      fetchLiveActivities()
    }, 30000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  async function fetchUserData() {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/')
      return
    }

    setUser(user)

    // Fetch waitlist data
    const { data: waitlistUser, error } = await supabase
      .from('waitlist_users')
      .select('*')
      .eq('email', user.email)
      .single()

    if (error) {
      console.error('Waitlist fetch error:', error)
      toast.error(error.message || 'Failed to load your data')
      return
    }

    if (!waitlistUser) {
      toast.error('Waitlist entry not found')
      return
    }

    setWaitlistData(waitlistUser)
    setEditForm({
      name: waitlistUser.name || '',
      startup_name: waitlistUser.startup_name || '',
      startup_stage: waitlistUser.startup_stage || '',
      city: waitlistUser.city || '',
      what_building: waitlistUser.what_building || '',
      website_url: waitlistUser.website_url || '',
      linkedin_url: waitlistUser.linkedin_url || '',
    })

    // Calculate position using API route (bypasses RLS)
    try {
      const positionResponse = await fetch('/api/waitlist/position')
      if (positionResponse.ok) {
        const { position: actualPos, displayedPosition: displayPos } = await positionResponse.json()
        setPosition(actualPos)
        setDisplayedPosition(displayPos)
      } else {
        console.error('Failed to fetch position')
      }
    } catch (positionError) {
      console.error('Position calculation error:', positionError)
    }

    // Get total count
    const { count } = await supabase
      .from('waitlist_users')
      .select('*', { count: 'exact', head: true })

    setTotalUsers(count || 0)
  }

  async function fetchLiveActivities() {
    try {
      // Use API route with admin client to bypass RLS and fetch all users
      const response = await fetch('/api/waitlist/activities')
      
      if (!response.ok) {
        console.error('Failed to fetch activities')
        setLiveActivities([])
        return
      }

      const { activities } = await response.json()
      setLiveActivities(activities || [])
    } catch (error) {
      console.error('Live activities error:', error)
      setLiveActivities([])
    }
  }

  async function fetchCommunityStats() {
    const supabase = createClient()

    const { count, error: countError } = await supabase
      .from('waitlist_users')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('Community stats error:', countError)
      setCommunityStats({
        totalFounders: 0,
        cities: 0,
        avgStage: 'MVP',
      })
      return
    }

    const { data: cities, error: citiesError } = await supabase
      .from('waitlist_users')
      .select('city')
      .not('city', 'is', null)

    const uniqueCities = new Set(
      cities && !citiesError
        ? cities.map((c) => c.city).filter(Boolean)
        : []
    )

    setCommunityStats({
      totalFounders: count || 0,
      cities: uniqueCities.size || 0,
      avgStage: 'MVP',
    })
  }

  async function handleSaveProfile() {
    try {
      const response = await fetch('/api/waitlist/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editForm.name,
          startup_name: editForm.startup_name,
          startup_stage: editForm.startup_stage,
          city: editForm.city,
          what_building: editForm.what_building || null,
          website_url: editForm.website_url || null,
          linkedin_url: editForm.linkedin_url || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          toast.error(`Too many update attempts. Please wait ${Math.ceil(data.retryAfter / 60)} minutes.`)
        } else if (response.status === 400 && data.details) {
          const firstError = data.details[0]
          toast.error(firstError?.message || 'Validation failed')
        } else {
          toast.error(data.error || 'Failed to update profile')
        }
        return
      }

      toast.success('Profile updated!')
      setIsSheetOpen(false)
      fetchUserData()
    } catch (error: any) {
      console.error('Profile update error:', error)
      toast.error('Failed to update profile. Please try again.')
    }
  }

  async function handleFileUpload(type: 'profile' | 'logo', file: File) {
    if (!waitlistData) return

    setUploading(type)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      formData.append('userId', waitlistData.id)

      const response = await fetch('/api/waitlist/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const { error } = await response.json()
        throw new Error(error || 'Upload failed')
      }

      const { url } = await response.json()
      
      // Update local state immediately
      setWaitlistData({
        ...waitlistData,
        [type === 'profile' ? 'profile_picture_url' : 'startup_logo_url']: url,
      })

      toast.success(
        type === 'profile'
          ? 'Nice. Your profile looks more founder-ready now.'
          : 'Great — your startup page will look better in beta.'
      )

      // Refresh data
      fetchUserData()
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Failed to upload image')
      
      // Send to Sentry for monitoring
      if (typeof window !== 'undefined') {
        import('@sentry/nextjs').then((Sentry) => {
          Sentry.captureException(error, {
            tags: {
              errorType: 'file_upload_error',
              uploadType: type,
            },
            extra: {
              userId: waitlistData.id,
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
            },
          })
        }).catch(() => {
          // Silently fail if Sentry is not available
        })
      }
    } finally {
      setUploading(null)
    }
  }

  // Calculate profile completeness
  function calculateCompleteness() {
    if (!waitlistData) return 0

    let score = 0
    const fields = [
      waitlistData.name,
      waitlistData.startup_name,
      waitlistData.startup_stage,
      waitlistData.city,
      waitlistData.what_building,
      waitlistData.profile_picture_url,
      waitlistData.startup_logo_url,
      waitlistData.website_url,
      waitlistData.linkedin_url,
    ]

    fields.forEach((field) => {
      if (field) score += 1
    })

    return Math.round((score / fields.length) * 100)
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  if (!waitlistData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0B0F]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#7F5BFF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#A0A0A8]">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Launch date is one week from now
  const oneWeekFromNow = new Date()
  oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7)
  const launchDateFormatted = format(oneWeekFromNow, 'MMMM d, yyyy')
  const daysUntilLaunch = Math.ceil(
    (oneWeekFromNow.getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  )

  // Get first name for greeting
  const firstName = waitlistData.name?.split(' ')[0] || 'Founder'

  // Review progress steps
  const reviewSteps = [
    {
      id: 'submitted',
      label: 'Profile Submitted',
      status: 'completed',
      description: 'Completed',
    },
    {
      id: 'review',
      label: 'Under Review',
      status: waitlistData.status === 'pending' ? 'active' : 'completed',
      description: 'In Queue',
    },
    {
      id: 'approved',
      label: 'Approved',
      status: waitlistData.status === 'approved' ? 'active' : waitlistData.status === 'activated' ? 'completed' : 'pending',
      description: 'Awaiting activation',
    },
    {
      id: 'access',
      label: 'Early Access',
      status: waitlistData.status === 'activated' ? 'active' : 'pending',
      description: "You'll receive an email",
    },
  ]

  const roadmapItems = [
    {
      id: 'beta',
      title: 'Private Beta',
      date: 'Nov 2025',
      features: ['BuilderLog', 'ProofCard', 'Analytics'],
    },
    {
      id: 'community',
      title: 'Community Drop',
      date: 'Dec 2025',
      features: ['Playbooks', 'Circles', 'Resources'],
    },
    {
      id: 'investor',
      title: 'Investor Access',
      date: 'Jan 2026',
      features: ['VC Search', 'Intros', 'Discovery Engine'],
    },
  ]

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0B0B0F]/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Logo size="small" animated={false} />
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{waitlistData.name}</p>
                <p className="text-xs text-[#A0A0A8]">{waitlistData.email}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="hover:bg-red-500/10 hover:text-red-400"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-16 max-w-6xl">
        {/* 1. Header Section (Hero Dashboard Header) */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-16"
        >
          <div className="relative">
            {/* Glowing asterisk background */}
            <div className="absolute -top-8 -left-8 w-32 h-32 text-[#7F5BFF]/20 blur-3xl">
              <Sparkles className="w-full h-full" />
            </div>

            <div className="relative bg-[rgba(255,255,255,0.04)] border border-white/10 rounded-[20px] p-8 backdrop-blur-xl">
              <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-semibold mb-2 text-white">
                    ✦ You're Early, {firstName}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap mb-6">
                {/* Position Badge */}
                <div className="px-4 py-2 bg-gradient-to-r from-indigo-500/20 to-[#7F5BFF]/20 border border-[#7F5BFF]/30 rounded-full">
                  <span className="text-sm font-medium text-white">
                    Position #{displayedPosition}
                  </span>
                </div>

                {/* Status Badge */}
                <div className="px-4 py-2 bg-[rgba(255,255,255,0.04)] border border-white/10 rounded-full flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    waitlistData.status === 'pending' ? 'bg-orange-400 animate-pulse' :
                    waitlistData.status === 'approved' ? 'bg-blue-400' :
                    'bg-green-400'
                  }`} />
                  <span className="text-sm font-medium text-white capitalize">
                    {waitlistData.status}
                  </span>
                </div>
              </div>

              {/* Countdown Card */}
              <div className="bg-gradient-to-br from-indigo-500/10 via-[#7F5BFF]/10 to-transparent border border-[#7F5BFF]/20 rounded-[20px] p-6 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-[#7F5BFF]" />
                  <h3 className="text-lg font-semibold text-white">
                    Private Beta Access Opens In: {daysUntilLaunch} days
                  </h3>
                </div>
                <p className="text-sm text-[#A0A0A8]">
                  {launchDateFormatted}
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 2. Profile Card */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-16"
        >
          <div className="bg-[rgba(255,255,255,0.04)] border border-white/10 rounded-[20px] p-8 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">▌ Profile</h2>
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-[#A0A0A8] hover:text-white"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit →
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="text-2xl font-semibold mb-2">Edit Profile</SheetTitle>
                    <SheetDescription>
                      Update your information. Changes are saved automatically.
                    </SheetDescription>
                  </SheetHeader>

                  <div className="mt-8 space-y-6">
                    {/* Founder Photo Upload */}
                    <div className="space-y-2">
                      <Label className="text-sm text-[#A0A0A8]">Founder Photo</Label>
                      <div className="flex items-center gap-4">
                        {waitlistData?.profile_picture_url ? (
                          <img
                            src={waitlistData.profile_picture_url}
                            alt="Profile"
                            className="w-16 h-16 rounded-full object-cover border-2 border-[#7F5BFF]/30"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 bg-[rgba(255,255,255,0.02)] flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-white/40" />
                          </div>
                        )}
                        <label
                          htmlFor="profile-upload-drawer"
                          className="flex-1 cursor-pointer"
                          onClick={(e) => {
                            if (uploading === 'profile') {
                              e.preventDefault()
                              return
                            }
                          }}
                        >
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full gap-2 border-white/10 hover:border-[#7F5BFF]/40"
                            disabled={uploading === 'profile'}
                            onMouseDown={(e) => {
                              // Prevent button from preventing label click
                              e.preventDefault()
                            }}
                          >
                            {uploading === 'profile' ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4" />
                                {waitlistData?.profile_picture_url ? 'Change Photo' : 'Upload Photo'}
                              </>
                            )}
                          </Button>
                        </label>
                        <input
                          id="profile-upload-drawer"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleFileUpload('profile', file)
                            // Reset input to allow re-uploading the same file
                            e.target.value = ''
                          }}
                          disabled={uploading === 'profile'}
                        />
                      </div>
                      <p className="text-xs text-[#A0A0A8]">Add your vibe – optional</p>
                    </div>

                    {/* Startup Logo Upload */}
                    <div className="space-y-2">
                      <Label className="text-sm text-[#A0A0A8]">Startup Logo</Label>
                      <div className="flex items-center gap-4">
                        {waitlistData?.startup_logo_url ? (
                          <img
                            src={waitlistData.startup_logo_url}
                            alt="Logo"
                            className="w-16 h-16 rounded-xl object-cover border border-white/10 bg-[rgba(255,255,255,0.02)]"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl border-2 border-dashed border-white/20 bg-[rgba(255,255,255,0.02)] flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-white/40" />
                          </div>
                        )}
                        <label
                          htmlFor="logo-upload-drawer"
                          className="flex-1 cursor-pointer"
                          onClick={(e) => {
                            if (uploading === 'logo') {
                              e.preventDefault()
                              return
                            }
                          }}
                        >
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full gap-2 border-white/10 hover:border-[#7F5BFF]/40"
                            disabled={uploading === 'logo'}
                            onMouseDown={(e) => {
                              // Prevent button from preventing label click
                              e.preventDefault()
                            }}
                          >
                            {uploading === 'logo' ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4" />
                                {waitlistData?.startup_logo_url ? 'Change Logo' : 'Upload Logo'}
                              </>
                            )}
                          </Button>
                        </label>
                        <input
                          id="logo-upload-drawer"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleFileUpload('logo', file)
                            // Reset input to allow re-uploading the same file
                            e.target.value = ''
                          }}
                          disabled={uploading === 'logo'}
                        />
                      </div>
                      <p className="text-xs text-[#A0A0A8]">Add your startup logo – optional</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm text-[#A0A0A8]">Full Name</Label>
                      <Input
                        id="name"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="bg-[rgba(255,255,255,0.04)] border-white/10 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="startup_name" className="text-sm text-[#A0A0A8]">Startup</Label>
                      <Input
                        id="startup_name"
                        value={editForm.startup_name}
                        onChange={(e) => setEditForm({ ...editForm, startup_name: e.target.value })}
                        className="bg-[rgba(255,255,255,0.04)] border-white/10 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="startup_stage" className="text-sm text-[#A0A0A8]">Stage</Label>
                      <Select
                        value={editForm.startup_stage}
                        onValueChange={(value) => setEditForm({ ...editForm, startup_stage: value })}
                      >
                        <SelectTrigger className="bg-[rgba(255,255,255,0.04)] border-white/10 text-white">
                          <SelectValue placeholder="Select stage" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="idea">Idea</SelectItem>
                          <SelectItem value="mvp">MVP</SelectItem>
                          <SelectItem value="launched">Launched</SelectItem>
                          <SelectItem value="revenue">Revenue</SelectItem>
                          <SelectItem value="scaling">Scaling</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-sm text-[#A0A0A8]">City</Label>
                      <Input
                        id="city"
                        value={editForm.city}
                        onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                        className="bg-[rgba(255,255,255,0.04)] border-white/10 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="what_building" className="text-sm text-[#A0A0A8]">Category</Label>
                      <Input
                        id="what_building"
                        value={editForm.what_building}
                        onChange={(e) => setEditForm({ ...editForm, what_building: e.target.value })}
                        className="bg-[rgba(255,255,255,0.04)] border-white/10 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website_url" className="text-sm text-[#A0A0A8]">Website</Label>
                      <Input
                        id="website_url"
                        value={editForm.website_url}
                        onChange={(e) => setEditForm({ ...editForm, website_url: e.target.value })}
                        type="url"
                        className="bg-[rgba(255,255,255,0.04)] border-white/10 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="linkedin_url" className="text-sm text-[#A0A0A8]">LinkedIn</Label>
                      <Input
                        id="linkedin_url"
                        value={editForm.linkedin_url}
                        onChange={(e) => setEditForm({ ...editForm, linkedin_url: e.target.value })}
                        type="url"
                        className="bg-[rgba(255,255,255,0.04)] border-white/10 text-white"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="ghost"
                        onClick={() => setIsSheetOpen(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveProfile}
                        className="flex-1 bg-[#7F5BFF] hover:bg-[#7F5BFF]/90"
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Founder Avatar + Name */}
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/5">
              <div className="relative">
                <label
                  htmlFor="profile-upload"
                  className="cursor-pointer group"
                  title="Add your vibe – optional"
                >
                  {waitlistData.profile_picture_url ? (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="relative"
                    >
                      <img
                        src={waitlistData.profile_picture_url}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-2 border-[#7F5BFF]/30 shadow-lg shadow-[#7F5BFF]/20"
                      />
                      {uploading === 'profile' && (
                        <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-[#0B0B0F]">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    </motion.div>
                  ) : (
                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-white/20 bg-[rgba(255,255,255,0.02)] flex items-center justify-center group-hover:border-[#7F5BFF]/40 transition-colors">
                      {uploading === 'profile' ? (
                        <div className="w-6 h-6 border-2 border-[#7F5BFF] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Plus className="w-8 h-8 text-white/40 group-hover:text-[#7F5BFF] transition-colors" />
                      )}
                    </div>
                  )}
                </label>
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload('profile', file)
                    // Reset input to allow re-uploading the same file
                    e.target.value = ''
                  }}
                  disabled={uploading === 'profile'}
                />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-1">
                  {waitlistData.name || 'Founder'}
                </h3>
                <p className="text-sm text-[#A0A0A8] mb-3">Founder</p>
                {/* Profile Completeness */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#A0A0A8]">Profile Completeness:</span>
                  <span className="text-xs font-medium text-white">{calculateCompleteness()}%</span>
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden max-w-32">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${calculateCompleteness()}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-[#7F5BFF] to-indigo-500"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-[#A0A0A8]">
                  <span className={waitlistData.profile_picture_url ? 'text-green-400' : ''}>
                    {waitlistData.profile_picture_url ? '●' : '○'} Photo {waitlistData.profile_picture_url ? 'added' : 'missing'}
                  </span>
                  <span className={waitlistData.startup_logo_url ? 'text-green-400' : ''}>
                    {waitlistData.startup_logo_url ? '●' : '○'} Logo {waitlistData.startup_logo_url ? 'added' : 'missing'}
                  </span>
                  <span className="text-green-400">
                    ● Startup details complete
                  </span>
                </div>
              </div>
            </div>

            {/* Startup Logo + Details */}
            <div className="flex items-start gap-4 mb-8 pb-8 border-b border-white/5">
              <div className="relative">
                <label
                  htmlFor="logo-upload"
                  className="cursor-pointer group"
                  title="Add your startup logo – optional"
                >
                  {waitlistData.startup_logo_url ? (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="relative"
                    >
                      <img
                        src={waitlistData.startup_logo_url}
                        alt="Startup Logo"
                        className="w-16 h-16 rounded-xl object-cover border border-white/10 bg-[rgba(255,255,255,0.02)] shadow-lg"
                      />
                      {uploading === 'logo' && (
                        <div className="absolute inset-0 rounded-xl bg-black/50 flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-[#0B0B0F]">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    </motion.div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl border-2 border-dashed border-white/20 bg-[rgba(255,255,255,0.02)] flex items-center justify-center group-hover:border-[#7F5BFF]/40 transition-colors">
                      {uploading === 'logo' ? (
                        <div className="w-4 h-4 border-2 border-[#7F5BFF] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-white/40 group-hover:text-[#7F5BFF] transition-colors" />
                      )}
                    </div>
                  )}
                </label>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload('logo', file)
                    // Reset input to allow re-uploading the same file
                    e.target.value = ''
                  }}
                  disabled={uploading === 'logo'}
                />
                {!waitlistData.startup_logo_url && (
                  <p className="text-xs text-[#A0A0A8] mt-2 text-center">+ Add Logo</p>
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-base font-semibold text-white mb-2">
                  {waitlistData.startup_name || 'something'}
                </h4>
                <div className="space-y-1 text-sm text-[#A0A0A8]">
                  <p>Stage: <span className="text-white">{waitlistData.startup_stage ? waitlistData.startup_stage.charAt(0).toUpperCase() + waitlistData.startup_stage.slice(1) : '—'}</span></p>
                  <p>City: <span className="text-white">{waitlistData.city || '—'}</span></p>
                </div>
              </div>
            </div>

            {/* Other Profile Fields */}
            <div className="space-y-0">
              {[
                { label: 'Category', value: waitlistData.what_building || '—' },
                { label: 'Website', value: waitlistData.website_url || '—' },
                { label: 'LinkedIn', value: waitlistData.linkedin_url || '—' },
              ].map((field, index) => (
                <div
                  key={field.label}
                  className={`py-4 ${index !== 2 ? 'border-b border-white/5' : ''} hover:bg-white/5 transition-colors`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#A0A0A8]">{field.label}</span>
                    <span className="text-sm font-medium text-white">{field.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 3. Review Progress */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-16"
        >
          <div className="bg-[rgba(255,255,255,0.04)] border border-white/10 rounded-[20px] p-8 backdrop-blur-xl">
            <h2 className="text-xl font-semibold mb-8 text-white">▌ Review Status</h2>

            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/10" />

              <div className="space-y-8">
                {reviewSteps.map((step, index) => {
                  const isCompleted = step.status === 'completed'
                  const isActive = step.status === 'active'

                  return (
                    <div key={step.id} className="relative flex items-start gap-6">
                      {/* Dot */}
                      <div className="relative z-10 flex-shrink-0">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                            isCompleted
                              ? 'bg-[#7F5BFF] border-[#7F5BFF]'
                              : isActive
                              ? 'bg-[#7F5BFF]/20 border-[#7F5BFF] animate-pulse'
                              : 'bg-[rgba(255,255,255,0.04)] border-white/10'
                          }`}
                        >
                          {isCompleted && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Check className="w-4 h-4 text-white" />
                            </motion.div>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 pt-1">
                        <h3 className={`text-base font-medium mb-1 ${
                          isActive ? 'text-white' : isCompleted ? 'text-white' : 'text-[#A0A0A8]'
                        }`}>
                          {step.label}
                        </h3>
                        <p className="text-sm text-[#A0A0A8]">{step.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </motion.section>

        {/* 4. Live Founder Pulse */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-16"
        >
          <div className="bg-[rgba(255,255,255,0.04)] border border-white/10 rounded-[20px] p-8 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xl font-semibold text-white">▌ Live Founder Pulse</h2>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-green-400">Live</span>
              </div>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              <AnimatePresence>
                {liveActivities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                    className="flex items-center gap-3 text-sm"
                  >
                    <span className="text-[#A0A0A8]">•</span>
                    <span className="text-white">
                      Founder {activity.action}
                    </span>
                    <span className="text-[#A0A0A8] ml-auto">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>

              {liveActivities.length === 0 && (
                <p className="text-sm text-[#A0A0A8] text-center py-8">
                  No recent activity
                </p>
              )}
            </div>
          </div>
        </motion.section>

        {/* 5. Roadmap Timeline */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-16"
        >
          <div className="bg-[rgba(255,255,255,0.04)] border border-white/10 rounded-[20px] p-8 backdrop-blur-xl">
            <h2 className="text-xl font-semibold mb-8 text-white">▌ What's Coming</h2>

            <div className="space-y-4">
              {roadmapItems.map((item) => (
                <Accordion
                  key={item.id}
                  type="single"
                  collapsible
                  className="border-b border-white/5 last:border-0"
                >
                  <AccordionItem value={item.id} className="border-0">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-4">
                          <ChevronRight className="w-5 h-5 text-[#7F5BFF] transition-transform duration-200" />
                          <div className="text-left">
                            <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                            <p className="text-sm text-[#A0A0A8]">{item.date}</p>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 pl-12">
                      <div className="flex flex-wrap gap-2">
                        {item.features.map((feature) => (
                          <span
                            key={feature}
                            className="px-3 py-1 bg-[rgba(255,255,255,0.04)] border border-white/10 rounded-full text-sm text-[#A0A0A8]"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 6. Why You're Here */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-16"
        >
          <div className="bg-[rgba(255,255,255,0.04)] border border-white/10 rounded-[20px] p-8 backdrop-blur-xl">
            <h2 className="text-xl font-semibold mb-4 text-white">▌ Why You're Here</h2>
            <div className="border-l-2 border-[#7F5BFF] pl-6">
              <p className="text-lg text-white leading-relaxed">
                Sipher makes your execution visible — not your pedigree.
              </p>
            </div>
          </div>
        </motion.section>

        {/* 7. While You Wait */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-16"
        >
          <div className="bg-[rgba(255,255,255,0.04)] border border-white/10 rounded-[20px] p-8 backdrop-blur-xl">
            <h2 className="text-xl font-semibold mb-6 text-white">▌ While You Wait</h2>
            <div className="space-y-4">
              {[
                'Your spot is secured',
                'Review takes ~7 days',
                "You'll receive email on approval",
                'You can update profile anytime',
              ].map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-sm text-[#A0A0A8]">{item}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center text-sm text-[#A0A0A8] pt-16 pb-8 border-t border-white/10 mt-16"
      >
        <p>Questions? Reply to your confirmation email.</p>
        <p className="mt-2">Built in Hyderabad, India. Proof over promises.</p>
      </motion.footer>
    </div>
  )
}
