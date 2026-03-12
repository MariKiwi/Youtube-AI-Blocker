FROM nginx:1.29-alpine

ARG PUBLIC_WEBSITE_URL=https://your-website.example
ARG CHROME_WEB_STORE_URL=https://chromewebstore.google.com/
ARG FIREFOX_ADDONS_URL=https://addons.mozilla.org/
ARG GITHUB_SOURCE_URL=https://github.com/MattiKiwi/Youtube-AI-Blocker
ARG GITHUB_RELEASES_URL=https://github.com/MattiKiwi/Youtube-AI-Blocker/releases
ARG GOOGLE_SITE_VERIFICATION=
ARG UMAMI_SCRIPT_URL=
ARG UMAMI_WEBSITE_ID=
ARG UMAMI_HOST_URL=
ARG UMAMI_DOMAINS=

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY . /usr/share/nginx/html

RUN PUBLIC_WEBSITE_URL="$PUBLIC_WEBSITE_URL" \
    CHROME_WEB_STORE_URL="$CHROME_WEB_STORE_URL" \
    FIREFOX_ADDONS_URL="$FIREFOX_ADDONS_URL" \
    GITHUB_SOURCE_URL="$GITHUB_SOURCE_URL" \
    GITHUB_RELEASES_URL="$GITHUB_RELEASES_URL" \
    UMAMI_SCRIPT_URL="$UMAMI_SCRIPT_URL" \
    UMAMI_WEBSITE_ID="$UMAMI_WEBSITE_ID" \
    UMAMI_HOST_URL="$UMAMI_HOST_URL" \
    UMAMI_DOMAINS="$UMAMI_DOMAINS" \
    sh /usr/share/nginx/html/generate-public-config.sh /usr/share/nginx/html/public-config.js && \
    GOOGLE_META_TAG="" && \
    if [ -n "$GOOGLE_SITE_VERIFICATION" ]; then \
      GOOGLE_META_TAG="<meta name=\"google-site-verification\" content=\"$GOOGLE_SITE_VERIFICATION\">"; \
    fi && \
    sed -i "s|<!-- YAIB_GOOGLE_SITE_VERIFICATION -->|$GOOGLE_META_TAG|g" /usr/share/nginx/html/index.html

HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1:80/ || exit 1
