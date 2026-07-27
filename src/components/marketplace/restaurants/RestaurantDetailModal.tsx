import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Users, Clock, UtensilsCrossed, Leaf, Car, Home } from 'lucide-react';
import { Restaurant } from '@/hooks/useRestaurants';
import RestaurantBookingModal from './RestaurantBookingModal';

interface RestaurantDetailModalProps {
  restaurant: Restaurant;
  open: boolean;
  onClose: () => void;
}

const RestaurantDetailModal = ({ restaurant, open, onClose }: RestaurantDetailModalProps) => {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const images = restaurant.images || [];
  const menu = restaurant.menu || [];
  const reviews = restaurant.reviews || [];

  const groupedMenu = menu.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof menu>);

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{restaurant.name}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="menu">Menu</TabsTrigger>
              <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {images.length > 0 && (
                <div className="space-y-2">
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    <img
                      src={images[selectedImage]?.image_url}
                      alt={restaurant.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {images.map((img, idx) => (
                        <img
                          key={img.id}
                          src={img.image_url}
                          alt={`${restaurant.name} ${idx + 1}`}
                          className={`w-20 h-20 object-cover rounded cursor-pointer ${selectedImage === idx ? 'ring-2 ring-primary' : ''}`}
                          onClick={() => setSelectedImage(idx)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{restaurant.address}, {restaurant.city}, {restaurant.country}</span>
                    </div>
                    {restaurant.average_rating > 0 && (
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 fill-primary text-primary" />
                        <span className="text-sm font-medium">{restaurant.average_rating.toFixed(1)} / 5.0</span>
                      </div>
                    )}
                  </div>
                  <Button onClick={() => setShowBookingModal(true)}>
                    Book Now
                  </Button>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {restaurant.cuisine_types.map((cuisine, idx) => (
                    <Badge key={idx} variant="secondary">{cuisine}</Badge>
                  ))}
                </div>

                {restaurant.description && (
                  <p className="text-muted-foreground">{restaurant.description}</p>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4" />
                    <span className="text-sm">{restaurant.dining_style}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Up to {restaurant.max_party_size} guests</span>
                  </div>
                  {restaurant.has_outdoor_seating && (
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4" />
                      <span className="text-sm">Outdoor Seating</span>
                    </div>
                  )}
                  {restaurant.parking_available && (
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4" />
                      <span className="text-sm">Parking Available</span>
                    </div>
                  )}
                </div>

                {restaurant.dietary_options.length > 0 && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Leaf className="w-4 h-4" /> Dietary Options
                    </h4>
                    <div className="flex gap-2 flex-wrap">
                      {restaurant.dietary_options.map((option, idx) => (
                        <Badge key={idx} variant="outline">{option}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="menu" className="space-y-6">
              {Object.keys(groupedMenu).length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Menu coming soon</p>
              ) : (
                Object.entries(groupedMenu).map(([category, items]) => (
                  <div key={category} className="space-y-3">
                    <h3 className="font-semibold text-lg capitalize">{category}</h3>
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div key={item.id} className="flex gap-4">
                          {item.image_url && (
                            <img src={item.image_url} alt={item.item_name} className="w-20 h-20 object-cover rounded" />
                          )}
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <h4 className="font-medium">{item.item_name}</h4>
                              {item.is_signature_dish && (
                                <Badge variant="secondary">Signature</Badge>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                            )}
                            {item.dietary_tags.length > 0 && (
                              <div className="flex gap-1 mt-2">
                                {item.dietary_tags.map((tag, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">{tag}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="collaboration" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Collaboration Types</h4>
                  <div className="flex gap-2">
                    {restaurant.collaboration_types.map((type, idx) => (
                      <Badge key={idx}>{type === 'free_meal' ? 'Free Meal' : type === 'paid_partnership' ? 'Paid Partnership' : type}</Badge>
                    ))}
                  </div>
                </div>

                {restaurant.content_requirements.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Content Requirements</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {restaurant.content_requirements.map((req, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground">{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-2">Minimum Requirements</h4>
                  <p className="text-sm text-muted-foreground">
                    {restaurant.min_follower_count.toLocaleString()}+ followers
                  </p>
                </div>

                {restaurant.paid_rate_min && restaurant.paid_rate_max && (
                  <div>
                    <h4 className="font-medium mb-2">Paid Partnership Rate</h4>
                    <p className="text-sm text-muted-foreground">
                      ${restaurant.paid_rate_min} - ${restaurant.paid_rate_max} {restaurant.currency.toUpperCase()}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-2">Available Meal Times</h4>
                  <div className="flex gap-2">
                    {restaurant.meal_types.map((type, idx) => (
                      <Badge key={idx} variant="outline">{type}</Badge>
                    ))}
                  </div>
                </div>

                <Button className="w-full" onClick={() => setShowBookingModal(true)}>
                  Request Booking
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No reviews yet</p>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 fill-primary text-primary" />
                      <span className="font-medium">{review.rating} / 5</span>
                    </div>
                    {review.review_text && (
                      <p className="text-sm text-muted-foreground">{review.review_text}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {showBookingModal && (
        <RestaurantBookingModal
          restaurant={restaurant}
          open={showBookingModal}
          onClose={() => setShowBookingModal(false)}
        />
      )}
    </>
  );
};

export default RestaurantDetailModal;
