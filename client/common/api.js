(function bootstrapApi(global) {
  function validateHttpUrl(value) {
    if (typeof value !== "string" || !value.trim()) {
      throw new Error("Invalid API base URL");
    }

    let url;

    try {
      url = new URL(value);
    } catch {
      throw new Error("Invalid API base URL");
    }

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("Invalid API base URL");
    }

    return url.toString();
  }

  async function extensionFetch(url, options) {
    if (!global.chrome?.runtime?.sendMessage) {
      const response = await fetch(url, options);
      return {
        ok: response.ok,
        status: response.status,
        data: await response.json(),
      };
    }

    const result = await global.chrome.runtime.sendMessage({
      type: "YAIB_FETCH",
      url,
      options,
    });

    if (!result) {
      throw new Error("No response from extension background");
    }

    if (result.error) {
      throw new Error(result.error);
    }

    return result;
  }

  function trimTrailingSlash(url) {
    return url.endsWith("/") ? url.slice(0, -1) : url;
  }

  function buildQueryString(params) {
    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === "") {
        continue;
      }

      searchParams.set(key, value);
    }

    const query = searchParams.toString();
    return query ? `?${query}` : "";
  }

  function createApiClient(settings) {
    const baseUrl = trimTrailingSlash(validateHttpUrl(settings.apiBaseUrl));

    async function request(path, options = {}, retryCount = 0) {
      try {
        const response = await extensionFetch(`${baseUrl}${path}`, {
          ...options,
          headers: {
            "Content-Type": "application/json",
            ...(options.headers ?? {}),
          },
        });

        if (!response.ok) {
          throw new Error(response.data?.message ?? `API request failed with status ${response.status}`);
        }

        return response.data;
      } catch (error) {
        if (retryCount < 1 && (!options.method || options.method === "GET")) {
          return request(path, options, retryCount + 1);
        }

        throw error;
      }
    }

    return {
      async getHealth() {
        return request("/health");
      },
      async getVideo(youtubeVideoId, deviceId = null) {
        return request(`/videos/${youtubeVideoId}${buildQueryString({ deviceId })}`);
      },
      async bulkLookup(youtubeVideoIds, deviceId = null) {
        return request("/videos/bulk-lookup", {
          method: "POST",
          body: JSON.stringify({ youtubeVideoIds, deviceId }),
        });
      },
      async flagVideo(youtubeVideoId, deviceId) {
        return request(`/videos/${youtubeVideoId}/flag`, {
          method: "POST",
          body: JSON.stringify({ deviceId }),
        });
      },
      async voteOnVideo(youtubeVideoId, deviceId, vote) {
        return request(`/videos/${youtubeVideoId}/vote`, {
          method: "POST",
          body: JSON.stringify({ deviceId, vote }),
        });
      },
    };
  }

  global.YouTubeAiBlockerApi = {
    createApiClient,
  };
}(globalThis));
