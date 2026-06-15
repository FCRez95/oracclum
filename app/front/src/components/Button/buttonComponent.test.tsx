import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./buttonComponent";

describe("Button component", () => {
  it("renders children correctly", () => {
    render(
      <Button type="confirm" size="medium" onClickAction={() => {}}>
        Click Me
      </Button>
    );
    expect(screen.getByText("Click Me")).toBeInTheDocument();
  });

  it("calls onClickAction when clicked", () => {
    const handleClick = jest.fn();
    render(
      <Button type="confirm" size="medium" onClickAction={handleClick}>
        Click Me
      </Button>
    );
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("applies correct classes for confirm type and medium size", () => {
    render(
      <Button type="confirm" size="medium" onClickAction={() => {}}>
        Confirm
      </Button>
    );
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-bg-primary");
    expect(button).toHaveClass("text-text-on-primary");
    expect(button).toHaveClass("hover:bg-bg-primary/80");
    expect(button).toHaveClass("px-medium");
    expect(button).toHaveClass("py-small");
    expect(button).toHaveClass("text-medium");
  });

  it("applies correct classes for cancel type and large size", () => {
    render(
      <Button type="cancel" size="large" onClickAction={() => {}}>
        Cancel
      </Button>
    );
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-bg-cancel");
    expect(button).toHaveClass("text-text-on-cancel");
    expect(button).toHaveClass("hover:bg-bg-cancel-hover");
    expect(button).toHaveClass("px-large");
    expect(button).toHaveClass("py-small");
    expect(button).toHaveClass("text-large");
  });

  it("applies correct classes for small size", () => {
    render(
      <Button type="confirm" size="small" onClickAction={() => {}}>
        Small
      </Button>
    );
    const button = screen.getByRole("button");
    expect(button).toHaveClass("px-small");
    expect(button).toHaveClass("py-extra-small");
    expect(button).toHaveClass("text-content");
  });
});
