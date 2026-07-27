import { describe, it, expect } from "vitest";
import { formatSocialUrl } from "./socialUrlFormatter";

describe("formatSocialUrl", () => {
  it("returns undefined for empty input", () => {
    expect(formatSocialUrl("instagram", null)).toBeUndefined();
    expect(formatSocialUrl("instagram", undefined)).toBeUndefined();
    expect(formatSocialUrl("instagram", "")).toBeUndefined();
  });

  it("returns an already-absolute URL unchanged", () => {
    expect(formatSocialUrl("instagram", "https://instagram.com/foo")).toBe(
      "https://instagram.com/foo",
    );
    expect(formatSocialUrl("tiktok", "http://example.com/x")).toBe(
      "http://example.com/x",
    );
  });

  it("strips a leading @ and builds the platform URL", () => {
    expect(formatSocialUrl("instagram", "@handle")).toBe(
      "https://instagram.com/handle",
    );
    expect(formatSocialUrl("instagram", "handle")).toBe(
      "https://instagram.com/handle",
    );
  });

  it("uses the @-prefixed path form for youtube and tiktok", () => {
    expect(formatSocialUrl("youtube", "handle")).toBe(
      "https://youtube.com/@handle",
    );
    expect(formatSocialUrl("tiktok", "handle")).toBe(
      "https://tiktok.com/@handle",
    );
  });

  it("uses the bare path form for twitter", () => {
    expect(formatSocialUrl("twitter", "handle")).toBe(
      "https://twitter.com/handle",
    );
  });
});
