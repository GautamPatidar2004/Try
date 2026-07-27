
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Instagram, Camera, TrendingUp } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Travel Content Creator",
      avatar: "/placeholder.svg",
      rating: 5,
      followers: "125K",
      platform: "Instagram",
      content: "Hostfluencer connected me with incredible properties in Bali and Tuscany. The collaborations were seamless and my content performed amazingly well. I've grown my audience by 30% through these authentic travel experiences!",
      metrics: {
        projects: 8,
        avgViews: "45K",
        bookingsGenerated: 23
      }
    },
    {
      name: "Marcus Rodriguez",
      role: "Airbnb Superhost",
      avatar: "/placeholder.svg", 
      rating: 5,
      property: "Malibu Ocean Villa",
      content: "Working with creators through Hostfluencer has been a game-changer. We've seen a 65% increase in bookings and the content quality is outstanding. The platform makes it so easy to find the right creators for our brand.",
      metrics: {
        collaborations: 12,
        bookingIncrease: "65%",
        contentPieces: 48
      }
    },
    {
      name: "Emily Thompson",
      role: "Lifestyle Influencer",
      avatar: "/placeholder.svg",
      rating: 5,
      followers: "89K",
      platform: "TikTok",
      content: "I've collaborated on 15 properties through Hostfluencer across Europe and the US. Each experience has been unique and my audience absolutely loves the authentic travel content. It's helped me transition to full-time content creation!",
      metrics: {
        countries: 8,
        totalReach: "2.1M",
        partnerships: 15
      }
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Real Results From
            <span className="bg-gradient-to-r from-brand-green to-emerald-600 bg-clip-text text-transparent"> Real Users</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See what hosts and creators are saying about their success on our platform.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-brand-light/30">
              <CardContent className="p-8">
                {/* Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                {/* Testimonial */}
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
                
                {/* Metrics */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {testimonial.role === "Travel Content Creator" || testimonial.role === "Lifestyle Influencer" ? (
                      <>
                        <div>
                          <div className="text-sm font-bold text-brand-green">{testimonial.metrics.projects || testimonial.metrics.partnerships}</div>
                          <div className="text-xs text-gray-500">Projects</div>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-brand-green">{testimonial.metrics.avgViews || testimonial.metrics.totalReach}</div>
                          <div className="text-xs text-gray-500">Avg Views</div>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-brand-green">{testimonial.metrics.bookingsGenerated || testimonial.metrics.countries}</div>
                          <div className="text-xs text-gray-500">{testimonial.metrics.bookingsGenerated ? 'Bookings' : 'Countries'}</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <div className="text-sm font-bold text-brand-green">{testimonial.metrics.collaborations}</div>
                          <div className="text-xs text-gray-500">Collabs</div>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-brand-green">{testimonial.metrics.bookingIncrease}</div>
                          <div className="text-xs text-gray-500">Growth</div>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-brand-green">{testimonial.metrics.contentPieces}</div>
                          <div className="text-xs text-gray-500">Content</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {/* User Info */}
                <div className="flex items-center">
                  <Avatar className="w-12 h-12 mr-4">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback className="bg-gradient-to-br from-brand-green to-emerald-500 text-white">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <div className="flex items-center text-sm text-gray-600">
                      <span>{testimonial.role}</span>
                      {testimonial.followers && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{testimonial.followers} followers</span>
                        </>
                      )}
                      {testimonial.property && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{testimonial.property}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
