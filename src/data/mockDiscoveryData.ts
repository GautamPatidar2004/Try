// Mock data for AI Discovery feed - used in development
export const mockProperties = [
  {
    id: 'mock-prop-1',
    title: 'Luxury Beachfront Villa',
    location: 'Malibu, California',
    description: 'Stunning oceanfront property with private beach access, infinity pool, and breathtaking sunset views. Perfect for lifestyle and travel content.',
    property_type: 'Villa',
    max_guests: 8,
    bedrooms: 4,
    bathrooms: 3,
    amenities: ['Pool', 'Beach Access', 'Ocean View', 'WiFi', 'Kitchen', 'Parking'],
    collaboration_type: 'content_exchange',
    content_requirements: ['Instagram Posts', 'Reels', 'Stories'],
    is_active: true,
    property_images: [
      { id: 'img-1', image_url: '/lovable-uploads/37dff50a-de23-4743-b5c6-803312d8f98c.png', is_primary: true, display_order: 0 },
      { id: 'img-2', image_url: '/lovable-uploads/6e4ad084-93fa-4967-86e3-518eeadac17e.png', is_primary: false, display_order: 1 }
    ],
    hosts: {
      id: 'mock-host-1',
      business_name: 'Coastal Luxury Retreats',
      profiles: {
        id: 'mock-host-1',
        first_name: 'Michael',
        last_name: 'Chen',
        profile_photo_url: '/lovable-uploads/c7e9e925-4019-4cae-91db-cf1399918f0a.png',
        bio: 'Luxury property owner focused on authentic travel experiences'
      }
    }
  },
  {
    id: 'mock-prop-2',
    title: 'Mountain Retreat Cabin',
    location: 'Aspen, Colorado',
    description: 'Cozy alpine cabin surrounded by pristine nature. Ideal for adventure and outdoor lifestyle content during all seasons.',
    property_type: 'Cabin',
    max_guests: 6,
    bedrooms: 3,
    bathrooms: 2,
    amenities: ['Fireplace', 'Mountain View', 'Hot Tub', 'Hiking Trails', 'WiFi'],
    collaboration_type: 'content_exchange',
    content_requirements: ['TikTok Videos', 'YouTube Vlogs', 'Instagram Stories'],
    is_active: true,
    property_images: [
      { id: 'img-3', image_url: '/lovable-uploads/9d534951-5ecc-41eb-949f-b96fbbe41437.png', is_primary: true, display_order: 0 }
    ],
    hosts: {
      id: 'mock-host-2',
      business_name: 'Mountain Escape Properties',
      profiles: {
        id: 'mock-host-2',
        first_name: 'Sarah',
        last_name: 'Martinez',
        profile_photo_url: '/lovable-uploads/d524ac95-afcd-4d7b-87d4-1c7c427aa1f8.png',
        bio: 'Nature lover sharing mountain experiences'
      }
    }
  },
  {
    id: 'mock-prop-3',
    title: 'Urban Loft in Downtown',
    location: 'New York, NY',
    description: 'Modern industrial loft in the heart of the city. Perfect for fashion, lifestyle, and urban content creation.',
    property_type: 'Apartment',
    max_guests: 4,
    bedrooms: 2,
    bathrooms: 2,
    amenities: ['City View', 'Rooftop Access', 'Gym', 'WiFi', 'Designer Furniture'],
    collaboration_type: 'paid_collab',
    content_requirements: ['Instagram Feed Posts', 'Reels', 'TikTok'],
    is_active: true,
    property_images: [
      { id: 'img-4', image_url: '/lovable-uploads/f6345ab9-57f4-49a0-acde-a9f6322960de.png', is_primary: true, display_order: 0 }
    ],
    hosts: {
      id: 'mock-host-3',
      business_name: 'Urban Stays Co',
      profiles: {
        id: 'mock-host-3',
        first_name: 'Alex',
        last_name: 'Thompson',
        profile_photo_url: '/lovable-uploads/37dff50a-de23-4743-b5c6-803312d8f98c.png',
        bio: 'Curating unique urban experiences'
      }
    }
  },
  {
    id: 'mock-prop-4',
    title: 'Tropical Island Paradise',
    location: 'Tulum, Mexico',
    description: 'Eco-luxury beachfront bungalow with jungle and ocean views. Sustainable paradise for wellness and travel influencers.',
    property_type: 'Bungalow',
    max_guests: 2,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ['Beach Access', 'Yoga Deck', 'Outdoor Shower', 'Eco-Friendly', 'Pool'],
    collaboration_type: 'content_exchange',
    content_requirements: ['Instagram Posts', 'Reels', 'Blog Features'],
    is_active: true,
    property_images: [
      { id: 'img-5', image_url: '/lovable-uploads/6e4ad084-93fa-4967-86e3-518eeadac17e.png', is_primary: true, display_order: 0 }
    ],
    hosts: {
      id: 'mock-host-4',
      business_name: 'Eco Tulum Retreats',
      profiles: {
        id: 'mock-host-4',
        first_name: 'Isabella',
        last_name: 'Rodriguez',
        profile_photo_url: '/lovable-uploads/9d534951-5ecc-41eb-949f-b96fbbe41437.png',
        bio: 'Sustainable hospitality advocate'
      }
    }
  },
  {
    id: 'mock-prop-5',
    title: 'Wine Country Estate',
    location: 'Napa Valley, California',
    description: 'Elegant vineyard estate with rolling hills and wine cellar. Perfect for food, wine, and luxury lifestyle content.',
    property_type: 'Estate',
    max_guests: 10,
    bedrooms: 5,
    bathrooms: 4,
    amenities: ['Vineyard Views', 'Wine Cellar', 'Gourmet Kitchen', 'Pool', 'Outdoor Dining'],
    collaboration_type: 'paid_collab',
    content_requirements: ['YouTube Videos', 'Instagram Posts', 'Blog Articles'],
    is_active: true,
    property_images: [
      { id: 'img-6', image_url: '/lovable-uploads/c7e9e925-4019-4cae-91db-cf1399918f0a.png', is_primary: true, display_order: 0 }
    ],
    hosts: {
      id: 'mock-host-5',
      business_name: 'Napa Luxury Estates',
      profiles: {
        id: 'mock-host-5',
        first_name: 'David',
        last_name: 'Anderson',
        profile_photo_url: '/lovable-uploads/d524ac95-afcd-4d7b-87d4-1c7c427aa1f8.png',
        bio: 'Wine enthusiast and hospitality expert'
      }
    }
  }
];

