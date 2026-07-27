import { Button } from "@/components/ui/button";
import { MessageSquare, HelpCircle, Settings } from "lucide-react";

interface HostProfileMobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const HostProfileMobileNav = ({ activeTab, onTabChange }: HostProfileMobileNavProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-2 z-50 pb-safe">
      <div className="flex justify-center gap-6">
        <Button
          variant={activeTab === "applications" ? "default" : "ghost"}
          onClick={() => onTabChange("applications")}
          className="flex flex-col items-center gap-1 h-auto py-3 px-3 min-h-[56px]"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-xs">Applications</span>
        </Button>
        <Button
          variant={activeTab === "help" ? "default" : "ghost"}
          onClick={() => onTabChange("help")}
          className="flex flex-col items-center gap-1 h-auto py-3 px-3 min-h-[56px]"
        >
          <HelpCircle className="w-5 h-5" />
          <span className="text-xs">Help</span>
        </Button>
        <Button
          variant={activeTab === "settings" ? "default" : "ghost"}
          onClick={() => onTabChange("settings")}
          className="flex flex-col items-center gap-1 h-auto py-3 px-3 min-h-[56px]"
        >
          <Settings className="w-5 h-5" />
          <span className="text-xs">Settings</span>
        </Button>
      </div>
    </div>
  );
};

export default HostProfileMobileNav;