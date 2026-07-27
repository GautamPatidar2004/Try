import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRestaurantBooking } from '@/hooks/useRestaurantBooking';
import { Restaurant } from '@/hooks/useRestaurants';
import { toast } from 'sonner';

interface RestaurantBookingModalProps {
  restaurant: Restaurant;
  open: boolean;
  onClose: () => void;
}

const RestaurantBookingModal = ({ restaurant, open, onClose }: RestaurantBookingModalProps) => {
  const { createBooking, loading } = useRestaurantBooking();
  const [formData, setFormData] = useState({
    booking_date: '',
    booking_time: '',
    party_size: 2,
    meal_type: '',
    collaboration_type: restaurant.collaboration_types[0] || 'free_meal',
    proposal_message: '',
    special_requests: ''
  });

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.booking_date || !formData.booking_time || !formData.meal_type) {
      toast.error('Please fill in all required fields');
      return;
    }

    const result = await createBooking({
      restaurant_id: restaurant.id,
      ...formData
    });

    if (result) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book at {restaurant.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                min={minDateStr}
                value={formData.booking_date}
                onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">Must be at least 24 hours in advance</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                type="time"
                value={formData.booking_time}
                onChange={(e) => setFormData({ ...formData, booking_time: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="party_size">Party Size *</Label>
              <Input
                id="party_size"
                type="number"
                min="1"
                max={restaurant.max_party_size}
                value={formData.party_size}
                onChange={(e) => setFormData({ ...formData, party_size: parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meal_type">Meal Type *</Label>
              <Select
                value={formData.meal_type}
                onValueChange={(value) => setFormData({ ...formData, meal_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select meal type" />
                </SelectTrigger>
                <SelectContent>
                  {restaurant.meal_types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {restaurant.collaboration_types.length > 1 && (
            <div className="space-y-2">
              <Label htmlFor="collaboration_type">Collaboration Type *</Label>
              <Select
                value={formData.collaboration_type}
                onValueChange={(value) => setFormData({ ...formData, collaboration_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {restaurant.collaboration_types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type === 'free_meal' ? 'Free Meal' : type === 'paid_partnership' ? 'Paid Partnership' : type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="proposal_message">Proposal Message *</Label>
            <Textarea
              id="proposal_message"
              placeholder="Tell the restaurant owner why you'd like to collaborate..."
              value={formData.proposal_message}
              onChange={(e) => setFormData({ ...formData, proposal_message: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="special_requests">Special Requests (Optional)</Label>
            <Textarea
              id="special_requests"
              placeholder="Any dietary restrictions or special requests?"
              value={formData.special_requests}
              onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Submitting...' : 'Submit Booking Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RestaurantBookingModal;
