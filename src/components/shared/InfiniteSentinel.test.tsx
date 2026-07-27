import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { InfiniteSentinel } from "./InfiniteSentinel";

// jsdom has no IntersectionObserver — install a controllable mock that captures
// the callback so tests can simulate the sentinel entering/leaving the viewport.
let trigger: (isIntersecting: boolean) => void;
let observeSpy: ReturnType<typeof vi.fn>;
let disconnectSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  observeSpy = vi.fn();
  disconnectSpy = vi.fn();
  class MockIO {
    constructor(private cb: (entries: { isIntersecting: boolean }[]) => void) {
      trigger = (isIntersecting: boolean) => this.cb([{ isIntersecting }]);
    }
    observe = observeSpy;
    disconnect = disconnectSpy;
    unobserve = vi.fn();
    takeRecords = vi.fn();
    root = null;
    rootMargin = "";
    thresholds = [];
  }
  vi.stubGlobal("IntersectionObserver", MockIO);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("InfiniteSentinel", () => {
  it("observes and calls onLoadMore when it scrolls into view", () => {
    const onLoadMore = vi.fn();
    render(<InfiniteSentinel onLoadMore={onLoadMore} enabled={true} />);
    expect(observeSpy).toHaveBeenCalledTimes(1);
    trigger(true);
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it("does not call onLoadMore when the sentinel is not intersecting", () => {
    const onLoadMore = vi.fn();
    render(<InfiniteSentinel onLoadMore={onLoadMore} enabled={true} />);
    trigger(false);
    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it("does not observe at all when disabled (nothing more to load / in flight)", () => {
    const onLoadMore = vi.fn();
    render(<InfiniteSentinel onLoadMore={onLoadMore} enabled={false} />);
    expect(observeSpy).not.toHaveBeenCalled();
  });
});
