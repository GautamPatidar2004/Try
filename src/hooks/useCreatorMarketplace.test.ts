import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCreatorMarketplace } from "./useCreatorMarketplace";

// Minimal creators that satisfy the hook's defaults (engagementRate within [0,20],
// followers within [0,10M], rating >= 0) so they all pass with no filters applied.
const make = (over: Record<string, unknown>) => ({
  followers: 1000,
  rating: 4,
  specialties: [] as string[],
  engagementRate: 5,
  collaborationPreferences: [] as string[],
  platforms: [] as string[],
  ...over,
});

const creators = [
  make({
    id: "a",
    name: "Alice Adventure",
    location: "New York, NY",
    followers: 200000,
    rating: 4.8,
    specialties: ["Travel", "Food"],
    engagementRate: 5,
    verified: true,
  }),
  make({
    id: "b",
    name: "Bob Builder",
    location: "Austin, TX",
    followers: 5000,
    rating: 4.0,
    specialties: ["Lifestyle"],
    engagementRate: 3,
    verified: false,
  }),
  make({
    id: "c",
    name: "Cara Chef",
    location: "Paris, France",
    followers: 120000,
    rating: 4.6,
    specialties: ["Food", "Cooking"],
    engagementRate: 7,
    verified: true,
  }),
] as Parameters<typeof useCreatorMarketplace>[0];

const ids = (list: { id: string }[]) => list.map((c) => c.id);

describe("useCreatorMarketplace", () => {
  it("returns every creator (sorted by followers desc) when no filters are set", () => {
    const { result } = renderHook(() => useCreatorMarketplace(creators));
    expect(ids(result.current.filteredCreators)).toEqual(["a", "c", "b"]);
    expect(result.current.activeFilterCount).toBe(0);
  });

  it("searches across name, location and specialties (case-insensitive)", () => {
    const { result } = renderHook(() => useCreatorMarketplace(creators));
    act(() => result.current.setSearchQuery("paris"));
    expect(ids(result.current.filteredCreators)).toEqual(["c"]); // location match
    act(() => result.current.setSearchQuery("food"));
    expect(ids(result.current.filteredCreators)).toEqual(["a", "c"]); // specialty match
    act(() => result.current.setSearchQuery("alice"));
    expect(ids(result.current.filteredCreators)).toEqual(["a"]); // name match
  });

  it("filters by follower range", () => {
    const { result } = renderHook(() => useCreatorMarketplace(creators));
    act(() => result.current.setFilters({ followerRange: [100000, 10000000] }));
    expect(ids(result.current.filteredCreators)).toEqual(["a", "c"]);
  });

  it("filters by minimum rating", () => {
    const { result } = renderHook(() => useCreatorMarketplace(creators));
    act(() => result.current.setFilters({ minRating: 4.7 }));
    expect(ids(result.current.filteredCreators)).toEqual(["a"]);
  });

  it("filters verified only", () => {
    const { result } = renderHook(() => useCreatorMarketplace(creators));
    act(() => result.current.setFilters({ verifiedOnly: true }));
    expect(ids(result.current.filteredCreators)).toEqual(["a", "c"]);
  });

  it("filters by content niche using exact (case-insensitive) specialty match", () => {
    const { result } = renderHook(() => useCreatorMarketplace(creators));
    act(() => result.current.setFilters({ contentNiches: ["food"] }));
    expect(ids(result.current.filteredCreators)).toEqual(["a", "c"]);
    act(() => result.current.setFilters({ contentNiches: ["cooking"] }));
    expect(ids(result.current.filteredCreators)).toEqual(["c"]);
  });

  it("applies the 'High Following' quick filter (>= 100k)", () => {
    const { result } = renderHook(() => useCreatorMarketplace(creators));
    act(() => result.current.handleQuickFilterToggle("High Following"));
    expect(ids(result.current.filteredCreators)).toEqual(["a", "c"]);
  });

  it("sorts by name, rating and engagement", () => {
    const { result } = renderHook(() => useCreatorMarketplace(creators));
    act(() => result.current.setSortBy("name"));
    expect(ids(result.current.filteredCreators)).toEqual(["a", "b", "c"]);
    act(() => result.current.setSortBy("rating"));
    expect(ids(result.current.filteredCreators)).toEqual(["a", "c", "b"]);
    act(() => result.current.setSortBy("engagement"));
    expect(ids(result.current.filteredCreators)).toEqual(["c", "a", "b"]);
  });

  it("counts active filters and clears them all", () => {
    const { result } = renderHook(() => useCreatorMarketplace(creators));
    act(() => result.current.setFilters({ verifiedOnly: true, minRating: 4 }));
    act(() => result.current.setSearchQuery("alice"));
    expect(result.current.activeFilterCount).toBe(2); // verifiedOnly + minRating
    act(() => result.current.clearAllFilters());
    expect(result.current.activeFilterCount).toBe(0);
    expect(result.current.searchQuery).toBe("");
    expect(ids(result.current.filteredCreators)).toEqual(["a", "c", "b"]);
  });
});
