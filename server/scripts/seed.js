import { PrismaClient } from "@prisma/client";

import { calculateVideoState } from "../src/lib/confidence.js";

const prisma = new PrismaClient();

async function main() {
  const samples = [
    {
      youtubeVideoId: "dQw4w9WgXcQ",
      upvotes: 12,
      downvotes: 2,
    },
    {
      youtubeVideoId: "aaaaaaaaaaa",
      upvotes: 1,
      downvotes: 4,
    },
    {
      youtubeVideoId: "bbbbbbbbbbb",
      upvotes: 2,
      downvotes: 9,
    },
  ];

  for (const sample of samples) {
    const state = calculateVideoState(sample);

    await prisma.video.upsert({
      where: {
        youtubeVideoId: sample.youtubeVideoId,
      },
      update: {
        upvotes: sample.upvotes,
        downvotes: sample.downvotes,
        score: state.score,
        confidenceLevel: state.confidenceLevel,
        status: state.status,
      },
      create: {
        youtubeVideoId: sample.youtubeVideoId,
        upvotes: sample.upvotes,
        downvotes: sample.downvotes,
        score: state.score,
        confidenceLevel: state.confidenceLevel,
        status: state.status,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

