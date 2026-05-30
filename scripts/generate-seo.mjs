import { mkdir, writeFile } from "node:fs/promises";
import { calculators } from "../src/data/calculators.js";

const siteUrl = (process.env.SITE_URL || "https://gensky.github.io/work-money-suite").replace(/\/$/, "");
const today = new Date().toISOString().slice(0, 10);

const liveRoutes = calculators
  .filter((calculator) => calculator.status === "Live")
  .map((calculator) => calculator.path);

const routes = ["/", "/text", ...liveRoutes];

function urlEntry(path, priority) {
  return `  <url>
    <loc>${siteUrl}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((route) => urlEntry(route, route === "/" ? "1.0" : route === "/text" ? "0.5" : "0.8")).join("\n")}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

await mkdir("public", { recursive: true });
await writeFile("public/sitemap.xml", sitemap);
await writeFile("public/robots.txt", robots);

console.log(`Generated SEO files for ${routes.length} routes at ${siteUrl}.`);
