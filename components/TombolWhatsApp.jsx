import Button from "@/components/Button";
import { toko } from "@/lib/toko";
import { formatRupiah } from "@/lib/format";

export default function TombolWhatsApp({ produk, variant = "primary", size = "lg", className = "" }) {
  if (!produk) return null;

  const nomor = (toko.nomorWhatsApp || "").replace(/\D/g, "");
  const hargaTeks = formatRupiah(produk.harga);
  const pesan = `Halo Alfa Bites! Saya ingin memesan donat ${produk.nama} (${hargaTeks}). Apakah masih tersedia?`;
  const urlWhatsApp = `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;

  return (
    <Button
      href={urlWhatsApp}
      variant={variant}
      size={size}
      leftIcon={<span className="text-xl">💬</span>}
      className={className}
    >
      Pesan via WhatsApp
    </Button>
  );
}
