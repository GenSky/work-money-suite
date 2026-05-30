import { copyFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { calculators } from "../src/data/calculators.js";

const liveRoutes = calculators
  .filter((calculator) => calculator.status === "Live")
  .map((calculator) => calculator.path);

const routes = ["/text", ...liveRoutes];
const distDir = "dist";
const indexPath = join(distDir, "index.html");

await copyFile(indexPath, join(distDir, "404.html"));

for (const route of routes) {
  const routeIndexPath = join(distDir, route.replace(/^\//, ""), "index.html");
  await mkdir(dirname(routeIndexPath), { recursive: true });
  await copyFile(indexPath, routeIndexPath);
}

console.log(`Prepared GitHub Pages fallback files for ${routes.length} app routes.`);
