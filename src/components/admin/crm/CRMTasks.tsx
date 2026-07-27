import { useState } from "react";
import { useCRMTasks } from "@/hooks/useCRMTasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, AlertCircle, Search, X } from "lucide-react";
import { format, isPast } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

const UserSearchPicker = ({ value, onChange }: { value: { id: string; name: string } | null; onChange: (v: { id: string; name: string } | null) => void }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);

  const searchQuery = useQuery({
    queryKey: ["user-search", searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, user_type")
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: searchTerm.length >= 2,
  });

  if (value) {
    return (
      <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
        <span className="text-sm flex-1">{value.name}</span>
        <X className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground" onClick={() => onChange(null)} />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search user to link..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          className="pl-9"
        />
      </div>
      {showResults && searchQuery.data && searchQuery.data.length > 0 && (
        <div className="absolute z-50 mt-1 w-full border rounded-md bg-popover shadow-md max-h-40 overflow-y-auto">
          {searchQuery.data.map((user: any) => (
            <button
              key={user.id}
              className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center justify-between"
              onClick={() => {
                onChange({ id: user.id, name: `${user.first_name || ""} ${user.last_name || ""}`.trim() });
                setSearchTerm("");
                setShowResults(false);
              }}
            >
              <span>{user.first_name || ""} {user.last_name || ""}</span>
              {user.user_type && <Badge variant="outline" className="text-[10px]">{user.user_type}</Badge>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const CRMTasks = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "medium", due_date: "" });
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string } | null>(null);

  const { tasks, isLoading, createTask, updateTask, deleteTask } = useCRMTasks({
    status: statusFilter,
    priority: priorityFilter,
  });

  const handleCreate = () => {
    if (!newTask.title.trim()) return;
    createTask.mutate({
      title: newTask.title,
      description: newTask.description || undefined,
      priority: newTask.priority,
      due_date: newTask.due_date || undefined,
      user_id: selectedUser?.id,
    });
    setNewTask({ title: "", description: "", priority: "medium", due_date: "" });
    setSelectedUser(null);
    setDialogOpen(false);
  };

  const toggleComplete = (task: any) => {
    if (task.status === "done") {
      updateTask.mutate({ id: task.id, status: "todo", completed_at: null });
    } else {
      updateTask.mutate({ id: task.id, status: "done", completed_at: new Date().toISOString() });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tasks & Follow-ups</h2>
        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1" /> New Task</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Task title" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} />
                <Textarea placeholder="Description (optional)" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} />
                <UserSearchPicker value={selectedUser} onChange={setSelectedUser} />
                <div className="flex gap-3">
                  <Select value={newTask.priority} onValueChange={(v) => setNewTask({ ...newTask, priority: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="date" value={newTask.due_date} onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })} />
                </div>
                <Button onClick={handleCreate} className="w-full" disabled={!newTask.title.trim()}>Create Task</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => {
            const isOverdue = task.due_date && task.status !== "done" && isPast(new Date(task.due_date));
            return (
              <div
                key={task.id}
                className={`flex items-start gap-3 p-3 rounded-lg border bg-card ${isOverdue ? "border-destructive/50" : ""}`}
              >
                <Checkbox
                  checked={task.status === "done"}
                  onCheckedChange={() => toggleComplete(task)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                    {task.title}
                  </p>
                  {task.description && <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <Badge className={`text-[10px] ${priorityColors[task.priority] || ""}`}>{task.priority}</Badge>
                    {task.related_user && (
                      <span className="text-xs text-muted-foreground">
                        Re: {task.related_user.first_name} {task.related_user.last_name}
                      </span>
                    )}
                    {task.due_date && (
                      <span className={`text-xs flex items-center gap-1 ${isOverdue ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                        {isOverdue && <AlertCircle className="h-3 w-3" />}
                        Due {format(new Date(task.due_date), "MMM d")}
                      </span>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => deleteTask.mutate(task.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>
            );
          })}
          {tasks.length === 0 && (
            <p className="text-center py-8 text-muted-foreground">No tasks found</p>
          )}
        </div>
      )}
    </div>
  );
};
