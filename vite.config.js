import { defineConfig } from "vite";
import { readFileSync } from "node:fs";

export default defineConfig({
  root: "dist",
  server: { host: "0.0.0.0", allowedHosts: ["terminal.local"] },
  plugins: [{
    name: "responsive-review",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        if (request.url?.split("?")[0] !== "/__review") return next();
        response.setHeader("Content-Type", "text/html; charset=utf-8");
        response.end(readFileSync(new URL("./qa/responsive.html", import.meta.url), "utf8"));
      });
    }
  }]
});
