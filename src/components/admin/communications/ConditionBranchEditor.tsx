import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Mail, Bell } from "lucide-react";

const CONDITION_TYPES = [
  { value: "profile_complete", label: "Profile is Complete" },
  { value: "has_social_accounts", label: "Has Connected Social Accounts" },
  { value: "has_applied", label: "Has Applied to a Campaign" },
  { value: "follower_threshold", label: "Follower Count Above X" },
  { value: "custom", label: "Custom Condition" },
];

interface BranchStep {
  step_type: string;
  step_config: any;
  delay_hours: number;
}

interface ConditionBranchEditorProps {
  config: any;
  onConfigChange: (config: any) => void;
}

const BranchStepEditor = ({
  step,
  index,
  onUpdate,
  onDelete,
}: {
  step: BranchStep;
  index: number;
  onUpdate: (index: number, step: BranchStep) => void;
  onDelete: (index: number) => void;
}) => {
  const updateConfig = (key: string, value: string) => {
    onUpdate(index, { ...step, step_config: { ...step.step_config, [key]: value } });
  };

  return (
    <Card className="p-3 space-y-2 border bg-background/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {step.step_type === "send_email" ? (
            <Mail className="h-3.5 w-3.5 text-blue-500" />
          ) : (
            <Bell className="h-3.5 w-3.5 text-amber-500" />
          )}
          <span className="text-xs font-medium">
            {step.step_type === "send_email" ? "Email" : "Notification"}
          </span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onDelete(index)}>
          <Trash2 className="h-3 w-3 text-destructive" />
        </Button>
      </div>

      {step.step_type === "send_email" ? (
        <>
          <Input
            value={step.step_config?.subject || ""}
            onChange={(e) => updateConfig("subject", e.target.value)}
            placeholder="Subject..."
            className="h-7 text-xs"
          />
          <Textarea
            value={step.step_config?.content || ""}
            onChange={(e) => updateConfig("content", e.target.value)}
            placeholder="Email body..."
            rows={3}
            className="text-xs"
          />
        </>
      ) : (
        <>
          <Input
            value={step.step_config?.title || ""}
            onChange={(e) => updateConfig("title", e.target.value)}
            placeholder="Title..."
            className="h-7 text-xs"
          />
          <Textarea
            value={step.step_config?.message || ""}
            onChange={(e) => updateConfig("message", e.target.value)}
            placeholder="Message..."
            rows={2}
            className="text-xs"
          />
        </>
      )}
    </Card>
  );
};

export const ConditionBranchEditor = ({ config, onConfigChange }: ConditionBranchEditorProps) => {
  const conditionField = config.condition_field || "";
  const yesSteps: BranchStep[] = config.yes_steps || [];
  const noSteps: BranchStep[] = config.no_steps || [];

  const updateField = (key: string, value: any) => {
    onConfigChange({ ...config, [key]: value });
  };

  const addBranchStep = (branch: "yes_steps" | "no_steps", stepType: string) => {
    const current = config[branch] || [];
    const defaultConfig = stepType === "send_email"
      ? { subject: "", content: "" }
      : { title: "", message: "" };
    updateField(branch, [...current, { step_type: stepType, step_config: defaultConfig, delay_hours: 0 }]);
  };

  const updateBranchStep = (branch: "yes_steps" | "no_steps", index: number, step: BranchStep) => {
    const current = [...(config[branch] || [])];
    current[index] = step;
    updateField(branch, current);
  };

  const deleteBranchStep = (branch: "yes_steps" | "no_steps", index: number) => {
    const current = [...(config[branch] || [])];
    current.splice(index, 1);
    updateField(branch, current);
  };

  return (
    <div className="space-y-4">
      {/* Condition Type */}
      <div className="space-y-2">
        <Label>Condition Type</Label>
        <Select value={conditionField} onValueChange={(v) => updateField("condition_field", v)}>
          <SelectTrigger><SelectValue placeholder="Select condition..." /></SelectTrigger>
          <SelectContent>
            {CONDITION_TYPES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {conditionField === "follower_threshold" && (
        <div className="space-y-2">
          <Label>Minimum Followers</Label>
          <Input
            type="number"
            min={0}
            value={config.follower_min || ""}
            onChange={(e) => updateField("follower_min", parseInt(e.target.value) || 0)}
            placeholder="e.g. 10000"
          />
        </div>
      )}

      {conditionField === "custom" && (
        <div className="space-y-2">
          <Label>Description</Label>
          <Input
            value={config.description || ""}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="e.g. If user has verified email..."
          />
        </div>
      )}

      {/* Yes Branch */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge className="bg-green-500/15 text-green-600 border-green-500/30 hover:bg-green-500/20">Yes</Badge>
          <span className="text-xs text-muted-foreground">Condition met</span>
        </div>
        <div className="space-y-2 pl-3 border-l-2 border-green-500/30">
          {yesSteps.map((step, i) => (
            <BranchStepEditor
              key={i}
              step={step}
              index={i}
              onUpdate={(idx, s) => updateBranchStep("yes_steps", idx, s)}
              onDelete={(idx) => deleteBranchStep("yes_steps", idx)}
            />
          ))}
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => addBranchStep("yes_steps", "send_email")}>
              <Mail className="h-3 w-3 mr-1" /> Email
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => addBranchStep("yes_steps", "send_notification")}>
              <Bell className="h-3 w-3 mr-1" /> Notification
            </Button>
          </div>
        </div>
      </div>

      {/* No Branch */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge className="bg-red-500/15 text-red-600 border-red-500/30 hover:bg-red-500/20">No</Badge>
          <span className="text-xs text-muted-foreground">Condition not met</span>
        </div>
        <div className="space-y-2 pl-3 border-l-2 border-red-500/30">
          {noSteps.map((step, i) => (
            <BranchStepEditor
              key={i}
              step={step}
              index={i}
              onUpdate={(idx, s) => updateBranchStep("no_steps", idx, s)}
              onDelete={(idx) => deleteBranchStep("no_steps", idx)}
            />
          ))}
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => addBranchStep("no_steps", "send_email")}>
              <Mail className="h-3 w-3 mr-1" /> Email
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => addBranchStep("no_steps", "send_notification")}>
              <Bell className="h-3 w-3 mr-1" /> Notification
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
