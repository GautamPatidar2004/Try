import { describe, it, expect } from "vitest";
import {
  getGeneration,
  GENERATION_LABELS,
  GENDER_LABELS,
  LIFESTYLE_LABELS,
} from "./demographics";

describe("getGeneration", () => {
  it("returns null for missing input", () => {
    expect(getGeneration(null)).toBeNull();
    expect(getGeneration(undefined)).toBeNull();
    expect(getGeneration("")).toBeNull();
  });

  it("returns null for unparseable dates", () => {
    expect(getGeneration("not-a-date")).toBeNull();
  });

  it("buckets birth years into the right generation", () => {
    expect(getGeneration("2000-06-15")).toBe("gen_z");
    expect(getGeneration("1990-06-15")).toBe("millennial");
    expect(getGeneration("1972-06-15")).toBe("gen_x");
    expect(getGeneration("1955-06-15")).toBe("boomer");
  });

  it("accepts a Date object", () => {
    // Use the local-time Date constructor so boundary years are timezone-stable.
    expect(getGeneration(new Date(1985, 5, 15))).toBe("millennial");
  });

  it("respects the inclusive generation boundaries", () => {
    expect(getGeneration(new Date(1997, 0, 1))).toBe("gen_z");
    expect(getGeneration(new Date(2012, 11, 31))).toBe("gen_z");
    expect(getGeneration(new Date(1996, 11, 31))).toBe("millennial");
    expect(getGeneration(new Date(1946, 0, 1))).toBe("boomer");
  });

  it("returns null for years outside the supported buckets", () => {
    expect(getGeneration(new Date(2013, 0, 1))).toBeNull();
    expect(getGeneration(new Date(1945, 11, 31))).toBeNull();
  });
});

describe("label maps", () => {
  it("maps every generation value to a label", () => {
    expect(GENERATION_LABELS.gen_z).toBe("Gen Z");
    expect(GENERATION_LABELS.millennial).toBe("Millennial");
    expect(GENERATION_LABELS.gen_x).toBe("Gen X");
    expect(GENERATION_LABELS.boomer).toBe("Boomer");
  });

  it("derives gender + lifestyle labels from their option lists", () => {
    expect(GENDER_LABELS.female).toBe("Female");
    expect(GENDER_LABELS.prefer_not_to_say).toBe("Prefer not to say");
    expect(LIFESTYLE_LABELS.pet_owner).toBe("Pet Owner");
    expect(LIFESTYLE_LABELS.active_sports).toBe("Active in Gym / Sports");
  });
});
