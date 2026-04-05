import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/badge";

describe("Badge", () => {
  it("should render with neutral tone by default", () => {
    render(<Badge>Neutral</Badge>);
    const badge = screen.getByText("Neutral");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-white/8");
  });

  it("should render with success tone", () => {
    render(<Badge tone="success">Success</Badge>);
    const badge = screen.getByText("Success");
    expect(badge).toHaveClass("bg-emerald-500/15");
    expect(badge).toHaveClass("text-emerald-300");
  });

  it("should render with warning tone", () => {
    render(<Badge tone="warning">Warning</Badge>);
    const badge = screen.getByText("Warning");
    expect(badge).toHaveClass("bg-amber-500/15");
    expect(badge).toHaveClass("text-amber-300");
  });

  it("should render with danger tone", () => {
    render(<Badge tone="danger">Danger</Badge>);
    const badge = screen.getByText("Danger");
    expect(badge).toHaveClass("bg-rose-500/15");
    expect(badge).toHaveClass("text-rose-300");
  });

  it("should render children correctly", () => {
    render(<Badge>Custom Content</Badge>);
    expect(screen.getByText("Custom Content")).toBeInTheDocument();
  });

  it("should render JSX children", () => {
    render(
      <Badge>
        <span data-testid="inner">Inner Span</span>
      </Badge>
    );
    expect(screen.getByTestId("inner")).toBeInTheDocument();
  });

  it("should have rounded-full styling", () => {
    render(<Badge>Pill</Badge>);
    const badge = screen.getByText("Pill");
    expect(badge).toHaveClass("rounded-full");
  });

  it("should have correct text sizing", () => {
    render(<Badge>Text Size</Badge>);
    const badge = screen.getByText("Text Size");
    expect(badge).toHaveClass("text-xs");
  });
});
