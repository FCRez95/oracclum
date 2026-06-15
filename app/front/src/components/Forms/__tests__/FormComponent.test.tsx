import React from "react";
import { render, screen } from "@testing-library/react";
import FormComponent from "../FormComponent";

describe("FormComponent", () => {
  it("renders children correctly", () => {
    render(
      <FormComponent type="default">
        <div>Test Child</div>
      </FormComponent>
    );
    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });

  it("renders a form with role=form", () => {
    render(<FormComponent type="default" />);
    expect(screen.getByRole("form")).toBeInTheDocument();
  });

  it("does not throw if no props other than type are provided", () => {
    expect(() => render(<FormComponent type="default" />)).not.toThrow();
  });
});
