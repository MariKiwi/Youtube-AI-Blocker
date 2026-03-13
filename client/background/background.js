if (typeof importScripts === "function") {
  importScripts("../common/logger.js", "../common/settings.js");
}

const logger = globalThis.YouTubeAiBlockerLogger;

chrome.runtime.onInstalled.addListener(async () => {
  const settingsApi = globalThis.YouTubeAiBlockerSettings;

  if (!settingsApi) {
    return;
  }

  const storage = chrome?.storage?.sync;
  let storedSettings = {};

  if (storage?.get) {
    storedSettings = await new Promise((resolve) => {
      storage.get([settingsApi.STORAGE_KEY], (result) => resolve(result[settingsApi.STORAGE_KEY] ?? {}));
    });
  } else {
    const existing = await settingsApi.getSettings();
    storedSettings = existing;
  }

  await settingsApi.saveSettings(settingsApi.hydrateSettings(storedSettings));
  const deviceId = await settingsApi.getDeviceId();
  logger.info("Extension installed and settings initialized");
  logger.info("Anonymous device ID initialized", { deviceId });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "YAIB_FETCH") {
    return undefined;
  }

  let requestUrl;

  try {
    requestUrl = new URL(String(message.url));
  } catch {
    sendResponse({
      error: "Invalid request URL",
    });
    return true;
  }

  if (requestUrl.protocol !== "http:" && requestUrl.protocol !== "https:") {
    sendResponse({
      error: "Invalid request URL",
    });
    return true;
  }

  fetch(requestUrl.toString(), message.options)
    .then(async (response) => {
      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      sendResponse({
        ok: response.ok,
        status: response.status,
        data,
      });
    })
    .catch((error) => {
      logger.warn("Background fetch failed", {
        url: message.url,
        error: error.message,
      });
      sendResponse({
        error: error.message,
      });
    });

  return true;
});
