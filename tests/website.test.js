import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = "/home/mari/Documents/Youtube AI Blocker";

test("website landing page includes core project messaging and SEO metadata", async () => {
  const html = await readFile(`${root}/website/index.html`, "utf8");

  assert.match(html, /<title>YouTube AI Blocker \| Flag, Highlight, and Block AI Videos<\/title>/);
  assert.match(html, /name="description"/);
  assert.match(html, /open source browser extension/i);
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

test("website assets define themed styling and lightweight behavior", async () => {
  const css = await readFile(`${root}/website/styles.css`, "utf8");
  const js = await readFile(`${root}/website/script.js`, "utf8");

  assert.match(css, /color-scheme: light dark/);
  assert.match(css, /Space Grotesk/);
  assert.match(css, /radial-gradient/);
  assert.match(css, /\.hero__content/);
  assert.match(css, /\.feature-grid/);
  assert.match(css, /\.photo-credits/);
  assert.match(css, /\.preview-card__image/);
  assert.match(css, /\.preview-card__image--hero/);
  assert.match(css, /object-fit: cover/);
  assert.doesNotMatch(css, /\.preview-card__hero-frame/);
  assert.match(css, /\.feed-item__image/);
  assert.match(css, /@media \(prefers-color-scheme: dark\)/);
  assert.match(js, /IntersectionObserver/);
  assert.match(js, /currentYear/);
  assert.match(js, /data-reveal/);
});
