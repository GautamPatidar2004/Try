import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowLeft, ArrowDown, Plus, Mail, Bell, Clock, GitBranch, Zap, GripVertical, Trash2, Save } from "lucide-react";
import { useAutomationFlows, AutomationFlow, AutomationStep } from "@/hooks/useAutomationFlows";
import { StepEditorSidebar } from "./StepEditorSidebar";
import { useToast } from "@/hooks/use-toast";

interface FlowBuilderProps {
  flowId: string;
  onBack: () => void;
}

const STEP_ICONS: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  send_email: { icon: <Mail className="h-4 w-4" />, color: "text-blue-500 bg-blue-500/10 border-blue-500/30", label: "Send Email" },
  send_notification: { icon: <Bell className="h-4 w-4" />, color: "text-amber-500 bg-amber-500/10 border-amber-500/30", label: "Send Notification" },
  wait: { icon: <Clock className="h-4 w-4" />, color: "text-muted-foreground bg-muted border-border", label: "Wait" },
  condition: { icon: <GitBranch className="h-4 w-4" />, color: "text-purple-500 bg-purple-500/10 border-purple-500/30", label: "Condition" },
};

const TRIGGER_TYPES = [
  { value: "user_signup", label: "User Signup" },
  { value: "inactive_days", label: "User Inactive (days)" },
  { value: "profile_incomplete", label: "Incomplete Profile" },
  { value: "campaign_applied", label: "Campaign Applied" },
  { value: "booking_confirmed", label: "Booking Confirmed" },
  { value: "property_listed", label: "New Property Listed" },
  { value: "campaign_listed", label: "New Campaign Listed" },
  { value: "manual", label: "Manual Trigger" },
];

