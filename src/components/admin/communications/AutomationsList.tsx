import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Workflow, Plus, Trash2, Users, Pencil, Clock, FileText } from "lucide-react";
import { useAutomationFlows, PREBUILT_FLOWS } from "@/hooks/useAutomationFlows";
import { FlowBuilder } from "./FlowBuilder";

export const AutomationsList = () => {
  const { flows, flowsLoading, enrollmentCounts, createFlow, createBlankFlow, toggleFlowStatus, deleteFlow, getStepsForFlow } = useAutomationFlows();
  const [editingFlowId, setEditingFlowId] = useState<string | null>(null);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);

  const existingFlowNames = flows?.map((f) => f.name) || [];
  const availableTemplates = PREBUILT_FLOWS.filter((t) => !existingFlowNames.includes(t.name));

  const getTriggerLabel = (type: string) => {
    switch (type) {
      case "user_signup": return "User Signup";
      case "inactive_days": return "Inactivity";
      case "profile_incomplete": return "Incomplete Profile";
      case "campaign_applied": return "Campaign Applied";
      case "booking_confirmed": return "Booking Confirmed";
      case "property_listed": return "New Property";
      case "campaign_listed": return "New Campaign";
      case "manual": return "Manual";
      default: return type;
    }
  };

  const handleCreateBlank = async () => {
    const result = await createBlankFlow.mutateAsync();
    setEditingFlowId(result.id);
  };

  const handleCreateFromTemplate = async (template: typeof PREBUILT_FLOWS[0]) => {
    const result = await createFlow.mutateAsync(template);
    setIsTemplateDialogOpen(false);
    setEditingFlowId(result.id);
  };

  // If editing a flow, show the builder
  if (editingFlowId) {
    return <FlowBuilder flowId={editingFlowId} onBack={() => setEditingFlowId(null)} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            Automation Flows
          </h3>
          <p className="text-sm text-muted-foreground">Build custom email & notification sequences</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCreateBlank} disabled={createBlankFlow.isPending}>
            <Plus className="h-4 w-4 mr-2" />
            Blank Flow
          </Button>
          {availableTemplates.length > 0 && (
            <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  From Template
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start from a Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 mt-2">
                  {availableTemplates.map((template, idx) => (
                    <div key={idx} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">{getTriggerLabel(template.trigger_type)}</Badge>
                            <Badge variant="secondary" className="text-xs">{template.steps.length} steps</Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleCreateFromTemplate(template)}
                          disabled={createFlow.isPending}
                        >
                          Use
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {flowsLoading ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">Loading...</CardContent>
        </Card>
      ) : flows && flows.length > 0 ? (
        <div className="space-y-3">
          {flows.map((flow) => {
            const counts = enrollmentCounts?.[flow.id] || { active: 0, completed: 0, total: 0 };
            const steps = getStepsForFlow(flow.id);

            return (
              <Card key={flow.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{flow.name}</h4>
                        <Badge variant={flow.status === "active" ? "default" : "secondary"}>
                          {flow.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {getTriggerLabel(flow.trigger_type)}
                        </Badge>
                      </div>
                      {flow.description && (
                        <p className="text-sm text-muted-foreground mt-1">{flow.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {counts.total} enrolled
                        </span>
                        <span>{counts.active} active</span>
                        <span>{counts.completed} completed</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {steps.length} steps
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingFlowId(flow.id)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Switch
                        checked={flow.status === "active"}
                        onCheckedChange={() => toggleFlowStatus.mutate({ id: flow.id, status: flow.status })}
                      />
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteFlow.mutate(flow.id)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Workflow className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">No automation flows yet</p>
            <div className="flex justify-center gap-2">
              <Button variant="outline" onClick={handleCreateBlank}>
                <Plus className="h-4 w-4 mr-2" />
                Blank Flow
              </Button>
              <Button onClick={() => setIsTemplateDialogOpen(true)}>
                <FileText className="h-4 w-4 mr-2" />
                From Template
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
