(function bootstrapPopup(global) {
  const logger = global.YouTubeAiBlockerLogger;
  const settingsApi = global.YouTubeAiBlockerSettings;

  const elements = {
    blockingEnabled: document.getElementById("blockingEnabled"),
    debugUnknownIndicators: document.getElementById("debugUnknownIndicators"),
    apiBaseUrl: document.getElementById("apiBaseUrl"),
    currentServer: document.getElementById("currentServer"),
    saveStatus: document.getElementById("saveStatus"),
    saveButton: document.getElementById("saveButton"),
    resetButton: document.getElementById("resetButton"),
  };

  function render(settings) {
    elements.blockingEnabled.checked = settings.blockingEnabled;
    elements.debugUnknownIndicators.checked = settings.debugUnknownIndicators;
    elements.apiBaseUrl.value = settings.apiBaseUrl;
    elements.currentServer.textContent = settings.apiBaseUrl;
  }

  async function load() {
    const settings = await settingsApi.getSettings();
    render(settings);
  }

  async function save() {
    elements.saveStatus.textContent = "Saving...";

    const settings = await settingsApi.saveSettings({
      apiBaseUrl: elements.apiBaseUrl.value,
      blockingEnabled: elements.blockingEnabled.checked,
      debugUnknownIndicators: elements.debugUnknownIndicators.checked,
    });

    render(settings);
    elements.saveStatus.textContent = "Saved";
    logger.info("Settings saved", settings);
  }

  async function reset() {
    elements.saveStatus.textContent = "Resetting...";
    const settings = await settingsApi.resetSettings();
    render(settings);
    elements.saveStatus.textContent = "Reset";
    logger.info("Settings reset");
  }

  elements.saveButton.addEventListener("click", () => {
    save().catch((error) => {
      logger.error("Failed to save settings", error);
      elements.saveStatus.textContent = "Error";
    });
  });

  elements.resetButton.addEventListener("click", () => {
    reset().catch((error) => {
      logger.error("Failed to reset settings", error);
      elements.saveStatus.textContent = "Error";
    });
  });

  load().catch((error) => {
    logger.error("Failed to load settings", error);
    elements.saveStatus.textContent = "Error";
  });
}(globalThis));
