import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface SettingCardProps {
  title: string;
  description: string;
  type: 'boolean' | 'string' | 'number' | 'slider' | 'textarea' | 'json';
  value: any;
  onChange: (value: any) => void;
  updatedAt?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

export const SettingCard = ({
  title,
  description,
  type,
  value,
  onChange,
  updatedAt,
  min = 0,
  max = 100,
  step = 1,
  disabled = false
}: SettingCardProps) => {
  const renderInput = () => {
    switch (type) {
      case 'boolean':
        return (
          <Switch
            checked={value}
            onCheckedChange={onChange}
            disabled={disabled}
          />
        );
      
      case 'slider':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Slider
                value={[value]}
                onValueChange={(vals) => onChange(vals[0])}
                min={min}
                max={max}
                step={step}
                disabled={disabled}
                className="flex-1 mr-4"
              />
              <Badge variant="secondary">{value}{type === 'slider' ? '%' : ''}</Badge>
            </div>
          </div>
        );
      
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            rows={4}
          />
        );
      
      case 'json':
        return (
          <Textarea
            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                onChange(JSON.parse(e.target.value));
              } catch {
                onChange(e.target.value);
              }
            }}
            disabled={disabled}
            rows={6}
            className="font-mono text-sm"
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
          />
        );
      
      case 'string':
      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
          />
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription className="text-sm">{description}</CardDescription>
          </div>
          {type === 'boolean' && (
            <div className="ml-4">
              {renderInput()}
            </div>
          )}
        </div>
      </CardHeader>
      {type !== 'boolean' && (
        <CardContent>
          <div className="space-y-2">
            {renderInput()}
            {updatedAt && (
              <p className="text-xs text-muted-foreground">
                Last updated: {format(new Date(updatedAt), 'PPp')}
              </p>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};
