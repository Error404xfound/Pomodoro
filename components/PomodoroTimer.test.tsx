import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PomodoroTimer from "./PomodoroTimer";

/**
 * Integration-style tests validating core user interactions.
 */
describe("PomodoroTimer", () => {
  it("switches between Focus and Break modes", async () => {
    const user = userEvent.setup();
    render(<PomodoroTimer />);

    const focusButton = screen.getByRole("button", { name: "Focus" });
    const breakButton = screen.getByRole("button", { name: "Break" });

    expect(focusButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("timer")).toHaveTextContent("25:00");

    await user.click(breakButton);

    expect(breakButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("timer")).toHaveTextContent("05:00");
  });

  it("uses selected duration values for each mode", async () => {
    const user = userEvent.setup();
    render(<PomodoroTimer />);

    await user.click(
      screen.getByRole("button", { name: "Increase focus duration" }),
    );

    expect(screen.getByLabelText("Focus Duration duration")).toHaveTextContent(
      "26",
    );
    expect(screen.getByRole("timer")).toHaveTextContent("26:00");

    await user.click(screen.getByRole("button", { name: "Break" }));
    await user.click(
      screen.getByRole("button", { name: "Increase break duration" }),
    );

    expect(screen.getByLabelText("Break Duration duration")).toHaveTextContent(
      "6",
    );
    expect(screen.getByRole("timer")).toHaveTextContent("06:00");
  });

  it("supports manual duration input for focus and break", async () => {
    const user = userEvent.setup();
    render(<PomodoroTimer />);

    const focusInput = screen.getByRole("spinbutton", {
      name: "Focus minutes",
    });
    fireEvent.change(focusInput, { target: { value: "30" } });

    expect(screen.getByRole("timer")).toHaveTextContent("30:00");

    await user.click(screen.getByRole("button", { name: "Break" }));

    const breakInput = screen.getByRole("spinbutton", {
      name: "Break minutes",
    });
    fireEvent.change(breakInput, { target: { value: "8" } });

    expect(screen.getByRole("timer")).toHaveTextContent("08:00");
  });

  it("disables reset until timer starts", async () => {
    const user = userEvent.setup();
    render(<PomodoroTimer />);

    const resetButton = screen.getByRole("button", { name: "Reset timer" });
    expect(resetButton).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Start timer" }));

    expect(
      screen.getByRole("button", { name: "Pause timer" }),
    ).toBeInTheDocument();
    expect(resetButton).toBeEnabled();
  });

  it("exposes labeled, keyboard-operable controls", async () => {
    const user = userEvent.setup();
    render(<PomodoroTimer />);

    const startButton = screen.getByRole("button", { name: "Start timer" });
    const resetButton = screen.getByRole("button", { name: "Reset timer" });
    const breakButton = screen.getByRole("button", { name: "Break" });

    expect(startButton).toBeEnabled();
    expect(resetButton).toBeDisabled();
    expect(breakButton).toBeEnabled();

    breakButton.focus();
    await user.keyboard("{Enter}");

    expect(screen.getByRole("timer")).toHaveTextContent("05:00");
  });
});