export const mockInfluencers = [
  {
    id: 'mock-inf-1',
    first_name: 'Emma',
    last_name: 'Williams',
    username: 'emma.travels',
    bio: 'Travel & lifestyle creator sharing authentic adventures. Passionate about sustainable tourism and cultural experiences.',
    profile_photo_url: '/lovable-uploads/37dff50a-de23-4743-b5c6-803312d8f98c.png',
    location: 'Los Angeles, CA',
    user_type: 'influencer',
    influencers: {
      total_followers: 125000,
      engagement_rate: 4.8,
      content_niches: ['Travel', 'Lifestyle', 'Sustainability'],
      collaboration_preferences: ['Content Exchange', 'Paid Collaborations']
    },
    social_accounts: [
      { platform: 'instagram', username: 'emma.travels', follower_count: 85000, is_verified: true, profile_url: 'https://instagram.com/emma.travels' },
      { platform: 'tiktok', username: 'emmatravels', follower_count: 40000, is_verified: false, profile_url: 'https://tiktok.com/@emmatravels' }
    ]
  },
  {
    id: 'mock-inf-2',
    first_name: 'Marcus',
    last_name: 'Johnson',
    username: 'adventure.marcus',
    bio: 'Adventure photographer and outdoor enthusiast. Capturing epic moments in the wild.',
    profile_photo_url: '/lovable-uploads/6e4ad084-93fa-4967-86e3-518eeadac17e.png',
    location: 'Denver, CO',
    user_type: 'influencer',
    influencers: {
      total_followers: 215000,
      engagement_rate: 5.2,
      content_niches: ['Adventure', 'Photography', 'Outdoor'],
      collaboration_preferences: ['Content Exchange', 'Brand Partnerships']
    },
    social_accounts: [
      { platform: 'instagram', username: 'adventure.marcus', follower_count: 150000, is_verified: true, profile_url: 'https://instagram.com/adventure.marcus' },
      { platform: 'youtube', username: 'AdventureMarcus', follower_count: 65000, is_verified: true, profile_url: 'https://youtube.com/@adventuremarcus' }
    ]
  },
  {
    id: 'mock-inf-3',
    first_name: 'Sophia',
    last_name: 'Lee',
    username: 'sophias.foodjourney',
    bio: 'Food & travel blogger exploring culinary experiences worldwide. Wine lover and recipe creator.',
    profile_photo_url: '/lovable-uploads/9d534951-5ecc-41eb-949f-b96fbbe41437.png',
    location: 'San Francisco, CA',
    user_type: 'influencer',
    influencers: {
      total_followers: 92000,
      engagement_rate: 6.1,
      content_niches: ['Food', 'Travel', 'Wine', 'Lifestyle'],
      collaboration_preferences: ['Paid Collaborations', 'Brand Partnerships']
    },
    social_accounts: [
      { platform: 'instagram', username: 'sophias.foodjourney', follower_count: 70000, is_verified: true, profile_url: 'https://instagram.com/sophias.foodjourney' },
      { platform: 'tiktok', username: 'sophiafood', follower_count: 22000, is_verified: false, profile_url: 'https://tiktok.com/@sophiafood' }
    ]
  },
  {
    id: 'mock-inf-4',
    first_name: 'James',
    last_name: 'Rivera',
    username: 'urban.james',
    bio: 'Urban lifestyle and fashion content creator. Showcasing city life, style, and modern living.',
    profile_photo_url: '/lovable-uploads/c7e9e925-4019-4cae-91db-cf1399918f0a.png',
    location: 'New York, NY',
    user_type: 'influencer',
    influencers: {
      total_followers: 178000,
      engagement_rate: 4.5,
      content_niches: ['Fashion', 'Lifestyle', 'Urban', 'Design'],
      collaboration_preferences: ['Paid Collaborations', 'Content Exchange']
    },
    social_accounts: [
      { platform: 'instagram', username: 'urban.james', follower_count: 130000, is_verified: true, profile_url: 'https://instagram.com/urban.james' },
      { platform: 'tiktok', username: 'urbanjames', follower_count: 48000, is_verified: true, profile_url: 'https://tiktok.com/@urbanjames' }
    ]
  },
  {
    id: 'mock-inf-5',
    first_name: 'Olivia',
    last_name: 'Chen',
    username: 'wellness.olivia',
    bio: 'Wellness coach and yoga instructor. Promoting mindful living, health, and sustainable practices.',
    profile_photo_url: '/lovable-uploads/d524ac95-afcd-4d7b-87d4-1c7c427aa1f8.png',
    location: 'Austin, TX',
    user_type: 'influencer',
    influencers: {
      total_followers: 156000,
      engagement_rate: 7.3,
      content_niches: ['Wellness', 'Yoga', 'Sustainability', 'Lifestyle'],
      collaboration_preferences: ['Content Exchange', 'Brand Partnerships']
    },
    social_accounts: [
      { platform: 'instagram', username: 'wellness.olivia', follower_count: 110000, is_verified: true, profile_url: 'https://instagram.com/wellness.olivia' },
      { platform: 'youtube', username: 'WellnessWithOlivia', follower_count: 46000, is_verified: false, profile_url: 'https://youtube.com/@wellnesswitholivia' }
    ]
  }
];

