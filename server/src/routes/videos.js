import { isValidYoutubeVideoId } from "../lib/video-id.js";
import { toVideoResponse } from "../serializers/videos.js";

const paramsSchema = {
  type: "object",
  required: ["youtubeVideoId"],
  properties: {
    youtubeVideoId: {
      type: "string",
    },
  },
};

const flagBodySchema = {
  type: "object",
  required: ["deviceId"],
  additionalProperties: false,
  properties: {
    deviceId: {
      type: "string",
      minLength: 1,
      maxLength: 255,
    },
  },
};

const voteBodySchema = {
  type: "object",
  required: ["deviceId", "vote"],
  additionalProperties: false,
  properties: {
    deviceId: {
      type: "string",
      minLength: 1,
      maxLength: 255,
    },
    vote: {
      type: "string",
      enum: ["up", "down"],
    },
  },
};

const videoResponseSchema = {
  type: "object",
  required: [
    "youtubeVideoId",
    "isFlaggedAi",
    "upvotes",
    "downvotes",
    "score",
    "confidenceLevel",
    "status",
  ],
  properties: {
    youtubeVideoId: {
      anyOf: [
        { type: "string" },
        { type: "null" },
      ],
    },
    isFlaggedAi: { type: "boolean" },
    upvotes: { type: "integer" },
    downvotes: { type: "integer" },
    score: { type: "integer" },
    confidenceLevel: { type: "string" },
    status: { type: "string" },
  },
};

export async function videoRoutes(fastify) {
  const { getVideoById, flagVideo, voteOnVideo } = fastify.videoService;

  fastify.get("/videos/:youtubeVideoId", {
    schema: {
      params: paramsSchema,
      response: {
        200: videoResponseSchema,
        400: {
          type: "object",
          required: ["error", "message"],
          properties: {
            error: { type: "string" },
            message: { type: "string" },
          },
        },
      },
    },
  }, async (request, reply) => {
    const { youtubeVideoId } = request.params;

    if (!isValidYoutubeVideoId(youtubeVideoId)) {
      return reply.status(400).send({
        error: "Bad Request",
        message: "Invalid YouTube video ID",
      });
    }

    const video = await getVideoById(youtubeVideoId);

    if (!video) {
      return {
        ...toVideoResponse(null),
        youtubeVideoId,
      };
    }

    return toVideoResponse(video);
  });

  fastify.post("/videos/:youtubeVideoId/flag", {
    schema: {
      params: paramsSchema,
      body: flagBodySchema,
      response: {
        200: videoResponseSchema,
        400: {
          type: "object",
          required: ["error", "message"],
          properties: {
            error: { type: "string" },
            message: { type: "string" },
          },
        },
        409: {
          type: "object",
          required: ["error", "message"],
          properties: {
            error: { type: "string" },
            message: { type: "string" },
          },
        },
      },
    },
  }, async (request, reply) => {
    const { youtubeVideoId } = request.params;

    if (!isValidYoutubeVideoId(youtubeVideoId)) {
      return reply.status(400).send({
        error: "Bad Request",
        message: "Invalid YouTube video ID",
      });
    }

    const video = await flagVideo({
      youtubeVideoId,
      deviceId: request.body.deviceId,
    });

    return toVideoResponse(video);
  });

  fastify.post("/videos/:youtubeVideoId/vote", {
    schema: {
      params: paramsSchema,
      body: voteBodySchema,
      response: {
        200: videoResponseSchema,
        400: {
          type: "object",
          required: ["error", "message"],
          properties: {
            error: { type: "string" },
            message: { type: "string" },
          },
        },
        404: {
          type: "object",
          required: ["error", "message"],
          properties: {
            error: { type: "string" },
            message: { type: "string" },
          },
        },
        409: {
          type: "object",
          required: ["error", "message"],
          properties: {
            error: { type: "string" },
            message: { type: "string" },
          },
        },
      },
    },
  }, async (request, reply) => {
    const { youtubeVideoId } = request.params;

    if (!isValidYoutubeVideoId(youtubeVideoId)) {
      return reply.status(400).send({
        error: "Bad Request",
        message: "Invalid YouTube video ID",
      });
    }

    const video = await voteOnVideo({
      youtubeVideoId,
      deviceId: request.body.deviceId,
      voteValue: request.body.vote.toUpperCase(),
    });

    return toVideoResponse(video);
  });
}
