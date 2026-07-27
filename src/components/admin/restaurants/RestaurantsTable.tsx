import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Star, Check, X } from "lucide-react";
import { format } from "date-fns";

interface Restaurant {
  id: string;
  name: string;
  city: string;
  country: string;
  cuisine_types: string[];
  price_range: string;
  average_rating: number;
  featured: boolean;
  is_active: boolean;
  created_at: string;
  owner?: {
    first_name: string;
    last_name: string;
  };
}

interface RestaurantsTableProps {
  restaurants: Restaurant[];
  onViewDetails: (restaurant: Restaurant) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  onToggleFeatured: (id: string, featured: boolean) => void;
}

export const RestaurantsTable = ({ 
  restaurants, 
  onViewDetails, 
  onToggleActive,
  onToggleFeatured 
}: RestaurantsTableProps) => {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Restaurant</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Cuisine</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {restaurants.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                No restaurants found
              </TableCell>
            </TableRow>
          ) : (
            restaurants.map((restaurant) => (
              <TableRow key={restaurant.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {restaurant.name}
                    {restaurant.featured && (
                      <Star className="h-4 w-4 text-yellow-600 fill-yellow-600" />
                    )}
                  </div>
                </TableCell>
                <TableCell>{restaurant.city}, {restaurant.country}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {restaurant.cuisine_types?.slice(0, 2).map((cuisine) => (
                      <Badge key={cuisine} variant="outline" className="text-xs">
                        {cuisine}
                      </Badge>
                    ))}
                    {restaurant.cuisine_types?.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{restaurant.cuisine_types.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {'$'.repeat(parseInt(restaurant.price_range) || 1)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-600 fill-yellow-600" />
                    <span>{restaurant.average_rating?.toFixed(1) || 'N/A'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {restaurant.owner ? `${restaurant.owner.first_name} ${restaurant.owner.last_name}` : 'N/A'}
                </TableCell>
                <TableCell>
                  <Badge variant={restaurant.is_active ? "default" : "secondary"}>
                    {restaurant.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onViewDetails(restaurant)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onToggleActive(restaurant.id, !restaurant.is_active)}
                    >
                      {restaurant.is_active ? (
                        <X className="h-4 w-4 text-orange-600" />
                      ) : (
                        <Check className="h-4 w-4 text-green-600" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onToggleFeatured(restaurant.id, !restaurant.featured)}
                    >
                      <Star className={`h-4 w-4 ${restaurant.featured ? 'text-yellow-600 fill-yellow-600' : 'text-muted-foreground'}`} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
