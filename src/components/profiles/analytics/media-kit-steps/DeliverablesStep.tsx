import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X, GripVertical, Info } from 'lucide-react';
import { useState } from 'react';

interface DeliverablesStepProps {
  deliverables: string[];
  onChange: (deliverables: string[]) => void;
}

export const DeliverablesStep = ({ deliverables, onChange }: DeliverablesStepProps) => {
  const [newItem, setNewItem] = useState('');

  const addItem = () => {
    if (newItem.trim()) {
      onChange([...deliverables, newItem.trim()]);
      setNewItem('');
    }
  };

  const removeItem = (index: number) => {
    onChange(deliverables.filter((_, i) => i !== index));
  };

  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= deliverables.length) return;
    const updated = [...deliverables];
    const [item] = updated.splice(from, 1);
    updated.splice(to, 0, item);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Deliverables</h3>
        <p className="text-sm text-muted-foreground">List the content you typically provide for collaborations.</p>
      </div>

      <div className="space-y-2">
        {deliverables.map((item, index) => (
          <div key={index} className="flex items-center gap-2 p-3 bg-muted rounded-lg group">
            <button
              className="text-muted-foreground hover:text-foreground cursor-grab"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => moveItem(index, index - 1)}
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <span className="flex-1 text-sm">{item}</span>
            <button
              onClick={() => removeItem(index)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem())}
          placeholder="Add a deliverable..."
          className="flex-1"
        />
        <Button variant="outline" size="icon" onClick={addItem} disabled={!newItem.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-foreground mb-1">What's Included Automatically</p>
            <ul className="space-y-1">
              <li>• Your profile photo and name</li>
              <li>• Instagram follower count and engagement rate</li>
              <li>• Reach and impression metrics (if connected)</li>
              <li>• Your social media handles</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
