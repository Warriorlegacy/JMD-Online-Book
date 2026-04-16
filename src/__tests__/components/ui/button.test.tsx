import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("should render with default primary variant", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("bg-[var(--color-gold)]");
  });

  it("should render with secondary variant", () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole("button", { name: /secondary/i });
    expect(button).toHaveClass("bg-white/6");
  });

  it("should render with ghost variant", () => {
    render(<Button variant="ghost">Ghost</Button>);
    const button = screen.getByRole("button", { name: /ghost/i });
    expect(button).toHaveClass("text-[var(--color-text-muted)]");
  });

  it("should render with danger variant", () => {
    render(<Button variant="danger">Delete</Button>);
    const button = screen.getByRole("button", { name: /delete/i });
    expect(button).toHaveClass("bg-[var(--color-danger)]");
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole("button", { name: /disabled/i });
    expect(button).toBeDisabled();
  });

  it("should have type='button' by default", () => {
    render(<Button>Submit</Button>);
    const button = screen.getByRole("button", { name: /submit/i });
    expect(button).toHaveAttribute("type", "button");
  });

  it("should accept custom type attribute", () => {
    render(<Button type="submit">Submit</Button>);
    const button = screen.getByRole("button", { name: /submit/i });
    expect(button).toHaveAttribute("type", "submit");
  });

  it("should call onClick handler", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick}>Click</Button>);
    const button = screen.getByRole("button", { name: /click/i });
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should merge custom className", () => {
    render(<Button className="custom-class">Styled</Button>);
    const button = screen.getByRole("button", { name: /styled/i });
    expect(button).toHaveClass("custom-class");
  });

  it("should spread additional props", () => {
    render(
      <Button data-testid="test-btn" aria-label="Test Button">
        Props
      </Button>
    );
    const button = screen.getByTestId("test-btn");
    expect(button).toHaveAttribute("aria-label", "Test Button");
  });
});
