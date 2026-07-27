import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';
import { Label } from '@/components/ui/label';

export interface BookingSlot {
  time: string;
  capacity: number;
}

interface TimeSlotPickerProps {
  slots: BookingSlot[];
  onChange: (slots: BookingSlot[]) => void;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  slots,
  onChange,
}) => {
  const addSlot = () => {
    onChange([...slots, { time: '12:00', capacity: 4 }]);
  };

  const removeSlot = (index: number) => {
    onChange(slots.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: keyof BookingSlot, value: string | number) => {
    const newSlots = [...slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    onChange(newSlots);
  };

  const getMealType = (time: string): string => {
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 6 && hour < 11) return 'Breakfast';
    if (hour >= 11 && hour < 15) return 'Lunch';
    if (hour >= 15 && hour < 17) return 'Afternoon';
    return 'Dinner';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Booking Time Slots</Label>
        <Button type="button" variant="outline" size="sm" onClick={addSlot}>
          <Plus className="w-4 h-4 mr-1" />
          Add Slot
        </Button>
      </div>

      <div className="space-y-3">
        {slots.map((slot, index) => (
          <div
            key={index}
            className="grid grid-cols-1 sm:grid-cols-[1fr_100px_80px_40px] gap-3 items-end p-3 border rounded-lg"
          >
            <div className="space-y-1">
              <Label htmlFor={`time-${index}`} className="text-xs">
                Time
              </Label>
              <Input
                id={`time-${index}`}
                type="time"
                value={slot.time}
                onChange={(e) => updateSlot(index, 'time', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">{getMealType(slot.time)}</p>
            </div>

            <div className="space-y-1">
              <Label htmlFor={`capacity-${index}`} className="text-xs">
                Max Party
              </Label>
              <Input
                id={`capacity-${index}`}
                type="number"
                min="1"
                max="20"
                value={slot.capacity}
                onChange={(e) => updateSlot(index, 'capacity', parseInt(e.target.value))}
              />
            </div>

            <div className="h-10" />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeSlot(index)}
              className="hover:bg-destructive/10 hover:text-destructive h-10 w-10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}

        {slots.length === 0 && (
          <div className="text-center p-6 border-2 border-dashed rounded-lg text-muted-foreground">
            <p className="text-sm">No time slots added yet</p>
            <p className="text-xs mt-1">Click "Add Slot" to create your first booking time</p>
          </div>
        )}
      </div>
    </div>
  );
};
