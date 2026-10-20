import { ambilKategoriPublik, ambilSemuaProduk } from "@/lib/produk";
import { ambilSiteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const dasar = ambilSiteUrl();
  const [produkRes, kategoriRes] = await Promise.all([
    ambilSemuaProduk({ hanyaAktif: true }),
    ambilKategoriPublik(),
  ]);

  const halamanStatis = [
    { url: `${dasar}/`, changeFrequency: "daily", priority: 1 },
    { url: `${dasar}/tentang`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${dasar}/keranjang`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${dasar}/favorit`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${dasar}/bandingkan`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const kategori = (kategoriRes.data || []).map((item) => ({
    url: `${dasar}/kategori/${item.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const produk = (produkRes.data || []).map((item) => ({
    url: `${dasar}/produk/${item.id}`,
    lastModified: item.created_at ? new Date(item.created_at) : undefined,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...halamanStatis, ...kategori, ...produk];
}
