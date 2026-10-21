"use client";

import { useState } from "react";
import { IconCookie, IconMenu2, IconShoppingCart, IconX } from "@tabler/icons-react";
import Button from "@/components/Button";
import TombolTema from "@/components/TombolTema";
import { useKeranjang } from "@/components/KeranjangProvider";
import { TOKO_CADANGAN } from "@/lib/toko-cadangan";

const menu = [
  { label: "Beranda", href: "/" },
  { label: "Katalog", href: "/#katalog" },
  { label: "Tentang", href: "/tentang" },
  { label: "Favorit", href: "/favorit" },
  { label: "Bandingkan", href: "/bandingkan" },
];

export default function Header({ toko = TOKO_CADANGAN }) {
  const [menuTerbuka, setMenuTerbuka] = useState(false);
  const { jumlahItem, sudahSiap } = useKeranjang();
  const jumlah = sudahSiap ? jumlahItem : 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/90 shadow-warm-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Button
          href="/"
          variant="tertiary"
          size="md"
          className="!min-h-[44px] !p-0 hover:!bg-transparent group"
          aria-label={`Kembali ke beranda ${toko.nama}`}
        >
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary shadow-inner transition-transform group-hover:scale-105">
              <IconCookie size={24} stroke={1.8} aria-hidden="true" />
            </span>
            <div className="text-left">
              <span className="block font-heading text-2xl font-bold leading-none tracking-tight text-primary">
                {toko.nama}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                {toko.tagline}
              </span>
            </div>
          </div>
        </Button>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
          {menu.map((item) => (
            <Button key={item.href} href={item.href} variant="tertiary" size="sm">
              {item.label}
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <TombolTema size="sm" />

          <Button
            href="/keranjang"
            variant="secondary"
            size="sm"
            className="relative"
            aria-label={`Keranjang belanja, ${jumlah} item`}
            title="Keranjang"
          >
            <IconShoppingCart size={18} stroke={1.9} aria-hidden="true" />
            <span className="hidden sm:inline">Keranjang</span>
            {jumlah > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-on-primary">
                {jumlah > 99 ? "99+" : jumlah}
              </span>
            )}
          </Button>

          <div className="lg:hidden">
            <Button
              variant="tertiary"
              size="sm"
              iconOnly
              onClick={() => setMenuTerbuka(!menuTerbuka)}
              aria-label={menuTerbuka ? "Tutup menu" : "Buka menu navigasi"}
              aria-expanded={menuTerbuka}
            >
              {menuTerbuka ? (
                <IconX size={23} stroke={2.2} aria-hidden="true" />
              ) : (
                <IconMenu2 size={23} stroke={2.2} aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {menuTerbuka && (
        <div className="border-t border-border bg-surface px-4 py-4 shadow-warm-lg lg:hidden">
          <nav className="flex flex-col gap-2" aria-label="Navigasi seluler">
            {menu.map((item) => (
              <Button
                key={item.href}
                href={item.href}
                variant="tertiary"
                size="md"
                fullWidth
                className="!justify-start text-left"
                onClick={() => setMenuTerbuka(false)}
              >
                {item.label}
              </Button>
            ))}
            <div className="mt-1 border-t border-border pt-2">
              <Button
                href="/keranjang"
                variant="primary"
                size="md"
                fullWidth
                leftIcon={<IconShoppingCart size={18} stroke={1.9} aria-hidden="true" />}
                onClick={() => setMenuTerbuka(false)}
              >
                Buka Keranjang
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
