"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  IconCategory,
  IconChevronRight,
  IconCookie,
  IconHistory,
  IconKey,
  IconLayoutDashboard,
  IconLogout,
  IconMenu2,
  IconPlus,
  IconSettings,
  IconShieldCheck,
  IconSpeakerphone,
  IconStar,
  IconUsers,
  IconWorld,
  IconX,
} from "@tabler/icons-react";
import Button from "@/components/Button";
import { keluar } from "@/lib/actions/auth";
import { TOKO_CADANGAN } from "@/lib/toko-cadangan";

const menuUtama = [
  { href: "/admin", label: "Dashboard", ikon: IconLayoutDashboard, tepat: true },
  { href: "/admin/kategori", label: "Kategori", ikon: IconCategory },
  { href: "/admin/banner", label: "Banner", ikon: IconSpeakerphone },
  { href: "/admin/ulasan", label: "Ulasan", ikon: IconStar },
];

const menuAdministrasi = [
  { href: "/admin/pengaturan", label: "Pengaturan", ikon: IconSettings },
  { href: "/admin/akun", label: "Akun Admin", ikon: IconUsers },
  { href: "/admin/password", label: "Password", ikon: IconKey },
  { href: "/admin/log", label: "Log Aktivitas", ikon: IconHistory },
];

function menuAktif(pathname, item) {
  if (item.tepat) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function ItemMenu({ item, pathname, onKlik }) {
  const aktif = menuAktif(pathname, item);
  const Ikon = item.ikon;

  return (
    <Button
      href={item.href}
      variant="tertiary"
      size="md"
      fullWidth
      onClick={onKlik}
      aria-current={aktif ? "page" : undefined}
      className={`!min-h-[44px] !justify-start !gap-3 !rounded-xl !px-3 !text-sm ${
        aktif
          ? "!bg-primary !text-on-primary shadow-sm hover:!bg-primary-hover"
          : "!text-text hover:!bg-primary-soft/70"
      }`}
    >
      <Ikon size={19} stroke={1.8} aria-hidden="true" className="shrink-0" />
      <span className="truncate">{item.label}</span>
      {aktif && (
        <IconChevronRight
          size={16}
          stroke={2}
          aria-hidden="true"
          className="ml-auto shrink-0 opacity-80"
        />
      )}
    </Button>
  );
}

export default function AdminShell({ children, toko = TOKO_CADANGAN, emailAdmin = "" }) {
  const pathname = usePathname() || "";
  const [terbuka, setTerbuka] = useState(false);

  useEffect(() => {
    setTerbuka(false);
  }, [pathname]);

  useEffect(() => {
    const layarDesktop = window.matchMedia("(min-width: 1024px)");

    function tutupSaatDesktop(event) {
      if (event.matches) setTerbuka(false);
    }

    layarDesktop.addEventListener("change", tutupSaatDesktop);
    return () => layarDesktop.removeEventListener("change", tutupSaatDesktop);
  }, []);

  useEffect(() => {
    if (!terbuka) return undefined;

    const overflowAwal = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function tutupDenganEscape(event) {
      if (event.key === "Escape") setTerbuka(false);
    }

    window.addEventListener("keydown", tutupDenganEscape);
    return () => {
      document.body.style.overflow = overflowAwal;
      window.removeEventListener("keydown", tutupDenganEscape);
    };
  }, [terbuka]);

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-surface/95 px-4 py-3 shadow-warm-sm backdrop-blur-md lg:hidden">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary shadow-sm">
            <IconCookie size={21} stroke={1.8} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-heading text-base font-bold leading-tight text-secondary">
              {toko.nama}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
              Panel Admin
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="tertiary"
          size="sm"
          iconOnly
          onClick={() => setTerbuka(true)}
          aria-label="Buka menu navigasi admin"
          aria-controls="sidebar-admin"
          aria-expanded={terbuka}
        >
          <IconMenu2 size={23} stroke={2} aria-hidden="true" />
        </Button>
      </header>

      {terbuka && (
        <button
          type="button"
          tabIndex={-1}
          aria-label="Tutup menu navigasi admin"
          onClick={() => setTerbuka(false)}
          className="fixed inset-0 z-40 bg-secondary/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        id="sidebar-admin"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[86vw] flex-col border-r border-border bg-surface shadow-warm-lg transition-transform duration-300 ease-out lg:translate-x-0 lg:shadow-none ${
          terbuka ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-sm">
              <IconCookie size={25} stroke={1.8} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-heading text-lg font-bold leading-tight text-secondary">
                {toko.nama}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                <IconShieldCheck size={12} stroke={2} aria-hidden="true" />
                Panel Admin
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="tertiary"
            size="sm"
            iconOnly
            onClick={() => setTerbuka(false)}
            aria-label="Tutup menu navigasi admin"
            className="lg:hidden"
          >
            <IconX size={20} stroke={2} aria-hidden="true" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-5">
          <Button
            href="/admin/produk/baru"
            variant="primary"
            size="md"
            fullWidth
            onClick={() => setTerbuka(false)}
            className="!justify-start !gap-2.5 !rounded-xl !px-3.5 !text-sm"
          >
            <IconPlus size={19} stroke={2.2} aria-hidden="true" />
            Tambah Produk
          </Button>

          <nav aria-label="Navigasi admin" className="mt-6 flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <p className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-text-muted">
                Menu Utama
              </p>
              {menuUtama.map((item) => (
                <ItemMenu
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  onKlik={() => setTerbuka(false)}
                />
              ))}
            </div>

            <div className="flex flex-col gap-1 border-t border-border/70 pt-4">
              <p className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-text-muted">
                Administrasi
              </p>
              {menuAdministrasi.map((item) => (
                <ItemMenu
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  onKlik={() => setTerbuka(false)}
                />
              ))}
            </div>
          </nav>
        </div>

        <div className="border-t border-border bg-bg/40 p-3">
          <div className="mb-3 flex items-center gap-2.5 rounded-xl border border-border bg-surface p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
              <IconShieldCheck size={19} stroke={1.9} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Masuk sebagai
              </p>
              <p className="truncate text-xs font-bold text-secondary" title={emailAdmin}>
                {emailAdmin || "Admin"}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Button
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              variant="tertiary"
              size="md"
              fullWidth
              className="!min-h-[40px] !justify-start !gap-2.5 !rounded-xl !px-3 !text-sm"
            >
              <IconWorld size={18} stroke={1.9} aria-hidden="true" />
              Lihat Website
            </Button>
            <form action={keluar} className="w-full">
              <Button
                type="submit"
                variant="tertiary"
                size="md"
                fullWidth
                className="!min-h-[40px] !justify-start !gap-2.5 !rounded-xl !px-3 !text-sm !text-error hover:!bg-error/10"
              >
                <IconLogout size={18} stroke={1.9} aria-hidden="true" />
                Keluar
              </Button>
            </form>
          </div>
        </div>
      </aside>

      <main className="min-h-screen lg:pl-72">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
