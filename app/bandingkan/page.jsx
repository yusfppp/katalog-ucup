import HalamanBandingkan from "@/components/HalamanBandingkan";
import { ambilSemuaProduk } from "@/lib/produk";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bandingkan Produk",
  description: "Pilih dua produk dan bandingkan foto, kategori, harga, serta deskripsinya.",
};

export default async function HalamanBandingkanPage() {
  const hasil = await ambilSemuaProduk({ hanyaAktif: true });
  return <HalamanBandingkan daftarProduk={(hasil.data || []).slice(0, 200)} />;
}
