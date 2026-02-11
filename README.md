# ⚽ Fut Evolução

A modern soccer match management system built with Next.js 16, TypeScript, Tailwind CSS, and Prisma.

## Features

- **Room-Based System**: Create and share rooms via URL
- **Multi-User Access**: Multiple users can view the same room simultaneously
- **Owner Permissions**: Only room owners can edit game information
- **Player Management**: Add, edit, and remove players
- **Team Organization**: Shuffle and split players into Team A, Team B, and bench
- **Match System**: 
  - Pick match winners
  - Automatic team rotation (losers go to bench, bench players join the winner)
  - Continuous match flow
- **Match History**: Track all completed matches with timestamps
- **Data Persistence**: All data saved to PostgreSQL database
- **Clean Architecture**: Organized with components, hooks, utils, and types

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (local or remote)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up your database:

Create a `.env` file in the root directory with your database connection string:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/matchroom?schema=public"
```

For development, you can use Prisma's local database:

```bash
npx prisma dev
```

Or create a free cloud database with:

```bash
npx create-db
```

3. Run Prisma migrations to create the database schema:

```bash
npx prisma migrate dev --name init
```

4. Generate the Prisma Client:

```bash
npx prisma generate
```

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
fut-evolucao/
├── app/                      # Next.js App Router pages
│   ├── page.tsx             # Home page (create/join rooms)
│   ├── rooms/[id]/          # Room page (dynamic route)
│   ├── api/                 # API routes
│   │   └── rooms/           # Room management endpoints
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── AddPlayerForm.tsx
│   ├── PlayerList.tsx
│   ├── TeamDisplay.tsx
│   ├── CurrentMatch.tsx
│   └── MatchHistory.tsx
├── hooks/                   # Custom React hooks
│   ├── useGameState.ts      # Local game state (legacy)
│   └── useRoomState.ts      # Room-based state with API
├── lib/                     # Library code
│   └── prisma.ts            # Prisma client instance
├── utils/                   # Utility functions
│   ├── storage.ts           # localStorage utilities (legacy)
│   └── teamUtils.ts         # Team management utilities
├── types/                   # TypeScript type definitions
│   ├── index.ts
│   └── api.ts               # API types
└── prisma/                  # Prisma configuration
    └── schema.prisma        # Database schema
```

## How to Use

### 1. Create a Room
- Enter a room name on the home page
- Click "Criar Sala" (Create Room)
- You'll be redirected to your new room as the owner

### 2. Share the Room
- Copy the Room ID or click "Compartilhar Sala" to copy the URL
- Share with other users who want to view the match progress
- Only you (the owner) can edit the room

### 3. Setup Phase
- Add players using the form
- Edit or remove players as needed (owner only)
- Set the number of players per team (default: 5)
- Click "Sortear e Dividir Times" to organize teams

### 4. Match Phase
- View the current match between Team A and Team B
- See bench players waiting to play
- Pick the winner (owner only)
- Start the next match (owner only)
  - Losing team goes to bench
  - Bench players form the new opposing team

### 5. History Phase
- View all completed matches
- See team compositions and winners
- Track timestamps for each match

## API Endpoints

### Create Room
```
POST /api/rooms
Body: { "name": "Room Name" }
Response: { "roomId": "...", "ownerToken": "..." }
```

### Get Room
```
GET /api/rooms/[id]
Headers: { "x-owner-token": "..." } (optional)
Response: { "room": {...}, "isOwner": boolean }
```

### Update Room
```
PUT /api/rooms/[id]
Body: { "gameState": {...}, "ownerToken": "..." }
Response: { "success": boolean }
```

## Database Schema

The application uses a single `Room` model with JSON fields for flexibility:

- `id` - Unique room identifier
- `name` - Room name
- `ownerId` - Secure owner token
- `players` - Array of players (JSON)
- `teamA` - Current Team A players (JSON)
- `teamB` - Current Team B players (JSON)
- `bench` - Bench players (JSON)
- `currentMatch` - Active match data (JSON)
- `matchHistory` - Array of completed matches (JSON)
- `createdAt` - Room creation timestamp
- `updatedAt` - Last update timestamp

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript 5**
- **Tailwind CSS 4**
- **Prisma** (ORM)
- **PostgreSQL** (Database)

## Environment Variables

Required environment variables:

- `DATABASE_URL` - PostgreSQL connection string

Example:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/matchroom?schema=public"
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Prisma Commands

- `npx prisma generate` - Generate Prisma Client
- `npx prisma migrate dev` - Create and apply migrations
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma db push` - Push schema changes without migrations
- `npx prisma db pull` - Pull schema from existing database

## License

MIT
