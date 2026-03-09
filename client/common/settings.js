(function bootstrapSettings(global) {
  const STORAGE_KEY = "yaib_settings";
  const DEVICE_ID_STORAGE_KEY = "yaib_device_id";
  const DEFAULT_SETTINGS = {
    apiBaseUrl: "http://127.0.0.1:3000",
    blockingEnabled: false,
    debugUnknownIndicators: false,
  };

  function createFallbackStorage() {
    return {
      get(keys, callback) {
        const fallback = {};
        const list = Array.isArray(keys) ? keys : [keys];

        for (const key of list) {
          const value = global.localStorage.getItem(key);
          fallback[key] = value ? JSON.parse(value) : undefined;
        }

        callback(fallback);
      },
      set(values, callback) {
        for (const [key, value] of Object.entries(values)) {
          global.localStorage.setItem(key, JSON.stringify(value));
        }

        if (callback) {
          callback();
        }
      },
    };
  }

  function getSettingsStorageArea() {
    if (global.chrome?.storage?.sync) {
      return global.chrome.storage.sync;
    }

    return createFallbackStorage();
  }

  function getDeviceStorageArea() {
    if (global.chrome?.storage?.local) {
      return global.chrome.storage.local;
    }

    return createFallbackStorage();
  }

  function sanitizeSettings(input) {
    return {
      apiBaseUrl: String(input?.apiBaseUrl ?? DEFAULT_SETTINGS.apiBaseUrl).trim() || DEFAULT_SETTINGS.apiBaseUrl,
      blockingEnabled: Boolean(input?.blockingEnabled),
      debugUnknownIndicators: Boolean(input?.debugUnknownIndicators),
    };
  }

  function getSettings() {
    const storage = getSettingsStorageArea();

    return new Promise((resolve) => {
      storage.get([STORAGE_KEY], (result) => {
        resolve({
          ...DEFAULT_SETTINGS,
          ...sanitizeSettings(result[STORAGE_KEY] ?? {}),
        });
      });
    });
  }

  function saveSettings(nextSettings) {
    const storage = getSettingsStorageArea();
    const sanitized = sanitizeSettings(nextSettings);

    return new Promise((resolve) => {
      storage.set({
        [STORAGE_KEY]: sanitized,
      }, () => resolve(sanitized));
    });
  }

  function resetSettings() {
    return saveSettings(DEFAULT_SETTINGS);
  }

  function createDeviceId() {
    if (global.crypto?.randomUUID) {
      return global.crypto.randomUUID();
    }

    return `yaib-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  }

  function getDeviceId() {
    const storage = getDeviceStorageArea();

    return new Promise((resolve) => {
      storage.get([DEVICE_ID_STORAGE_KEY], (result) => {
        const existingDeviceId = String(result[DEVICE_ID_STORAGE_KEY] ?? "").trim();

        if (existingDeviceId) {
          resolve(existingDeviceId);
          return;
        }

        const nextDeviceId = createDeviceId();
        storage.set({
          [DEVICE_ID_STORAGE_KEY]: nextDeviceId,
        }, () => resolve(nextDeviceId));
      });
    });
  }

  global.YouTubeAiBlockerSettings = {
    STORAGE_KEY,
    DEVICE_ID_STORAGE_KEY,
    DEFAULT_SETTINGS,
    getSettings,
    getDeviceId,
    saveSettings,
    resetSettings,
  };
}(globalThis));
