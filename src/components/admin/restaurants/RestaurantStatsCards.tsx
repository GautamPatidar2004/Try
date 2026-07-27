import { Card } from "@/components/ui/card";
import { UtensilsCrossed, CheckCircle, Star, Calendar } from "lucide-react";

interface RestaurantStatsCardsProps {
  stats: {
    total: number;
    active: number;
    featured: number;
    bookingsThisMonth: number;
    averageRating: number;
  };
}

export const RestaurantStatsCards = ({ stats }: RestaurantStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold mt-1">{stats.total}</p>
          </div>
          <UtensilsCrossed className="h-8 w-8 text-primary" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold mt-1">{stats.active}</p>
          </div>
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Featured</p>
            <p className="text-2xl font-bold mt-1">{stats.featured}</p>
          </div>
          <Star className="h-8 w-8 text-yellow-600" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Bookings</p>
            <p className="text-2xl font-bold mt-1">{stats.bookingsThisMonth}</p>
          </div>
          <Calendar className="h-8 w-8 text-blue-600" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Avg Rating</p>
            <p className="text-2xl font-bold mt-1">{stats.averageRating.toFixed(1)}</p>
          </div>
          <Star className="h-8 w-8 text-orange-600 fill-orange-600" />
        </div>
      </Card>
    </div>
  );
};
