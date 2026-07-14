/**
 * Post-build script: injects a lean precache manifest + content hash into sw.js.
 * Full site is NOT precached — HTML/JSON use network-first at runtime.
 * Precache only the app shell so offline still has a landing page.
 */
import { readdirSync, statSync, readFileSync, writeFileSync, existsSync } from "fs";
import { join, relative } from "path";
import { createHash } from "crypto";

const OUT_DIR = join(import.meta.dirname, "../out");
const SW_PATH = join(OUT_DIR, "sw.js");
const BASE_PATH = "/boardgames";

function walk(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...walk(fullPath));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

function toUrl(filePath) {
  const rel = relative(OUT_DIR, filePath).replace(/\\/g, "/");
  return `${BASE_PATH}/${rel}`;
}

const allFiles = existsSync(OUT_DIR) ? walk(OUT_DIR) : [];

// Version must reflect ANY content change (rules, HTML, data, assets)
const hash = createHash("md5");
for (const f of allFiles.sort()) {
  hash.update(relative(OUT_DIR, f));
  hash.update(readFileSync(f));
}
const version = hash.digest("hex").slice(0, 8);

// Lean app-shell precache for offline fallback (not the whole site)
const shellCandidates = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/en/`,
  `${BASE_PATH}/zh/`,
  `${BASE_PATH}/manifest.json`,
  `${BASE_PATH}/icons/icon-192.png`,
  `${BASE_PATH}/icons/icon-512.png`,
  `${BASE_PATH}/data/cover-manifest.json`,
  `${BASE_PATH}/data/games-meta.json`,
];

const existingUrls = new Set(allFiles.map(toUrl));
existingUrls.add(`${BASE_PATH}/`);

const precacheUrls = shellCandidates.filter((url) => {
  if (url === `${BASE_PATH}/`) return true;
  const rel = url.slice(BASE_PATH.length + 1);
  // trailingSlash HTML lives as directory/index.html in export
  if (url.endsWith("/")) {
    return (
      existsSync(join(OUT_DIR, rel, "index.html")) ||
      existsSync(join(OUT_DIR, rel.replace(/\/$/, "") + ".html"))
    );
  }
  return existingUrls.has(url) || existsSync(join(OUT_DIR, rel));
});

const uniqueUrls = [...new Set(precacheUrls)];

let swContent = readFileSync(SW_PATH, "utf-8");

swContent = swContent.replace(
  'const CACHE_VERSION = "v1";',
  `const CACHE_VERSION = "${version}";`
);

swContent = swContent.replace(
  "const PRECACHE_URLS = self.__PRECACHE_MANIFEST || [];",
  `const PRECACHE_URLS = ${JSON.stringify(uniqueUrls, null, 2)};`
);

writeFileSync(SW_PATH, swContent);

console.log(
  `✓ SW precache manifest generated: ${uniqueUrls.length} URLs, version ${version}`
);
