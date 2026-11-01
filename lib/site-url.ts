import type { IncomingHttpHeaders } from "node:http";

export function getPublicBaseUrl(requestHeaders?: Headers | IncomingHttpHeaders): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  let configuredUrl: URL | null = null;
  try { if (configured) configuredUrl = new URL(configured); } catch { configuredUrl = null; }
  if (process.env.NODE_ENV !== "production" && configuredUrl) return configuredUrl.origin;
  if (configuredUrl && configuredUrl.hostname !== "localhost" && configuredUrl.hostname !== "127.0.0.1" && !configuredUrl.hostname.startsWith("votre-")) return configuredUrl.origin;

  const deploymentHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (deploymentHost) return `https://${deploymentHost.replace(/^https?:\/\//, "")}`;

  const header = (name: string) => {
    const value = requestHeaders instanceof Headers ? requestHeaders.get(name) : requestHeaders?.[name.toLowerCase()];
    return Array.isArray(value) ? value[0] : value?.split(",")[0]?.trim();
  };
  const host = header("x-forwarded-host") ?? header("host");
  const allowedHosts = new Set([process.env.VERCEL_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL, configuredUrl?.hostname, "desco-mall.vercel.app"].filter(Boolean).map((value) => value!.replace(/^https?:\/\//, "").split(":")[0]));
  if (host && /^[a-z0-9.-]+(?::\d{1,5})?$/i.test(host) && (allowedHosts.has(host.split(":")[0]!) || process.env.NODE_ENV !== "production")) {
    const protocol = process.env.NODE_ENV === "production" ? "https" : (header("x-forwarded-proto") ?? "http").split(",")[0];
    return `${protocol}://${host}`;
  }
  return configuredUrl?.origin ?? (process.env.NODE_ENV === "production" ? "https://desco-mall.vercel.app" : "http://localhost:3000");
}
