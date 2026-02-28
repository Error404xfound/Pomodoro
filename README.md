This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

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
