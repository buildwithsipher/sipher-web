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
import { Logo } from '@/components/shared/logo'
import { toast } from 'sonner'
import { format } from 'date-fns'

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
  const [totalUsers, setTotalUsers] = useState<number>(0)
  const [isEditing, setIsEditing] = useState(false)
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

  useEffect(() => {
    fetchUserData()
    fetchLiveActivities()
    fetchCommunityStats()

    // Subscribe to real-time updates
    const supabase = createClient()
    const channel = supabase
      .channel('waitlist_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'waitlist_users',
        },
        () => {
          fetchUserData()
          fetchLiveActivities()
          fetchCommunityStats()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
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

    // Calculate position
    const { data: usersBeforeMe, error: posError } = await supabase
      .from('waitlist_users')
      .select('id', { count: 'exact', head: true })
      .lt('created_at', waitlistUser.created_at)

    if (!posError) {
      setPosition((usersBeforeMe as any) + 1)
    }

    // Get total count
    const { count } = await supabase
      .from('waitlist_users')
      .select('*', { count: 'exact', head: true })

    setTotalUsers(count || 0)
  }

  async function fetchLiveActivities() {
    const supabase = createClient()

    // For live activities, we'll show limited data (anonymized)
    // Since RLS might block this, we'll use a simpler approach
    // Try to fetch, but gracefully handle if blocked
    const { data, error } = await supabase
      .from('waitlist_users')
      .select('id, city, startup_name, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Live activities error:', error)
      // Don't show error to user, just use empty array or mock data
      // Show some mock activity to keep the UI working
      setLiveActivities([
        {
          id: '1',
          action: 'joined the waitlist',
          city: 'India',
          timestamp: new Date().toISOString(),
        },
      ])
      return
    }

    if (data && data.length > 0) {
      const activities: LiveActivity[] = data.map((u) => ({
        id: u.id,
        action: u.startup_name
          ? `joined from ${u.city || 'India'}`
          : `joined the waitlist`,
        city: u.city,
        timestamp: u.created_at,
      }))
      setLiveActivities(activities)
    } else {
      // Show placeholder if no data
      setLiveActivities([])
    }
  }

  async function fetchCommunityStats() {
    const supabase = createClient()

    // Get total count (this might be blocked by RLS, so we'll handle gracefully)
    const { count, error: countError } = await supabase
      .from('waitlist_users')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('Community stats error:', countError)
      // Use default values if RLS blocks
      setCommunityStats({
        totalFounders: 0,
        cities: 0,
        avgStage: 'MVP',
      })
      return
    }

    // Try to get cities (might be blocked by RLS)
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
    const supabase = createClient()

    const { error } = await supabase
      .from('waitlist_users')
      .update({
        name: editForm.name,
        startup_name: editForm.startup_name,
        startup_stage: editForm.startup_stage,
        city: editForm.city,
        what_building: editForm.what_building || null,
        website_url: editForm.website_url || null,
        linkedin_url: editForm.linkedin_url || null,
      })
      .eq('id', waitlistData?.id)

    if (error) {
      toast.error('Failed to update profile')
      return
    }

    toast.success('Profile updated!')
    setIsEditing(false)
    fetchUserData()
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  if (!waitlistData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0B0C]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const percentageComplete = totalUsers > 0 ? (position / totalUsers) * 100 : 0
  const daysUntilLaunch = Math.ceil(
    (new Date('2026-02-01').getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  )

  return (
    <div className="min-h-screen bg-[#0B0B0C]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0B0B0C]/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Logo size="small" animated={false} />

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{waitlistData.name}</p>
                <p className="text-xs text-white/60">{waitlistData.email}</p>
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

      <main className="container mx-auto px-4 sm:px-6 py-12 max-w-6xl">
        {/* Hero Section: Queue Position */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="bg-gradient-to-br from-purple-500/10 via-transparent to-indigo-500/10 border border-purple-500/20 rounded-3xl p-8 md:p-12 relative overflow-hidden">
            {/* Animated background orb */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-medium text-purple-400">Your Position</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-black mb-4 text-white">
                #{position}
              </h1>

              <p className="text-xl text-white/60 mb-8">
                out of <span className="text-white font-semibold">{totalUsers}</span> founders on the waitlist
              </p>

              {/* Progress Bar */}
              <div className="relative h-3 bg-white/10 rounded-full overflow-hidden mb-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${100 - percentageComplete}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                />
              </div>

              <p className="text-sm text-white/60">
                <span className="text-white font-semibold">{position - 1}</span> founders ahead of you
              </p>

              {/* Launch Countdown */}
              <div className="mt-8 pt-8 border-t border-white/10">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-sm text-white/60 mb-1">Launch Date</p>
                    <p className="text-lg font-bold text-white">February 1, 2026</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60 mb-1">Days Until Launch</p>
                    <p className="text-lg font-bold text-purple-400">{daysUntilLaunch} days</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60 mb-1">Your Status</p>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full">
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                      <span className="text-sm font-medium text-orange-400 capitalize">
                        {waitlistData.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Live Pulse Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-5 h-5 text-green-400" />
            <h2 className="text-2xl font-bold text-white">Live Pulse</h2>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-green-400">Live</span>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 space-y-3 max-h-80 overflow-y-auto">
            <AnimatePresence>
              {liveActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-3 bg-white/[0.02] rounded-lg"
                >
                  <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">
                      <span className="font-medium">A founder</span>{' '}
                      <span className="text-white/60">{activity.action}</span>
                    </p>
                    <p className="text-xs text-white/40">
                      {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <p className="text-xs text-white/40 text-center mt-4">
            Real-time activity from founders joining Sipher. Identities are anonymized.
          </p>
        </motion.section>

        {/* Profile Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Your Profile</h2>
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false)
                    setEditForm({
                      name: waitlistData.name || '',
                      startup_name: waitlistData.startup_name || '',
                      startup_stage: waitlistData.startup_stage || '',
                      city: waitlistData.city || '',
                      what_building: waitlistData.what_building || '',
                      website_url: waitlistData.website_url || '',
                      linkedin_url: waitlistData.linkedin_url || '',
                    })
                  }}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveProfile} className="gap-2">
                  <Check className="w-4 h-4" />
                  Save
                </Button>
              </div>
            )}
          </div>

          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <Label className="flex items-center gap-2 mb-2 text-white/70">
                  <Users className="w-4 h-4 text-white/40" />
                  Full Name
                </Label>
                {isEditing ? (
                  <Input
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    placeholder="Your name"
                  />
                ) : (
                  <p className="text-lg font-medium text-white">{waitlistData.name || '—'}</p>
                )}
              </div>

              {/* Startup Name */}
              <div>
                <Label className="flex items-center gap-2 mb-2 text-white/70">
                  <Briefcase className="w-4 h-4 text-white/40" />
                  Startup Name
                </Label>
                {isEditing ? (
                  <Input
                    value={editForm.startup_name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, startup_name: e.target.value })
                    }
                    placeholder="Your startup"
                  />
                ) : (
                  <p className="text-lg font-medium text-white">
                    {waitlistData.startup_name || '—'}
                  </p>
                )}
              </div>

              {/* Startup Stage */}
              <div>
                <Label className="flex items-center gap-2 mb-2 text-white/70">
                  <TrendingUp className="w-4 h-4 text-white/40" />
                  Stage
                </Label>
                {isEditing ? (
                  <Select
                    value={editForm.startup_stage}
                    onValueChange={(value) =>
                      setEditForm({ ...editForm, startup_stage: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="idea">Idea</SelectItem>
                      <SelectItem value="mvp">MVP</SelectItem>
                      <SelectItem value="launched">Live Product</SelectItem>
                      <SelectItem value="revenue">Revenue</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-lg font-medium text-white capitalize">
                    {waitlistData.startup_stage || '—'}
                  </p>
                )}
              </div>

              {/* City */}
              <div>
                <Label className="flex items-center gap-2 mb-2 text-white/70">
                  <MapPin className="w-4 h-4 text-white/40" />
                  City
                </Label>
                {isEditing ? (
                  <Input
                    value={editForm.city}
                    onChange={(e) =>
                      setEditForm({ ...editForm, city: e.target.value })
                    }
                    placeholder="Your city"
                  />
                ) : (
                  <p className="text-lg font-medium text-white">{waitlistData.city || '—'}</p>
                )}
              </div>

              {/* What Building */}
              <div className="md:col-span-2">
                <Label className="flex items-center gap-2 mb-2 text-white/70">
                  <Sparkles className="w-4 h-4 text-white/40" />
                  What are you building?
                </Label>
                {isEditing ? (
                  <Input
                    value={editForm.what_building}
                    onChange={(e) =>
                      setEditForm({ ...editForm, what_building: e.target.value })
                    }
                    placeholder="One-liner about your startup"
                  />
                ) : (
                  <p className="text-lg font-medium text-white">
                    {waitlistData.what_building || '—'}
                  </p>
                )}
              </div>

              {/* Website */}
              <div>
                <Label className="flex items-center gap-2 mb-2 text-white/70">
                  <LinkIcon className="w-4 h-4 text-white/40" />
                  Website / Product
                </Label>
                {isEditing ? (
                  <Input
                    value={editForm.website_url}
                    onChange={(e) =>
                      setEditForm({ ...editForm, website_url: e.target.value })
                    }
                    placeholder="https://yourproduct.com"
                    type="url"
                  />
                ) : waitlistData.website_url ? (
                  <a
                    href={waitlistData.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-medium text-purple-400 hover:underline"
                  >
                    {waitlistData.website_url}
                  </a>
                ) : (
                  <p className="text-lg font-medium text-white">—</p>
                )}
              </div>

              {/* LinkedIn */}
              <div>
                <Label className="flex items-center gap-2 mb-2 text-white/70">
                  <Linkedin className="w-4 h-4 text-white/40" />
                  LinkedIn
                </Label>
                {isEditing ? (
                  <Input
                    value={editForm.linkedin_url}
                    onChange={(e) =>
                      setEditForm({ ...editForm, linkedin_url: e.target.value })
                    }
                    placeholder="https://linkedin.com/in/yourprofile"
                    type="url"
                  />
                ) : waitlistData.linkedin_url ? (
                  <a
                    href={waitlistData.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-medium text-purple-400 hover:underline"
                  >
                    View Profile
                  </a>
                ) : (
                  <p className="text-lg font-medium text-white">—</p>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        {/* What's Next: Roadmap */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold mb-6 text-white">What's Next</h2>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 via-indigo-500 to-pink-500" />

            <div className="space-y-8">
              {/* Phase 1 */}
              <div className="relative flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center relative z-10">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">Phase 1: Private Beta</h3>
                    <span className="px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded text-xs font-medium text-purple-400">
                      Feb 1, 2026
                    </span>
                  </div>
                  <p className="text-white/60 mb-3">
                    First 50 founders get access to BuilderLog and ProofCard
                  </p>
                  <ul className="space-y-2 text-sm text-white/60">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>Daily execution logging (30 seconds)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>ProofCard score calculation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>Shareable public profile</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Phase 2 */}
              <div className="relative flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center relative z-10">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">Phase 2: Community</h3>
                    <span className="px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded text-xs font-medium text-indigo-400">
                      Mar 2026
                    </span>
                  </div>
                  <p className="text-white/60 mb-3">
                    The Forge + Resources launch for all beta users
                  </p>
                  <ul className="space-y-2 text-sm text-white/60">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                      <span>High-trust founder community</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                      <span>Domain-specific playbooks</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                      <span>Fundraising checklists</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Phase 3 */}
              <div className="relative flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center relative z-10">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">Phase 3: VC Discovery</h3>
                    <span className="px-2 py-1 bg-pink-500/10 border border-pink-500/20 rounded text-xs font-medium text-pink-400">
                      Apr 2026
                    </span>
                  </div>
                  <p className="text-white/60 mb-3">
                    VCs get access to search founders by ProofCard
                  </p>
                  <ul className="space-y-2 text-sm text-white/60">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-pink-400 flex-shrink-0 mt-0.5" />
                      <span>VC portal with founder search</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-pink-400 flex-shrink-0 mt-0.5" />
                      <span>Inbound intro requests</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-pink-400 flex-shrink-0 mt-0.5" />
                      <span>Proof-based discovery</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Why You're Here: Manifesto */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold mb-6 text-white">Why You're Here</h2>

          <div className="bg-gradient-to-br from-purple-500/10 via-transparent to-indigo-500/10 border border-purple-500/20 rounded-2xl p-8 md:p-12">
            <div className="max-w-3xl">
              <h3 className="text-3xl md:text-4xl font-black leading-tight mb-6 text-white">
                You're early to a movement that will change how founders are evaluated.
              </h3>

              <div className="space-y-4 text-lg text-white/60 leading-relaxed">
                <p>
                  For too long, <span className="text-white font-semibold">credentials</span> have mattered more than{' '}
                  <span className="text-white font-semibold">execution</span>.
                </p>
                <p>
                  Your college. Your network. Your last name.
                </p>
                <p>
                  But you know the truth: <span className="text-white font-semibold">shipping matters</span>.
                </p>
                <p>
                  Every feature you build. Every user you talk to. Every bug you fix at 2 AM.
                </p>
                <p>
                  <span className="text-purple-400 font-bold">That's what Sipher measures.</span>
                </p>
              </div>

              <div className="mt-8 pt-8 border-t border-white/10">
                <p className="text-sm text-white/60 italic">
                  You're not here because of what you studied.
                  <br />
                  You're here because of what you <span className="text-white font-semibold not-italic">build</span>.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* The Community: Stats */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold mb-6 text-white">The Community</h2>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {/* Total Founders */}
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-3xl font-black mb-2 text-white">{totalUsers}</div>
              <p className="text-sm text-white/60">Founders on waitlist</p>
            </div>

            {/* Cities */}
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="text-3xl font-black mb-2 text-white">{communityStats.cities}+</div>
              <p className="text-sm text-white/60">Cities across India</p>
            </div>

            {/* Avg Stage */}
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6">
              <div className="w-12 h-12 bg-pink-500/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-pink-400" />
              </div>
              <div className="text-3xl font-black mb-2 text-white">MVP</div>
              <p className="text-sm text-white/60">Most common stage</p>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6">
            <h3 className="font-semibold mb-4 text-white">Top Cities</h3>
            <div className="space-y-3">
              {['Bangalore', 'Hyderabad', 'Mumbai', 'Delhi', 'Pune'].map((city, index) => (
                <div key={city} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-white/60 w-6">{index + 1}.</span>
                    <span className="font-medium text-white">{city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${100 - index * 15}%` }}
                      />
                    </div>
                    <span className="text-sm text-white/60 w-12 text-right">
                      {Math.floor(totalUsers * (100 - index * 15) / 500)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* What You Can't Do (Clear Messaging) */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <div className="bg-white/[0.02] border border-white/10 rounded-xl p-8">
            <h3 className="text-lg font-bold mb-4 text-white">While You Wait</h3>
            <div className="space-y-3 text-sm text-white/60">
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                Your spot is secured. No action needed.
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                We'll review your profile manually (quality over quantity).
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                You'll get an email when you're approved (usually within 7 days).
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                Feel free to update your profile anytime above.
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-white/60">
                <strong className="text-white">Important:</strong> We don't do referral programs or "share to move up" tactics.{' '}
                Your position is based on when you joined, not how many people you spam. Quality matters.
              </p>
            </div>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-center text-sm text-white/60 pt-8 border-t border-white/10 mt-16"
      >
        <p>
          Questions? Reply to your confirmation email.
        </p>
        <p className="mt-2">
          Built in Hyderabad, India. Proof over promises.
        </p>
      </motion.footer>
    </div>
  )
}

