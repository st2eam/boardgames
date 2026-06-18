/**
 * Post-build script: scans the static export (out/) and injects a precache
 * manifest into sw.js so the Service Worker can cache all assets on install.
 */
import { readdirSync, statSync, readFileSync, writeFileSync } from "fs";
import { join, relative } from "path";
import { createHash } from "crypto";

const OUT_DIR = join(import.meta.dirname, "../out");
const SW_PATH = join(OUT_DIR, "sw.js");
const BASE_PATH = "/boardgames";

const INCLUDE_EXTENSIONS = new Set([
  ".html",
  ".js",
  ".css",
  ".json",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".svg",
  ".ico",
  ".woff",
  ".woff2",
]);

const EXCLUDE_PATTERNS = [
  /\/__next\./,
  /\.txt$/,
  /\.map$/,
];

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

function shouldInclude(filePath) {
  const ext = filePath.slice(filePath.lastIndexOf("."));
  if (!INCLUDE_EXTENSIONS.has(ext)) return false;
  const rel = relative(OUT_DIR, filePath);
  return !EXCLUDE_PATTERNS.some((p) => p.test(rel));
}

const allFiles = walk(OUT_DIR).filter(shouldInclude);

const urls = allFiles.map((f) => {
  const rel = relative(OUT_DIR, f).replace(/\\/g, "/");
  return `${BASE_PATH}/${rel}`;
});

// Add root URL
urls.unshift(`${BASE_PATH}/`);

// Deduplicate
const uniqueUrls = [...new Set(urls)];

// Generate a version hash based on all file contents
const hash = createHash("md5");
for (const f of allFiles.slice(0, 50)) {
  hash.update(readFileSync(f));
}
const version = hash.digest("hex").slice(0, 8);

// Read sw.js template and inject manifest
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
