-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "players" JSONB NOT NULL DEFAULT '[]',
    "teamA" JSONB NOT NULL DEFAULT '[]',
    "teamB" JSONB NOT NULL DEFAULT '[]',
    "bench" JSONB NOT NULL DEFAULT '[]',
    "currentMatch" JSONB,
    "matchHistory" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Room_ownerId_idx" ON "Room"("ownerId");
