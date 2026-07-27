import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useState } from 'react';

interface AboutYouStepProps {
  data: {
    bio: string;
    location: string;
    languages: string[];
    specialties: string[];
  };
  onChange: (data: Partial<AboutYouStepProps['data']>) => void;
}

export const AboutYouStep = ({ data, onChange }: AboutYouStepProps) => {
  const [newLanguage, setNewLanguage] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');

  const addTag = (type: 'languages' | 'specialties', value: string, setter: (v: string) => void) => {
    if (value.trim() && !data[type].includes(value.trim())) {
      onChange({ [type]: [...data[type], value.trim()] });
      setter('');
    }
  };

  const removeTag = (type: 'languages' | 'specialties', index: number) => {
    onChange({ [type]: data[type].filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">About You</h3>
        <p className="text-sm text-muted-foreground">Tell brands who you are and what makes you unique.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mk-bio">Bio</Label>
        <Textarea
          id="mk-bio"
          value={data.bio}
          onChange={(e) => onChange({ bio: e.target.value.slice(0, 500) })}
          placeholder="Write a compelling bio that showcases your personality and content style..."
          rows={5}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground text-right">{data.bio.length}/500 characters</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mk-location">Location</Label>
        <Input id="mk-location" value={data.location} onChange={(e) => onChange({ location: e.target.value })} placeholder="e.g. Los Angeles, CA" />
      </div>

      <div className="space-y-2">
        <Label>Languages</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {data.languages.map((lang, i) => (
            <Badge key={i} variant="secondary" className="gap-1">
              {lang}
              <button onClick={() => removeTag('languages', i)}><X className="h-3 w-3" /></button>
            </Badge>
          ))}
        </div>
        <Input
          value={newLanguage}
          onChange={(e) => setNewLanguage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('languages', newLanguage, setNewLanguage))}
          placeholder="Type a language and press Enter"
        />
      </div>

      <div className="space-y-2">
        <Label>Specialties / Niches</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {data.specialties.map((spec, i) => (
            <Badge key={i} variant="secondary" className="gap-1">
              {spec}
              <button onClick={() => removeTag('specialties', i)}><X className="h-3 w-3" /></button>
            </Badge>
          ))}
        </div>
        <Input
          value={newSpecialty}
          onChange={(e) => setNewSpecialty(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('specialties', newSpecialty, setNewSpecialty))}
          placeholder="e.g. Travel, Lifestyle, Food..."
        />
      </div>
    </div>
  );
};
