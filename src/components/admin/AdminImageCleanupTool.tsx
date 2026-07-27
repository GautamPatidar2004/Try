import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useImageCleanup } from "@/hooks/useImageCleanup";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AdminImageCleanupTool = () => {
  const [propertyId, setPropertyId] = useState("");
  const { cleanupDuplicateImages, isCleaningUp } = useImageCleanup();

  const handleCleanup = async () => {
    if (!propertyId.trim()) {
      alert("Please enter a property ID");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to clean up duplicate images for property ${propertyId}? This will remove duplicate image records permanently.`
    );

    if (confirmed) {
      await cleanupDuplicateImages(propertyId.trim());
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trash2 className="w-5 h-5" />
          Image Cleanup Tool
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            This tool removes duplicate image records for a specific property. Use with caution.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="property-id">Property ID</Label>
          <Input
            id="property-id"
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            placeholder="Enter property ID to clean up"
            disabled={isCleaningUp}
          />
        </div>

        <Button
          onClick={handleCleanup}
          disabled={!propertyId.trim() || isCleaningUp}
          className="w-full"
          variant="destructive"
        >
          {isCleaningUp ? "Cleaning up..." : "Remove Duplicate Images"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminImageCleanupTool;