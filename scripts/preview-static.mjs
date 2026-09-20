import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { extname, join, resolve } from "node:path";

const root = resolve("out");
const port = Number(process.env.PREVIEW_PORT ?? 3000);
const contentTypes = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".webp": "image/webp",
  ".json": "application/json",
  ".txt": "text/plain",
};

if (!existsSync(root)) {
  throw new Error("The out directory does not exist. Run the production build first.");
}

createServer((request, response) => {
  let requestPath = decodeURIComponent((request.url ?? "/").split("?")[0]);

  if (request.url?.includes("_rsc")) {
    response.statusCode = 204;
    response.end();
    return;
  }

  if (requestPath.startsWith("/boardgames")) {
    requestPath = requestPath.slice("/boardgames".length) || "/";
  }

  let filePath = join(root, requestPath);
  if (requestPath.endsWith("/")) filePath = join(filePath, "index.html");
  if (!existsSync(filePath)) filePath = join(root, requestPath, "index.html");

  if (!existsSync(filePath)) {
    response.statusCode = 404;
    response.end("Not found");
    return;
  }

  response.setHeader("content-type", contentTypes[extname(filePath).toLowerCase()] ?? "application/octet-stream");
  response.end(readFileSync(filePath));
}).listen(port, "127.0.0.1", () => {
  console.log(`Static preview available at http://localhost:${port}/boardgames/en/games/catan/`);
});
