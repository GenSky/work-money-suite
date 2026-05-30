import { absoluteUrl, SITE_CONFIG } from "../data/siteConfig.js";

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.siteUrl,
    description: SITE_CONFIG.defaultDescription,
    inLanguage: "en-US",
  };
}

export function calculatorSchema({ title, description, path }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: title,
    url: absoluteUrl(path),
    description,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    isAccessibleForFree: true,
    inLanguage: "en-US",
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.siteUrl,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}
