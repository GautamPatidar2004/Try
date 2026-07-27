import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("joins truthy class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("ignores falsy values", () => {
    expect(cn("a", false && "b", null, undefined, "c")).toBe("a c");
  });

  it("flattens arrays and objects (clsx semantics)", () => {
    expect(cn(["a", "b"])).toBe("a b");
    expect(cn({ a: true, b: false, c: true })).toBe("a c");
  });

  it("dedupes conflicting tailwind classes, last one wins (twMerge)", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });
});
