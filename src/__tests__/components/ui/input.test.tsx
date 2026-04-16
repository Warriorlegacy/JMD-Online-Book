import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@/components/ui/input";

describe("Input", () => {
  it("should render an input element", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("should have base styling", () => {
    render(<Input />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("w-full");
    expect(input).toHaveClass("rounded-2xl");
    expect(input).toHaveClass("border");
    expect(input).toHaveClass("bg-white/6");
  });

  it("should merge custom className", () => {
    render(<Input className="custom-input" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("custom-input");
  });

  it("should spread additional props", () => {
    render(
      <Input
        type="email"
        placeholder="Enter email"
        data-testid="email-input"
        aria-label="Email Address"
      />
    );
    const input = screen.getByTestId("email-input");
    expect(input).toHaveAttribute("type", "email");
    expect(input).toHaveAttribute("placeholder", "Enter email");
    expect(input).toHaveAttribute("aria-label", "Email Address");
  });

  it("should accept value prop", () => {
    render(<Input value="test value" onChange={() => {}} />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("test value");
  });

  it("should accept disabled prop", () => {
    render(<Input disabled />);
    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
  });

  it("should accept readOnly prop", () => {
    render(<Input readOnly />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("readonly");
  });

  it("should handle onChange", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Input onChange={onChange} />);
    const input = screen.getByRole("textbox");
    await user.type(input, "hello");
    expect(onChange).toHaveBeenCalledTimes(5);
  });

  it("should accept type attribute", () => {
    render(<Input type="password" />);
    const input = screen.getByDisplayValue("");
    expect(input).toHaveAttribute("type", "password");
  });

  it("should accept name attribute", () => {
    render(<Input name="username" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("name", "username");
  });
});
