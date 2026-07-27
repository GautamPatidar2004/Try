import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGeographicData } from "@/hooks/useGeographicData";
import { Globe } from "lucide-react";

export const GeographicMetrics = () => {
  const { data: locations, isLoading } = useGeographicData();

  if (isLoading) {
    return <div className="text-center py-8">Loading geographic data...</div>;
  }

  const topLocations = locations?.slice(0, 10) || [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Top Locations by Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topLocations.map((location, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{location.location}</p>
                    <p className="text-sm text-muted-foreground">
                      {location.users} users · {location.properties} properties
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">#{idx + 1}</p>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary rounded-full h-2 transition-all"
                    style={{ width: `${(location.users / (topLocations[0]?.users || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locations?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Unique locations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Top Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">{topLocations[0]?.location || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">{topLocations[0]?.users || 0} users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {locations?.reduce((sum, l) => sum + l.properties, 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">Total properties</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
