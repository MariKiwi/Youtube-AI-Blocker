(function bootstrapWebsite() {
  const CONSENT_COOKIE_NAME = "yaib_analytics_consent";
  const CONSENT_ACCEPTED = "accepted";
  const CONSENT_DECLINED = "declined";
  const publicConfig = globalThis.YouTubeAiBlockerPublicConfig ?? {};
  const yearNode = document.getElementById("currentYear");
  const cookieBanner = document.getElementById("cookieBanner");
  const cookieBannerStatus = document.getElementById("cookieBannerStatus");
  const privacyButtons = [...document.querySelectorAll("[data-open-cookie-settings]")];
  const consentButtons = [...document.querySelectorAll("[data-consent-action]")];
  const acceptAnalyticsButtons = consentButtons.filter(
    (button) => button.getAttribute("data-consent-action") === "accept",
  );
  const hasUmamiConfig = Boolean(publicConfig.umamiScriptUrl && publicConfig.umamiWebsiteId);

  function sanitizeHttpUrl(value) {
    if (typeof value !== "string") {
      return "";
    }

    try {
      const url = new URL(value);

      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return "";
      }

      return url.toString();
    } catch {
      return "";
    }
  }

  function readCookie(name) {
    const cookieValue = document.cookie
      .split("; ")
      .find((entry) => entry.startsWith(`${name}=`));

    return cookieValue ? decodeURIComponent(cookieValue.split("=").slice(1).join("=")) : "";
  }

  function writeCookie(name, value, maxAgeSeconds) {
    let cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;

    if (location.protocol === "https:") {
      cookie += "; Secure";
    }

    document.cookie = cookie;
  }

  function getConsentState() {
    const consentValue = readCookie(CONSENT_COOKIE_NAME);

    if (consentValue === CONSENT_ACCEPTED || consentValue === CONSENT_DECLINED) {
      return consentValue;
    }

    return "";
  }

  function updateConsentStatus(consentValue) {
    if (!cookieBannerStatus) {
      return;
    }

    if (!hasUmamiConfig) {
      cookieBannerStatus.textContent = "Analytics are not configured on this deployment. Only necessary cookies can be used right now.";
      return;
    }

    if (consentValue === CONSENT_ACCEPTED) {
      cookieBannerStatus.textContent = "Current choice: analytics allowed.";
      return;
    }

    if (consentValue === CONSENT_DECLINED) {
      cookieBannerStatus.textContent = "Current choice: only necessary cookies are active.";
      return;
    }

    cookieBannerStatus.textContent = "Choose whether this site may load Umami analytics.";
  }

  function showConsentBanner() {
    if (!cookieBanner) {
      return;
    }

    updateConsentStatus(getConsentState());
    cookieBanner.hidden = false;
    cookieBanner.classList.add("cookie-banner--visible");

    for (const button of privacyButtons) {
      button.classList.add("cookie-settings-fab--raised");
    }
  }

  function hideConsentBanner() {
    if (!cookieBanner) {
      return;
    }

    cookieBanner.classList.remove("cookie-banner--visible");
    cookieBanner.hidden = true;

    for (const button of privacyButtons) {
      button.classList.remove("cookie-settings-fab--raised");
    }
  }

  function ensureUmami() {
    if (!hasUmamiConfig || document.querySelector('script[data-yaib-umami="true"]')) {
      return;
    }

    const scriptUrl = sanitizeHttpUrl(publicConfig.umamiScriptUrl);

    if (!scriptUrl) {
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = scriptUrl;
    script.setAttribute("data-website-id", publicConfig.umamiWebsiteId);
    script.setAttribute("data-yaib-umami", "true");
    script.setAttribute("data-do-not-track", "true");

    const hostUrl = sanitizeHttpUrl(publicConfig.umamiHostUrl);

    if (hostUrl) {
      script.setAttribute("data-host-url", hostUrl);
    }

    if (typeof publicConfig.umamiDomains === "string" && publicConfig.umamiDomains.trim()) {
      script.setAttribute("data-domains", publicConfig.umamiDomains);
    }

    document.head.appendChild(script);
  }

  function applyConsent(consentValue) {
    writeCookie(CONSENT_COOKIE_NAME, consentValue, 31536000);
    updateConsentStatus(consentValue);

    if (consentValue === CONSENT_ACCEPTED) {
      ensureUmami();
    }

    if (consentValue === CONSENT_DECLINED) {
      const umamiScript = document.querySelector('script[data-yaib-umami="true"]');

      if (umamiScript) {
        umamiScript.remove();
      }
    }

    hideConsentBanner();
  }

  if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
  }

  for (const node of document.querySelectorAll("[data-public-link]")) {
    const key = node.getAttribute("data-public-link");
    const href = typeof key === "string" ? sanitizeHttpUrl(publicConfig[key]) : "";

    if (!href) {
      continue;
    }

    node.setAttribute("href", href);

    if (node.getAttribute("aria-disabled") === "true" && href !== "#") {
      node.removeAttribute("aria-disabled");
    }
  }

  for (const button of privacyButtons) {
    button.addEventListener("click", showConsentBanner);
  }

  for (const button of acceptAnalyticsButtons) {
    button.disabled = !hasUmamiConfig;

    if (!hasUmamiConfig) {
      button.setAttribute("aria-disabled", "true");
      button.title = "Analytics are not configured on this deployment.";
    } else {
      button.removeAttribute("aria-disabled");
      button.removeAttribute("title");
    }
  }

  for (const button of consentButtons) {
    button.addEventListener("click", () => {
      const action = button.getAttribute("data-consent-action");

      if (action === "accept") {
        if (!hasUmamiConfig) {
          showConsentBanner();
          return;
        }

        applyConsent(CONSENT_ACCEPTED);
        return;
      }

      applyConsent(CONSENT_DECLINED);
    });
  }

  const consentState = getConsentState();

  if (hasUmamiConfig && consentState === CONSENT_ACCEPTED) {
    ensureUmami();
  }

  if (!consentState) {
    showConsentBanner();
  }

  const schemaNode = document.querySelector('script[type="application/ld+json"]');

  if (schemaNode && publicConfig.githubSourceUrl) {
    try {
      const schema = JSON.parse(schemaNode.textContent ?? "{}");
      schema.sameAs = publicConfig.githubSourceUrl;
      schemaNode.textContent = JSON.stringify(schema);
    } catch (error) {
      console.warn("[YAIB site] Failed to update JSON-LD config", error);
    }
  }

  const revealTargets = [
    ...document.querySelectorAll(".section"),
    ...document.querySelectorAll(".preview-card"),
  ];

  for (const node of revealTargets) {
    node.setAttribute("data-reveal", "");
  }

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) {
        continue;
      }

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  }, {
    threshold: 0.18,
    rootMargin: "0px 0px -8% 0px",
  });

  for (const node of revealTargets) {
    observer.observe(node);
  }
}());
