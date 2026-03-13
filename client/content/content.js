(function bootstrapContentScript(global) {
  const logger = global.YouTubeAiBlockerLogger;
  const settingsApi = global.YouTubeAiBlockerSettings;
  const apiFactory = global.YouTubeAiBlockerApi;

  const STATE_CLASS_MAP = {
    unknown: "yaib-pill--unknown",
    low: "yaib-pill--low",
    medium: "yaib-pill--medium",
    high: "yaib-pill--high",
    disputed: "yaib-pill--disputed",
    unflagged: "yaib-pill--unflagged",
  };

  const ROOT_ID = "yaib-watch-controls";
  const TOAST_ID = "yaib-watch-toast";
  const CARD_BADGE_CLASS = "yaib-card-badge";
  const BLOCK_OVERLAY_CLASS = "yaib-block-overlay";
  const WATCH_BLOCK_HOST_ID = "primary-inner";
  const FETCH_FAILURE_COOLDOWN_MS = 5000;
  const SUCCESS_STATUS_MS = 2400;
  const INFO_STATUS_MS = 2800;
  const ERROR_STATUS_MS = 3600;
  const CARD_SELECTOR = [
    "ytd-rich-item-renderer",
    "ytd-rich-grid-media",
    "ytd-rich-grid-slim-media",
    "ytd-video-renderer",
    "ytd-grid-video-renderer",
    "ytd-compact-video-renderer",
  ].join(", ");
  const CARD_LOG_SELECTOR = [
    "ytd-rich-item-renderer",
    "ytd-rich-grid-media",
    "ytd-rich-grid-slim-media",
    "ytd-video-renderer",
    "ytd-grid-video-renderer",
    "ytd-compact-video-renderer",
  ].join(", ");

  let clientContext = null;
  let observedVideoId = null;
  let currentVideo = null;
  let mutationObserver = null;
  let lastFetchFailureAt = 0;
  let lastCardFetchFailureAt = 0;
  let lastLoggedFetchFailureKey = null;
  let lastLoggedCardFetchFailureKey = null;
  let renderScheduled = false;
  let pendingAction = null;
  let statusMessage = "";
  let statusTone = "info";
  let statusTimer = null;
  let lastRenderedCardSignature = "";
  let lastCardDiscoveryLogKey = null;
  let rerenderRequested = false;
  let extensionContextInvalidated = false;
  const videoStateCache = new Map();
  const temporarilyRevealedVideoIds = new Set();

  function isWatchPage() {
    return global.location.pathname === "/watch";
  }

  function isExtensionContextInvalidatedError(error) {
    const message = String(error?.message ?? error ?? "");
    return message.includes("Extension context invalidated");
  }

  function handleExtensionContextInvalidated() {
    extensionContextInvalidated = true;
    renderScheduled = false;
    rerenderRequested = false;

    if (mutationObserver) {
      mutationObserver.disconnect();
      mutationObserver = null;
    }

    logger.info("Extension context invalidated; stopping page observers until reload");
  }

  function handleUnexpectedActionError(error) {
    if (isExtensionContextInvalidatedError(error)) {
      handleExtensionContextInvalidated();
      return;
    }

    clearPendingAction();
    setStatus(error.message, "error");
    scheduleRender();
  }

  function getVideoIdFromLocation() {
    const url = new URL(global.location.href);
    const videoId = url.searchParams.get("v");
    return videoId && videoId.length === 11 ? videoId : null;
  }

  function findActionRow() {
    return document.querySelector("#menu ytd-menu-renderer #top-level-buttons-computed");
  }

  function findWatchBlockHost() {
    return document.getElementById(WATCH_BLOCK_HOST_ID);
  }

  function getVideoIdFromHref(href) {
    if (!href) {
      return null;
    }

    try {
      const url = new URL(href, global.location.origin);
      const videoId = url.searchParams.get("v");
      return videoId && videoId.length === 11 ? videoId : null;
    } catch {
      return null;
    }
  }

  function collectVideoCardTargets() {
    return [...document.querySelectorAll(CARD_SELECTOR)]
      .map((card) => {
        const thumbnailLink = card.querySelector([
          'a#thumbnail[href*="/watch?v="]',
          'a.ytd-thumbnail[href*="/watch?v="]',
          'a[href*="/watch?v="][id="thumbnail"]',
          'a[href*="/watch?v="][aria-hidden="true"]',
        ].join(", "));
        const titleLink = card.querySelector([
          'a#video-title[href*="/watch?v="]',
          'a[href*="/watch?v="][title]',
        ].join(", "));
        const videoId = getVideoIdFromHref(thumbnailLink?.href ?? titleLink?.href ?? "");

        if (!videoId || !(thumbnailLink ?? titleLink)) {
          return null;
        }

        return {
          card,
          thumbnailLink: thumbnailLink ?? titleLink,
          videoId,
        };
      })
      .filter(Boolean);
  }

  function logCardDiscovery(targets) {
    if (!clientContext?.settings.debugUnknownIndicators) {
      return;
    }

    const presentRenderers = [...new Set(
      [...document.querySelectorAll(CARD_LOG_SELECTOR)]
        .map((node) => node.tagName.toLowerCase()),
    )];
    const logKey = `${targets.length}:${presentRenderers.join(",")}`;

    if (logKey === lastCardDiscoveryLogKey) {
      return;
    }

    lastCardDiscoveryLogKey = logKey;
    logger.info("Video-card detection snapshot", {
      matchedTargets: targets.length,
      renderersFound: presentRenderers,
    });
  }

  function formatConfidenceLabel(video) {
    if (video.status === "unknown") {
      return "AI Unknown";
    }

    if (video.status === "unflagged") {
      return "AI Unflagged";
    }

    const label = video.confidenceLevel.charAt(0).toUpperCase() + video.confidenceLevel.slice(1);
    return `AI ${label}`;
  }

  function removeCardHighlight(card) {
    const badge = card.querySelector(`.${CARD_BADGE_CLASS}`);
    badge?.remove();

    for (const className of [...card.classList]) {
      if (className.startsWith("yaib-card--")) {
        card.classList.remove(className);
      }
    }
  }

  function removeCardBlockState(card) {
    const overlay = card.querySelector(`.${BLOCK_OVERLAY_CLASS}`);
    overlay?.remove();
    card.classList.remove("yaib-card-blocked");
  }

  function isVideoBlocked(video) {
    return Boolean(
      clientContext?.settings.blockingEnabled
      && video?.isFlaggedAi
      && !temporarilyRevealedVideoIds.has(video.youtubeVideoId),
    );
  }

  function buildBlockOverlay(video, variant = "card") {
    const overlay = document.createElement("div");
    overlay.className = `${BLOCK_OVERLAY_CLASS} ${BLOCK_OVERLAY_CLASS}--${variant}`;
    const panel = document.createElement("div");
    panel.className = "yaib-block-overlay__panel";

    const eyebrow = document.createElement("p");
    eyebrow.className = "yaib-block-overlay__eyebrow";
    eyebrow.textContent = "AI Video Hidden";

    const title = document.createElement("h3");
    title.className = "yaib-block-overlay__title";
    title.textContent = formatConfidenceLabel(video);

    const meta = document.createElement("p");
    meta.className = "yaib-block-overlay__meta";
    meta.textContent = `Score ${video.score}`;

    const button = document.createElement("button");
    button.className = "yaib-block-overlay__button";
    button.type = "button";
    button.dataset.yaibRevealVideoId = String(video.youtubeVideoId ?? "");
    button.textContent = "Show anyway";

    panel.append(eyebrow, title, meta, button);
    overlay.append(panel);

    return overlay;
  }

  function applyVideoCardBlockState(target, video) {
    removeCardBlockState(target.card);

    if (!isVideoBlocked(video)) {
      return;
    }

    target.card.classList.add("yaib-card-blocked");
    target.card.append(buildBlockOverlay(video, "card"));
  }

  function applyVideoCardHighlight(target, video) {
    removeCardHighlight(target.card);

    if (!video) {
      return;
    }

    if (video.status === "unknown" && !clientContext.settings.debugUnknownIndicators) {
      return;
    }

    const badge = document.createElement("span");
    badge.className = `${CARD_BADGE_CLASS} yaib-pill ${STATE_CLASS_MAP[video.confidenceLevel] ?? "yaib-pill--unknown"}`;
    badge.textContent = video.status === "unknown"
      ? formatConfidenceLabel(video)
      : `${formatConfidenceLabel(video)} · ${video.score}`;

    target.thumbnailLink.classList.add("yaib-thumbnail-host");
    target.thumbnailLink.append(badge);
    target.card.classList.add(`yaib-card--${video.confidenceLevel}`);
  }

  async function renderVideoCardHighlights() {
    if (!clientContext) {
      return;
    }

    const targets = collectVideoCardTargets();
    logCardDiscovery(targets);

    if (targets.length === 0) {
      lastRenderedCardSignature = "";
      return;
    }

    const uniqueIds = [...new Set(targets.map((target) => target.videoId))];
    const cardSignature = uniqueIds.join(",");
    const idsToFetch = uniqueIds.filter((videoId) => !videoStateCache.has(videoId));

    if (idsToFetch.length > 0) {
      const now = Date.now();

      if (now - lastCardFetchFailureAt < FETCH_FAILURE_COOLDOWN_MS) {
        return;
      }

      try {
        const response = await clientContext.api.bulkLookup(idsToFetch, clientContext.deviceId);

        for (const video of response.videos) {
          videoStateCache.set(video.youtubeVideoId, video);
        }
      } catch (error) {
        lastCardFetchFailureAt = Date.now();
        const failureKey = `${cardSignature}:${error.message}`;

        if (lastLoggedCardFetchFailureKey !== failureKey) {
          lastLoggedCardFetchFailureKey = failureKey;
          logger.warn("Video-card bulk lookup failed", {
            videoCount: idsToFetch.length,
            apiBaseUrl: clientContext.settings.apiBaseUrl,
            error: error.message,
          });
        }

        return;
      }
    }

    lastCardFetchFailureAt = 0;
    lastLoggedCardFetchFailureKey = null;
    lastRenderedCardSignature = cardSignature;

    for (const target of targets) {
      const video = videoStateCache.get(target.videoId);
      applyVideoCardHighlight(target, video);
      applyVideoCardBlockState(target, video);
    }
  }

  function removeWatchPageBlockState() {
    const host = findWatchBlockHost();

    if (!host) {
      return;
    }

    host.classList.remove("yaib-watch-blocked");
    host.querySelector(`.${BLOCK_OVERLAY_CLASS}--watch`)?.remove();
  }

  function applyWatchPageBlockState(video) {
    const host = findWatchBlockHost();

    if (!host) {
      return;
    }

    removeWatchPageBlockState();

    if (!isVideoBlocked(video)) {
      return;
    }

    host.classList.add("yaib-watch-blocked");
    host.append(buildBlockOverlay(video, "watch"));
  }

  function findOrCreateRoot(actionRow) {
    let root = document.getElementById(ROOT_ID);

    if (!root) {
      root = document.createElement("div");
      root.id = ROOT_ID;
      root.className = "yaib-controls";
      root.addEventListener("click", onRootClick);
      actionRow.append(root);
    } else if (root.parentElement !== actionRow) {
      actionRow.append(root);
    }

    return root;
  }

  function findOrCreateToast() {
    let toast = document.getElementById(TOAST_ID);

    if (!toast) {
      toast = document.createElement("div");
      toast.id = TOAST_ID;
      toast.className = "yaib-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.append(toast);
    }

    return toast;
  }

  function renderUnknownState(root) {
    const isPending = pendingAction === "flag";
    root.replaceChildren(
      buildPill("yaib-pill yaib-pill--unknown", "AI", "Unknown"),
      buildActionButton("flag", isPending ? "Flagging..." : "Flag as AI", isPending),
    );
  }

  function renderErrorState(root) {
    root.replaceChildren(
      buildPill("yaib-pill yaib-pill--disputed", "AI", "API Error"),
      buildActionButton("", "Check API", true),
    );
  }

  function renderKnownState(root, video) {
    const confidenceClass = STATE_CLASS_MAP[video.confidenceLevel] ?? "yaib-pill--unknown";
    const label = video.confidenceLevel.charAt(0).toUpperCase() + video.confidenceLevel.slice(1);
    const isUpvotePending = pendingAction === "upvote";
    const isDownvotePending = pendingAction === "downvote";
    const isUpvoteActive = video.currentDeviceVote === "up";
    const isDownvoteActive = video.currentDeviceVote === "down";

    const upvoteButton = buildActionButton(
      "upvote",
      isUpvotePending ? "Voting..." : "Upvote",
      isUpvotePending,
      isUpvoteActive,
    );
    const downvoteButton = buildActionButton(
      "downvote",
      isDownvotePending ? "Voting..." : "Downvote",
      isDownvotePending,
      isDownvoteActive,
    );

    root.replaceChildren(
      buildPill(`yaib-pill ${confidenceClass}`, "AI", label),
      buildPill("yaib-pill", "Score", String(video.score)),
      upvoteButton,
      downvoteButton,
    );
  }

  function buildPill(className, strongText, valueText) {
    const pill = document.createElement("span");
    pill.className = className;

    const strong = document.createElement("strong");
    strong.textContent = strongText;

    pill.append(strong, document.createTextNode(` ${valueText}`));
    return pill;
  }

  function buildActionButton(action, label, disabled = false, active = false) {
    const button = document.createElement("button");
    button.className = `yaib-button${active ? " yaib-button--active" : ""}`;
    button.type = "button";
    button.textContent = label;

    if (action) {
      button.dataset.yaibAction = action;
    }

    if (active) {
      button.setAttribute("aria-pressed", "true");
    } else if (action === "upvote" || action === "downvote") {
      button.setAttribute("aria-pressed", "false");
    }

    if (disabled) {
      button.disabled = true;
    }

    return button;
  }

  function renderToast() {
    const toast = findOrCreateToast();

    if (!statusMessage) {
      toast.className = "yaib-toast";
      toast.textContent = "";
      toast.setAttribute("hidden", "hidden");
      return;
    }

    toast.className = `yaib-toast yaib-toast--visible yaib-toast--${statusTone}`;
    toast.textContent = statusMessage;
    toast.removeAttribute("hidden");
  }

  function setStatus(message, tone = "info", duration = null) {
    if (statusTimer) {
      global.clearTimeout(statusTimer);
      statusTimer = null;
    }

    statusMessage = message;
    statusTone = tone;
    renderToast();

    if (duration) {
      statusTimer = global.setTimeout(() => {
        clearStatus();
      }, duration);
    }
  }

  function clearStatus() {
    if (statusTimer) {
      global.clearTimeout(statusTimer);
      statusTimer = null;
    }

    statusMessage = "";
    statusTone = "info";
    renderToast();
  }

  function setPendingAction(action) {
    pendingAction = action;
  }

  function clearPendingAction() {
    pendingAction = null;
  }

  async function refreshVideoState(videoId) {
    const video = await clientContext.api.getVideo(videoId, clientContext.deviceId);
    currentVideo = video;
    observedVideoId = videoId;
    videoStateCache.set(videoId, video);
    return video;
  }

  async function handleFlag(videoId) {
    const deviceId = clientContext.deviceId;

    setPendingAction("flag");
    setStatus("Saving flag...", "info");
    scheduleRender();

    try {
      const video = await clientContext.api.flagVideo(videoId, deviceId);
      currentVideo = video;
      observedVideoId = videoId;
      setStatus("Flag saved", "success", SUCCESS_STATUS_MS);
      logger.info("Video flagged as AI", { videoId, deviceId });
    } catch (error) {
      if (error.message.includes("already voted")) {
        await refreshVideoState(videoId);
        setStatus("This device already flagged the video", "info", INFO_STATUS_MS);
      } else {
        setStatus(error.message, "error", ERROR_STATUS_MS);
        logger.warn("Flag action failed", { videoId, error: error.message });
      }
    } finally {
      clearPendingAction();
      scheduleRender();
    }
  }

  async function handleVote(videoId, vote) {
    const deviceId = clientContext.deviceId;
    const pendingKey = vote === "up" ? "upvote" : "downvote";

    setPendingAction(pendingKey);
    setStatus("Submitting vote...", "info");
    scheduleRender();

    try {
      const video = await clientContext.api.voteOnVideo(videoId, deviceId, vote);
      currentVideo = video;
      observedVideoId = videoId;
      setStatus(vote === "up" ? "Upvote saved" : "Downvote saved", "success", SUCCESS_STATUS_MS);
      logger.info("Video vote submitted", { videoId, vote, deviceId });
    } catch (error) {
      if (error.message.includes("already cast this vote")) {
        await refreshVideoState(videoId);
        setStatus("This device already cast that vote", "info", INFO_STATUS_MS);
      } else if (error.message.includes("has not been flagged yet")) {
        await refreshVideoState(videoId);
        setStatus("Flag the video before voting", "error", ERROR_STATUS_MS);
      } else {
        setStatus(error.message, "error", ERROR_STATUS_MS);
        logger.warn("Vote action failed", { videoId, vote, error: error.message });
      }
    } finally {
      clearPendingAction();
      scheduleRender();
    }
  }

  function onRootClick(event) {
    const button = event.target.closest("[data-yaib-action]");

    if (!button || button.hasAttribute("disabled")) {
      return;
    }

    const videoId = getVideoIdFromLocation();

    if (!videoId || pendingAction) {
      return;
    }

    if (button.dataset.yaibAction === "flag") {
      handleFlag(videoId).catch(handleUnexpectedActionError);
      return;
    }

    if (button.dataset.yaibAction === "upvote") {
      handleVote(videoId, "up").catch(handleUnexpectedActionError);
      return;
    }

    if (button.dataset.yaibAction === "downvote") {
      handleVote(videoId, "down").catch(handleUnexpectedActionError);
    }
  }

  function onDocumentClick(event) {
    const button = event.target.closest("[data-yaib-reveal-video-id]");

    if (!button) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const videoId = button.dataset.yaibRevealVideoId;

    if (!videoId) {
      return;
    }

    temporarilyRevealedVideoIds.add(videoId);
    setStatus("Blocked video revealed for this session", "info", INFO_STATUS_MS);
    scheduleRender();
  }

  async function renderWatchPageControls() {
    if (!clientContext || !isWatchPage()) {
      removeWatchPageBlockState();
      return;
    }

    const videoId = getVideoIdFromLocation();

    if (!videoId) {
      removeWatchPageBlockState();
      return;
    }

    const actionRow = findActionRow();

    if (!actionRow) {
      return;
    }

    const root = findOrCreateRoot(actionRow);
    const isVideoChanged = videoId !== observedVideoId;
    const now = Date.now();

    if (isVideoChanged) {
      clearStatus();
      clearPendingAction();
      currentVideo = null;
    }

    if (pendingAction && currentVideo && videoId === observedVideoId) {
      if (currentVideo.status === "unknown") {
        applyWatchPageBlockState(currentVideo);
        renderUnknownState(root);
        return;
      }

      applyWatchPageBlockState(currentVideo);
      renderKnownState(root, currentVideo);
      return;
    }

    if (now - lastFetchFailureAt < FETCH_FAILURE_COOLDOWN_MS) {
      renderErrorState(root);
      return;
    }

    let video;

    try {
      video = await refreshVideoState(videoId);
    } catch (error) {
      lastFetchFailureAt = Date.now();
      currentVideo = null;
      setStatus("Could not reach the API", "error", ERROR_STATUS_MS);
      renderErrorState(root);
      const failureKey = `${videoId}:${error.message}`;

      if (lastLoggedFetchFailureKey !== failureKey) {
        lastLoggedFetchFailureKey = failureKey;
        logger.warn("Watch-page API request failed", {
          videoId,
          apiBaseUrl: clientContext.settings.apiBaseUrl,
          error: error.message,
        });
      }

      return;
    }

    observedVideoId = videoId;
    lastFetchFailureAt = 0;
    lastLoggedFetchFailureKey = null;

    if (video.status === "unknown") {
      applyWatchPageBlockState(video);
      renderUnknownState(root);
      return;
    }

    applyWatchPageBlockState(video);
    renderKnownState(root, video);
  }

  function scheduleRender() {
    if (extensionContextInvalidated) {
      return;
    }

    if (renderScheduled) {
      rerenderRequested = true;
      return;
    }

    renderScheduled = true;
    global.requestAnimationFrame(() => {
      settingsApi.getSettings()
        .then((settings) => {
          if (clientContext) {
            if (!settings.blockingEnabled) {
              temporarilyRevealedVideoIds.clear();
            }

            clientContext.settings = settings;
          }

          return Promise.all([
            renderWatchPageControls(),
            renderVideoCardHighlights(),
          ]);
        })
        .catch((error) => {
          if (isExtensionContextInvalidatedError(error)) {
            handleExtensionContextInvalidated();
            return;
          }

          logger.error("Unexpected page render failure", error);
        })
        .finally(() => {
          renderScheduled = false;

          if (rerenderRequested) {
            rerenderRequested = false;
            scheduleRender();
          }
        });
    });
  }

  function startObserver() {
    if (mutationObserver) {
      mutationObserver.disconnect();
    }

    mutationObserver = new MutationObserver(() => {
      const nextVideoId = getVideoIdFromLocation();

      if (
        nextVideoId !== observedVideoId
        || !document.getElementById(ROOT_ID)
        || collectVideoCardTargets().length > 0
      ) {
        scheduleRender();
      }
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  async function initializeClient() {
    if (extensionContextInvalidated) {
      return;
    }

    const settings = await settingsApi.getSettings();
    const deviceId = await settingsApi.getDeviceId();
    const api = apiFactory.createApiClient(settings);

    clientContext = {
      settings,
      api,
      deviceId,
    };

    global.__YAIB_CLIENT__ = clientContext;
    document.documentElement.dataset.yaibClientReady = "true";

    logger.info("Content script initialized", {
      apiBaseUrl: settings.apiBaseUrl,
      blockingEnabled: settings.blockingEnabled,
      deviceId,
    });

    scheduleRender();
    startObserver();
    global.addEventListener("yt-navigate-finish", scheduleRender);
    document.addEventListener("yt-page-data-updated", scheduleRender);
    document.addEventListener("click", onDocumentClick, true);
  }

  initializeClient().catch((error) => {
    if (isExtensionContextInvalidatedError(error)) {
      handleExtensionContextInvalidated();
      return;
    }

    logger.error("Content bootstrap failed", error);
  });
}(globalThis));
