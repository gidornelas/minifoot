import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "../App";

describe("App", () => {
  it("renders the Sprint 0 shell", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "minifoot." })).toBeInTheDocument();
    expect(screen.getByText("TypeScript strict configurado")).toBeInTheDocument();
  });
});
