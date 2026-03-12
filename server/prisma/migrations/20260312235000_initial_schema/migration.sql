-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('FLAGGED', 'DISPUTED', 'UNFLAGGED');

-- CreateEnum
CREATE TYPE "ConfidenceLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'DISPUTED', 'UNFLAGGED');

-- CreateEnum
CREATE TYPE "VoteValue" AS ENUM ('UP', 'DOWN');

-- CreateTable
CREATE TABLE "videos" (
    "youtubeVideoId" TEXT NOT NULL,
    "status" "VideoStatus" NOT NULL,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER NOT NULL DEFAULT 0,
    "confidenceLevel" "ConfidenceLevel" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "videos_pkey" PRIMARY KEY ("youtubeVideoId")
);

-- CreateTable
CREATE TABLE "votes" (
    "id" TEXT NOT NULL,
    "youtubeVideoId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "value" "VoteValue" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "votes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "votes_youtubeVideoId_deviceId_key" ON "votes"("youtubeVideoId", "deviceId");

-- CreateIndex
CREATE INDEX "votes_youtubeVideoId_idx" ON "votes"("youtubeVideoId");

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_youtubeVideoId_fkey" FOREIGN KEY ("youtubeVideoId") REFERENCES "videos"("youtubeVideoId") ON DELETE CASCADE ON UPDATE CASCADE;
