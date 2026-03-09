import test from "node:test";
import assert from "node:assert/strict";

import { buildApp } from "../server/src/app.js";

test("GET /health returns service status", async () => {
  const app = buildApp({
    videoService: {
      async getVideoById() {
        return null;
      },
    },
  });

  const response = await app.inject({
    method: "GET",
    url: "/health",
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), {
    status: "ok",
    service: "youtube-ai-blocker-server",
  });

  await app.close();
});

test("GET /videos/:youtubeVideoId returns unknown for missing videos", async () => {
  const app = buildApp({
    videoService: {
      async getVideoById(youtubeVideoId) {
        assert.equal(youtubeVideoId, "dQw4w9WgXcQ");
        return null;
      },
    },
  });

  const response = await app.inject({
    method: "GET",
    url: "/videos/dQw4w9WgXcQ",
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), {
    youtubeVideoId: "dQw4w9WgXcQ",
    isFlaggedAi: false,
    upvotes: 0,
    downvotes: 0,
    score: 0,
    confidenceLevel: "unknown",
    status: "unknown",
  });

  await app.close();
});

test("GET /videos/:youtubeVideoId returns mapped video data", async () => {
  const app = buildApp({
    videoService: {
      async getVideoById() {
        return {
          youtubeVideoId: "dQw4w9WgXcQ",
          status: "FLAGGED",
          upvotes: 10,
          downvotes: 2,
          score: 8,
          confidenceLevel: "MEDIUM",
        };
      },
    },
  });

  const response = await app.inject({
    method: "GET",
    url: "/videos/dQw4w9WgXcQ",
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), {
    youtubeVideoId: "dQw4w9WgXcQ",
    isFlaggedAi: true,
    upvotes: 10,
    downvotes: 2,
    score: 8,
    confidenceLevel: "medium",
    status: "flagged",
  });

  await app.close();
});

test("GET /videos/:youtubeVideoId rejects invalid YouTube IDs", async () => {
  const app = buildApp({
    videoService: {
      async getVideoById() {
        throw new Error("should not be called");
      },
    },
  });

  const response = await app.inject({
    method: "GET",
    url: "/videos/invalid-id",
  });

  assert.equal(response.statusCode, 400);
  assert.deepEqual(response.json(), {
    error: "Bad Request",
    message: "Invalid YouTube video ID",
  });

  await app.close();
});

test("POST /videos/:youtubeVideoId/flag creates or updates a flagged record", async () => {
  const app = buildApp({
    videoService: {
      async getVideoById() {
        return null;
      },
      async flagVideo({ youtubeVideoId, deviceId }) {
        assert.equal(youtubeVideoId, "dQw4w9WgXcQ");
        assert.equal(deviceId, "device-123");

        return {
          youtubeVideoId,
          status: "FLAGGED",
          upvotes: 1,
          downvotes: 0,
          score: 1,
          confidenceLevel: "LOW",
        };
      },
    },
  });

  const response = await app.inject({
    method: "POST",
    url: "/videos/dQw4w9WgXcQ/flag",
    payload: {
      deviceId: "device-123",
    },
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), {
    youtubeVideoId: "dQw4w9WgXcQ",
    isFlaggedAi: true,
    upvotes: 1,
    downvotes: 0,
    score: 1,
    confidenceLevel: "low",
    status: "flagged",
  });

  await app.close();
});

test("POST /videos/:youtubeVideoId/flag rejects invalid YouTube IDs", async () => {
  const app = buildApp({
    videoService: {
      async getVideoById() {
        return null;
      },
      async flagVideo() {
        throw new Error("should not be called");
      },
    },
  });

  const response = await app.inject({
    method: "POST",
    url: "/videos/invalid-id/flag",
    payload: {
      deviceId: "device-123",
    },
  });

  assert.equal(response.statusCode, 400);
  assert.deepEqual(response.json(), {
    error: "Bad Request",
    message: "Invalid YouTube video ID",
  });

  await app.close();
});

test("POST /videos/:youtubeVideoId/flag validates request payloads", async () => {
  const app = buildApp({
    videoService: {
      async getVideoById() {
        return null;
      },
      async flagVideo() {
        throw new Error("should not be called");
      },
    },
  });

  const response = await app.inject({
    method: "POST",
    url: "/videos/dQw4w9WgXcQ/flag",
    payload: {},
  });

  assert.equal(response.statusCode, 400);

  await app.close();
});

test("POST /videos/:youtubeVideoId/flag rejects duplicate device votes", async () => {
  const app = buildApp({
    videoService: {
      async getVideoById() {
        return null;
      },
      async flagVideo() {
        const error = new Error("This device has already voted on this video");
        error.name = "ConflictError";
        error.statusCode = 409;
        throw error;
      },
    },
  });

  const response = await app.inject({
    method: "POST",
    url: "/videos/dQw4w9WgXcQ/flag",
    payload: {
      deviceId: "device-123",
    },
  });

  assert.equal(response.statusCode, 409);
  assert.deepEqual(response.json(), {
    error: "ConflictError",
    message: "This device has already voted on this video",
  });

  await app.close();
});

