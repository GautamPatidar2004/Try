
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from '@/integrations/supabase/client'
import { Users, Mail, Calendar, UserPlus, Send, RefreshCw } from 'lucide-react'
import { useWaitlistConversion, WaitlistEntryWithStatus } from '@/hooks/useWaitlistConversion'

type StatusFilter = 'all' | 'pending' | 'invited' | 'activated' | 'declined'

const WaitlistAdmin = () => {
  const [entries, setEntries] = useState<WaitlistEntryWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, thisWeek: 0, thisMonth: 0, pending: 0, invited: 0, activated: 0 })
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selectedEntries, setSelectedEntries] = useState<string[]>([])
  const { inviteUser, bulkInviteUsers, resendInvitation, isLoading } = useWaitlistConversion()

  useEffect(() => {
    fetchWaitlistEntries()
  }, [])

  const fetchWaitlistEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('waitlist')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching waitlist:', error)
        return
      }

      setEntries((data || []) as WaitlistEntryWithStatus[])
      
      // Calculate stats
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const thisWeek = data?.filter(entry => 
        new Date(entry.created_at) > weekAgo
      ).length || 0

      const thisMonth = data?.filter(entry => 
        new Date(entry.created_at) > monthAgo
      ).length || 0

      const pending = data?.filter(entry => entry.status === 'pending').length || 0
      const invited = data?.filter(entry => entry.status === 'invited').length || 0
      const activated = data?.filter(entry => entry.status === 'activated').length || 0

      setStats({
        total: data?.length || 0,
        thisWeek,
        thisMonth,
        pending,
        invited,
        activated
      })
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInviteUser = async (entry: WaitlistEntryWithStatus) => {
    const success = await inviteUser(entry)
    if (success) {
      fetchWaitlistEntries() // Refresh the list
    }
  }

  const handleBulkInvite = async () => {
    const entriesToInvite = entries.filter(entry => 
      selectedEntries.includes(entry.id) && entry.status === 'pending'
    )
    
    if (entriesToInvite.length === 0) {
      return
    }
    
    await bulkInviteUsers(entriesToInvite)
    setSelectedEntries([])
    fetchWaitlistEntries()
  }

  const handleResendInvitation = async (entry: WaitlistEntryWithStatus) => {
    const success = await resendInvitation(entry)
    if (success) {
      fetchWaitlistEntries()
    }
  }

  const filteredEntries = entries.filter(entry => {
    if (statusFilter === 'all') return true
    return entry.status === statusFilter
  })

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'default',
      invited: 'secondary',
      activated: 'default',
      declined: 'destructive'
    } as const
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {status}
      </Badge>
    )
  }

  if (loading) {
    return <div className="text-center py-8">Loading waitlist data...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Waitlist Management</h2>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-primary" />
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 text-primary" />
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Send className="h-6 w-6 text-primary" />
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">Invited</p>
                <p className="text-2xl font-bold">{stats.invited}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <UserPlus className="h-6 w-6 text-primary" />
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">Activated</p>
                <p className="text-2xl font-bold">{stats.activated}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Mail className="h-6 w-6 text-primary" />
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">{stats.thisWeek}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="invited">Invited</SelectItem>
              <SelectItem value="activated">Activated</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {selectedEntries.length > 0 && (
          <Button 
            onClick={handleBulkInvite}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Invite Selected ({selectedEntries.length})
          </Button>
        )}
      </div>

      {/* Waitlist Table */}
      <Card>
        <CardHeader>
          <CardTitle>Waitlist Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">
                    <Checkbox 
                      checked={selectedEntries.length === filteredEntries.filter(e => e.status === 'pending').length && filteredEntries.filter(e => e.status === 'pending').length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedEntries(filteredEntries.filter(e => e.status === 'pending').map(e => e.id))
                        } else {
                          setSelectedEntries([])
                        }
                      }}
                    />
                  </th>
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <Checkbox 
                        checked={selectedEntries.includes(entry.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedEntries([...selectedEntries, entry.id])
                          } else {
                            setSelectedEntries(selectedEntries.filter(id => id !== entry.id))
                          }
                        }}
                        disabled={entry.status !== 'pending'}
                      />
                    </td>
                    <td className="p-2 font-medium">{entry.name}</td>
                    <td className="p-2">{entry.email}</td>
                    <td className="p-2 capitalize">{entry.user_type || 'N/A'}</td>
                    <td className="p-2">{getStatusBadge(entry.status)}</td>
                    <td className="p-2">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        {entry.status === 'pending' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleInviteUser(entry)}
                            disabled={isLoading}
                            className="flex items-center gap-1"
                          >
                            <UserPlus className="h-3 w-3" />
                            Invite
                          </Button>
                        )}
                        {entry.status === 'invited' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleResendInvitation(entry)}
                            disabled={isLoading}
                            className="flex items-center gap-1"
                          >
                            <RefreshCw className="h-3 w-3" />
                            Resend
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredEntries.length === 0 && (
              <p className="text-center py-8 text-muted-foreground">
                {statusFilter === 'all' ? 'No signups yet' : `No ${statusFilter} entries`}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default WaitlistAdmin
