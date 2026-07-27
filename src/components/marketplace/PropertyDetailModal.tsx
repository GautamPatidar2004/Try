import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Users, Bed, Bath, Wifi, Car, MapPin, Calendar, Heart, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import CollaborationApplicationModal from './CollaborationApplicationModal';
import { usePropertyReviews } from '@/hooks/usePropertyReviews';
import ReviewCard from '@/components/reviews/ReviewCard';
import PropertyAvailabilityCalendar from './PropertyAvailabilityCalendar';

interface Property {
  id: string;
  title: string;
  location: string;
  coordinates: { lat: number; lng: number };
  images: string[];
  rating: number;
  reviews: number;
  type: string;
  guests: number;
  bedrooms: number;
  bathrooms: number;
  pricePerNight: number;
  amenities: string[];
  contentRequirements: string[];
  collaborationType: string;
  isSuperhost: boolean;
  host: {
    name: string;
    avatar: string;
    responseRate: number;
    business?: string;
  };
  availableDates: string;
  description?: string;
  discount?: number | null;
  originalPrice?: number | null;
}

interface PropertyDetailModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  isDemoMode?: boolean;
}

const PropertyDetailModal = ({ property, isOpen, onClose, isDemoMode = false }: PropertyDetailModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { reviews, loading: reviewsLoading } = usePropertyReviews(property?.id || null);

  if (!property) return null;

  const nextImage = () => {
    setCurrentImageIndex((prev) => prev === property.images.length - 1 ? 0 : prev + 1);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => prev === 0 ? property.images.length - 1 : prev - 1);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? nextImage() : prevImage();
    }
    touchStartX.current = null;
  };

  const handleApplyToCollaborate = () => {
    if (isDemoMode) {
      navigate('/auth');
      return;
    }
    setShowApplicationModal(true);
  };

  const amenityIcons: Record<string, any> = {
    'WiFi': Wifi,
    'Parking': Car,
    'Pool': Users,
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className={`${isMobile ? 'max-w-full h-full max-h-full rounded-none p-0 m-0' : 'max-w-4xl max-h-[90vh] p-0'} overflow-y-auto`}>
          <VisuallyHidden.Root>
            <DialogTitle>{property.title}</DialogTitle>
          </VisuallyHidden.Root>
          <div className="relative">
            {/* Image Section */}
            <div
              className="relative aspect-[16/10] overflow-hidden rounded-t-lg"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={property.images[currentImageIndex]}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              
              {/* Image Navigation - hidden on mobile (use swipe) */}
              {property.images.length > 1 && (
                <>
                  {!isMobile && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-card w-10 h-10 rounded-full flex items-center justify-center shadow-md"
                      >
                        ‹
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-card w-10 h-10 rounded-full flex items-center justify-center shadow-md"
                      >
                        ›
                      </button>
                    </>
                  )}
                  
                  {/* Image Dots */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {property.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full ${
                          index === currentImageIndex ? 'bg-card' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
              
              {/* Heart Icon */}
              <button
                onClick={() => setIsLiked(!isLiked)}
                className="absolute top-4 right-16 p-2 rounded-full bg-white/80 hover:bg-card min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
              </button>

              {/* Share Icon */}
              <button
                onClick={() => {
                  const url = `${window.location.origin}/stays/${property.id}`;
                  navigator.clipboard.writeText(url);
                  toast({ title: 'Link copied!', description: 'Stay link copied to clipboard' });
                }}
                className="absolute top-4 right-28 p-2 rounded-full bg-white/80 hover:bg-card min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Share stay"
              >
                <Share2 className="w-5 h-5 text-muted-foreground" />
              </button>
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col space-y-2">
                {property.isSuperhost && (
                  <Badge className="bg-card text-foreground font-medium">Superhost</Badge>
                )}
                <Badge className={`font-medium ${property.collaborationType === 'Free Stay' ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'}`}>
                  {property.collaborationType}
                </Badge>
              </div>
            </div>

            {/* Content Section */}
            <div className={`${isMobile ? 'p-4 pb-24' : 'p-6'} space-y-5`}>
              {/* Header */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  {property.reviews > 0 ? (
                    <div className="flex items-center space-x-2">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{property.rating}</span>
                      <span className="text-muted-foreground">({property.reviews} reviews)</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">No reviews yet</span>
                  )}
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">{property.location}</span>
                  </div>
                </div>
                
                <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                  {property.title}
                </h1>
                
                <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:space-x-6 text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm">{property.guests} guests</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Bed className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm">{property.bedrooms} beds</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Bath className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm">{property.bathrooms} baths</span>
                  </div>
                </div>
              </div>

              {/* Host Info */}
              <div className="flex items-center justify-between py-4 border-y border-border">
                <div className="flex items-center space-x-3">
                  <img src={property.host.avatar} alt={property.host.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full" />
                  <div>
                    <h3 className="font-semibold text-foreground text-sm sm:text-base">Hosted by {property.host.name}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{property.host.responseRate}% response rate</p>
                    {property.host.business && (
                      <p className="text-xs sm:text-sm text-muted-foreground">{property.host.business}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              {property.description && (
                <div>
                  <h3 className="font-semibold text-foreground mb-2">About this place</h3>
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">{property.description}</p>
                </div>
              )}

              {/* Amenities */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">What this place offers</h3>
                <div className="grid grid-cols-2 gap-3">
                  {property.amenities.map((amenity, index) => {
                    const IconComponent = amenityIcons[amenity];
                    return (
                      <div key={index} className="flex items-center space-x-3">
                        {IconComponent && <IconComponent className="w-5 h-5 text-muted-foreground" />}
                        <span className="text-sm text-muted-foreground">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Content Requirements */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">Content Requirements</h3>
                <div className="flex flex-wrap gap-2">
                  {property.contentRequirements.map((requirement, index) => (
                    <Badge key={index} variant="outline" className="px-3 py-1">
                      {requirement}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Availability Calendar */}
              <PropertyAvailabilityCalendar propertyId={property.id} />

              {/* Reviews Section */}
              {property.reviews > 0 && (
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Reviews ({property.reviews})</h3>
                  {reviewsLoading ? (
                    <p className="text-muted-foreground">Loading reviews...</p>
                  ) : reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No reviews available yet.</p>
                  )}
                </div>
              )}

              {/* Pricing - desktop only (mobile has sticky bar) */}
              {!isMobile && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      {property.pricePerNight === 0 ? (
                        <span className="text-2xl font-bold text-green-600">Free Stay</span>
                      ) : (
                        <div>
                          {property.originalPrice && property.discount && property.originalPrice > property.pricePerNight && (
                            <span className="text-lg text-muted-foreground line-through mr-2">${property.originalPrice}</span>
                          )}
                          <span className="text-2xl font-bold text-foreground">${property.pricePerNight}</span>
                          <span className="text-muted-foreground"> / night</span>
                          {property.discount && (
                            <Badge className="ml-2 bg-green-500">{property.discount}% off</Badge>
                          )}
                        </div>
                      )}
                      {property.originalPrice && property.discount && (
                        <p className="text-sm text-muted-foreground mt-1">
                          You save ${(property.originalPrice - property.pricePerNight)} per night
                        </p>
                      )}
                    </div>
                    <Button className="bg-brand-green hover:bg-brand-green/90 px-8 h-12" onClick={handleApplyToCollaborate}>
                      Apply to Collaborate
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile sticky bottom bar */}
            {isMobile && (
              <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-[80] flex items-center justify-between gap-3 pb-safe">
                <div className="flex-1 min-w-0">
                  {property.pricePerNight === 0 ? (
                    <span className="text-lg font-bold text-green-600">Free Stay</span>
                  ) : (
                    <div>
                      <span className="text-lg font-bold text-foreground">${property.pricePerNight}</span>
                      <span className="text-sm text-muted-foreground"> / night</span>
                      {property.discount && (
                        <Badge className="ml-1 bg-green-500 text-xs">{property.discount}% off</Badge>
                      )}
                    </div>
                  )}
                </div>
                <Button className="bg-brand-green hover:bg-brand-green/90 h-12 px-6 flex-shrink-0" onClick={handleApplyToCollaborate}>
                  Apply
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <CollaborationApplicationModal
        property={property}
        isOpen={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
      />
    </>
  );
};

export default PropertyDetailModal;
