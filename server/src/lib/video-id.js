const YOUTUBE_VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

export function isValidYoutubeVideoId(value) {
  return YOUTUBE_VIDEO_ID_PATTERN.test(value);
}

