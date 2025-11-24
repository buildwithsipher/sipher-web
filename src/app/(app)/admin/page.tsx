'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Search,
  Filter,
  Mail,
  MapPin,
  Briefcase,
  TrendingUp,
  ExternalLink,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  status: 'pending' | 'approved' | 'activated'
  referral_code: string
  created_at: string
  approved_at: string | null
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'activated'

export default function AdminPage() {
  const [users, setUsers] = useState<WaitlistUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<WaitlistUser[]>([])
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending')
  const [searchQuery, setSearchQuery] = useState('')
  const [total, setTotal] = useState(0)
  const [adminSecret, setAdminSecret] = useState<string | null>(null)
  const [showSecretPrompt, setShowSecretPrompt] = useState(true)

  useEffect(() => {
    if (adminSecret) {
      fetchUsers()
    }
  }, [statusFilter, adminSecret])

  const handleSecretSubmit = (secret: string) => {
    if (secret.trim()) {
      setAdminSecret(secret)
      setShowSecretPrompt(false)
    }
  }

  useEffect(() => {
    // Filter users by search query
    if (!searchQuery.trim()) {
      setFilteredUsers(users)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = users.filter(
      user =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.startup_name?.toLowerCase().includes(query) ||
        user.city?.toLowerCase().includes(query)
    )
    setFilteredUsers(filtered)
  }, [searchQuery, users])

  async function fetchUsers() {
    if (!adminSecret) return

    try {
      setLoading(true)
      const response = await fetch(`/api/admin/users?status=${statusFilter}&limit=100`, {
        headers: {
          Authorization: `Bearer ${adminSecret}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Unauthorized - Invalid admin secret')
          setShowSecretPrompt(true)
          setAdminSecret(null)
          return
        }
        throw new Error('Failed to fetch users')
      }

      const data = await response.json()
      setUsers(data.users || [])
      setFilteredUsers(data.users || [])
      setTotal(data.total || 0)
    } catch (error: any) {
      console.error('Fetch error:', error)
      toast.error(error.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(userId: string) {
    if (!adminSecret) {
      toast.error('Admin secret required')
      return
    }

    try {
      setApproving(userId)
      const response = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminSecret}`,
        },
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve user')
      }

      toast.success('User approved! Approval email sent.')
      fetchUsers() // Refresh list
    } catch (error: any) {
      console.error('Approval error:', error)
      toast.error(error.message || 'Failed to approve user')
    } finally {
      setApproving(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        )
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <CheckCircle2 className="w-3 h-3" />
            Approved
          </span>
        )
      case 'activated':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
            <CheckCircle2 className="w-3 h-3" />
            Activated
          </span>
        )
      default:
        return null
    }
  }

  if (showSecretPrompt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full mx-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-lg p-8"
          >
            <h1 className="text-2xl font-bold mb-2">Admin Access</h1>
            <p className="text-muted-foreground mb-6">
              Enter your admin secret to access the admin panel
            </p>
            <form
              onSubmit={e => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const secret = formData.get('secret') as string
                handleSecretSubmit(secret)
              }}
              className="space-y-4"
            >
              <Input
                name="secret"
                type="password"
                placeholder="Admin secret"
                required
                autoFocus
                className="w-full"
              />
              <Button type="submit" className="w-full">
                Access Admin Panel
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    )
  }

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Logo size="small" />
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowSecretPrompt(true)
                  setAdminSecret(null)
                }}
                className="gap-2"
              >
                Change Secret
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchUsers}
                className="gap-2"
                disabled={!adminSecret}
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-orange-400">
                  {users.filter(u => u.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-400" />
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-blue-400">
                  {users.filter(u => u.status === 'approved').length}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Activated</p>
                <p className="text-2xl font-bold text-green-400">
                  {users.filter(u => u.status === 'activated').length}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, startup, or city..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'pending', 'approved', 'activated'] as StatusFilter[]).map(status => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50 border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Startup
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Stage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <p className="text-muted-foreground">
                        {searchQuery ? 'No users found matching your search' : 'No users found'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="hover:bg-secondary/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-foreground">{user.name}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{user.startup_name || '—'}</p>
                            {user.what_building && (
                              <p className="text-xs text-muted-foreground">{user.what_building}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm capitalize">{user.startup_stage || '—'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{user.city || '—'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(user.status)}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(user.created_at), 'MMM d, yyyy')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(user.created_at), 'h:mm a')}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {user.linkedin_url && (
                            <a
                              href={user.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 hover:bg-secondary rounded-lg transition-colors"
                              title="View LinkedIn"
                            >
                              <ExternalLink className="w-4 h-4 text-muted-foreground" />
                            </a>
                          )}
                          {user.website_url && (
                            <a
                              href={user.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 hover:bg-secondary rounded-lg transition-colors"
                              title="View Website"
                            >
                              <ExternalLink className="w-4 h-4 text-muted-foreground" />
                            </a>
                          )}
                          {user.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => handleApprove(user.id)}
                              disabled={approving === user.id}
                              className="gap-2"
                            >
                              {approving === user.id ? (
                                <>
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                  Approving...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-4 h-4" />
                                  Approve
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
