/**
 * Post-build: write sitemap.xml + robots.txt into out/ for GitHub Pages.
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "out");
const CONTENT = join(ROOT, "content", "games");

const SITE_ORIGIN = "https://st2eam.github.io";
const BASE_PATH = "/boardgames";
const SITE_URL = `${SITE_ORIGIN}${BASE_PATH}`;
const LOCALES = ["en", "zh"];

function abs(path) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const withBase = normalized.startsWith(BASE_PATH)
    ? normalized
    : `${BASE_PATH}${normalized}`;
  return `${SITE_ORIGIN}${withBase}`;
}

function loadJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf-8"));
}

function hasFile(slug, name) {
  return existsSync(join(CONTENT, slug, name));
}

function urlEntry(loc, { changefreq = "weekly", priority = "0.7" } = {}) {
  return `  <url>
    <loc>${loc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function main() {
  if (!existsSync(OUT)) {
    console.warn("generate-seo: out/ missing, skip");
    return;
  }

  const slugs = loadJson(join(CONTENT, "index.json"));
  const urls = [];

  for (const locale of LOCALES) {
    urls.push(
      urlEntry(abs(`/${locale}/`), { changefreq: "daily", priority: "1.0" })
    );
    urls.push(
      urlEntry(abs(`/${locale}/costs/`), { changefreq: "monthly", priority: "0.5" })
    );

    for (const slug of slugs) {
      urls.push(
        urlEntry(abs(`/${locale}/games/${slug}/`), {
          changefreq: "weekly",
          priority: "0.8",
        })
      );

      if (hasFile(slug, "flow.json")) {
        urls.push(urlEntry(abs(`/${locale}/games/${slug}/flow/`)));
      }
      if (hasFile(slug, "score.json")) {
        urls.push(urlEntry(abs(`/${locale}/games/${slug}/score/`), { priority: "0.5" }));
      }
      if (hasFile(slug, "trainer.json")) {
        urls.push(urlEntry(abs(`/${locale}/games/${slug}/trainer/`), { priority: "0.5" }));
      }
      if (hasFile(slug, "calculator.json")) {
        urls.push(
          urlEntry(abs(`/${locale}/games/${slug}/calculator/`), { priority: "0.5" })
        );
      }
    }
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;

  const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

  writeFileSync(join(OUT, "sitemap.xml"), sitemap);
  writeFileSync(join(OUT, "robots.txt"), robots);

  // Also keep copies in public/ for local preview consistency
  writeFileSync(join(ROOT, "public", "sitemap.xml"), sitemap);
  writeFileSync(join(ROOT, "public", "robots.txt"), robots);

  console.log(
    `✓ SEO: sitemap.xml (${urls.length} URLs) + robots.txt → out/ & public/`
  );
}

main();
