import { useState, useRef, useCallback, useEffect } from "react";
import DOMPurify from "dompurify";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link,
  Heading1,
  Heading2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Code,
  Quote,
  User,
  Mail,
  Type,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface RichEmailEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const RichEmailEditor = ({ value, onChange, placeholder }: RichEmailEditorProps) => {
  const [mode, setMode] = useState<"visual" | "html">("visual");
  const editorRef = useRef<HTMLDivElement>(null);
  const lastSyncedHtml = useRef<string>("");

  // Set innerHTML imperatively only on mount and when switching to visual mode
  useEffect(() => {
    if (mode === "visual" && editorRef.current) {
      const sanitized = DOMPurify.sanitize(value);
      if (editorRef.current.innerHTML !== sanitized) {
        editorRef.current.innerHTML = sanitized;
        lastSyncedHtml.current = sanitized;
      }
    }
  }, [mode]); // Only on mode change (includes initial mount)

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    syncContent();
  }, []);

  const syncContent = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      lastSyncedHtml.current = html;
      onChange(html);
    }
  }, [onChange]);

  const insertVariable = useCallback((variable: string) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement("span");
      span.className = "bg-primary/20 text-primary px-1 rounded text-sm font-mono";
      span.contentEditable = "false";
      span.textContent = `{${variable}}`;
      range.insertNode(span);
      range.setStartAfter(span);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    } else if (editorRef.current) {
      editorRef.current.innerHTML += `<span class="bg-primary/20 text-primary px-1 rounded text-sm font-mono" contenteditable="false">{${variable}}</span>`;
    }
    syncContent();
  }, [syncContent]);

  const ToolbarButton = ({ icon: Icon, onClick, title, active }: { icon: any; onClick: () => void; title: string; active?: boolean }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      title={title}
      className={cn("h-8 w-8 p-0", active && "bg-accent")}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      <Tabs value={mode} onValueChange={(v) => setMode(v as "visual" | "html")}>
        <div className="border-b bg-muted/30">
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-1 flex-wrap">
              {mode === "visual" && (
                <>
                  <ToolbarButton icon={Bold} onClick={() => execCommand("bold")} title="Bold" />
                  <ToolbarButton icon={Italic} onClick={() => execCommand("italic")} title="Italic" />
                  <ToolbarButton icon={Underline} onClick={() => execCommand("underline")} title="Underline" />
                  <div className="w-px h-6 bg-border mx-1" />
                  <ToolbarButton icon={Heading1} onClick={() => execCommand("formatBlock", "h1")} title="Heading 1" />
                  <ToolbarButton icon={Heading2} onClick={() => execCommand("formatBlock", "h2")} title="Heading 2" />
                  <div className="w-px h-6 bg-border mx-1" />
                  <ToolbarButton icon={List} onClick={() => execCommand("insertUnorderedList")} title="Bullet List" />
                  <ToolbarButton icon={ListOrdered} onClick={() => execCommand("insertOrderedList")} title="Numbered List" />
                  <div className="w-px h-6 bg-border mx-1" />
                  <ToolbarButton icon={AlignLeft} onClick={() => execCommand("justifyLeft")} title="Align Left" />
                  <ToolbarButton icon={AlignCenter} onClick={() => execCommand("justifyCenter")} title="Align Center" />
                  <ToolbarButton icon={AlignRight} onClick={() => execCommand("justifyRight")} title="Align Right" />
                  <div className="w-px h-6 bg-border mx-1" />
                  <ToolbarButton
                    icon={Link}
                    onClick={() => {
                      const url = prompt("Enter URL:");
                      if (url) execCommand("createLink", url);
                    }}
                    title="Insert Link"
                  />
                  <ToolbarButton icon={Quote} onClick={() => execCommand("formatBlock", "blockquote")} title="Quote" />
                  <div className="w-px h-6 bg-border mx-1" />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
                        <User className="h-4 w-4" />
                        <span className="text-xs">Variables</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => insertVariable("firstName")}>
                        <User className="h-4 w-4 mr-2" />
                        First Name
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => insertVariable("lastName")}>
                        <User className="h-4 w-4 mr-2" />
                        Last Name
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => insertVariable("email")}>
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => insertVariable("userType")}>
                        <Type className="h-4 w-4 mr-2" />
                        User Type
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
            <TabsList className="h-8">
              <TabsTrigger value="visual" className="text-xs h-6 px-2">Visual</TabsTrigger>
              <TabsTrigger value="html" className="text-xs h-6 px-2">
                <Code className="h-3 w-3 mr-1" />
                HTML
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="visual" className="m-0">
          <div
            ref={editorRef}
            contentEditable
            className="min-h-[300px] p-4 focus:outline-none prose prose-sm max-w-none"
            onInput={syncContent}
            onBlur={syncContent}
            data-placeholder={placeholder}
            style={{
              minHeight: "300px",
            }}
          />
        </TabsContent>

        <TabsContent value="html" className="m-0">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="min-h-[300px] font-mono text-sm border-0 rounded-none resize-none focus-visible:ring-0"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
