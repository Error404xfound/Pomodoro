import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PomodoroTimer from "./PomodoroTimer";

const MODE_LOCK_MESSAGE =
  "Mode cannot be switched until the current timer finishes or is cancelled.";

const getTimer = () => screen.getByRole("timer");
const getStartButton = () =>
  screen.getByRole("button", { name: /start timer|start/i });
const getPauseButton = () =>
  screen.getByRole("button", { name: /pause timer|pause/i });
const getResumeButton = () =>
  screen.getByRole("button", { name: /resume timer|resume/i });
const getDeleteButton = () =>
  screen.getByRole("button", { name: /delete timer|reset timer/i });
const getDismissButton = () =>
  screen.getByRole("button", { name: /dismiss timer completion|dismiss/i });
const getCompletionResetButton = () =>
  screen.getByRole("button", { name: /restart timer|reset/i });

/**
 * Integration-style component tests for PomodoroTimer.
 *
 * Coverage goals:
 * - control-state transitions (idle/active/completed)
 * - mode lock policy
 * - completion behavior at 00:00
 * - dismiss/reset completion actions
 */
describe("PomodoroTimer", () => {
  beforeAll(() => {
    jest
      .spyOn(HTMLMediaElement.prototype, "play")
      .mockImplementation(() => Promise.resolve());
    jest.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders initial idle state with a single start control", () => {
    render(<PomodoroTimer />);

    expect(screen.getByRole("button", { name: "Focus" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(getTimer()).toHaveTextContent("25:00");
    expect(getStartButton()).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /pause timer|pause/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /delete timer|reset timer/i }),
    ).not.toBeInTheDocument();
  });

  it("allows mode switching before start", async () => {
    const user = userEvent.setup();
    render(<PomodoroTimer />);

    const focusButton = screen.getByRole("button", { name: "Focus" });
    const breakButton = screen.getByRole("button", { name: "Break" });

    await user.click(breakButton);
    expect(breakButton).toHaveAttribute("aria-pressed", "true");
    expect(getTimer()).toHaveTextContent("05:00");

    await user.click(focusButton);
    expect(focusButton).toHaveAttribute("aria-pressed", "true");
    expect(getTimer()).toHaveTextContent("25:00");
  });

  it("locks opposite mode after start and unlocks only after delete/reset", async () => {
    const user = userEvent.setup();
    render(<PomodoroTimer />);

    const breakButton = screen.getByRole("button", { name: "Break" });
    expect(breakButton).toBeEnabled();

    await user.click(getStartButton());

    expect(breakButton).toBeDisabled();
    expect(breakButton.parentElement).toHaveAttribute("title", MODE_LOCK_MESSAGE);

    await user.click(getPauseButton());
    expect(breakButton).toBeDisabled();

    await user.click(getDeleteButton());
    expect(screen.getByRole("button", { name: "Break" })).toBeEnabled();
  });

  it("pauses countdown and resumes from remaining time", async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(<PomodoroTimer />);
    await user.click(getStartButton());

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(getTimer()).toHaveTextContent("24:58");

    await user.click(getPauseButton());
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(getTimer()).toHaveTextContent("24:58");

    await user.click(getResumeButton());
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(getTimer()).toHaveTextContent("24:57");
  });

  it("delete restores default focus mode and duration", async () => {
    const user = userEvent.setup();
    render(<PomodoroTimer />);

    await user.click(screen.getByRole("button", { name: "Break" }));
    expect(getTimer()).toHaveTextContent("05:00");

    await user.click(getStartButton());
    await user.click(getDeleteButton());

    expect(getTimer()).toHaveTextContent("25:00");
    expect(screen.getByRole("button", { name: "Focus" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(getStartButton()).toBeInTheDocument();
  });

  it("stops at 00:00 on completion and shows dismiss/reset controls", async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(<PomodoroTimer />);
    await user.click(getStartButton());

    act(() => {
      jest.advanceTimersByTime(25 * 60 * 1000);
    });

    expect(getTimer()).toHaveTextContent("00:00");
    expect(getDismissButton()).toBeInTheDocument();
    expect(getCompletionResetButton()).toBeInTheDocument();
  });

  it("dismiss returns to idle duration without auto-start", async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(<PomodoroTimer />);
    await user.click(getStartButton());

    act(() => {
      jest.advanceTimersByTime(25 * 60 * 1000);
    });

    await user.click(getDismissButton());

    expect(getTimer()).toHaveTextContent("25:00");
    expect(getStartButton()).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Break" }));
    expect(getTimer()).toHaveTextContent("05:00");
  });

  it("completion reset restarts timer immediately", async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(<PomodoroTimer />);
    await user.click(getStartButton());

    act(() => {
      jest.advanceTimersByTime(25 * 60 * 1000);
    });

    await user.click(getCompletionResetButton());

    expect(getPauseButton()).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(getTimer()).not.toHaveTextContent("00:00");
  });
});
