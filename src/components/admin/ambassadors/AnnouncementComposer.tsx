import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useAmbassadorAdmin } from '@/hooks/useAmbassadorAdmin';
import { Loader2, Megaphone, Calendar, Send, Eye, EyeOff, AlertCircle, Bell, Clock } from 'lucide-react';
import { format } from 'date-fns';

const PRIORITY_OPTIONS = [
  { value: 'normal', label: 'Normal', color: 'bg-gray-100 text-gray-800' },
  { value: 'important', label: 'Important', color: 'bg-amber-100 text-amber-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
];

const TIER_OPTIONS = ['Standard', 'Silver', 'Gold', 'Platinum'];

export function AnnouncementComposer() {
  const { announcements, tiers, createAnnouncement, updateAnnouncement, isUpdating, announcementsLoading } = useAmbassadorAdmin();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('normal');
  const [targetTiers, setTargetTiers] = useState<string[]>([]);
  const [scheduleForLater, setScheduleForLater] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  const handleSubmit = () => {
    if (!title || !content) return;

    let scheduled_for = null;
    if (scheduleForLater && scheduledDate && scheduledTime) {
      scheduled_for = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
    }

    createAnnouncement({
      title,
      content,
      priority,
      target_tiers: targetTiers,
      scheduled_for,
    });

    // Reset form
    setTitle('');
    setContent('');
    setPriority('normal');
    setTargetTiers([]);
    setScheduleForLater(false);
    setScheduledDate('');
    setScheduledTime('');
  };

  const handleTierToggle = (tier: string, checked: boolean) => {
    if (checked) {
      setTargetTiers((prev) => [...prev, tier]);
    } else {
      setTargetTiers((prev) => prev.filter((t) => t !== tier));
    }
  };

  const getPriorityBadge = (priority: string) => {
    const option = PRIORITY_OPTIONS.find((p) => p.value === priority);
    return <Badge className={option?.color || 'bg-gray-100'}>{option?.label || priority}</Badge>;
  };

  const getStatusBadge = (announcement: { sent_at: string | null; scheduled_for: string | null; is_active: boolean }) => {
    if (!announcement.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    if (announcement.sent_at) {
      return <Badge className="bg-green-100 text-green-800">Sent</Badge>;
    }
    if (announcement.scheduled_for) {
      return (
        <Badge className="bg-blue-100 text-blue-800">
          <Clock className="w-3 h-3 mr-1" />
          Scheduled
        </Badge>
      );
    }
    return <Badge variant="outline">Draft</Badge>;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Compose Form */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-brand-green" />
            New Announcement
          </CardTitle>
          <CardDescription>
            Send announcements to all or specific ambassadors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Announcement title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Write your announcement..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center gap-2">
                      {opt.value === 'urgent' && <AlertCircle className="w-4 h-4 text-red-500" />}
                      {opt.value === 'important' && <Bell className="w-4 h-4 text-amber-500" />}
                      {opt.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Target Tiers (leave empty for all)</Label>
            <div className="grid grid-cols-2 gap-2">
              {TIER_OPTIONS.map((tier) => (
                <div key={tier} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tier-${tier}`}
                    checked={targetTiers.includes(tier)}
                    onCheckedChange={(checked) => handleTierToggle(tier, !!checked)}
                  />
                  <label htmlFor={`tier-${tier}`} className="text-sm cursor-pointer">
                    {tier}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="schedule">Schedule for later</Label>
              <Switch
                id="schedule"
                checked={scheduleForLater}
                onCheckedChange={setScheduleForLater}
              />
            </div>

            {scheduleForLater && (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="date" className="text-xs">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="time" className="text-xs">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!title || !content || isUpdating}
            className="w-full"
          >
            {isUpdating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : scheduleForLater ? (
              <Calendar className="w-4 h-4 mr-2" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {scheduleForLater ? 'Schedule Announcement' : 'Send Now'}
          </Button>
        </CardContent>
      </Card>

      {/* Announcements History */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Announcement History</CardTitle>
          <CardDescription>Past and scheduled announcements</CardDescription>
        </CardHeader>
        <CardContent>
          {announcementsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : !announcements || announcements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No announcements yet
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {announcements.map((announcement) => (
                    <TableRow key={announcement.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{announcement.title}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {announcement.content}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getPriorityBadge(announcement.priority)}</TableCell>
                      <TableCell>
                        {announcement.target_tiers && announcement.target_tiers.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {announcement.target_tiers.map((tier) => (
                              <Badge key={tier} variant="outline" className="text-xs">
                                {tier}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">All</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(announcement)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {announcement.sent_at
                          ? format(new Date(announcement.sent_at), 'MMM d, yyyy')
                          : announcement.scheduled_for
                          ? format(new Date(announcement.scheduled_for), 'MMM d, yyyy HH:mm')
                          : format(new Date(announcement.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            updateAnnouncement({
                              id: announcement.id,
                              is_active: !announcement.is_active,
                            })
                          }
                        >
                          {announcement.is_active ? (
                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
