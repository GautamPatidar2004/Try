import { describe, it, expect } from "vitest";
import { renderWithProviders, screen } from "@/test/test-utils";
import MatchBadge from "./MatchBadge";

describe("MatchBadge", () => {
  it("renders the score as '<n>% Match' (the label is only used for color)", () => {
    renderWithProviders(<MatchBadge score={92} />);
    expect(screen.getByText("92% Match")).toBeInTheDocument();
  });

  it("applies the color tier matching the score threshold", () => {
    const { container, unmount } = renderWithProviders(
      <MatchBadge score={95} />,
    );
    expect(container.querySelector(".from-green-500")).toBeTruthy(); // >= 80
    unmount();

    const good = renderWithProviders(<MatchBadge score={72} />);
    expect(good.container.querySelector(".from-blue-500")).toBeTruthy(); // 70–79
    good.unmount();

    const fair = renderWithProviders(<MatchBadge score={65} />);
    expect(fair.container.querySelector(".from-yellow-500")).toBeTruthy(); // 60–69
    fair.unmount();

    const low = renderWithProviders(<MatchBadge score={40} />);
    expect(low.container.querySelector(".from-gray-400")).toBeTruthy(); // < 60
  });

  it("shows the icon by default and hides it when showIcon is false", () => {
    const withIcon = renderWithProviders(<MatchBadge score={80} />);
    expect(withIcon.container.querySelector("svg")).toBeTruthy();
    withIcon.unmount();

    const without = renderWithProviders(
      <MatchBadge score={80} showIcon={false} />,
    );
    expect(without.container.querySelector("svg")).toBeNull();
  });
});
