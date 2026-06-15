import fs from "fs";
import path from "path";

const CONTENT_DIR = path.resolve(process.cwd(), "content/games");

export function getContentPath(...segments: string[]): string {
  return path.join(CONTENT_DIR, ...segments);
}

export function loadJson<T>(...segments: string[]): T {
  const filePath = getContentPath(...segments);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

export function loadMarkdown(...segments: string[]): string {
  const filePath = getContentPath(...segments);
  return fs.readFileSync(filePath, "utf-8");
}

export function fileExists(...segments: string[]): boolean {
  const filePath = getContentPath(...segments);
  return fs.existsSync(filePath);
}