test("POST /videos/:youtubeVideoId/vote records an upvote on an existing video", async () => {
  const app = buildApp({
    videoService: {
      async getVideoById() {
        return null;
      },
      async flagVideo() {
        throw new Error("should not be called");
      },
      async voteOnVideo({ youtubeVideoId, deviceId, voteValue }) {
        assert.equal(youtubeVideoId, "dQw4w9WgXcQ");
        assert.equal(deviceId, "device-456");
        assert.equal(voteValue, "UP");

        return {
          youtubeVideoId,
          status: "FLAGGED",
          upvotes: 2,
          downvotes: 0,
          score: 2,
          confidenceLevel: "LOW",
        };
      },
    },
  });

  const response = await app.inject({
    method: "POST",
    url: "/videos/dQw4w9WgXcQ/vote",
    payload: {
      deviceId: "device-456",
      vote: "up",
    },
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), {
    youtubeVideoId: "dQw4w9WgXcQ",
    isFlaggedAi: true,
    upvotes: 2,
    downvotes: 0,
    score: 2,
    confidenceLevel: "low",
    status: "flagged",
  });

  await app.close();
});

test("POST /videos/:youtubeVideoId/vote records a downvote on an existing video", async () => {
  const app = buildApp({
    videoService: {
      async getVideoById() {
        return null;
      },
      async flagVideo() {
        throw new Error("should not be called");
      },
      async voteOnVideo() {
        return {
          youtubeVideoId: "dQw4w9WgXcQ",
          status: "DISPUTED",
          upvotes: 1,
          downvotes: 1,
          score: 0,
          confidenceLevel: "DISPUTED",
        };
      },
    },
  });

  const response = await app.inject({
    method: "POST",
    url: "/videos/dQw4w9WgXcQ/vote",
    payload: {
      deviceId: "device-456",
      vote: "down",
    },
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), {
    youtubeVideoId: "dQw4w9WgXcQ",
    isFlaggedAi: false,
    upvotes: 1,
    downvotes: 1,
    score: 0,
    confidenceLevel: "disputed",
    status: "disputed",
  });

  await app.close();
});

test("POST /videos/:youtubeVideoId/vote rejects invalid YouTube IDs", async () => {
  const app = buildApp({
    videoService: {
      async getVideoById() {
        return null;
      },
      async flagVideo() {
        throw new Error("should not be called");
      },
      async voteOnVideo() {
        throw new Error("should not be called");
      },
    },
  });

  const response = await app.inject({
    method: "POST",
    url: "/videos/invalid-id/vote",
    payload: {
      deviceId: "device-456",
      vote: "up",
    },
  });

  assert.equal(response.statusCode, 400);
  assert.deepEqual(response.json(), {
    error: "Bad Request",
    message: "Invalid YouTube video ID",
  });

  await app.close();
});

test("POST /videos/:youtubeVideoId/vote validates request payloads", async () => {
  const app = buildApp({
    videoService: {
      async getVideoById() {
        return null;
      },
      async flagVideo() {
        throw new Error("should not be called");
      },
      async voteOnVideo() {
        throw new Error("should not be called");
      },
    },
  });

  const response = await app.inject({
    method: "POST",
    url: "/videos/dQw4w9WgXcQ/vote",
    payload: {
      deviceId: "device-456",
    },
  });

  assert.equal(response.statusCode, 400);

  await app.close();
});

test("POST /videos/:youtubeVideoId/vote rejects unknown videos", async () => {
  const app = buildApp({
    videoService: {
      async getVideoById() {
        return null;
      },
      async flagVideo() {
        throw new Error("should not be called");
      },
      async voteOnVideo() {
        const error = new Error("Video has not been flagged yet");
        error.name = "NotFoundError";
        error.statusCode = 404;
        throw error;
      },
    },
  });

  const response = await app.inject({
    method: "POST",
    url: "/videos/dQw4w9WgXcQ/vote",
    payload: {
      deviceId: "device-456",
      vote: "up",
    },
  });

  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.json(), {
    error: "NotFoundError",
    message: "Video has not been flagged yet",
  });

  await app.close();
});

test("POST /videos/:youtubeVideoId/vote rejects repeated identical votes", async () => {
  const app = buildApp({
    videoService: {
      async getVideoById() {
        return null;
      },
      async flagVideo() {
        throw new Error("should not be called");
      },
      async voteOnVideo() {
        const error = new Error("This device has already cast this vote for the video");
        error.name = "ConflictError";
        error.statusCode = 409;
        throw error;
      },
    },
  });

  const response = await app.inject({
    method: "POST",
    url: "/videos/dQw4w9WgXcQ/vote",
    payload: {
      deviceId: "device-456",
      vote: "down",
    },
  });

  assert.equal(response.statusCode, 409);
  assert.deepEqual(response.json(), {
    error: "ConflictError",
    message: "This device has already cast this vote for the video",
  });

  await app.close();
});
