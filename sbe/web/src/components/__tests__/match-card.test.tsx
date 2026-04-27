import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MatchCard } from "../match-card";

describe("MatchCard", () => {
  const mockMatch = {
    id: "match-1",
    teamA: "Real Madrid",
    teamB: "Barcelona",
    startTime: "2024-05-20T20:00:00Z",
    status: "scheduled" as const,
    sportType: "football",
    league: "La Liga",
  };

  it("renders correctly with essential props", () => {
    render(<MatchCard match={mockMatch} />);

    // Team names should be rendered
    expect(screen.getByText("Real Madrid")).toBeInTheDocument();
    expect(screen.getByText("Barcelona")).toBeInTheDocument();

    // League/Sport should be rendered
    expect(screen.getByText("La Liga")).toBeInTheDocument();
  });

  it("displays team initials correctly", () => {
    render(<MatchCard match={mockMatch} />);

    // Check for "RE" and "BA" (first two letters uppercase)
    expect(screen.getByText("RE")).toBeInTheDocument();
    expect(screen.getByText("BA")).toBeInTheDocument();
  });

  it("handles live match status", () => {
    render(
      <MatchCard
        match={{
          ...mockMatch,
          status: "in_play",
          score: { teamA: "2", teamB: "1" }
        }}
      />
    );

    // Should show "Live" badge
    expect(screen.getByText("Live")).toBeInTheDocument();

    // Should show scores
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("handles missing odds with default values", () => {
    render(<MatchCard match={mockMatch} />);

    // Shows default odds when odds array is empty/undefined
    expect(screen.getByText("2.10")).toBeInTheDocument();
    expect(screen.getByText("2.14")).toBeInTheDocument();
  });

  it("displays provided odds correctly", () => {
    render(
      <MatchCard
        match={{
          ...mockMatch,
          odds: [{ selection: "Real Madrid", back: 1.85, lay: 1.87 }]
        }}
      />
    );

    expect(screen.getByText("1.85")).toBeInTheDocument();
    expect(screen.getByText("1.87")).toBeInTheDocument();
  });

  it("displays default initials if team names are empty", () => {
    render(
      <MatchCard
        match={{
          ...mockMatch,
          teamA: "",
          teamB: ""
        }}
      />
    );

    expect(screen.getAllByText("T1")).toHaveLength(1); // One for initial, one for text
    expect(screen.getAllByText("T2")).toHaveLength(1);
  });
});
