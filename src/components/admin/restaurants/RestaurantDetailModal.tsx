import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Star, MapPin, Clock, Users, DollarSign, Check, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAdminRestaurants } from "@/hooks/useAdminRestaurants";
import { format } from "date-fns";

interface RestaurantDetailModalProps {
  restaurantId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  onToggleFeatured: (id: string, featured: boolean) => void;
}

export const RestaurantDetailModal = ({ 
  restaurantId, 
  open, 
  onOpenChange,
  onToggleActive,
  onToggleFeatured
}: RestaurantDetailModalProps) => {
  const { getRestaurantById, getRestaurantBookings, getRestaurantReviews } = useAdminRestaurants();

  const { data: restaurant, isLoading } = useQuery({
    queryKey: ["admin-restaurant-detail", restaurantId],
    queryFn: () => getRestaurantById(restaurantId!),
    enabled: !!restaurantId && open,
  });

  const { data: bookings } = useQuery({
    queryKey: ["admin-restaurant-bookings", restaurantId],
    queryFn: () => getRestaurantBookings(restaurantId!),
    enabled: !!restaurantId && open,
  });

  const { data: reviews } = useQuery({
    queryKey: ["admin-restaurant-reviews", restaurantId],
    queryFn: () => getRestaurantReviews(restaurantId!),
    enabled: !!restaurantId && open,
  });

  if (!open || !restaurantId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Restaurant Details</DialogTitle>
          <DialogDescription>
            Complete information about this restaurant
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">Loading...</div>
        ) : restaurant ? (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{restaurant.name}</h3>
                  <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{restaurant.city}, {restaurant.country}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant={restaurant.is_active ? "default" : "secondary"}>
                    {restaurant.is_active ? "Active" : "Inactive"}
                  </Badge>
                  {restaurant.featured && (
                    <Badge variant="default">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Featured
                    </Badge>
                  )}
                </div>
              </div>

              {restaurant.restaurant_images && restaurant.restaurant_images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {restaurant.restaurant_images.slice(0, 3).map((image: any) => (
                    <img 
                      key={image.id}
                      src={image.image_url} 
                      alt={restaurant.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{restaurant.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cuisine Types</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {restaurant.cuisine_types?.map((cuisine: string) => (
                      <Badge key={cuisine} variant="outline">{cuisine}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dining Style</p>
                  <p className="font-medium capitalize">{restaurant.dining_style}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price Range</p>
                  <p className="font-medium">{'$'.repeat(parseInt(restaurant.price_range) || 1)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-600 fill-yellow-600" />
                    <span className="font-medium">{restaurant.average_rating?.toFixed(1) || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {restaurant.operating_hours && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Operating Hours
                  </h4>
                  <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {JSON.stringify(restaurant.operating_hours, null, 2)}
                  </pre>
                </div>
              )}

              {(restaurant as any).owner && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2">Owner</h4>
                    <p className="text-sm">
                      {(restaurant as any).owner.first_name} {(restaurant as any).owner.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">{(restaurant as any).owner.email}</p>
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => {
                    onToggleActive(restaurant.id, !restaurant.is_active);
                    onOpenChange(false);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  {restaurant.is_active ? (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Activate
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    onToggleFeatured(restaurant.id, !restaurant.featured);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  <Star className={`h-4 w-4 mr-2 ${restaurant.featured ? 'fill-current' : ''}`} />
                  {restaurant.featured ? 'Unfeature' : 'Feature'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="collaboration" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Collaboration Types</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {restaurant.collaboration_types?.map((type: string) => (
                      <Badge key={type} variant="outline">{type}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Min Follower Count</p>
                  <p className="font-medium">
                    {restaurant.min_follower_count?.toLocaleString() || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Paid Rate Range</p>
                  <p className="font-medium">
                    {restaurant.paid_rate_min && restaurant.paid_rate_max
                      ? `$${restaurant.paid_rate_min} - $${restaurant.paid_rate_max}`
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Max Party Size</p>
                  <p className="font-medium">{restaurant.max_party_size || 'N/A'}</p>
                </div>
              </div>

              {restaurant.content_requirements && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Content Requirements</p>
                  <div className="flex flex-wrap gap-1">
                    {restaurant.content_requirements.map((req: string) => (
                      <Badge key={req} variant="secondary">{req}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="bookings" className="space-y-4">
              {bookings && bookings.length > 0 ? (
                <div className="space-y-2">
                  {bookings.map((booking: any) => (
                    <div key={booking.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">
                            {booking.influencer?.first_name} {booking.influencer?.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(booking.booking_date), "MMM d, yyyy")} at {booking.booking_time}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-sm">
                            <Users className="h-4 w-4" />
                            <span>{booking.party_size} guests</span>
                          </div>
                        </div>
                        <Badge>{booking.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No bookings yet
                </div>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4">
              {reviews && reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review: any) => (
                    <div key={review.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">
                            {review.reviewer?.first_name} {review.reviewer?.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(review.created_at), "MMM d, yyyy")}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-600 fill-yellow-600" />
                          <span className="font-medium">{review.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm">{review.review_text}</p>
                      {review.would_recommend && (
                        <Badge variant="secondary" className="mt-2">
                          Recommended
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No reviews yet
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="py-8 text-center text-muted-foreground">Restaurant not found</div>
        )}
      </DialogContent>
    </Dialog>
  );
};
