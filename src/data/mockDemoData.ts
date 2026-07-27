export const mockApplications = [
  {
    id: '1',
    creator: {
      name: 'Emma Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      followers: 45000,
      engagement: 4.2,
      niche: 'Travel & Lifestyle',
      instagram: '@emmaexplores'
    },
    property: 'Luxury Beachfront Villa in Malibu',
    dates: 'Feb 15-22, 2025',
    proposal: 'I would love to collaborate with your stunning property! My audience is highly engaged with luxury travel content. I can create 10 high-quality posts, 5 stories daily, and 1 viral-worthy reel showcasing your villa.',
    contentDeliverables: ['10 Instagram Posts', '5 Stories per day', '1 Reel', 'Full usage rights'],
    status: 'pending',
    submittedAt: '2 hours ago'
  },
  {
    id: '2',
    creator: {
      name: 'Marcus Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      followers: 128000,
      engagement: 5.8,
      niche: 'Adventure & Photography',
      instagram: '@marcusframes'
    },
    property: 'Mountain Retreat in Aspen',
    dates: 'Mar 1-7, 2025',
    proposal: 'Your mountain retreat is perfect for my adventure photography series. I specialize in cinematic landscape shots that get millions of views.',
    contentDeliverables: ['15 Instagram Posts', '8 Stories', '2 Reels', 'YouTube Feature'],
    status: 'pending',
    submittedAt: '5 hours ago'
  },
  {
    id: '3',
    creator: {
      name: 'Sofia Laurent',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      followers: 89000,
      engagement: 4.7,
      niche: 'Luxury & Fashion',
      instagram: '@sofialuxe'
    },
    property: 'Penthouse Suite in NYC',
    dates: 'Jan 20-25, 2025',
    proposal: 'This penthouse would be perfect for my New York Fashion Week content. My followers love high-end lifestyle content.',
    contentDeliverables: ['12 Instagram Posts', '6 Stories', '1 Reel', 'TikTok Series'],
    status: 'pending',
    submittedAt: '1 day ago'
  },
  {
    id: '4',
    creator: {
      name: 'Jake Morrison',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      followers: 67000,
      engagement: 3.9,
      niche: 'Fitness & Wellness',
      instagram: '@jakefitness'
    },
    property: 'Wellness Resort in Bali',
    dates: 'Apr 10-17, 2025',
    proposal: 'Looking to create a wellness retreat series. My audience is very interested in health and travel destinations.',
    contentDeliverables: ['8 Instagram Posts', '10 Stories', '2 Reels'],
    status: 'pending',
    submittedAt: '2 days ago'
  }
];

export const mockHostProperties = [
  {
    id: '1',
    title: 'Luxury Beachfront Villa',
    location: 'Malibu, California',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    views: 1247,
    applications: 12,
    responseRate: 98,
    status: 'active'
  },
  {
    id: '2',
    title: 'Mountain Retreat',
    location: 'Aspen, Colorado',
    image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800',
    views: 892,
    applications: 8,
    responseRate: 95,
    status: 'active'
  },
  {
    id: '3',
    title: 'Penthouse Suite',
    location: 'New York, NY',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    views: 2156,
    applications: 23,
    responseRate: 100,
    status: 'active'
  }
];

export const demoCreatorProperties = [
  {
    id: '1',
    title: 'Luxury Beachfront Villa in Malibu',
    location: 'Malibu, California',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    type: 'Villa',
    rating: 4.9,
    reviews: 127,
    amenities: ['Ocean View', 'Infinity Pool', 'Private Beach', 'Modern Kitchen'],
    description: 'Stunning beachfront property with breathtaking Pacific Ocean views. Perfect for luxury lifestyle and travel content.',
    host: {
      name: 'Jennifer Martinez',
      avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150',
      responseTime: 'within 1 hour'
    }
  },
  {
    id: '2',
    title: 'Cozy Mountain Cabin in Aspen',
    location: 'Aspen, Colorado',
    image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800',
    type: 'Cabin',
    rating: 4.8,
    reviews: 89,
    amenities: ['Mountain Views', 'Fireplace', 'Hot Tub', 'Ski-in/Ski-out'],
    description: 'Charming alpine retreat surrounded by snow-capped peaks. Ideal for adventure and winter sports content.',
    host: {
      name: 'Michael Chen',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      responseTime: 'within 2 hours'
    }
  },
  {
    id: '3',
    title: 'Modern Penthouse in Manhattan',
    location: 'New York, NY',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    type: 'Penthouse',
    rating: 5.0,
    reviews: 203,
    amenities: ['City Views', 'Rooftop Access', 'Smart Home', 'Concierge'],
    description: 'Sleek urban oasis in the heart of Manhattan. Perfect for fashion, lifestyle, and cityscape content.',
    host: {
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      responseTime: 'within 30 minutes'
    }
  },
  {
    id: '4',
    title: 'Tropical Paradise in Bali',
    location: 'Ubud, Bali',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
    type: 'Villa',
    rating: 4.9,
    reviews: 156,
    amenities: ['Jungle Views', 'Infinity Pool', 'Yoga Deck', 'Spa'],
    description: 'Peaceful jungle sanctuary with authentic Balinese charm. Ideal for wellness and spiritual content.',
    host: {
      name: 'David Williams',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
      responseTime: 'within 3 hours'
    }
  }
];