// Mock AI match scores for influencers (showing properties)
export const mockInfluencerMatches = [
  {
    id: 'mock-match-1',
    match_score: 92,
    property_id: 'mock-prop-1',
    influencer_id: 'current-user',
    match_reasons: [
      'Perfect coastal location alignment with your travel content',
      'High engagement potential for beach and lifestyle posts',
      'Host actively seeks authentic travel creators'
    ],
    ai_recommendation: 'This luxury beachfront villa is an exceptional match for your coastal lifestyle content. The property\'s aesthetic aligns perfectly with your brand, and the host values authentic storytelling.',
    property: mockProperties[0]
  },
  {
    id: 'mock-match-2',
    match_score: 88,
    property_id: 'mock-prop-2',
    influencer_id: 'current-user',
    match_reasons: [
      'Your adventure content perfectly fits this mountain setting',
      'Strong seasonal content opportunities',
      'Host preferences match your collaboration style'
    ],
    ai_recommendation: 'Great opportunity for creating compelling adventure and outdoor content. The mountain location offers diverse seasonal backdrops for your portfolio.',
    property: mockProperties[1]
  },
  {
    id: 'mock-match-3',
    match_score: 85,
    property_id: 'mock-prop-4',
    influencer_id: 'current-user',
    match_reasons: [
      'Eco-friendly focus aligns with your sustainability values',
      'Tropical setting expands your content diversity',
      'Wellness angle matches your audience interests'
    ],
    ai_recommendation: 'This eco-luxury paradise offers authentic sustainable travel content opportunities. Perfect for showcasing responsible tourism to your engaged audience.',
    property: mockProperties[3]
  },
  {
    id: 'mock-match-4',
    match_score: 81,
    property_id: 'mock-prop-5',
    influencer_id: 'current-user',
    match_reasons: [
      'Luxury lifestyle content opportunity',
      'Food and wine angle adds content variety',
      'High-value collaboration potential'
    ],
    ai_recommendation: 'Expand into luxury lifestyle content with this stunning wine country estate. Great for diversifying your portfolio and attracting premium brand partnerships.',
    property: mockProperties[4]
  },
  {
    id: 'mock-match-5',
    match_score: 78,
    property_id: 'mock-prop-3',
    influencer_id: 'current-user',
    match_reasons: [
      'Urban setting complements your travel content',
      'Modern aesthetic fits your visual style',
      'City content gaps in your portfolio'
    ],
    ai_recommendation: 'Balance your outdoor content with this sleek urban loft. Perfect for showing your versatility and reaching city-dwelling audiences.',
    property: mockProperties[2]
  }
];

