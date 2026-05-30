export const SITE_CONFIG = {
  name: "Work & Money Suite",
  shortName: "Work Money",
  siteUrl: import.meta.env.VITE_SITE_URL || "https://gensky.github.io/work-money-suite",
  defaultDescription:
    "Modern calculators for workdays, take-home pay, benefits, debt payoff, and retirement planning.",
  defaultOgImage: "/og-default.svg",
  locale: "en_US",
};

export function absoluteUrl(path = "/") {
  const base = SITE_CONFIG.siteUrl.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}
