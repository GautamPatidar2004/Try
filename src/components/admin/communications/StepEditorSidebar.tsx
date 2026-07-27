import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Variable } from "lucide-react";
import { AutomationStep } from "@/hooks/useAutomationFlows";
import { ConditionBranchEditor } from "./ConditionBranchEditor";

const PERSONAL_VARIABLES = [
  { key: "{{first_name}}", label: "First Name" },
  { key: "{{last_name}}", label: "Last Name" },
  { key: "{{user_type}}", label: "User Type" },
  { key: "{{email}}", label: "Email" },
  { key: "{{days_since_signup}}", label: "Days Since Signup" },
];

const PLATFORM_VARIABLES = [
  { key: "{{new_opportunities_count}}", label: "New Opportunities" },
  { key: "{{recent_collab_location}}", label: "Recent Collab Location" },
  { key: "{{creators_matched_count}}", label: "Creators Matched" },
  { key: "{{active_brands_count}}", label: "Active Brands" },
  { key: "{{trending_category}}", label: "Trending Category" },
];

const VARIABLES = [...PERSONAL_VARIABLES, ...PLATFORM_VARIABLES];

const VariableChips = ({ field, onInsert }: { field: string; onInsert: (key: string, field: string) => void }) => (
  <div className="space-y-1.5">
    <div className="flex flex-wrap gap-1">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium w-full">Personal</span>
      {PERSONAL_VARIABLES.map((v) => (
        <Badge
          key={v.key}
          variant="outline"
          className="cursor-pointer text-xs hover:bg-accent"
          onClick={() => onInsert(v.key, field)}
        >
          <Variable className="h-3 w-3 mr-1" />{v.label}
        </Badge>
      ))}
    </div>
    <div className="flex flex-wrap gap-1">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium w-full">Platform Stats</span>
      {PLATFORM_VARIABLES.map((v) => (
        <Badge
          key={v.key}
          variant="outline"
          className="cursor-pointer text-xs hover:bg-accent border-primary/30"
          onClick={() => onInsert(v.key, field)}
        >
          <Variable className="h-3 w-3 mr-1" />{v.label}
        </Badge>
      ))}
    </div>
  </div>
);

interface StepEditorSidebarProps {
  step: AutomationStep | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: { step_type?: string; step_config?: any; delay_hours?: number }) => void;
  onDelete: (id: string) => void;
}

export const StepEditorSidebar = ({ step, open, onClose, onUpdate, onDelete }: StepEditorSidebarProps) => {
  const [stepType, setStepType] = useState(step?.step_type || "send_email");
  const [delayHours, setDelayHours] = useState(step?.delay_hours || 0);
  const [config, setConfig] = useState<any>(step?.step_config || {});

  useEffect(() => {
    if (step) {
      setStepType(step.step_type);
      setDelayHours(step.delay_hours);
      setConfig(step.step_config || {});
    }
  }, [step]);

  if (!step) return null;

  const handleSave = () => {
    onUpdate(step.id, { step_type: stepType, step_config: config, delay_hours: delayHours });
    onClose();
  };

  const insertVariable = (variable: string, field: string) => {
    setConfig((prev: any) => ({ ...prev, [field]: (prev[field] || "") + variable }));
  };

  const updateConfig = (key: string, value: string) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-[420px] sm:w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Step</SheetTitle>
        </SheetHeader>

        <div className="space-y-5 mt-4">
          {/* Step Type */}
          <div className="space-y-2">
            <Label>Step Type</Label>
            <Select value={stepType} onValueChange={setStepType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="send_email">Send Email</SelectItem>
                <SelectItem value="send_notification">Send Notification</SelectItem>
                <SelectItem value="wait">Wait / Delay</SelectItem>
                <SelectItem value="condition">Condition (Phase 2)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Delay */}
          <div className="space-y-2">
            <Label>Delay before this step</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                value={delayHours}
                onChange={(e) => setDelayHours(parseInt(e.target.value) || 0)}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">hours</span>
              {delayHours >= 24 && (
                <span className="text-xs text-muted-foreground">
                  ({Math.floor(delayHours / 24)}d {delayHours % 24}h)
                </span>
              )}
            </div>
          </div>

          {/* Email Fields */}
          {stepType === "send_email" && (
            <>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  value={config.subject || ""}
                  onChange={(e) => updateConfig("subject", e.target.value)}
                  placeholder="Email subject line..."
                />
                <VariableChips field="subject" onInsert={insertVariable} />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  value={config.content || ""}
                  onChange={(e) => updateConfig("content", e.target.value)}
                  placeholder="Email body content..."
                  rows={8}
                />
                <VariableChips field="content" onInsert={insertVariable} />
              </div>
            </>
          )}

          {/* Notification Fields */}
          {stepType === "send_notification" && (
            <>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={config.title || ""}
                  onChange={(e) => updateConfig("title", e.target.value)}
                  placeholder="Notification title..."
                />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  value={config.message || ""}
                  onChange={(e) => updateConfig("message", e.target.value)}
                  placeholder="Notification message..."
                  rows={4}
                />
                <VariableChips field="message" onInsert={insertVariable} />
              </div>
            </>
          )}

          {/* Wait Fields */}
          {stepType === "wait" && (
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={config.description || ""}
                onChange={(e) => updateConfig("description", e.target.value)}
                placeholder="e.g. Wait 3 days for user to respond"
              />
              <p className="text-xs text-muted-foreground">
                The delay above controls how long this step waits. The description is for your reference.
              </p>
            </div>
          )}

          {/* Condition Editor with Branches */}
          {stepType === "condition" && (
            <ConditionBranchEditor config={config} onConfigChange={setConfig} />
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="destructive" size="sm" onClick={() => { onDelete(step.id); onClose(); }}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Step
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
              <Button size="sm" onClick={handleSave}>Save Changes</Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
