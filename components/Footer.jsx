import Button from "@/components/Button";
import { toko } from "@/lib/toko";

export default function Footer() {
  const nomorWA = (toko.nomorWhatsApp || "").replace(/\D/g, "");

  return (
    <footer className="mt-20 border-t border-border bg-secondary text-border">
      <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 lg:gap-12">
          {/* BRAND & TAGLINE */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-2xl shadow-md">
                🍩
              </span>
              <div>
                <span className="block font-heading text-3xl font-bold text-white tracking-tight">
                  {toko.nama}
                </span>
                <span className="text-xs font-semibold text-border/80 uppercase tracking-widest">
                  {toko.tagline}
                </span>
              </div>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-border/90">
              Donat mini rumahan empuk dengan topping melimpah. Dibuat fresh setiap hari dengan bahan berkualitas premium untuk menemani momen bahagiamu di Batam.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Button
                href={`https://wa.me/${nomorWA}`}
                variant="tertiary-light"
                size="sm"
                leftIcon={<span>💬</span>}
              >
                WhatsApp Order
              </Button>
              <Button
                href="https://instagram.com"
                variant="tertiary-light"
                size="sm"
                leftIcon={<span>📸</span>}
              >
                Instagram
              </Button>
            </div>
          </div>

          {/* NAVIGASI CEPAT */}
          <div className="flex flex-col gap-3">
            <p className="font-heading text-lg font-bold text-white tracking-wide">
              Navigasi
            </p>
            <div className="flex flex-col items-start gap-1">
              <Button href="#hero" variant="tertiary-light" size="sm" className="!px-2">
                Beranda
              </Button>
              <Button href="#katalog" variant="tertiary-light" size="sm" className="!px-2">
                Varian Donat
              </Button>
              <Button href="#paket" variant="tertiary-light" size="sm" className="!px-2">
                Paket Box Donat
              </Button>
              <Button href="#cara-pesan" variant="tertiary-light" size="sm" className="!px-2">
                Cara Pemesanan
              </Button>
              <Button href="#faq" variant="tertiary-light" size="sm" className="!px-2">
                Tanya Jawab (FAQ)
              </Button>
            </div>
          </div>

          {/* LOKASI & ADMIN */}
          <div className="flex flex-col gap-3">
            <p className="font-heading text-lg font-bold text-white tracking-wide">
              Toko & Jam Buka
            </p>
            <div className="text-sm space-y-2 text-border/90">
              <p className="flex items-start gap-2">
                <span className="text-accent shrink-0">📍</span>
                <span>{toko.alamat}</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-accent shrink-0">⏰</span>
                <span>{toko.jamBuka}</span>
              </p>
            </div>
            <div className="pt-3">
              <Button
                href="/admin"
                variant="secondary"
                size="sm"
                leftIcon={<span>🔐</span>}
              >
                Masuk Admin Toko
              </Button>
            </div>
          </div>
        </div>

        {/* COPYRIGHT & PRIVACY */}
        <div className="mt-12 pt-8 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-border/70">
          <p>© {new Date().getFullYear()} {toko.nama}. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <Button href="#hero" variant="tertiary-light" size="sm" className="!h-8 !text-xs">
              Kembali ke Atas ↑
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
