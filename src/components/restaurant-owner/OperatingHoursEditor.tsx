import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy } from 'lucide-react';

export interface DayHours {
  open: string;
  close: string;
  isClosed: boolean;
}

export interface OperatingHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

interface OperatingHoursEditorProps {
  hours: OperatingHours;
  onChange: (hours: OperatingHours) => void;
}

const DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

const DAY_LABELS: Record<typeof DAYS[number], string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

export const OperatingHoursEditor: React.FC<OperatingHoursEditorProps> = ({
  hours,
  onChange,
}) => {
  const handleDayChange = (
    day: typeof DAYS[number],
    field: keyof DayHours,
    value: string | boolean
  ) => {
    onChange({
      ...hours,
      [day]: {
        ...hours[day],
        [field]: value,
      },
    });
  };

  const copyToAllDays = () => {
    const mondayHours = hours.monday;
    const newHours = { ...hours };
    DAYS.forEach((day) => {
      newHours[day] = { ...mondayHours };
    });
    onChange(newHours);
  };

  const copyToWeekdays = () => {
    const mondayHours = hours.monday;
    const weekdays: typeof DAYS[number][] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const newHours = { ...hours };
    weekdays.forEach((day) => {
      newHours[day] = { ...mondayHours };
    });
    onChange(newHours);
  };

  const copyToWeekend = () => {
    const saturdayHours = hours.saturday;
    const newHours = { ...hours };
    newHours.saturday = { ...saturdayHours };
    newHours.sunday = { ...saturdayHours };
    onChange(newHours);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={copyToAllDays}
          className="text-xs"
        >
          <Copy className="w-3 h-3 mr-1" />
          Copy to All Days
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={copyToWeekdays}
          className="text-xs"
        >
          <Copy className="w-3 h-3 mr-1" />
          Copy to Weekdays
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={copyToWeekend}
          className="text-xs"
        >
          <Copy className="w-3 h-3 mr-1" />
          Copy to Weekend
        </Button>
      </div>

      <div className="space-y-3">
        {DAYS.map((day) => (
          <div
            key={day}
            className="grid grid-cols-1 sm:grid-cols-[120px_1fr_80px] gap-3 items-center p-3 border rounded-lg"
          >
            <div className="font-medium text-sm">{DAY_LABELS[day]}</div>

            {hours[day].isClosed ? (
              <div className="text-sm text-muted-foreground">Closed</div>
            ) : (
              <div className="flex gap-2 items-center">
                <Input
                  type="time"
                  value={hours[day].open}
                  onChange={(e) => handleDayChange(day, 'open', e.target.value)}
                  className="flex-1"
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="time"
                  value={hours[day].close}
                  onChange={(e) => handleDayChange(day, 'close', e.target.value)}
                  className="flex-1"
                />
              </div>
            )}

            <div className="flex items-center gap-2 justify-end">
              <label htmlFor={`closed-${day}`} className="text-xs text-muted-foreground">
                Closed
              </label>
              <Switch
                id={`closed-${day}`}
                checked={hours[day].isClosed}
                onCheckedChange={(checked) => handleDayChange(day, 'isClosed', checked)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
