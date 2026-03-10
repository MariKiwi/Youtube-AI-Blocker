import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = "/home/mari/Documents/Youtube AI Blocker";

test("website landing page includes core project messaging and SEO metadata", async () => {
  const html = await readFile(`${root}/website/index.html`, "utf8");

  assert.match(html, /<title>YouTube AI Blocker \| Flag, Highlight, and Block AI Videos<\/title>/);
  assert.match(html, /name="description"/);
  assert.match(html, /open source browser extension/i);
  assert.match(html, /Store install when available, manual install when needed/i);
  assert.match(html, /Chrome Web Store/);
  assert.match(html, /Firefox Add-ons/);
  assert.match(html, /GitHub Releases/);
  assert.match(html, /\.\/manual-install\.html/);
  assert.match(html, /third-party extension installs/i);
  assert.match(html, /github\.com\/MattiKiwi\/Youtube-AI-Blocker\/releases/);
  assert.match(html, /How it works/);
  assert.match(html, /anonymous voting/i);
  assert.match(html, /optional blocking/i);
  assert.match(html, /https:\/\/github\.com\/MattiKiwi\/Youtube-AI-Blocker/);
  assert.match(html, /mario-ame-EUTXu9T36XU-unsplash\.jpg/);
  assert.match(html, /mario-ame-fSfv8RhkvCs-unsplash\.jpg/);
  assert.match(html, /logan-voss-vJy0DdZ6NVk-unsplash\.jpg/);
  assert.match(html, /Photo credits/);
  assert.match(html, /Mario Amé/);
  assert.match(html, /Logan Voss/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /FAQ/);
});

test("website manual install guide exists and links the user through unpacked install flow", async () => {
  const html = await readFile(`${root}/website/manual-install.html`, "utf8");

  assert.match(html, /Manual Install \| YouTube AI Blocker/);
  assert.match(html, /chromium-based browsers/i);
  assert.match(html, /chrome:\/\/extensions/);
  assert.match(html, /Developer mode/);
  assert.match(html, /Load unpacked/);
  assert.match(html, /dist\/extension\//);
  assert.match(html, /github\.com\/MattiKiwi\/Youtube-AI-Blocker\/releases/);
});

test("website assets define themed styling and lightweight behavior", async () => {
  const css = await readFile(`${root}/website/styles.css`, "utf8");
  const js = await readFile(`${root}/website/script.js`, "utf8");

  assert.match(css, /color-scheme: light dark/);
  assert.match(css, /Space Grotesk/);
  assert.match(css, /radial-gradient/);
  assert.match(css, /\.hero__content/);
  assert.match(css, /\.feature-grid/);
  assert.match(css, /\.install-grid/);
  assert.match(css, /\.install-card/);
  assert.match(css, /\.install-note/);
  assert.match(css, /\.steps--manual/);
  assert.match(css, /\.page-title/);
  assert.match(css, /\.photo-credits/);
  assert.match(css, /\.preview-card__image/);
  assert.match(css, /\.preview-card__image--hero/);
  assert.match(css, /object-fit: cover/);
  assert.match(css, /\.feed-item__image/);
  assert.match(css, /@media \(prefers-color-scheme: dark\)/);
  assert.match(js, /IntersectionObserver/);
  assert.match(js, /currentYear/);
  assert.match(js, /data-reveal/);
});
