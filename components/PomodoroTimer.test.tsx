import { act, fireEvent, render, screen } from "@testing-library/react";
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

    expect(
      screen.getByRole("spinbutton", { name: "Focus minutes" }),
    ).toHaveValue(26);
    expect(screen.getByRole("timer")).toHaveTextContent("26:00");

    await user.click(screen.getByRole("button", { name: "Break" }));
    await user.click(
      screen.getByRole("button", { name: "Increase break duration" }),
    );

    expect(
      screen.getByRole("spinbutton", { name: "Break minutes" }),
    ).toHaveValue(6);
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

  it("shows delete control only after timer starts", async () => {
    const user = userEvent.setup();
    render(<PomodoroTimer />);

    expect(
      screen.queryByRole("button", { name: "Delete timer" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Start timer" }));

    expect(
      screen.getByRole("button", { name: "Pause timer" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Delete timer" }),
    ).toBeInTheDocument();
  });

  it("exposes labeled, keyboard-operable controls", async () => {
    const user = userEvent.setup();
    render(<PomodoroTimer />);

    const startButton = screen.getByRole("button", { name: "Start timer" });
    const breakButton = screen.getByRole("button", { name: "Break" });

    expect(startButton).toBeEnabled();
    expect(
      screen.queryByRole("button", { name: "Delete timer" }),
    ).not.toBeInTheDocument();
    expect(breakButton).toBeEnabled();

    breakButton.focus();
    await user.keyboard("{Enter}");

    expect(screen.getByRole("timer")).toHaveTextContent("05:00");
  });

  it("locks the opposite mode after start and unlocks only after cancel/reset", async () => {
    const user = userEvent.setup();
    render(<PomodoroTimer />);

    const breakButton = screen.getByRole("button", { name: "Break" });
    expect(breakButton).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Start timer" }));

    expect(breakButton).toBeDisabled();
    expect(breakButton.closest("div")).toHaveAttribute(
      "title",
      "Mode cannot be switched until the current timer finishes or is cancelled.",
    );

    await user.click(screen.getByRole("button", { name: "Pause timer" }));
    expect(breakButton).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Delete timer" }));
    expect(screen.getByRole("button", { name: "Break" })).toBeEnabled();
  });

  it("stops at 00:00 on completion and resets only after acknowledgement", async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<PomodoroTimer />);

    await user.click(screen.getByRole("button", { name: "Start timer" }));

    act(() => {
      jest.advanceTimersByTime(25 * 60 * 1000);
    });

    expect(screen.getByRole("timer")).toHaveTextContent("00:00");
    expect(
      screen.getByRole("button", { name: "Dismiss timer completion" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Restart timer" }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Dismiss timer completion" }),
    );

    expect(screen.getByRole("timer")).toHaveTextContent("25:00");
    expect(screen.getByRole("button", { name: "Start timer" })).toBeEnabled();

    jest.useRealTimers();
  });
});
