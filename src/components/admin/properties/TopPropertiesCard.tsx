import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, TrendingUp } from "lucide-react";

interface TopProperty {
  id: string;
  title: string;
  location: string;
  applications_count: number;
  collaboration_type: string;
}

interface TopPropertiesCardProps {
  properties: TopProperty[];
}

const TopPropertiesCard = ({ properties }: TopPropertiesCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Top Performing Properties
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {properties.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No data available yet
            </p>
          ) : (
            properties.map((property, index) => (
              <div 
                key={property.id}
                className="flex items-start justify-between border-b last:border-0 pb-3 last:pb-0"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-muted-foreground">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-medium">{property.title}</p>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        {property.location}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {property.applications_count} applications
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {property.collaboration_type.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopPropertiesCard;
