function toCurrentDeviceVote(value) {
  if (value === "UP") {
    return "up";
  }

  if (value === "DOWN") {
    return "down";
  }

  return null;
}

export function toVideoResponse(video) {
  if (!video) {
    return {
      youtubeVideoId: null,
      isFlaggedAi: false,
      upvotes: 0,
      downvotes: 0,
      score: 0,
      confidenceLevel: "unknown",
      status: "unknown",
      currentDeviceVote: null,
    };
  }

  const currentDeviceVote = toCurrentDeviceVote(
    video.currentDeviceVote ?? video.votes?.[0]?.value ?? null,
  );

  return {
    youtubeVideoId: video.youtubeVideoId,
    isFlaggedAi: video.status === "FLAGGED",
    upvotes: video.upvotes,
    downvotes: video.downvotes,
    score: video.score,
    confidenceLevel: video.confidenceLevel.toLowerCase(),
    status: video.status.toLowerCase(),
    currentDeviceVote,
  };
}

export function toUnknownVideoResponse(youtubeVideoId) {
  return {
    youtubeVideoId,
    isFlaggedAi: false,
    upvotes: 0,
    downvotes: 0,
    score: 0,
    confidenceLevel: "unknown",
    status: "unknown",
    currentDeviceVote: null,
  };
}
