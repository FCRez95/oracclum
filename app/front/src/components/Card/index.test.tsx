import React from "react";
import { render, screen } from "@testing-library/react";
import { Card } from "@/components/Card";

describe("Card Component", () => {
  it("should render with default border and medium padding correctly", () => {
    render(
      <Card borderType="default" paddingType="medium">
        <p>Default Card Content</p>
      </Card>
    );

    const cardElement = screen.getByText("Default Card Content").closest("div");
    expect(cardElement).toBeInTheDocument();

    expect(cardElement).toHaveClass("bg-bg-card");
    expect(cardElement).toHaveClass("rounded-large");
    expect(cardElement).toHaveClass("p-medium");
    expect(cardElement).toHaveClass("w-fit");
    expect(cardElement).toHaveClass("border-3");
    expect(cardElement).toHaveClass("border-border-default");

    expect(screen.getByText("Default Card Content")).toBeInTheDocument();
  });

  it("should render with success border", () => {
    render(
      <Card borderType="success" paddingType="default">
        <p>Success Card</p>
      </Card>
    );
    const cardElement = screen.getByText("Success Card").closest("div");

    expect(cardElement).toBeInTheDocument();
    expect(cardElement).toHaveClass("border-border-highlight");
    expect(cardElement).not.toHaveClass("border-border-default");
  });

  it("should render with error border", () => {
    render(
      <Card borderType="error" paddingType="default">
        <p>Error Card</p>
      </Card>
    );
    const cardElement = screen.getByText("Error Card").closest("div");

    expect(cardElement).toBeInTheDocument();
    expect(cardElement).toHaveClass("border-border-error");
    expect(cardElement).not.toHaveClass("border-border-default");
  });

  it("should render with muted border", () => {
    render(
      <Card borderType="muted" paddingType="default">
        <p>Muted Card</p>
      </Card>
    );
    const cardElement = screen.getByText("Muted Card").closest("div");

    expect(cardElement).toBeInTheDocument();
    expect(cardElement).toHaveClass("border-border-muted");
    expect(cardElement).not.toHaveClass("border-border-default");
  });

  it("should render complex children correctly", () => {
    render(
      <Card borderType="default" paddingType="default">
        <div>
          <h1>Title</h1>
          <button>Click Me</button>
        </div>
      </Card>
    );

    expect(screen.getByRole("heading", { name: /title/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /click me/i })
    ).toBeInTheDocument();
  });

  it("should not apply unexpected classes", () => {
    render(
      <Card borderType="default" paddingType="default">
        <p>Content</p>
      </Card>
    );
    const cardElement = screen.getByText("Content").closest("div");

    expect(cardElement).not.toHaveClass("some-other-class");
    expect(cardElement).not.toHaveClass("border-border-error");
  });
});
