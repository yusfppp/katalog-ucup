import { TOKO_CADANGAN } from "@/lib/toko-cadangan";

export default function manifest() {
  return {
    name: `${TOKO_CADANGAN.nama} - Katalog Camilan Rumahan`,
    short_name: TOKO_CADANGAN.nama,
    description: `${TOKO_CADANGAN.tagline} Katalog produk, varian, dan pemesanan langsung via WhatsApp.`,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FFF7EC",
    theme_color: "#C93868",
    lang: "id",
    categories: ["shopping", "food"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Buka Katalog",
        short_name: "Katalog",
        url: "/#katalog",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Keranjang",
        short_name: "Keranjang",
        url: "/keranjang",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
