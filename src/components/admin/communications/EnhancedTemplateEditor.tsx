import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Trash2, Variable, Eye, Smartphone, Monitor } from "lucide-react";
import { useCommunications } from "@/hooks/useCommunications";

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "onboarding", label: "Onboarding" },
  { value: "re-engagement", label: "Re-engagement" },
  { value: "announcement", label: "Announcement" },
  { value: "opportunity", label: "Opportunity" },
  { value: "milestone", label: "Milestone" },
  { value: "custom", label: "Custom" },
];

const VARIABLES = [
  { key: "{{first_name}}", label: "First Name" },
  { key: "{{last_name}}", label: "Last Name" },
  { key: "{{user_type}}", label: "User Type" },
  { key: "{{email}}", label: "Email" },
  { key: "{{days_since_signup}}", label: "Days Since Signup" },
  { key: "{{platform_name}}", label: "Platform Name" },
];

export const EnhancedTemplateEditor = () => {
  const { templates, createTemplate, deleteTemplate } = useCommunications();
  const [isCreating, setIsCreating] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [showPreview, setShowPreview] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    type: "email" as "email" | "notification" | "both",
    category: "custom",
    subject: "",
    content: "",
  });

  const insertVariable = (variable: string) => {
    setNewTemplate((prev) => ({ ...prev, content: prev.content + variable }));
  };

  const handleCreate = () => {
    if (!newTemplate.name.trim() || !newTemplate.content.trim()) return;
    createTemplate.mutate(
      {
        name: newTemplate.name,
        type: newTemplate.type,
        subject: newTemplate.subject || null,
        content: newTemplate.content,
        variables: VARIABLES.filter((v) => newTemplate.content.includes(v.key)).map((v) => v.key),
        is_active: true,
      },
      {
        onSuccess: () => {
          setIsCreating(false);
          setNewTemplate({ name: "", type: "email", category: "custom", subject: "", content: "" });
        },
      }
    );
  };

  const filteredTemplates = templates?.filter((t) => {
    if (categoryFilter === "all") return true;
    return (t as any).category === categoryFilter;
  });

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "onboarding": return "bg-blue-500/10 text-blue-500";
      case "re-engagement": return "bg-amber-500/10 text-amber-500";
      case "announcement": return "bg-purple-500/10 text-purple-500";
      case "opportunity": return "bg-green-500/10 text-green-500";
      case "milestone": return "bg-pink-500/10 text-pink-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const renderPreview = () => {
    const content = newTemplate.content
      .replace(/{{first_name}}/g, "John")
      .replace(/{{last_name}}/g, "Doe")
      .replace(/{{user_type}}/g, "Creator")
      .replace(/{{email}}/g, "john@example.com")
      .replace(/{{days_since_signup}}/g, "5")
      .replace(/{{platform_name}}/g, "Hostfluencer");

    return (
      <div className={`border rounded-lg p-4 bg-card ${previewMode === "mobile" ? "max-w-[375px] mx-auto" : ""}`}>
        {newTemplate.subject && (
          <div className="border-b pb-2 mb-3">
            <p className="text-xs text-muted-foreground">Subject</p>
            <p className="font-medium text-sm">{newTemplate.subject}</p>
          </div>
        )}
        <div className="text-sm whitespace-pre-wrap">{content}</div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Template Library
            </CardTitle>
            <CardDescription>Create and manage reusable templates with dynamic variables</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Template</DialogTitle>
                  <DialogDescription>Build a reusable message template with dynamic variables</DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="edit" className="mt-4">
                  <TabsList>
                    <TabsTrigger value="edit">Edit</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>
                  <TabsContent value="edit" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input placeholder="e.g., Welcome Email" value={newTemplate.name} onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={newTemplate.category} onValueChange={(v) => setNewTemplate({ ...newTemplate, category: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.filter((c) => c.value !== "all").map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select value={newTemplate.type} onValueChange={(v: "email" | "notification" | "both") => setNewTemplate({ ...newTemplate, type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="notification">Notification</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {(newTemplate.type === "email" || newTemplate.type === "both") && (
                      <div className="space-y-2">
                        <Label>Subject</Label>
                        <Input placeholder="Email subject..." value={newTemplate.subject} onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })} />
                      </div>
                    )}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Content</Label>
                        <div className="flex gap-1 flex-wrap">
                          {VARIABLES.map((v) => (
                            <Button key={v.key} variant="outline" size="sm" className="h-6 text-xs px-2" onClick={() => insertVariable(v.key)}>
                              <Variable className="h-3 w-3 mr-1" />
                              {v.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <Textarea
                        placeholder="Write your template content..."
                        value={newTemplate.content}
                        onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                        rows={10}
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                      <Button onClick={handleCreate} disabled={!newTemplate.name.trim() || !newTemplate.content.trim() || createTemplate.isPending}>
                        {createTemplate.isPending ? "Creating..." : "Create Template"}
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="preview" className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Button variant={previewMode === "desktop" ? "default" : "outline"} size="sm" onClick={() => setPreviewMode("desktop")}>
                        <Monitor className="h-4 w-4 mr-1" /> Desktop
                      </Button>
                      <Button variant={previewMode === "mobile" ? "default" : "outline"} size="sm" onClick={() => setPreviewMode("mobile")}>
                        <Smartphone className="h-4 w-4 mr-1" /> Mobile
                      </Button>
                    </div>
                    {renderPreview()}
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredTemplates && filteredTemplates.length > 0 ? (
          <div className="space-y-3">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium">{template.name}</h4>
                    <Badge variant="outline">{template.type}</Badge>
                    {(template as any).category && (
                      <Badge className={getCategoryColor((template as any).category)}>
                        {(template as any).category}
                      </Badge>
                    )}
                  </div>
                  {template.subject && (
                    <p className="text-sm text-muted-foreground mt-1">Subject: {template.subject}</p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{template.content}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteTemplate.mutate(template.id)} disabled={deleteTemplate.isPending}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {categoryFilter !== "all" ? "No templates in this category" : "No templates yet. Create your first one!"}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
