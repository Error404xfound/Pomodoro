# Pomodoro Timer (Next.js + TypeScript)

Accessible Pomodoro timer with Focus/Break modes, manual duration inputs, mode switching, and reward feedback.

## Features

- Focus and Break session modes
- Manual duration input for each mode (clamped safely to valid range)
- Start / Pause / Reset controls
- Reset disabled until timer is started
- Accessible controls (keyboard focus, labels, ARIA state)
- Optional reward sounds and animations (respects reduced-motion)
- Unit tests for timer behavior

## Tech Stack

- Next.js
- React
- TypeScript
- Jest + Testing Library
- Tailwind-style utility classes (project styles)

## Project Structure

- `app/` – app router entry/layout/pages
- `components/` – UI components (timer, controls, display, alert)
- `components/pomodoro/` – timer constants, types, utilities
- `public/` – static assets

## Main Files

- `components/PomodoroTimer.tsx`
- `components/TimerDisplay.tsx`
- `components/LengthSetting.tsx`
- `components/Controls.tsx`
- `components/pomodoro/constants.ts`
- `components/pomodoro/utils.ts`

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Testing

```bash
npm test
```

## Build

```bash
npm run build
npm run start
```

## Accessibility Notes

- Semantic controls (`button`, `fieldset`, `legend`, labeled inputs)
- Visible focus indicators
- ARIA pressed state on mode toggle
- Live status updates for assistive tech
- Reduced-motion preference respected

## License

MIT (or your preferred license).
