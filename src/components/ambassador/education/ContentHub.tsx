import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Book, Lightbulb, Video, Palette } from "lucide-react";
import { AmbassadorHandbook } from "./AmbassadorHandbook";
import { ContentPrompts } from "./ContentPrompts";
import { TrainingVideos } from "./TrainingVideos";
import { AssetsOverview } from "./AssetsOverview";
import { useTrainingProgress } from "@/hooks/useTrainingProgress";
import { Badge } from "@/components/ui/badge";

export const ContentHub = () => {
  const [activeTab, setActiveTab] = useState("handbook");
  const { completedCount, totalCount, isTrainingComplete } = useTrainingProgress();

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Book className="h-5 w-5 text-primary" />
              Education Hub
            </CardTitle>
            <CardDescription className="mt-1">
              Everything you need to succeed as an ambassador
            </CardDescription>
          </div>
          {isTrainingComplete && (
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              🎓 Training Complete
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="handbook" className="flex items-center gap-2">
              <Book className="h-4 w-4" />
              <span className="hidden sm:inline">Handbook</span>
            </TabsTrigger>
            <TabsTrigger value="prompts" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">Content Ideas</span>
            </TabsTrigger>
            <TabsTrigger value="training" className="flex items-center gap-2 relative">
              <Video className="h-4 w-4" />
              <span className="hidden sm:inline">Training</span>
              {completedCount > 0 && completedCount < totalCount && (
                <span className="absolute -top-1 -right-1 h-4 w-4 text-[10px] bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                  {completedCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="assets" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Assets</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="handbook" className="mt-0">
            <AmbassadorHandbook />
          </TabsContent>

          <TabsContent value="prompts" className="mt-0">
            <ContentPrompts />
          </TabsContent>

          <TabsContent value="training" className="mt-0">
            <TrainingVideos />
          </TabsContent>

          <TabsContent value="assets" className="mt-0">
            <AssetsOverview />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
