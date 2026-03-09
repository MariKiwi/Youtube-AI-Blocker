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
    };
  }

  return {
    youtubeVideoId: video.youtubeVideoId,
    isFlaggedAi: video.status === "FLAGGED",
    upvotes: video.upvotes,
    downvotes: video.downvotes,
    score: video.score,
    confidenceLevel: video.confidenceLevel.toLowerCase(),
    status: video.status.toLowerCase(),
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
  };
}
