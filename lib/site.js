export function ambilSiteUrl() {
  const url =
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "http://localhost:3000";

  return String(url).trim().replace(/\/+$/, "");
}

export function urlAbsolut(path = "/") {
  const dasar = ambilSiteUrl();
  if (!path) return dasar;
  return `${dasar}${path.startsWith("/") ? path : `/${path}`}`;
}