export const FlowBuilder = ({ flowId, onBack }: FlowBuilderProps) => {
  const { flows, getStepsForFlow, updateFlow, addStep, updateStep, deleteStep, reorderSteps } = useAutomationFlows();
  const { toast } = useToast();
  const flow = flows?.find((f) => f.id === flowId);
  const steps = getStepsForFlow(flowId);

  const [editingStep, setEditingStep] = useState<AutomationStep | null>(null);
  const [flowName, setFlowName] = useState(flow?.name || "");
  const [flowDescription, setFlowDescription] = useState(flow?.description || "");
  const [triggerType, setTriggerType] = useState(flow?.trigger_type || "manual");
  const [triggerConfig, setTriggerConfig] = useState<any>(flow?.trigger_config || {});
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [nameEdited, setNameEdited] = useState(false);

  // Sync flow data when it loads
  if (flow && !nameEdited && flowName !== flow.name) {
    setFlowName(flow.name);
    setFlowDescription(flow.description || "");
    setTriggerType(flow.trigger_type);
    setTriggerConfig(flow.trigger_config || {});
  }

  const handleSaveFlow = () => {
    updateFlow.mutate({
      id: flowId,
      name: flowName,
      description: flowDescription,
      trigger_type: triggerType,
      trigger_config: triggerConfig,
    });
    toast({ title: "Flow saved" });
  };

  const handleAddStep = (stepType: string) => {
    const nextPos = steps.length;
    const defaultConfig: Record<string, any> = {
      send_email: { subject: "", content: "" },
      send_notification: { title: "", message: "" },
      wait: { description: "" },
      condition: { description: "" },
    };
    addStep.mutate({
      flow_id: flowId,
      step_type: stepType,
      step_config: defaultConfig[stepType] || {},
      delay_hours: stepType === "wait" ? 24 : 0,
      position: nextPos,
    });
  };

  const handleUpdateStep = (id: string, updates: { step_type?: string; step_config?: any; delay_hours?: number }) => {
    updateStep.mutate({ id, ...updates });
  };

  const handleDeleteStep = (id: string) => {
    deleteStep.mutate(id);
  };

  const handleDragStart = (idx: number) => setDragIdx(idx);

  const handleDrop = (targetIdx: number) => {
    if (dragIdx === null || dragIdx === targetIdx) return;
    const reordered = [...steps];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(targetIdx, 0, moved);
    reorderSteps.mutate(reordered.map((s, i) => ({ id: s.id, position: i })));
    setDragIdx(null);
  };

  const getStepSummary = (step: AutomationStep) => {
    const c = step.step_config || {};
    switch (step.step_type) {
      case "send_email": return c.subject || "Untitled email";
      case "send_notification": return c.title || "Untitled notification";
      case "wait": return c.description || `Wait ${step.delay_hours}h`;
      case "condition": return c.description || "Condition";
      default: return step.step_type;
    }
  };

  const formatDelay = (hours: number) => {
    if (hours === 0) return "Immediately";
    if (hours < 24) return `${hours}h delay`;
    const days = Math.floor(hours / 24);
    const rem = hours % 24;
    return `${days}d${rem ? ` ${rem}h` : ""} delay`;
  };

  if (!flow) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Flow not found.</p>
        <Button variant="outline" className="mt-4" onClick={onBack}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <Input
              value={flowName}
              onChange={(e) => { setFlowName(e.target.value); setNameEdited(true); }}
              className="text-lg font-semibold border-none bg-transparent p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Flow name..."
            />
            <Input
              value={flowDescription}
              onChange={(e) => { setFlowDescription(e.target.value); setNameEdited(true); }}
              className="text-sm text-muted-foreground border-none bg-transparent p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 mt-0.5"
              placeholder="Description..."
            />
          </div>
        </div>
        <Button onClick={handleSaveFlow} disabled={updateFlow.isPending}>
          <Save className="h-4 w-4 mr-2" />
          Save Flow
        </Button>
      </div>

      {/* Trigger Node */}
      <div className="flex justify-center">
        <Card className="w-full max-w-lg border-2 border-primary/30 bg-primary/5 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">Trigger</span>
                <Badge variant="outline" className="text-xs">Start</Badge>
              </div>
              <Select value={triggerType} onValueChange={(v) => { setTriggerType(v); setNameEdited(true); }}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRIGGER_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {triggerType === "user_signup" && (
                <Select
                  value={triggerConfig.user_type || "all"}
                  onValueChange={(v) => { setTriggerConfig({ ...triggerConfig, user_type: v }); setNameEdited(true); }}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="User type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="influencer">Creators</SelectItem>
                    <SelectItem value="brand">Brands</SelectItem>
                    <SelectItem value="host">Hosts</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {triggerType === "inactive_days" && (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    className="h-8 text-xs w-20"
                    value={triggerConfig.days || 14}
                    onChange={(e) => { setTriggerConfig({ ...triggerConfig, days: parseInt(e.target.value) || 14 }); setNameEdited(true); }}
                  />
                  <span className="text-xs text-muted-foreground">days inactive</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Steps Chain */}
      {steps.map((step, idx) => {
        const meta = STEP_ICONS[step.step_type] || STEP_ICONS.send_email;
        const isCondition = step.step_type === "condition";
        const yesSteps = step.step_config?.yes_steps || [];
        const noSteps = step.step_config?.no_steps || [];

        return (
          <div key={step.id}>
            {/* Connector */}
            <div className="flex flex-col items-center py-1">
              <div className="w-px h-4 bg-border" />
              <ArrowDown className="h-4 w-4 text-muted-foreground" />
              {step.delay_hours > 0 && step.step_type !== "wait" && (
                <span className="text-[10px] text-muted-foreground">{formatDelay(step.delay_hours)}</span>
              )}
            </div>

            {/* Step Node */}
            <div className="flex justify-center">
              <Card
                className={`w-full max-w-lg border-2 p-4 cursor-pointer transition-all hover:shadow-md ${meta.color} ${editingStep?.id === step.id ? "ring-2 ring-primary" : ""}`}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(idx)}
                onClick={() => setEditingStep(step)}
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  <div className="p-2 rounded-lg bg-background/60">
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{meta.label}</span>
                      <Badge variant="secondary" className="text-[10px]">#{idx + 1}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{getStepSummary(step)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={(e) => { e.stopPropagation(); handleDeleteStep(step.id); }}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </Card>
            </div>

            {/* Branch Fork Visualization for Condition Steps */}
            {isCondition && (yesSteps.length > 0 || noSteps.length > 0) && (
              <div className="flex justify-center">
                <div className="w-full max-w-lg">
                  {/* Fork connector */}
                  <div className="flex justify-center">
                    <div className="w-px h-4 bg-border" />
                  </div>
                  {/* Two columns */}
                  <div className="grid grid-cols-2 gap-4 relative">
                    {/* Horizontal connector line */}
                    <div className="absolute top-0 left-1/4 right-1/4 h-px bg-border" />
                    {/* Left vertical lines */}
                    <div className="absolute top-0 left-1/4 w-px h-4 bg-border" />
                    <div className="absolute top-0 right-1/4 w-px h-4 bg-border" />

                    {/* Yes Branch */}
                    <div className="pt-5 space-y-2">
                      <div className="flex items-center justify-center gap-1.5 mb-2">
                        <Badge className="bg-green-500/15 text-green-600 border-green-500/30 text-[10px]">✓ Yes</Badge>
                      </div>
                      {yesSteps.map((bs: any, bIdx: number) => (
                        <Card key={bIdx} className="p-2.5 border bg-green-500/5 border-green-500/20">
                          <div className="flex items-center gap-2">
                            {bs.step_type === "send_email" ? (
                              <Mail className="h-3 w-3 text-blue-500 shrink-0" />
                            ) : (
                              <Bell className="h-3 w-3 text-amber-500 shrink-0" />
                            )}
                            <span className="text-xs truncate">
                              {bs.step_type === "send_email"
                                ? bs.step_config?.subject || "Untitled email"
                                : bs.step_config?.title || "Untitled notification"}
                            </span>
                          </div>
                        </Card>
                      ))}
                      {yesSteps.length === 0 && (
                        <p className="text-[10px] text-center text-muted-foreground italic">No actions</p>
                      )}
                    </div>

                    {/* No Branch */}
                    <div className="pt-5 space-y-2">
                      <div className="flex items-center justify-center gap-1.5 mb-2">
                        <Badge className="bg-red-500/15 text-red-600 border-red-500/30 text-[10px]">✗ No</Badge>
                      </div>
                      {noSteps.map((bs: any, bIdx: number) => (
                        <Card key={bIdx} className="p-2.5 border bg-red-500/5 border-red-500/20">
                          <div className="flex items-center gap-2">
                            {bs.step_type === "send_email" ? (
                              <Mail className="h-3 w-3 text-blue-500 shrink-0" />
                            ) : (
                              <Bell className="h-3 w-3 text-amber-500 shrink-0" />
                            )}
                            <span className="text-xs truncate">
                              {bs.step_type === "send_email"
                                ? bs.step_config?.subject || "Untitled email"
                                : bs.step_config?.title || "Untitled notification"}
                            </span>
                          </div>
                        </Card>
                      ))}
                      {noSteps.length === 0 && (
                        <p className="text-[10px] text-center text-muted-foreground italic">No actions</p>
                      )}
                    </div>
                  </div>
                  {/* Merge connector */}
                  <div className="flex justify-center relative">
                    <div className="absolute -top-0 left-1/4 right-1/4 h-px bg-border" />
                    <div className="w-px h-4 bg-border" />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Add Step */}
      <div className="flex flex-col items-center py-1">
        {steps.length > 0 && (
          <>
            <div className="w-px h-4 bg-border" />
            <ArrowDown className="h-4 w-4 text-muted-foreground" />
          </>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="mt-2 border-dashed" disabled={addStep.isPending}>
              <Plus className="h-4 w-4 mr-2" />
              Add Step
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleAddStep("send_email")}>
              <Mail className="h-4 w-4 mr-2 text-blue-500" /> Send Email
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddStep("send_notification")}>
              <Bell className="h-4 w-4 mr-2 text-amber-500" /> Send Notification
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddStep("wait")}>
              <Clock className="h-4 w-4 mr-2" /> Wait / Delay
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddStep("condition")}>
              <GitBranch className="h-4 w-4 mr-2 text-purple-500" /> Condition
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Step Editor Sidebar */}
      <StepEditorSidebar
        step={editingStep}
        open={!!editingStep}
        onClose={() => setEditingStep(null)}
        onUpdate={handleUpdateStep}
        onDelete={handleDeleteStep}
      />
    </div>
  );
};
