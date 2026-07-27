import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface ServiceItem {
  platform: string;
  serviceType: string;
  price: string;
  description: string;
}

interface ServicesRatesStepProps {
  services: ServiceItem[];
  onChange: (services: ServiceItem[]) => void;
}

const PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'Twitter/X', 'Blog', 'Other'];
const SERVICE_TYPES = ['Feed Post', 'Story', 'Reel', 'Video', 'Blog Post', 'UGC', 'Brand Ambassador', 'Event Coverage', 'Other'];

export const ServicesRatesStep = ({ services, onChange }: ServicesRatesStepProps) => {
  const addService = () => {
    onChange([...services, { platform: 'Instagram', serviceType: 'Feed Post', price: '', description: '' }]);
  };

  const updateService = (index: number, field: keyof ServiceItem, value: string) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeService = (index: number) => {
    onChange(services.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Services & Rates</h3>
        <p className="text-sm text-muted-foreground">Define your content services and pricing for brands.</p>
      </div>

      <div className="space-y-4">
        {services.map((service, index) => (
          <Card key={index}>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Service {index + 1}</span>
                <Button size="icon" variant="ghost" onClick={() => removeService(index)} className="h-7 w-7 text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Platform</Label>
                  <Select value={service.platform} onValueChange={(v) => updateService(index, 'platform', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Service Type</Label>
                  <Select value={service.serviceType} onValueChange={(v) => updateService(index, 'serviceType', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SERVICE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Price</Label>
                <Input value={service.price} onChange={(e) => updateService(index, 'price', e.target.value)} placeholder="e.g. $500 or Starting at $300" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Description (optional)</Label>
                <Textarea value={service.description} onChange={(e) => updateService(index, 'description', e.target.value)} placeholder="Brief description of what's included..." rows={2} className="resize-none" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button variant="outline" onClick={addService} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Service
      </Button>
    </div>
  );
};
