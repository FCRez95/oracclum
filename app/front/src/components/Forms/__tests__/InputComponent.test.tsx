import { render, screen } from "@testing-library/react";
import InputComponent from "../InputComponent";
import "@testing-library/jest-dom";

describe("InputComponent", () => {
  it("should render an input element", () => {
    render(<InputComponent classType="default" />);
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
  });

  it("should apply type, name, placeholder, and required props", () => {
    render(
      <InputComponent
        type="email"
        name="userEmail"
        placeholder="Enter your email"
        classType="default"
        required
      />
    );
    const input = screen.getByPlaceholderText("Enter your email");

    expect(input).toHaveAttribute("type", "email");
    expect(input).toHaveAttribute("name", "userEmail");
    expect(input).toBeRequired();
  });

  it("should default to type text and not required", () => {
    render(<InputComponent classType="default" />);
    const input = screen.getByRole("textbox");

    expect(input).toHaveAttribute("type", "text");
    expect(input).not.toBeRequired();
  });
});
