import {
  IconArrowUp,
  IconBrandInstagram,
  IconBrandWhatsapp,
  IconClock,
  IconCookie,
  IconLock,
  IconMapPin,
} from "@tabler/icons-react";
import Button from "@/components/Button";
import { TOKO_CADANGAN } from "@/lib/toko-cadangan";
import { urlInstagram, urlWhatsApp } from "@/lib/format";

export default function Footer({ toko = TOKO_CADANGAN }) {
  const nomorWA = (toko.nomorWhatsApp || "").replace(/\D/g, "");
  const instagram = urlInstagram(toko.instagram);
  const pesan = `Halo ${toko.nama}! Saya ingin bertanya tentang produk yang tersedia.`;

  return (
    <footer className="mt-20 border-t border-border bg-footer text-on-footer">
      <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 lg:gap-12">
          <div className="flex flex-col gap-4 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-on-primary shadow-md">
                <IconCookie size={26} stroke={1.8} aria-hidden="true" />
              </span>
              <div>
                <span className="block font-heading text-3xl font-bold tracking-tight text-on-footer">
                  {toko.nama}
                </span>
                <span className="text-xs font-semibold uppercase tracking-widest text-on-footer/80">
                  {toko.tagline}
                </span>
              </div>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-on-footer/90">
              Camilan rumahan yang dibuat fresh setiap hari. Pesan langsung lewat WhatsApp, kami
              bantu siapkan pesananmu.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Button
                href={urlWhatsApp(nomorWA, pesan)}
                variant="tertiary-light"
                size="sm"
                leftIcon={<IconBrandWhatsapp size={18} stroke={1.9} aria-hidden="true" />}
              >
                WhatsApp
              </Button>
              {instagram && (
                <Button
                  href={instagram}
                  variant="tertiary-light"
                  size="sm"
                  leftIcon={<IconBrandInstagram size={18} stroke={1.9} aria-hidden="true" />}
                >
                  Instagram
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <p className="font-heading text-lg font-bold tracking-wide text-on-footer">Navigasi</p>
            <div className="flex flex-col items-start gap-1">
              <Button href="/" variant="tertiary-light" size="sm" className="!px-2">
                Beranda
              </Button>
              <Button href="/#katalog" variant="tertiary-light" size="sm" className="!px-2">
                Katalog Produk
              </Button>
              <Button href="/tentang" variant="tertiary-light" size="sm" className="!px-2">
                Tentang & Kontak
              </Button>
              <Button href="/keranjang" variant="tertiary-light" size="sm" className="!px-2">
                Keranjang
              </Button>
              <Button href="/favorit" variant="tertiary-light" size="sm" className="!px-2">
                Favorit
              </Button>
              <Button href="/bandingkan" variant="tertiary-light" size="sm" className="!px-2">
                Bandingkan Produk
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <p className="font-heading text-lg font-bold tracking-wide text-on-footer">
              Toko & Jam Buka
            </p>
            <div className="space-y-2 text-sm text-on-footer/90">
              <p className="flex items-start gap-2">
                <IconMapPin
                  size={18}
                  stroke={1.9}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-accent"
                />
                <span>{toko.alamat}</span>
              </p>
              <p className="flex items-center gap-2">
                <IconClock
                  size={18}
                  stroke={1.9}
                  aria-hidden="true"
                  className="shrink-0 text-accent"
                />
                <span>{toko.jamBuka}</span>
              </p>
              <p className="flex items-center gap-2">
                <IconBrandWhatsapp
                  size={18}
                  stroke={1.9}
                  aria-hidden="true"
                  className="shrink-0 text-accent"
                />
                <span>{nomorWA}</span>
              </p>
            </div>
            <div className="pt-3">
              <Button
                href="/admin"
                variant="secondary"
                size="sm"
                leftIcon={<IconLock size={17} stroke={1.9} aria-hidden="true" />}
              >
                Masuk Admin Toko
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-on-footer/20 pt-8 text-xs text-on-footer/70 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {toko.nama}. Semua hak dilindungi.
          </p>
          <Button
            href="/"
            variant="tertiary-light"
            size="sm"
            className="!h-8 !text-xs"
            rightIcon={<IconArrowUp size={14} stroke={2} aria-hidden="true" />}
          >
            Kembali ke Atas
          </Button>
        </div>
      </div>
    </footer>
  );
}
