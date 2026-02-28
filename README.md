# Pomodoro Timer (Next.js + TypeScript)

Accessible Pomodoro timer with Focus/Break modes, manual duration controls, completion workflow, alerting, and reward feedback.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [State Lifecycle](#state-lifecycle)
- [Core User Flows](#core-user-flows)
- [Project Structure](#project-structure)
- [Component Reference](#component-reference)
- [Utilities and Types](#utilities-and-types)
- [Styling and Animation](#styling-and-animation)
- [Testing Strategy](#testing-strategy)
- [Repository Hygiene](#repository-hygiene)
- [Accessibility](#accessibility)
- [Local Development](#local-development)
- [Build and Run](#build-and-run)

## Overview

The timer supports two modes:

- **Focus**
- **Break**

The app includes:

- Duration editing with min/max clamps
- Single-button idle controls and contextual active/completion controls
- Mode locking after start (until completion/cancel)
- Completion alarm loop (`/AlarmSound.mp3`) until dismiss/reset
- Progress border animation around timer display
- Optional reward sounds/animations
- Jest + Testing Library coverage for behavior

## Architecture

Primary orchestration lives in `components/PomodoroTimer.tsx`.  
Presentation is split into reusable components:

- `components/TimerDisplay.tsx` for time/mode rendering and progress ring
- `components/Controls.tsx` for control-state-specific actions
- `components/LengthSetting.tsx` for duration input and stepper controls
- `components/Alert.tsx` for dismissible system notifications

Shared domain logic is in `components/pomodoro/*`:

- `constants.ts` for defaults and limits
- `types.ts` for mode/reward types
- `utils.ts` for clamping, labels, duration lookup, and progress helpers

## State Lifecycle

The timer uses four conceptual phases:

- **idle**: no active session has started yet
- **running**: countdown is active
- **paused**: session started but countdown paused
- **completed**: countdown reached `00:00` and is awaiting user action

Mode switching is locked during `running` and `paused`, and unlocked in `idle` and `completed`.

## Core User Flows

1. **Idle**
   - User sees one large Start button.
   - User can switch modes and edit durations.

2. **Running / Paused**
   - Controls split into Pause/Resume and Delete.
   - Opposite mode is disabled and tooltip explains lock rule.

3. **Completion**
   - Timer stops at `00:00`.
   - Alarm sound loops until Dismiss or Reset.
   - Controls become Dismiss (left) and Reset (right).
   - Dismiss restores configured duration without auto-start.
   - Reset restarts current mode immediately.

## Project Structure

- `app/` — App Router files (`layout.tsx`, `page.tsx`, global styles)
- `components/` — UI components and timer orchestration
- `components/pomodoro/` — constants/types/utilities
- `public/` — static assets (`AlarmSound.mp3` expected)
- Root config — ESLint, Jest, TS, Next.js, PostCSS

## Component Reference

### `PomodoroTimer`
State orchestration, timer ticking lifecycle, mode lock policy, completion acknowledgment, alarm lifecycle, and accessibility status messages.

### `Controls`
Renders control variants by state:
- idle → Start
- active/paused → Pause/Resume + Delete
- completed → Dismiss + Reset

### `TimerDisplay`
Renders:
- current mode label
- `mm:ss` timer
- clockwise conic-border progress based on elapsed percentage

### `LengthSetting`
Reusable duration editor for Focus/Break with:
- decrement / increment buttons
- bounded numeric input
- labels and range hint

### `Alert`
Dismissible top banner for timer status/completion messages.

## Utilities and Types

- `clampLength(value)` — enforces min/max minute bounds
- `getDurationByMode(mode, focus, break)` — resolves active duration in minutes
- `getModeLabel(mode)` — user-facing mode string
- `getSessionProgress(current, total, hasStarted)` — normalized progress in `[0, 1]`
- `TimerMode` — `"focus" | "break"`
- `RewardType` — `"start" | "complete"`

## Styling and Animation

Global styles (`app/globals.css`) include:

- app theme tokens
- timer progress ring styles
- reward glow/confetti keyframes
- reduced-motion fallback disabling animation

## Testing Strategy

`components/PomodoroTimer.test.tsx` validates:

- idle, running, completion control states
- mode lock behavior
- completion at `00:00`
- dismiss/reset post-completion flows
- timer progression with fake timers

## Repository Hygiene

- Build artifacts in `.next/` are generated and should not be edited directly.
- Keep source edits in `app/`, `components/`, and `components/pomodoro/`.
- Ensure `.next/` remains ignored in `.gitignore` to avoid noisy commits.

## Accessibility

- Labeled buttons and inputs
- ARIA pressed state on mode switch
- `role="timer"` for time output
- visible focus rings
- status messaging for non-visual feedback
- reduced motion support

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build and Run

```bash
npm run build
npm run start
```

## Test and Lint

```bash
npm test
npm run lint
```
