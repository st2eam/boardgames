/**
 * Generate PWA icons from SVG source.
 * Uses sharp (bundled with Next.js) to convert SVG to PNG at multiple sizes.
 */
import { writeFileSync } from "fs";
import { join } from "path";

const ICONS_DIR = join(import.meta.dirname, "../public/icons");

// Design: light background, A+J cards in amber tones, "TGS" text
// All letterforms drawn as paths for consistent rendering
const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="108" fill="#fefce8"/>
  <rect x="4" y="4" width="504" height="504" rx="106" fill="none" stroke="#f59e0b" stroke-width="4" opacity="0.3"/>

  <!-- Card A (rotated left) -->
  <g transform="translate(210,220) rotate(-10)">
    <rect x="-68" y="-92" width="136" height="184" rx="12" fill="#fff" stroke="#e7e5e4" stroke-width="2"/>
    <!-- A drawn as path -->
    <path d="M0,-40 L-22,40 M0,-40 L22,40 M-14,12 L14,12" fill="none" stroke="#dc2626" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- Red heart top-left -->
    <path d="M-42,-62 C-42,-70 -34,-74 -30,-68 C-26,-74 -18,-70 -18,-62 C-18,-52 -30,-44 -30,-44 C-30,-44 -42,-52 -42,-62 Z" fill="#dc2626"/>
  </g>

  <!-- Card J (rotated right, overlapping) -->
  <g transform="translate(302,220) rotate(8)">
    <rect x="-68" y="-92" width="136" height="184" rx="12" fill="#fff" stroke="#f59e0b" stroke-width="2" opacity="0.8"/>
    <!-- J drawn as path -->
    <path d="M10,-36 L10,24 C10,42 -4,44 -16,36" fill="none" stroke="#1c1917" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M-6,-36 L26,-36" fill="none" stroke="#1c1917" stroke-width="9" stroke-linecap="round"/>
    <!-- Black spade top-left -->
    <path d="M-40,-70 C-40,-70 -52,-56 -52,-48 C-52,-42 -46,-39 -40,-43 C-34,-39 -28,-42 -28,-48 C-28,-56 -40,-70 -40,-70 Z" fill="#1c1917"/>
    <rect x="-42.5" y="-43" width="5" height="8" rx="1.5" fill="#1c1917"/>
  </g>

  <!-- TGS text as simple geometric shapes (bottom center) -->
  <g transform="translate(256,400)" fill="#92400e">
    <!-- T: horizontal top bar + vertical stem -->
    <rect x="-54" y="-14" width="32" height="5.5" rx="2"/>
    <rect x="-40.5" y="-14" width="5.5" height="30" rx="2"/>
    <!-- G: open square with inward bar -->
    <rect x="-12" y="-14" width="22" height="5.5" rx="1"/>
    <rect x="-12" y="-14" width="5.5" height="30" rx="1"/>
    <rect x="-12" y="10.5" width="22" height="5.5" rx="1"/>
    <rect x="4.5" y="1" width="5.5" height="15" rx="1"/>
    <!-- S: top bar + left upper + middle bar + right lower + bottom bar -->
    <rect x="20" y="-14" width="24" height="5.5" rx="1"/>
    <rect x="20" y="-14" width="5.5" height="16" rx="1"/>
    <rect x="20" y="-3.5" width="24" height="5.5" rx="1"/>
    <rect x="38.5" y="-3.5" width="5.5" height="19" rx="1"/>
    <rect x="20" y="10.5" width="24" height="5.5" rx="1"/>
  </g>

  <!-- Amber accent dots -->
  <circle cx="256" cy="444" r="4" fill="#d97706"/>
</svg>`;

const MASKABLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#fefce8"/>

  <!-- Card A -->
  <g transform="translate(205,210) rotate(-10)">
    <rect x="-58" y="-78" width="116" height="156" rx="10" fill="#fff" stroke="#e7e5e4" stroke-width="2"/>
    <path d="M0,-32 L-18,32 M0,-32 L18,32 M-11,8 L11,8" fill="none" stroke="#dc2626" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M-34,-52 C-34,-58 -28,-61 -25,-56 C-22,-61 -16,-58 -16,-52 C-16,-44 -25,-38 -25,-38 C-25,-38 -34,-44 -34,-52 Z" fill="#dc2626"/>
  </g>

  <!-- Card J -->
  <g transform="translate(307,210) rotate(8)">
    <rect x="-58" y="-78" width="116" height="156" rx="10" fill="#fff" stroke="#f59e0b" stroke-width="1.5"/>
    <path d="M8,-28 L8,18 C8,32 -4,34 -14,28" fill="none" stroke="#1c1917" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M-6,-28 L22,-28" fill="none" stroke="#1c1917" stroke-width="8" stroke-linecap="round"/>
    <!-- Black spade top-left -->
    <path d="M-32,-58 C-32,-58 -42,-46 -42,-40 C-42,-35 -37,-33 -32,-36 C-27,-33 -22,-35 -22,-40 C-22,-46 -32,-58 -32,-58 Z" fill="#1c1917"/>
    <rect x="-34" y="-36" width="4" height="6" rx="1" fill="#1c1917"/>
  </g>

  <!-- TGS -->
  <g transform="translate(256,380)" fill="#92400e">
    <!-- T -->
    <rect x="-46" y="-12" width="28" height="5" rx="1.5"/>
    <rect x="-34.5" y="-12" width="5" height="26" rx="1.5"/>
    <!-- G -->
    <rect x="-9" y="-12" width="20" height="5" rx="1"/>
    <rect x="-9" y="-12" width="5" height="26" rx="1"/>
    <rect x="-9" y="9" width="20" height="5" rx="1"/>
    <rect x="6" y="0" width="5" height="14" rx="1"/>
    <!-- S -->
    <rect x="19" y="-12" width="22" height="5" rx="1"/>
    <rect x="19" y="-12" width="5" height="14.5" rx="1"/>
    <rect x="19" y="-2.5" width="22" height="5" rx="1"/>
    <rect x="36" y="-2.5" width="5" height="16.5" rx="1"/>
    <rect x="19" y="9" width="22" height="5" rx="1"/>
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
    console.log("sharp not available, generating SVG fallbacks...");
    generateFallback();
    return;
  }

  for (const { name, size, svg } of sizes) {
    const buf = Buffer.from(svg);
    await sharp(buf).resize(size, size).png().toFile(join(ICONS_DIR, name));
    console.log(`Generated ${name} (${size}x${size})`);
  }
}

function generateFallback() {
  for (const { name, size, svg } of sizes) {
    const scaled = svg.replace('viewBox="0 0 512 512"', `viewBox="0 0 512 512" width="${size}" height="${size}"`);
    const svgName = name.replace(".png", ".svg");
    writeFileSync(join(ICONS_DIR, svgName), scaled);
    console.log(`Generated ${svgName} (SVG fallback, ${size}x${size})`);
  }
}

generate().catch(console.error);
