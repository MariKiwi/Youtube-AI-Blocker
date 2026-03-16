import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const sourceDir = path.resolve(process.argv[2] ?? ".");
const outputDir = path.resolve(process.argv[3] ?? path.join(sourceDir, ".site-build"));
const publicWebsiteUrl = process.env.PUBLIC_WEBSITE_URL ?? "https://your-website.example";

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === ".site-build") {
        continue;
      }

      files.push(...await walk(fullPath));
      continue;
    }

    files.push(fullPath);
  }

  return files;
}

function normalizeBaseUrl(value) {
  try {
    const url = new URL(value);
    return url.toString().replace(/\/$/, "");
  } catch {
    return "https://your-website.example";
  }
}

function routePathForHtml(relativePath) {
  const normalized = relativePath.split(path.sep).join("/");

  if (normalized === "index.html") {
    return "/";
  }

  if (normalized.endsWith("/index.html")) {
    return `/${normalized.slice(0, -"index.html".length)}`;
  }

  return `/${normalized.slice(0, -".html".length)}/`;
}

function outputPathForHtml(relativePath) {
  const parsed = path.parse(relativePath);

  if (parsed.base === "index.html") {
    return path.join(parsed.dir, "index.html");
  }

  return path.join(parsed.dir, parsed.name, "index.html");
}

function buildLegacyRedirect(cleanRoute) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0; url=${cleanRoute}">
  <link rel="canonical" href="${cleanRoute}">
  <title>Redirecting…</title>
</head>
<body>
  <p>Redirecting to <a href="${cleanRoute}">${cleanRoute}</a>.</p>
</body>
</html>
`;
}

async function main() {
  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });

  const allFiles = await walk(sourceDir);
  const htmlFiles = [];

  for (const fullPath of allFiles) {
    const relativePath = path.relative(sourceDir, fullPath);

    if (relativePath === "generate-site-output.mjs") {
      continue;
    }

    if (relativePath.endsWith(".html")) {
      htmlFiles.push(relativePath);
      continue;
    }

    const targetPath = path.join(outputDir, relativePath);
    await mkdir(path.dirname(targetPath), { recursive: true });
    await cp(fullPath, targetPath, { force: true });
  }

  const baseUrl = normalizeBaseUrl(publicWebsiteUrl);
  const sitemapEntries = [];

  for (const relativePath of htmlFiles.sort()) {
    const sourcePath = path.join(sourceDir, relativePath);
    const html = await readFile(sourcePath, "utf8");
    const cleanRoute = routePathForHtml(relativePath);
    const cleanOutputPath = path.join(outputDir, outputPathForHtml(relativePath));

    await mkdir(path.dirname(cleanOutputPath), { recursive: true });
    await writeFile(cleanOutputPath, html);

    sitemapEntries.push(`${baseUrl}${cleanRoute}`);

    if (relativePath !== "index.html") {
      const legacyRedirectPath = path.join(outputDir, relativePath);
      await mkdir(path.dirname(legacyRedirectPath), { recursive: true });
      await writeFile(legacyRedirectPath, buildLegacyRedirect(cleanRoute));
    }
  }

  const sitemapXml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sitemapEntries.map((url) => `  <url><loc>${url}</loc></url>`),
    '</urlset>',
    '',
  ].join("\n");

  await writeFile(path.join(outputDir, "sitemap.xml"), sitemapXml);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
