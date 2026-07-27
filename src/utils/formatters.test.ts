import { describe, it, expect } from "vitest";
import {
  formatFollowers,
  formatCurrency,
  extractCity,
  formatEngagementRate,
  formatPercentage,
  truncateText,
} from "./formatters";

describe("formatFollowers", () => {
  it("returns the raw number below 1,000", () => {
    expect(formatFollowers(0)).toBe("0");
    expect(formatFollowers(42)).toBe("42");
    expect(formatFollowers(999)).toBe("999");
  });

  it("formats thousands with a K suffix and one decimal", () => {
    expect(formatFollowers(1000)).toBe("1.0K");
    expect(formatFollowers(5432)).toBe("5.4K");
    expect(formatFollowers(15000)).toBe("15.0K");
  });

  it("formats millions with an M suffix and one decimal", () => {
    expect(formatFollowers(1000000)).toBe("1.0M");
    expect(formatFollowers(1234567)).toBe("1.2M");
    expect(formatFollowers(15000000)).toBe("15.0M");
  });

  it("rounds at the K/M boundary the way toFixed does", () => {
    // 999_999 is still < 1_000_000, so it formats as K and rounds up
    expect(formatFollowers(999999)).toBe("1000.0K");
  });
});

describe("formatCurrency", () => {
  // NOTE: the function only sets `minimumFractionDigits: 0`, so whole numbers
  // render without cents, but fractional amounts still show up to 2 decimals
  // (the USD default). The docstring's "$1,235" (rounded) is NOT what it does.
  it("drops cents for whole-dollar amounts", () => {
    expect(formatCurrency(0)).toBe("$0");
    expect(formatCurrency(1000)).toBe("$1,000");
    expect(formatCurrency(1000000)).toBe("$1,000,000");
  });

  it("keeps cents for fractional amounts (does not round, does not pad trailing zeros)", () => {
    expect(formatCurrency(1234.56)).toBe("$1,234.56");
    // minimumFractionDigits:0 means a single significant decimal is NOT padded to .50
    expect(formatCurrency(9.5)).toBe("$9.5");
  });

  it("handles negative amounts", () => {
    expect(formatCurrency(-1234.56)).toBe("-$1,234.56");
  });
});

describe("extractCity", () => {
  it("returns the first comma-separated segment, trimmed", () => {
    expect(extractCity("New York, NY, USA")).toBe("New York");
    expect(extractCity("  Tokyo , JP")).toBe("Tokyo");
  });

  it("returns the whole string when there is no comma", () => {
    expect(extractCity("Paris")).toBe("Paris");
  });

  it("returns an empty string for empty input", () => {
    expect(extractCity("")).toBe("");
  });
});

describe("formatEngagementRate", () => {
  it("renders the rate with two decimals and a percent sign", () => {
    expect(formatEngagementRate(5.234)).toBe("5.23%");
    expect(formatEngagementRate(0)).toBe("0.00%");
    expect(formatEngagementRate(10)).toBe("10.00%");
  });
});

describe("formatPercentage", () => {
  it("multiplies a 0–1 ratio by 100 with one decimal", () => {
    expect(formatPercentage(0.123)).toBe("12.3%");
    expect(formatPercentage(0.5)).toBe("50.0%");
    expect(formatPercentage(1)).toBe("100.0%");
    expect(formatPercentage(0)).toBe("0.0%");
  });
});

describe("truncateText", () => {
  it("returns text unchanged when at or under the limit", () => {
    expect(truncateText("Hi", 10)).toBe("Hi");
    expect(truncateText("exactlyten", 10)).toBe("exactlyten");
  });

  it("truncates and appends an ellipsis (preserving any boundary whitespace)", () => {
    // "Long text here".substring(0, 10) === "Long text " (note the trailing space)
    expect(truncateText("Long text here", 10)).toBe("Long text ...");
  });
});
