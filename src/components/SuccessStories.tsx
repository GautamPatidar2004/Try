
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExternalLink, Instagram, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SuccessStories = () => {
  const navigate = useNavigate();

  const stories = [
    {
      host: {
        name: "Marina Rodriguez",
        role: "Luxury Villa Host",
        avatar: "/placeholder.svg",
        property: "Malibu Oceanfront Villa"
      },
      creator: {
        name: "Jessica Davis",
        role: "Travel Lifestyle Creator",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face",
        followers: "125K"
      },
      results: {
        bookings: "+40%",
        content: "12 posts",
        engagement: "250K views"
      },
      story: "Jessica's authentic content of our Malibu villa resulted in 6 direct bookings within the first month. Her storytelling perfectly captured the luxury experience we offer.",
      contentImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop"
    },
    {
      host: {
        name: "David Chen",
        role: "Mountain Retreat Owner",
        avatar: "/placeholder.svg",
        property: "Aspen Cozy Cabin"
      },
      creator: {
        name: "Alex Thompson",
        role: "Adventure Content Creator",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        followers: "89K"
      },  
      results: {
        bookings: "+65%",
        content: "8 posts",
        engagement: "180K views"
      },
      story: "Alex's adventure-focused content brought a younger demographic to our cabin. His authentic outdoor lifestyle content was exactly what our property needed.",
      contentImage: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=400&fit=crop"
    },
    {
      host: {
        name: "Sarah Kim",
        role: "Urban Loft Host",
        avatar: "/placeholder.svg", 
        property: "Downtown Austin Loft"
      },
      creator: {
        name: "Sophia Kim",
        role: "Urban Lifestyle Influencer",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        followers: "203K"
      },
      results: {
        bookings: "+85%",
        content: "15 posts",
        engagement: "420K views"
      },
      story: "Sophia's urban aesthetic perfectly matched our loft's vibe. Her content attracted creative professionals who now make up 60% of our bookings.",
      contentImage: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop"
    }
  ];

  return (
    <section id="success-stories" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Real Success
            <span className="bg-gradient-to-r from-brand-green to-emerald-600 bg-clip-text text-transparent"> Stories</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how hosts and creators are building successful partnerships and achieving measurable results through our platform.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
          {stories.map((story, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-gray-50">
              <CardContent className="p-0">
                {/* Content Image */}
                <div className="relative h-48 overflow-hidden rounded-t-lg">
                  <img 
                    src={story.contentImage} 
                    alt="Content created"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm rounded-full p-2">
                    <Instagram className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="p-6">
                  {/* Results Metrics */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-lg font-bold text-brand-green">{story.results.bookings}</div>
                      <div className="text-xs text-gray-500">Bookings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-brand-green">{story.results.content}</div>
                      <div className="text-xs text-gray-500">Content</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-brand-green">{story.results.engagement}</div>
                      <div className="text-xs text-gray-500">Views</div>
                    </div>
                  </div>

                  {/* Story */}
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed italic">
                    "{story.story}"
                  </p>

                  {/* Participants */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={story.host.avatar} alt={story.host.name} />
                        <AvatarFallback className="bg-gradient-to-br from-brand-green to-emerald-500 text-white text-xs">
                          {story.host.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm text-gray-900">{story.host.name}</div>
                        <div className="text-xs text-gray-500">{story.host.property}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={story.creator.avatar} alt={story.creator.name} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                          {story.creator.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm text-gray-900">{story.creator.name}</div>
                        <div className="text-xs text-gray-500">{story.creator.followers} followers</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-brand-green to-emerald-600 hover:from-brand-green/90 hover:to-emerald-600/90 text-white font-semibold px-8 py-4 text-lg"
            onClick={() => navigate('/marketplace')}
          >
            Create Your Success Story
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SuccessStories;
