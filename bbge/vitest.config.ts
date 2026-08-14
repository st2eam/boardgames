import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["bbge/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@bbge/core": path.resolve(__dirname, "core/src"),
      "@bbge/engine": path.resolve(__dirname, "engine/src"),
      "@bbge/runtime": path.resolve(__dirname, "runtime/src"),
      "@bbge/network": path.resolve(__dirname, "network/src"),
      "@bbge/ai": path.resolve(__dirname, "ai/src"),
      "@bbge/ui": path.resolve(__dirname, "ui/src"),
      "@bbge/love-letter": path.resolve(__dirname, "plugins/love-letter/src"),
      "@bbge/texas-holdem": path.resolve(
        __dirname,
        "plugins/texas-holdem/src",
      ),
      "@bbge/six-nimmt": path.resolve(__dirname, "plugins/six-nimmt/src"),
      "@bbge/go": path.resolve(__dirname, "plugins/go/src"),
      "@bbge/cabo": path.resolve(__dirname, "plugins/cabo/src"),
      "@bbge/uno": path.resolve(__dirname, "plugins/uno/src"),
      "@bbge/trio": path.resolve(__dirname, "plugins/trio/src"),
      "@bbge/rummikub": path.resolve(__dirname, "plugins/rummikub/src"),
    },
  },
});
