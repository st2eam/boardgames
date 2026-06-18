/**
 * Generate PWA icons from SVG source.
 * Uses sharp (bundled with Next.js) to convert SVG to PNG at multiple sizes.
 */
import { execSync } from "child_process";
import { writeFileSync, existsSync } from "fs";
import { join } from "path";

const ICONS_DIR = join(import.meta.dirname, "../public/icons");

const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="80" fill="#fafaf9"/>
  <rect x="24" y="24" width="464" height="464" rx="64" fill="#d97706"/>
  <g fill="#fafaf9">
    <rect x="80" y="120" width="160" height="200" rx="12"/>
    <rect x="272" y="120" width="160" height="200" rx="12"/>
    <rect x="80" y="340" width="352" height="52" rx="12"/>
  </g>
  <g fill="#92400e">
    <text x="160" y="240" font-family="sans-serif" font-size="72" font-weight="bold" text-anchor="middle">♟</text>
    <text x="352" y="240" font-family="sans-serif" font-size="72" font-weight="bold" text-anchor="middle">♠</text>
    <text x="256" y="380" font-family="sans-serif" font-size="28" font-weight="bold" text-anchor="middle">GAME SHELF</text>
  </g>
</svg>`;

const MASKABLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#d97706"/>
  <g fill="#fafaf9">
    <rect x="120" y="160" width="120" height="150" rx="10"/>
    <rect x="272" y="160" width="120" height="150" rx="10"/>
    <rect x="120" y="326" width="272" height="40" rx="10"/>
  </g>
  <g fill="#92400e">
    <text x="180" y="256" font-family="sans-serif" font-size="54" font-weight="bold" text-anchor="middle">♟</text>
    <text x="332" y="256" font-family="sans-serif" font-size="54" font-weight="bold" text-anchor="middle">♠</text>
    <text x="256" y="356" font-family="sans-serif" font-size="20" font-weight="bold" text-anchor="middle">GAME SHELF</text>
  </g>
</svg>`;

const sizes = [
  { name: "icon-180.png", size: 180, svg: ICON_SVG },
  { name: "icon-192.png", size: 192, svg: ICON_SVG },
  { name: "icon-512.png", size: 512, svg: ICON_SVG },
  { name: "icon-maskable-512.png", size: 512, svg: MASKABLE_SVG },
];

async function generate() {
  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    console.log("sharp not available, generating SVG fallbacks as PNG via resvg...");
    generateFallback();
    return;
  }

  for (const { name, size, svg } of sizes) {
    const buf = Buffer.from(svg);
    await sharp(buf).resize(size, size).png().toFile(join(ICONS_DIR, name));
    console.log(`✓ Generated ${name} (${size}x${size})`);
  }
}

function generateFallback() {
  for (const { name, size, svg } of sizes) {
    const scaled = svg.replace('viewBox="0 0 512 512"', `viewBox="0 0 512 512" width="${size}" height="${size}"`);
    const svgName = name.replace(".png", ".svg");
    writeFileSync(join(ICONS_DIR, svgName), scaled);
    console.log(`✓ Generated ${svgName} (SVG fallback, ${size}x${size})`);
  }
}

generate().catch(console.error);
