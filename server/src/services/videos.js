import { prisma } from "../db.js";
import { ConflictError, NotFoundError } from "../errors.js";
import { calculateVideoState } from "../lib/confidence.js";

export async function getVideoById(youtubeVideoId) {
  return prisma.video.findUnique({
    where: {
      youtubeVideoId,
    },
  });
}

export async function flagVideo({ youtubeVideoId, deviceId }) {
  return prisma.$transaction(async (tx) => {
    const existingVote = await tx.vote.findUnique({
      where: {
        youtubeVideoId_deviceId: {
          youtubeVideoId,
          deviceId,
        },
      },
    });

    if (existingVote) {
      throw new ConflictError("This device has already voted on this video");
    }

    const existingVideo = await tx.video.findUnique({
      where: {
        youtubeVideoId,
      },
    });

    const nextUpvotes = (existingVideo?.upvotes ?? 0) + 1;
    const nextDownvotes = existingVideo?.downvotes ?? 0;
    const nextState = calculateVideoState({
      upvotes: nextUpvotes,
      downvotes: nextDownvotes,
    });

    const video = existingVideo
      ? await tx.video.update({
        where: {
          youtubeVideoId,
        },
        data: {
          upvotes: nextUpvotes,
          downvotes: nextDownvotes,
          score: nextState.score,
          confidenceLevel: nextState.confidenceLevel,
          status: nextState.status,
        },
      })
      : await tx.video.create({
        data: {
          youtubeVideoId,
          upvotes: nextUpvotes,
          downvotes: nextDownvotes,
          score: nextState.score,
          confidenceLevel: nextState.confidenceLevel,
          status: nextState.status,
        },
      });

    await tx.vote.create({
      data: {
        youtubeVideoId,
        deviceId,
        value: "UP",
      },
    });

    return video;
  });
}

export async function voteOnVideo({ youtubeVideoId, deviceId, voteValue }) {
  return prisma.$transaction(async (tx) => {
    const existingVideo = await tx.video.findUnique({
      where: {
        youtubeVideoId,
      },
    });

    if (!existingVideo) {
      throw new NotFoundError("Video has not been flagged yet");
    }

    const existingVote = await tx.vote.findUnique({
      where: {
        youtubeVideoId_deviceId: {
          youtubeVideoId,
          deviceId,
        },
      },
    });

    if (existingVote?.value === voteValue) {
      throw new ConflictError("This device has already cast this vote for the video");
    }

    let nextUpvotes = existingVideo.upvotes;
    let nextDownvotes = existingVideo.downvotes;

    if (existingVote) {
      if (existingVote.value === "UP") {
        nextUpvotes -= 1;
      } else {
        nextDownvotes -= 1;
      }
    }

    if (voteValue === "UP") {
      nextUpvotes += 1;
    } else {
      nextDownvotes += 1;
    }

    const nextState = calculateVideoState({
      upvotes: nextUpvotes,
      downvotes: nextDownvotes,
    });

    const video = await tx.video.update({
      where: {
        youtubeVideoId,
      },
      data: {
        upvotes: nextUpvotes,
        downvotes: nextDownvotes,
        score: nextState.score,
        confidenceLevel: nextState.confidenceLevel,
        status: nextState.status,
      },
    });

    if (existingVote) {
      await tx.vote.update({
        where: {
          youtubeVideoId_deviceId: {
            youtubeVideoId,
            deviceId,
          },
        },
        data: {
          value: voteValue,
        },
      });
    } else {
      await tx.vote.create({
        data: {
          youtubeVideoId,
          deviceId,
          value: voteValue,
        },
      });
    }

    return video;
  });
}

export function buildVideoService(overrides = {}) {
  return {
    getVideoById,
    flagVideo,
    voteOnVideo,
    ...overrides,
  };
}
