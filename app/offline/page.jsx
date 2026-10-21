import { IconWifiOff } from "@tabler/icons-react";
import Button from "@/components/Button";

export const metadata = {
  title: "Sedang Offline",
  description: "Koneksi internet sedang tidak tersedia.",
};

export default function HalamanOffline() {
  return (
    <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-4 px-4 py-20 text-center sm:px-6">
      <IconWifiOff size={64} stroke={1.4} aria-hidden="true" className="text-primary/70" />
      <h1 className="font-heading text-3xl font-bold text-secondary sm:text-4xl">
        Kamu sedang offline
      </h1>
      <p className="max-w-md text-sm text-text-muted">
        Halaman ini tersimpan di perangkatmu. Sambungkan internet kembali untuk melihat produk
        terbaru dan mengirim pesanan lewat WhatsApp.
      </p>
      <Button href="/" variant="primary" size="lg">
        Coba Buka Beranda
      </Button>
    </div>
  );
}
