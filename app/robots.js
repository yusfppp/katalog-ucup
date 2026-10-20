import { ambilSiteUrl } from "@/lib/site";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/offline"],
      },
    ],
    sitemap: `${ambilSiteUrl()}/sitemap.xml`,
  };
}
