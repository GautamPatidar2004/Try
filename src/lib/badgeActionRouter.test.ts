import { describe, it, expect, vi } from "vitest";
import { getBadgeAction, executeBadgeAction } from "./badgeActionRouter";

describe("getBadgeAction", () => {
  it("routes content/posting badges to the portfolio tab", () => {
    expect(getBadgeAction("First Post")).toMatchObject({
      path: "/profile",
      tab: "portfolio",
    });
    expect(getBadgeAction("Content Creator")).toMatchObject({
      path: "/profile",
      tab: "portfolio",
    });
    expect(getBadgeAction("Posting Streak")).toMatchObject({
      tab: "portfolio",
    });
  });

  it("'first steps' resolves to portfolio (first matching branch wins over the application branch)", () => {
    expect(getBadgeAction("First Steps")).toMatchObject({
      path: "/profile",
      tab: "portfolio",
    });
  });

  it("routes profile/setup/social badges to the settings tab", () => {
    expect(getBadgeAction("Profile Pro")).toMatchObject({ tab: "settings" });
    expect(getBadgeAction("Social Connector")).toMatchObject({
      tab: "settings",
    });
  });

  it("routes application badges to the marketplace", () => {
    expect(getBadgeAction("Application Master")).toMatchObject({
      path: "/marketplace",
    });
  });

  it("routes collaboration / community / discovery / match badges to discover", () => {
    expect(getBadgeAction("Collaboration King")).toMatchObject({
      path: "/discover",
    });
    expect(getBadgeAction("Community Builder")).toMatchObject({
      path: "/discover",
    });
    expect(getBadgeAction("Perfect Match")).toMatchObject({
      path: "/discover",
    });
  });

  it("routes property/listing badges to the properties tab", () => {
    expect(getBadgeAction("Property Mogul")).toMatchObject({
      path: "/profile",
      tab: "properties",
    });
  });

  it("falls back to the badges tab for unknown badges", () => {
    expect(getBadgeAction("Totally Unknown Badge")).toMatchObject({
      path: "/profile",
      tab: "badges",
    });
  });
});

describe("executeBadgeAction", () => {
  it("for an EARNED badge it only celebrates and does not navigate", () => {
    const navigate = vi.fn();
    const toast = vi.fn();
    executeBadgeAction("First Post", navigate, toast, true);
    expect(toast).toHaveBeenCalledTimes(1);
    expect(toast.mock.calls[0][0].title).toContain("Achievement Unlocked");
    expect(navigate).not.toHaveBeenCalled();
  });

  it("for an UNEARNED badge it toasts the hint and navigates to path?tab", () => {
    const navigate = vi.fn();
    const toast = vi.fn();
    executeBadgeAction("First Post", navigate, toast, false);
    expect(toast).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith("/profile?tab=portfolio", {
      state: undefined,
    });
  });

  it("navigates without a query string when the action has no tab", () => {
    const navigate = vi.fn();
    const toast = vi.fn();
    executeBadgeAction("Collaboration King", navigate, toast, false);
    expect(navigate).toHaveBeenCalledWith("/discover", { state: undefined });
  });
});
