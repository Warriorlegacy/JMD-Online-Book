import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card } from "@/components/ui/card";

describe("Card", () => {
  it("should render with children", () => {
    render(
      <Card>
        <p>Card Content</p>
      </Card>
    );
    expect(screen.getByText("Card Content")).toBeInTheDocument();
  });

  it("should have glass-panel and rounded classes", () => {
    render(
      <Card>
        <span>Styled</span>
      </Card>
    );
    const card = screen.getByText("Styled").parentElement;
    expect(card).toHaveClass("glass-panel");
    expect(card).toHaveClass("rounded-[28px]");
  });

  it("should merge custom className", () => {
    render(
      <Card className="custom-card-class">
        <span>Custom</span>
      </Card>
    );
    const card = screen.getByText("Custom").parentElement;
    expect(card).toHaveClass("custom-card-class");
  });

  it("should render with p-5 padding", () => {
    render(
      <Card>
        <span>Padded</span>
      </Card>
    );
    const card = screen.getByText("Padded").parentElement;
    expect(card).toHaveClass("p-5");
  });

  it("should render multiple children", () => {
    render(
      <Card>
        <h2>Title</h2>
        <p>Description</p>
        <button>Action</button>
      </Card>
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /action/i })).toBeInTheDocument();
  });
});
