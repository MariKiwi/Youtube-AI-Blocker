import { isValidYoutubeVideoId } from "../lib/video-id.js";
import { sanitizeString, sanitizeStringArray } from "../lib/sanitize.js";
import { toUnknownVideoResponse, toVideoResponse } from "../serializers/videos.js";

const paramsSchema = {
  type: "object",
  required: ["youtubeVideoId"],
  properties: {
    youtubeVideoId: {
      type: "string",
    },
  },
};

const videoQuerySchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    deviceId: {
      type: "string",
      minLength: 1,
      maxLength: 255,
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
    "currentDeviceVote",
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
    currentDeviceVote: {
      anyOf: [
        { type: "string", enum: ["up", "down"] },
        { type: "null" },
      ],
    },
  },
};

const bulkLookupBodySchema = {
  type: "object",
  required: ["youtubeVideoIds"],
  additionalProperties: false,
  properties: {
    youtubeVideoIds: {
      type: "array",
      minItems: 1,
      maxItems: 100,
      items: {
        type: "string",
      },
    },
    deviceId: {
      type: "string",
      minLength: 1,
      maxLength: 255,
    },
  },
};

const bulkLookupResponseSchema = {
  type: "object",
  required: ["videos"],
  properties: {
    videos: {
      type: "array",
      items: videoResponseSchema,
    },
  },
};

export async function videoRoutes(fastify) {
  const {
    getVideoById,
    getVideosByIds,
    flagVideo,
    voteOnVideo,
  } = fastify.videoService;

  fastify.get("/videos/:youtubeVideoId", {
    schema: {
      params: paramsSchema,
      querystring: videoQuerySchema,
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
    const youtubeVideoId = sanitizeString(request.params.youtubeVideoId);
    const deviceId = sanitizeString(request.query.deviceId);

    if (!isValidYoutubeVideoId(youtubeVideoId)) {
      return reply.status(400).send({
        error: "Bad Request",
        message: "Invalid YouTube video ID",
      });
    }

    const video = await getVideoById(youtubeVideoId, deviceId || null);

    if (!video) {
      return toUnknownVideoResponse(youtubeVideoId);
    }

    return toVideoResponse(video);
  });

  fastify.post("/videos/bulk-lookup", {
    schema: {
      body: bulkLookupBodySchema,
      response: {
        200: bulkLookupResponseSchema,
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
    const requestedIds = sanitizeStringArray(request.body.youtubeVideoIds);
    const deviceId = sanitizeString(request.body.deviceId);
    const uniqueIds = [...new Set(requestedIds)];

    for (const youtubeVideoId of uniqueIds) {
      if (!isValidYoutubeVideoId(youtubeVideoId)) {
        return reply.status(400).send({
          error: "Bad Request",
          message: `Invalid YouTube video ID: ${youtubeVideoId}`,
        });
      }
    }

    const videos = await getVideosByIds(uniqueIds, deviceId || null);
    const videoMap = new Map(videos.map((video) => [video.youtubeVideoId, video]));

    return {
      videos: requestedIds.map((youtubeVideoId) => {
        const video = videoMap.get(youtubeVideoId);

        if (!video) {
          return toUnknownVideoResponse(youtubeVideoId);
        }

        return toVideoResponse(video);
      }),
    };
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
    const youtubeVideoId = sanitizeString(request.params.youtubeVideoId);
    const deviceId = sanitizeString(request.body.deviceId);

    if (!isValidYoutubeVideoId(youtubeVideoId)) {
      return reply.status(400).send({
        error: "Bad Request",
        message: "Invalid YouTube video ID",
      });
    }

    const video = await flagVideo({
      youtubeVideoId,
      deviceId,
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
    const youtubeVideoId = sanitizeString(request.params.youtubeVideoId);
    const deviceId = sanitizeString(request.body.deviceId);

    if (!isValidYoutubeVideoId(youtubeVideoId)) {
      return reply.status(400).send({
        error: "Bad Request",
        message: "Invalid YouTube video ID",
      });
    }

    const video = await voteOnVideo({
      youtubeVideoId,
      deviceId,
      voteValue: request.body.vote.toUpperCase(),
    });

    return toVideoResponse(video);
  });
}
