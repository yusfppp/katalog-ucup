import HalamanKeranjang from "@/components/HalamanKeranjang";
import { ambilPengaturan } from "@/lib/toko";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Keranjang Belanja",
  description: "Periksa pesananmu lalu kirim seluruh isi keranjang lewat WhatsApp.",
};

export default async function HalamanKeranjangPage() {
  const toko = await ambilPengaturan();
  return <HalamanKeranjang toko={toko} />;
}
