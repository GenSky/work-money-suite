import { useEffect } from "react";
import { absoluteUrl, SITE_CONFIG } from "../data/siteConfig.js";

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
}

function upsertLink(rel, href) {
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

function upsertJsonLd(schema) {
  let element = document.head.querySelector("#wms-jsonld");
  if (!schema) {
    element?.remove();
    return;
  }

  if (!element) {
    element = document.createElement("script");
    element.id = "wms-jsonld";
    element.type = "application/ld+json";
    document.head.appendChild(element);
  }
  element.textContent = JSON.stringify(schema);
}

export function usePageMeta(title, description, options = {}) {
  useEffect(() => {
    const pageTitle =
      title && title !== SITE_CONFIG.name ? `${title} | ${SITE_CONFIG.name}` : SITE_CONFIG.name;
    const pageDescription = description || SITE_CONFIG.defaultDescription;
    const path = options.path || window.location.pathname;
    const canonical = absoluteUrl(path);
    const image = absoluteUrl(options.image || SITE_CONFIG.defaultOgImage);

    document.title = pageTitle;

    upsertMeta('meta[name="description"]', { name: "description", content: pageDescription });
    upsertMeta('meta[name="robots"]', { name: "robots", content: "index, follow" });
    upsertMeta('meta[property="og:site_name"]', { property: "og:site_name", content: SITE_CONFIG.name });
    upsertMeta('meta[property="og:locale"]', { property: "og:locale", content: SITE_CONFIG.locale });
    upsertMeta('meta[property="og:type"]', { property: "og:type", content: options.type || "website" });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: pageTitle });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: pageDescription });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: canonical });
    upsertMeta('meta[property="og:image"]', { property: "og:image", content: image });
    upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: pageTitle });
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: pageDescription });
    upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: image });
    upsertLink("canonical", canonical);
    upsertJsonLd(options.schema);
  }, [title, description, options.path, options.image, options.type, options.schema]);
}
