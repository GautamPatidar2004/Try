import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMarketplace, type Property } from "./useMarketplace";

const mkProp = (over: Partial<Property> & { id: string }): Property => ({
  title: "T",
  location: "Nowhere",
  coordinates: { lat: 0, lng: 0 },
  images: [],
  rating: 4,
  reviews: 10,
  type: "House",
  guests: 2,
  bedrooms: 1,
  bathrooms: 1,
  pricePerNight: 100,
  amenities: [],
  contentRequirements: [],
  collaborationType: "Paid",
  isSuperhost: false,
  host: { name: "H", avatar: "", responseRate: 90 },
  availableDates: "",
  ...over,
});

const properties: Property[] = [
  mkProp({
    id: "p1",
    title: "Beach House",
    location: "Miami, FL",
    pricePerNight: 200,
    type: "House",
    guests: 6,
    bedrooms: 3,
    rating: 4.9,
    reviews: 50,
    amenities: ["Pool", "WiFi"],
    isSuperhost: true,
  }),
  mkProp({
    id: "p2",
    title: "City Loft",
    location: "New York, NY",
    pricePerNight: 0,
    type: "Apartment",
    guests: 2,
    bedrooms: 1,
    rating: 4.2,
    reviews: 8,
    amenities: ["WiFi"],
    collaborationType: "Free Stay",
  }),
  mkProp({
    id: "p3",
    title: "Mountain Cabin",
    location: "Denver, CO",
    pricePerNight: 100,
    type: "Cabin",
    guests: 4,
    bedrooms: 2,
    rating: 4.6,
    reviews: 30,
    amenities: ["Kitchen", "Pet Friendly"],
  }),
];

const idSet = (list: { id: string }[]) => new Set(list.map((p) => p.id));
const ids = (list: { id: string }[]) => list.map((p) => p.id);

describe("useMarketplace", () => {
  it("returns all properties with no filters", () => {
    const { result } = renderHook(() => useMarketplace(properties));
    expect(idSet(result.current.filteredProperties)).toEqual(
      new Set(["p1", "p2", "p3"]),
    );
    expect(result.current.activeFilterCount).toBe(0);
  });

  it("searches by title and location", () => {
    const { result } = renderHook(() => useMarketplace(properties));
    act(() => result.current.setSearchQuery("miami"));
    expect(idSet(result.current.filteredProperties)).toEqual(new Set(["p1"]));
    act(() => result.current.setSearchQuery("loft"));
    expect(idSet(result.current.filteredProperties)).toEqual(new Set(["p2"]));
  });

  it("applies the Superhost and amenity quick filters", () => {
    const { result } = renderHook(() => useMarketplace(properties));
    act(() => result.current.handleQuickFilterToggle("Superhost"));
    expect(idSet(result.current.filteredProperties)).toEqual(new Set(["p1"]));

    act(() => result.current.handleQuickFilterToggle("Superhost")); // toggle off
    act(() => result.current.handleQuickFilterToggle("WiFi"));
    expect(idSet(result.current.filteredProperties)).toEqual(
      new Set(["p1", "p2"]),
    );
  });

  it("filters by price range (only applies when narrowed from [0,1000])", () => {
    const { result } = renderHook(() => useMarketplace(properties));
    act(() =>
      result.current.setFilters((prev) => ({ ...prev, priceRange: [0, 150] })),
    );
    expect(idSet(result.current.filteredProperties)).toEqual(
      new Set(["p2", "p3"]),
    );
  });

  it("filters by minimum rating, minimum guests and superhost-only", () => {
    const { result } = renderHook(() => useMarketplace(properties));
    act(() =>
      result.current.setFilters((prev) => ({ ...prev, minRating: 4.7 })),
    );
    expect(idSet(result.current.filteredProperties)).toEqual(new Set(["p1"]));

    act(() => result.current.clearAllFilters());
    act(() => result.current.setFilters((prev) => ({ ...prev, minGuests: 4 })));
    expect(idSet(result.current.filteredProperties)).toEqual(
      new Set(["p1", "p3"]),
    );

    act(() => result.current.clearAllFilters());
    act(() =>
      result.current.setFilters((prev) => ({ ...prev, superhostOnly: true })),
    );
    expect(idSet(result.current.filteredProperties)).toEqual(new Set(["p1"]));
  });

  it("sorts by price ascending", () => {
    const { result } = renderHook(() => useMarketplace(properties));
    act(() => result.current.setSortBy("price-low"));
    expect(ids(result.current.filteredProperties)).toEqual(["p2", "p3", "p1"]);
  });

  it("clears all filters and resets the count", () => {
    const { result } = renderHook(() => useMarketplace(properties));
    act(() =>
      result.current.setFilters((prev) => ({
        ...prev,
        minRating: 4.7,
        superhostOnly: true,
      })),
    );
    expect(result.current.activeFilterCount).toBeGreaterThan(0);
    act(() => result.current.clearAllFilters());
    expect(result.current.activeFilterCount).toBe(0);
    expect(idSet(result.current.filteredProperties)).toEqual(
      new Set(["p1", "p2", "p3"]),
    );
  });
});