// Mock AI match scores for hosts (showing influencers)
export const mockHostMatches = [
  {
    id: 'mock-match-6',
    match_score: 94,
    property_id: 'current-property',
    influencer_id: 'mock-inf-1',
    match_reasons: [
      'Excellent audience alignment with your property\'s target market',
      'High engagement rate of 4.8% ensures quality reach',
      'Authentic travel content style matches your brand values'
    ],
    ai_recommendation: 'Emma is an ideal partner with a highly engaged audience that perfectly matches your property\'s demographic. Her authentic storytelling approach will showcase your space beautifully.',
    influencer: mockInfluencers[0]
  },
  {
    id: 'mock-match-7',
    match_score: 91,
    property_id: 'current-property',
    influencer_id: 'mock-inf-2',
    match_reasons: [
      'Adventure content expertise fits your property type',
      '215K total followers with strong YouTube presence',
      'Professional photography quality elevates property showcase'
    ],
    ai_recommendation: 'Marcus brings exceptional visual storytelling skills and a large adventure-focused audience. His content will highlight your property\'s unique outdoor features.',
    influencer: mockInfluencers[1]
  },
  {
    id: 'mock-match-8',
    match_score: 87,
    property_id: 'current-property',
    influencer_id: 'mock-inf-5',
    match_reasons: [
      'Wellness niche aligns with retreat-style properties',
      'Impressive 7.3% engagement rate shows dedicated followers',
      'Sustainable practices match your eco-conscious values'
    ],
    ai_recommendation: 'Olivia\'s wellness-focused content and highly engaged community are perfect for properties emphasizing relaxation and mindful experiences.',
    influencer: mockInfluencers[4]
  },
  {
    id: 'mock-match-9',
    match_score: 83,
    property_id: 'current-property',
    influencer_id: 'mock-inf-3',
    match_reasons: [
      'Food and travel content creates unique property narrative',
      'Strong engagement with culinary-focused audience',
      'Wine country and gourmet content expertise'
    ],
    ai_recommendation: 'Sophia\'s food and travel focus offers a unique angle for showcasing your property through culinary experiences and lifestyle content.',
    influencer: mockInfluencers[2]
  },
  {
    id: 'mock-match-10',
    match_score: 80,
    property_id: 'current-property',
    influencer_id: 'mock-inf-4',
    match_reasons: [
      'Urban lifestyle expertise for city properties',
      '178K followers with fashion and design focus',
      'Modern aesthetic matches contemporary spaces'
    ],
    ai_recommendation: 'James excels at showcasing modern, stylish spaces to a design-conscious audience. Great for urban or boutique properties targeting city dwellers.',
    influencer: mockInfluencers[3]
  }
];
