(function bootstrapWebsite() {
  const CONSENT_COOKIE_NAME = "yaib_analytics_consent";
  const CONSENT_ACCEPTED = "accepted";
  const CONSENT_DECLINED = "declined";
  const publicConfig = globalThis.YouTubeAiBlockerPublicConfig ?? {};
  const yearNode = document.getElementById("currentYear");
  const consentPanel = document.getElementById("consentPanel");
  const privacyButtons = [...document.querySelectorAll("[data-open-privacy-settings]")];
  const consentButtons = [...document.querySelectorAll("[data-consent-action]")];
  const hasUmamiConfig = Boolean(publicConfig.umamiScriptUrl && publicConfig.umamiWebsiteId);

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

  function showConsentPanel() {
    if (!consentPanel) {
      return;
    }

    consentPanel.hidden = false;
    consentPanel.classList.add("consent-panel--visible");
  }

  function hideConsentPanel() {
    if (!consentPanel) {
      return;
    }

    consentPanel.classList.remove("consent-panel--visible");
    consentPanel.hidden = true;
  }

  function ensureUmami() {
    if (!hasUmamiConfig || document.querySelector('script[data-yaib-umami="true"]')) {
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = publicConfig.umamiScriptUrl;
    script.setAttribute("data-website-id", publicConfig.umamiWebsiteId);
    script.setAttribute("data-yaib-umami", "true");
    script.setAttribute("data-do-not-track", "true");

    if (publicConfig.umamiHostUrl) {
      script.setAttribute("data-host-url", publicConfig.umamiHostUrl);
    }

    if (publicConfig.umamiDomains) {
      script.setAttribute("data-domains", publicConfig.umamiDomains);
    }

    document.head.appendChild(script);
  }

  function applyConsent(consentValue) {
    writeCookie(CONSENT_COOKIE_NAME, consentValue, 31536000);

    if (consentValue === CONSENT_ACCEPTED) {
      ensureUmami();
    }

    if (consentValue === CONSENT_DECLINED) {
      const umamiScript = document.querySelector('script[data-yaib-umami="true"]');

      if (umamiScript) {
        umamiScript.remove();
      }
    }

    hideConsentPanel();
  }

  if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
  }

  for (const node of document.querySelectorAll("[data-public-link]")) {
    const key = node.getAttribute("data-public-link");
    const href = typeof key === "string" ? publicConfig[key] : "";

    if (!href) {
      continue;
    }

    node.setAttribute("href", href);

    if (node.getAttribute("aria-disabled") === "true" && href !== "#") {
      node.removeAttribute("aria-disabled");
    }
  }

  for (const button of privacyButtons) {
    button.addEventListener("click", showConsentPanel);
  }

  for (const button of consentButtons) {
    button.addEventListener("click", () => {
      const action = button.getAttribute("data-consent-action");

      if (action === "accept") {
        applyConsent(CONSENT_ACCEPTED);
        return;
      }

      applyConsent(CONSENT_DECLINED);
    });
  }

  if (hasUmamiConfig) {
    const consentState = getConsentState();

    if (consentState === CONSENT_ACCEPTED) {
      ensureUmami();
    } else if (!consentState) {
      showConsentPanel();
    }
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
