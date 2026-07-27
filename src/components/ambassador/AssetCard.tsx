import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AssetCardProps {
  title: string;
  description: string;
  format: string;
  size: string;
  icon: string;
  onDownload: () => void;
}

export const AssetCard = ({ title, description, format, size, icon, onDownload }: AssetCardProps) => {
  const { toast } = useToast();

  const handleDownload = () => {
    onDownload();
    toast({
      title: "Download started",
      description: `${title} is being downloaded...`,
    });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="text-4xl">{icon}</div>
          <div className="text-xs text-muted-foreground text-right">
            <div className="font-medium">{format}</div>
            <div>{size}</div>
          </div>
        </div>
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <Button 
          variant="outline" 
          className="w-full gap-2"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4" />
          Download
        </Button>
      </CardContent>
    </Card>
  );
};
