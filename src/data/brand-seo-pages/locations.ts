import type { LocationData } from "./types";

export const locations: Record<string, LocationData> = {
  miami: {
    slug: "miami",
    name: "Miami",
    state: "Florida",
    region: "Southeast",
    creatorCount: 850,
    popularNiches: ["Luxury Travel", "Beach Lifestyle", "Nightlife", "Latin Culture", "Fashion"]
  },
  "los-angeles": {
    slug: "los-angeles",
    name: "Los Angeles",
    state: "California",
    region: "West Coast",
    creatorCount: 2100,
    popularNiches: ["Entertainment", "Lifestyle", "Food & Dining", "Fitness", "Fashion"]
  },
  "new-york": {
    slug: "new-york",
    name: "New York",
    state: "New York",
    region: "Northeast",
    creatorCount: 1800,
    popularNiches: ["Urban Lifestyle", "Food Scene", "Fashion", "Arts & Culture", "Luxury"]
  },
  austin: {
    slug: "austin",
    name: "Austin",
    state: "Texas",
    region: "Southwest",
    creatorCount: 520,
    popularNiches: ["Music & Events", "Food & BBQ", "Outdoor Adventure", "Tech Lifestyle", "Wellness"]
  },
  denver: {
    slug: "denver",
    name: "Denver",
    state: "Colorado",
    region: "Mountain West",
    creatorCount: 380,
    popularNiches: ["Outdoor Adventure", "Craft Beer", "Wellness", "Skiing", "Sustainability"]
  },
  nashville: {
    slug: "nashville",
    name: "Nashville",
    state: "Tennessee",
    region: "Southeast",
    creatorCount: 420,
    popularNiches: ["Music & Entertainment", "Bachelorette Parties", "Food Scene", "Country Lifestyle", "Events"]
  },
  "san-francisco": {
    slug: "san-francisco",
    name: "San Francisco",
    state: "California",
    region: "West Coast",
    creatorCount: 680,
    popularNiches: ["Tech & Startups", "Food & Wine", "Outdoor Activities", "LGBTQ+ Travel", "Sustainability"]
  },
  chicago: {
    slug: "chicago",
    name: "Chicago",
    state: "Illinois",
    region: "Midwest",
    creatorCount: 720,
    popularNiches: ["Food & Dining", "Architecture", "Urban Culture", "Sports", "Arts"]
  },
  seattle: {
    slug: "seattle",
    name: "Seattle",
    state: "Washington",
    region: "Pacific Northwest",
    creatorCount: 450,
    popularNiches: ["Coffee Culture", "Outdoor Adventure", "Tech Lifestyle", "Seafood", "Sustainability"]
  },
  "san-diego": {
    slug: "san-diego",
    name: "San Diego",
    state: "California",
    region: "West Coast",
    creatorCount: 510,
    popularNiches: ["Beach Lifestyle", "Craft Beer", "Outdoor Adventure", "Mexican Cuisine", "Wellness"]
  },
  scottsdale: {
    slug: "scottsdale",
    name: "Scottsdale",
    state: "Arizona",
    region: "Southwest",
    creatorCount: 280,
    popularNiches: ["Luxury Resorts", "Golf", "Spa & Wellness", "Desert Adventure", "Fine Dining"]
  },
  "las-vegas": {
    slug: "las-vegas",
    name: "Las Vegas",
    state: "Nevada",
    region: "Southwest",
    creatorCount: 620,
    popularNiches: ["Entertainment", "Nightlife", "Luxury Hotels", "Food & Dining", "Events"]
  },
  "new-orleans": {
    slug: "new-orleans",
    name: "New Orleans",
    state: "Louisiana",
    region: "Southeast",
    creatorCount: 340,
    popularNiches: ["Food & Cuisine", "Music & Culture", "Nightlife", "History", "Festivals"]
  },
  orlando: {
    slug: "orlando",
    name: "Orlando",
    state: "Florida",
    region: "Southeast",
    creatorCount: 480,
    popularNiches: ["Theme Parks", "Family Travel", "Resorts", "Entertainment", "Golf"]
  },
  hawaii: {
    slug: "hawaii",
    name: "Hawaii",
    state: "Hawaii",
    region: "Pacific",
    creatorCount: 320,
    popularNiches: ["Luxury Resorts", "Adventure Travel", "Beach Lifestyle", "Wellness", "Hawaiian Culture"]
  }
};

export const locationList = Object.values(locations);
export const locationSlugs = Object.keys(locations);
