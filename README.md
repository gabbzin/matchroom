# ⚽ Fut Evolução

A modern soccer match management system built with Next.js 16, TypeScript, and Tailwind CSS.

## Features

- **Player Management**: Add, edit, and remove players
- **Team Organization**: Shuffle and split players into Team A, Team B, and bench
- **Match System**: 
  - Pick match winners
  - Automatic team rotation (losers go to bench, bench players join the winner)
  - Continuous match flow
- **Match History**: Track all completed matches with timestamps
- **Data Persistence**: All data saved to localStorage automatically
- **Clean Architecture**: Organized with components, hooks, utils, and types

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
fut-evolucao/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Main application page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── AddPlayerForm.tsx
│   ├── PlayerList.tsx
│   ├── TeamDisplay.tsx
│   ├── CurrentMatch.tsx
│   └── MatchHistory.tsx
├── hooks/                 # Custom React hooks
│   └── useGameState.ts    # Main game state management
├── utils/                 # Utility functions
│   ├── storage.ts         # localStorage utilities
│   └── teamUtils.ts       # Team management utilities
└── types/                 # TypeScript type definitions
    └── index.ts
```

## How to Use

### 1. Setup Phase
- Add players using the form
- Edit or remove players as needed
- Set the number of players per team (default: 5)
- Click "Shuffle & Split Teams" to organize teams

### 2. Match Phase
- View the current match between Team A and Team B
- See bench players waiting to play
- Click "Team A Wins" or "Team B Wins" to record the result
- Click "Start Next Match" to begin the next game
  - Losing team goes to bench
  - Bench players form the new opposing team

### 3. History Phase
- View all completed matches
- See team compositions and winners
- Track timestamps for each match

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript 5**
- **Tailwind CSS 4**
- **localStorage** for data persistence

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## License

MIT
