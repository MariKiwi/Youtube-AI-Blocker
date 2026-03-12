import { readFileSync, writeFileSync } from "node:fs";

const htmlPath = process.argv[2];

if (!htmlPath) {
  throw new Error("HTML path is required");
}

const verification = process.env.GOOGLE_SITE_VERIFICATION ?? "";
const html = readFileSync(htmlPath, "utf8");
const metaTag = verification
  ? `<meta name="google-site-verification" content="${escapeHtmlAttribute(verification)}">`
  : "";

writeFileSync(
  htmlPath,
  html.replace("<!-- YAIB_GOOGLE_SITE_VERIFICATION -->", metaTag),
);

function escapeHtmlAttribute(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return character;
    }
  });
}
