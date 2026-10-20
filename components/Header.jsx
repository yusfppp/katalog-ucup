"use client";

import { useState } from "react";
import Button from "@/components/Button";
import { toko } from "@/lib/toko";

export default function Header() {
  const [menuTerbuka, setMenuTerbuka] = useState(false);

  const navItems = [
    { label: "Beranda", href: "#hero" },
    { label: "Varian Donat", href: "#katalog" },
    { label: "Paket Box", href: "#paket" },
    { label: "Cara Pesan", href: "#cara-pesan" },
    { label: "Testimoni", href: "#testimoni" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-surface/90 border-b border-border shadow-warm-sm transition-all">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-3 sm:px-6">
        {/* LOGO MENGGUNAKAN BUTTON TERTIARY */}
        <Button
          href="/"
          variant="tertiary"
          size="md"
          className="!p-0 !min-h-[44px] hover:!bg-transparent group"
          aria-label="Kembali ke beranda Alfa Bites"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-xl shadow-inner group-hover:scale-105 transition-transform">
              🍩
            </span>
            <div className="text-left">
              <span className="block font-heading text-2xl font-bold tracking-tight text-primary leading-none">
                {toko.nama}
              </span>
              <span className="text-[10px] font-semibold text-text-muted tracking-wider uppercase">
                Mini Homemade Donuts
              </span>
            </div>
          </div>
        </Button>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Button
              key={item.label}
              href={item.href}
              variant="tertiary"
              size="sm"
            >
              {item.label}
            </Button>
          ))}
        </nav>

        {/* DESKTOP CTA */}
        <div className="hidden md:flex items-center gap-2">
          <Button
            href="#pesan"
            variant="primary"
            size="md"
            rightIcon={<span>👉</span>}
          >
            Pesan Sekarang
          </Button>
        </div>

        {/* MOBILE HAMBURGER BUTTON */}
        <div className="md:hidden flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            href="#pesan"
          >
            Pesan
          </Button>
          <Button
            variant="tertiary"
            size="sm"
            iconOnly
            onClick={() => setMenuTerbuka(!menuTerbuka)}
            aria-label={menuTerbuka ? "Tutup menu" : "Buka menu navigasi"}
          >
            {menuTerbuka ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            )}
          </Button>
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {menuTerbuka && (
        <div className="md:hidden border-t border-border bg-surface px-4 py-4 shadow-warm-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Button
                key={item.label}
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
            <div className="pt-2 border-t border-border mt-1">
              <Button
                href="#pesan"
                variant="primary"
                size="md"
                fullWidth
                onClick={() => setMenuTerbuka(false)}
              >
                🍩 Pesan Sekarang
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
