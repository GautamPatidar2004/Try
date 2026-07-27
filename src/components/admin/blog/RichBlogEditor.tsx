import { useRef, useCallback, useState } from "react";
import DOMPurify from "dompurify";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link,
  Quote,
  Code,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface RichBlogEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichBlogEditor = ({
  value,
  onChange,
  placeholder = "Start writing your blog post...",
  className,
}: RichBlogEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showSource, setShowSource] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);

  // Execute a formatting command
  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    // Trigger onChange after command
    setTimeout(() => {
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    }, 0);
  }, [onChange]);

  // Handle content changes
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  // Insert a link
  const insertLink = useCallback(() => {
    if (linkUrl) {
      execCommand("createLink", linkUrl);
      setLinkUrl("");
      setLinkPopoverOpen(false);
    }
  }, [linkUrl, execCommand]);

  // Format block (headers, paragraph)
  const formatBlock = useCallback((tag: string) => {
    execCommand("formatBlock", tag);
  }, [execCommand]);

  // Toolbar button component
  const ToolbarButton = ({
    icon: Icon,
    onClick,
    active,
    title,
    disabled,
  }: {
    icon: React.ElementType;
    onClick: () => void;
    active?: boolean;
    title: string;
    disabled?: boolean;
  }) => (
    <Toggle
      size="sm"
      pressed={active}
      onPressedChange={onClick}
      title={title}
      disabled={disabled}
      className="h-8 w-8 p-0 data-[state=on]:bg-accent"
    >
      <Icon className="h-4 w-4" />
    </Toggle>
  );

  // Handle paste - clean up pasted content
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    handleInput();
  }, [handleInput]);

  // Handle key commands
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case "b":
          e.preventDefault();
          execCommand("bold");
          break;
        case "i":
          e.preventDefault();
          execCommand("italic");
          break;
        case "u":
          e.preventDefault();
          execCommand("underline");
          break;
      }
    }
  }, [execCommand]);

  // Source view for raw HTML editing
  if (showSource) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center justify-between p-2 border rounded-t-md bg-muted/50">
          <span className="text-sm font-medium">HTML Source</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSource(false)}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            Visual Editor
          </Button>
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-h-[300px] p-4 font-mono text-sm border rounded-b-md bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="<p>Write your HTML here...</p>"
        />
      </div>
    );
  }

  return (
    <div className={cn("border rounded-md overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/30">
        {/* Text formatting */}
        <ToolbarButton
          icon={Bold}
          onClick={() => execCommand("bold")}
          title="Bold (Ctrl+B)"
        />
        <ToolbarButton
          icon={Italic}
          onClick={() => execCommand("italic")}
          title="Italic (Ctrl+I)"
        />
        <ToolbarButton
          icon={Underline}
          onClick={() => execCommand("underline")}
          title="Underline (Ctrl+U)"
        />
        <ToolbarButton
          icon={Strikethrough}
          onClick={() => execCommand("strikeThrough")}
          title="Strikethrough"
        />

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Headers */}
        <ToolbarButton
          icon={Heading1}
          onClick={() => formatBlock("h1")}
          title="Heading 1"
        />
        <ToolbarButton
          icon={Heading2}
          onClick={() => formatBlock("h2")}
          title="Heading 2"
        />
        <ToolbarButton
          icon={Heading3}
          onClick={() => formatBlock("h3")}
          title="Heading 3"
        />

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Lists */}
        <ToolbarButton
          icon={List}
          onClick={() => execCommand("insertUnorderedList")}
          title="Bullet List"
        />
        <ToolbarButton
          icon={ListOrdered}
          onClick={() => execCommand("insertOrderedList")}
          title="Numbered List"
        />

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Alignment */}
        <ToolbarButton
          icon={AlignLeft}
          onClick={() => execCommand("justifyLeft")}
          title="Align Left"
        />
        <ToolbarButton
          icon={AlignCenter}
          onClick={() => execCommand("justifyCenter")}
          title="Align Center"
        />
        <ToolbarButton
          icon={AlignRight}
          onClick={() => execCommand("justifyRight")}
          title="Align Right"
        />

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Elements */}
        <Popover open={linkPopoverOpen} onOpenChange={setLinkPopoverOpen}>
          <PopoverTrigger asChild>
            <Toggle
              size="sm"
              title="Insert Link"
              className="h-8 w-8 p-0"
            >
              <Link className="h-4 w-4" />
            </Toggle>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="link-url">URL</Label>
                <Input
                  id="link-url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      insertLink();
                    }
                  }}
                />
              </div>
              <Button size="sm" onClick={insertLink} className="w-full">
                Insert Link
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <ToolbarButton
          icon={Quote}
          onClick={() => formatBlock("blockquote")}
          title="Block Quote"
        />
        <ToolbarButton
          icon={Code}
          onClick={() => formatBlock("pre")}
          title="Code Block"
        />
        <ToolbarButton
          icon={Minus}
          onClick={() => execCommand("insertHorizontalRule")}
          title="Horizontal Rule"
        />

        {/* Source toggle */}
        <div className="ml-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSource(true)}
            className="gap-2 text-xs"
          >
            <Code2 className="h-3 w-3" />
            HTML
          </Button>
        </div>
      </div>

      {/* Editor area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(value) }}
        className={cn(
          "min-h-[300px] p-4 focus:outline-none",
          "prose prose-sm max-w-none dark:prose-invert",
          "prose-headings:mt-4 prose-headings:mb-2",
          "prose-p:my-2 prose-ul:my-2 prose-ol:my-2",
          "prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic",
          "[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-muted-foreground"
        )}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
    </div>
  );
};
