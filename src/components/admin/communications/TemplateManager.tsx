import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Plus, Trash2 } from "lucide-react";
import { useCommunications } from "@/hooks/useCommunications";
import { Badge } from "@/components/ui/badge";

export const TemplateManager = () => {
  const { templates, createTemplate, deleteTemplate } = useCommunications();
  const [isCreating, setIsCreating] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    type: "email" as "email" | "notification" | "both",
    subject: "",
    content: "",
  });

  const handleCreateTemplate = () => {
    if (!newTemplate.name.trim() || !newTemplate.content.trim()) return;

    createTemplate.mutate(
      {
        name: newTemplate.name,
        type: newTemplate.type,
        subject: newTemplate.subject || null,
        content: newTemplate.content,
        variables: [],
        is_active: true,
      },
      {
        onSuccess: () => {
          setIsCreating(false);
          setNewTemplate({
            name: "",
            type: "email",
            subject: "",
            content: "",
          });
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Message Templates
            </CardTitle>
            <CardDescription>Create and manage reusable templates</CardDescription>
          </div>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Template</DialogTitle>
                <DialogDescription>
                  Create a reusable message template for emails or notifications
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    placeholder="e.g., Welcome Email"
                    value={newTemplate.name}
                    onChange={(e) =>
                      setNewTemplate({ ...newTemplate, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Template Type</Label>
                  <Select
                    value={newTemplate.type}
                    onValueChange={(val: "email" | "notification" | "both") =>
                      setNewTemplate({ ...newTemplate, type: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="notification">Notification</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(newTemplate.type === "email" || newTemplate.type === "both") && (
                  <div className="space-y-2">
                    <Label htmlFor="template-subject">Email Subject</Label>
                    <Input
                      id="template-subject"
                      placeholder="Enter email subject..."
                      value={newTemplate.subject}
                      onChange={(e) =>
                        setNewTemplate({ ...newTemplate, subject: e.target.value })
                      }
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="template-content">Content</Label>
                  <Textarea
                    id="template-content"
                    placeholder="Enter template content..."
                    value={newTemplate.content}
                    onChange={(e) =>
                      setNewTemplate({ ...newTemplate, content: e.target.value })
                    }
                    rows={8}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use variables: {"{firstName}"}, {"{lastName}"}, {"{email}"}
                  </p>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateTemplate}
                    disabled={
                      !newTemplate.name.trim() ||
                      !newTemplate.content.trim() ||
                      createTemplate.isPending
                    }
                  >
                    {createTemplate.isPending ? "Creating..." : "Create Template"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {templates && templates.length > 0 ? (
          <div className="space-y-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{template.name}</h4>
                    <Badge variant="outline">{template.type}</Badge>
                  </div>
                  {template.subject && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Subject: {template.subject}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {template.content}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteTemplate.mutate(template.id)}
                  disabled={deleteTemplate.isPending}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No templates yet. Create your first one!
          </div>
        )}
      </CardContent>
    </Card>
  );
};
