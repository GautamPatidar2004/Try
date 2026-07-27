import { useState, useEffect } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { AdminCommandPalette } from "./AdminCommandPalette";
import { SidebarProvider } from "@/components/ui/sidebar";

interface AdminShellProps {
  children: React.ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const AdminShell = ({ children, activeSection, onSectionChange }: AdminShellProps) => {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Global keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCommandSelect = (sectionId: string) => {
    onSectionChange(sectionId);
    setCommandPaletteOpen(false);
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-muted/30 overflow-x-hidden">
        <AdminSidebar 
          activeSection={activeSection} 
          onSectionChange={onSectionChange}
        />
        
        <div className="flex-1 flex flex-col min-h-screen min-w-0">
          <AdminHeader 
            onCommandPaletteOpen={() => setCommandPaletteOpen(true)}
          />
          
          <main className="flex-1 p-6 overflow-y-auto overflow-x-hidden min-w-0">
            {children}
          </main>
        </div>
        
        <AdminCommandPalette 
          open={commandPaletteOpen}
          onOpenChange={setCommandPaletteOpen}
          onSelect={handleCommandSelect}
        />
      </div>
    </SidebarProvider>
  );
};
