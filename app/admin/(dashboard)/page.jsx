import {
  IconCircleCheck,
  IconCookie,
  IconEyeOff,
  IconFileExport,
  IconFileImport,
  IconPackage,
  IconPlus,
  IconStar,
} from "@tabler/icons-react";
import TabelProduk from "@/components/TabelProduk";
import Pagination from "@/components/Pagination";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { wajibAdmin } from "@/lib/auth";
import { ADMIN_PER_HALAMAN, ambilProdukAdmin, hitungRingkasanAdmin } from "@/lib/produk";
import { formatAngka } from "@/lib/format";

export const dynamic = "force-dynamic";

const kartuRingkasan = [
  { kunci: "total", label: "Total Produk", ikon: IconPackage, warna: "text-primary" },
  { kunci: "aktif", label: "Produk Aktif", ikon: IconCircleCheck, warna: "text-success" },
  { kunci: "nonaktif", label: "Produk Nonaktif", ikon: IconEyeOff, warna: "text-error" },
  { kunci: "ulasan", label: "Total Ulasan", ikon: IconStar, warna: "text-accent" },
];

export default async function HalamanAdmin({ searchParams }) {
  await wajibAdmin();

  const params = await searchParams;
  const q = typeof params?.q === "string" ? params.q.trim().slice(0, 100) : "";
  const hal = Math.max(1, Number.parseInt(params?.hal, 10) || 1);
  const sukses = typeof params?.sukses === "string" ? params.sukses : "";

  const [ringkasan, daftar] = await Promise.all([
    hitungRingkasanAdmin(),
    ambilProdukAdmin({ q, hal, perHalaman: ADMIN_PER_HALAMAN }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-secondary sm:text-4xl">
            Dashboard Admin
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Ringkasan toko dan pengelolaan katalog donat Alfa Bites.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            href="/admin/produk/baru"
            variant="primary"
            size="md"
            leftIcon={<IconPlus size={18} stroke={2.2} aria-hidden="true" />}
          >
            Tambah Produk
          </Button>
          <Button
            href="/admin/impor"
            variant="secondary"
            size="md"
            leftIcon={<IconFileImport size={18} stroke={1.9} aria-hidden="true" />}
          >
            Impor CSV
          </Button>
          <Button
            href="/admin/ekspor"
            variant="secondary"
            size="md"
            leftIcon={<IconFileExport size={18} stroke={1.9} aria-hidden="true" />}
          >
            Ekspor CSV
          </Button>
        </div>
      </div>

      {sukses && (
        <div
          role="status"
          className="rounded-xl border border-success/30 bg-success/10 p-3.5 text-sm font-semibold text-success"
        >
          {sukses}
        </div>
      )}

      {ringkasan.error && (
        <div
          role="alert"
          className="rounded-xl border border-error/30 bg-error/10 p-3.5 text-sm font-semibold text-error"
        >
          Sebagian ringkasan gagal dimuat: {ringkasan.error}. Pastikan migration database sudah
          dijalankan.
        </div>
      )}

      <section aria-labelledby="ringkasan-judul" className="flex flex-col gap-4">
        <h2 id="ringkasan-judul" className="sr-only">
          Ringkasan toko
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {kartuRingkasan.map((kartu) => {
            const Ikon = kartu.ikon;
            return (
              <div
                key={kartu.kunci}
                className="rounded-[20px] border-[1.5px] border-border bg-surface p-4 shadow-warm sm:p-5"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-text-muted">
                    {kartu.label}
                  </p>
                  <span
                    aria-hidden="true"
                    className={`flex h-9 w-9 items-center justify-center rounded-xl bg-bg/70 ${kartu.warna}`}
                  >
                    <Ikon size={19} stroke={1.9} />
                  </span>
                </div>
                <p className={`mt-2 font-heading text-3xl font-bold sm:text-4xl ${kartu.warna}`}>
                  {formatAngka(ringkasan[kartu.kunci] || 0)}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section
          aria-labelledby="kategori-ringkasan"
          className="rounded-[20px] border-[1.5px] border-border bg-surface p-5 shadow-warm sm:p-6"
        >
          <h2 id="kategori-ringkasan" className="font-heading text-xl font-bold text-secondary">
            Produk per Kategori
          </h2>
          {ringkasan.perKategori.length === 0 ? (
            <p className="mt-3 text-sm text-text-muted">Belum ada kategori.</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-2">
              {ringkasan.perKategori.map((kategori) => (
                <li
                  key={kategori.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-bg/50 px-3 py-2 text-sm"
                >
                  <Button
                    href={`/kategori/${kategori.slug}`}
                    variant="tertiary"
                    size="sm"
                  >
                    {kategori.nama}
                  </Button>
                  <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-bold text-primary">
                    {formatAngka(kategori.jumlah)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section
          aria-labelledby="terlaris-judul"
          className="rounded-[20px] border-[1.5px] border-border bg-surface p-5 shadow-warm sm:p-6"
        >
          <h2 id="terlaris-judul" className="font-heading text-xl font-bold text-secondary">
            Produk Terlaris
          </h2>
          <p className="mt-1 text-xs text-text-muted">
            Berdasarkan jumlah klik tombol pesan WhatsApp.
          </p>
          {ringkasan.terlaris.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-border bg-bg/40 p-4 text-sm text-text-muted">
              Belum ada data klik.
            </p>
          ) : (
            <ol className="mt-4 flex flex-col gap-2">
              {ringkasan.terlaris.map((produk, indeks) => (
                <li
                  key={produk.id}
                  className="flex items-center gap-3 rounded-xl bg-bg/50 px-3 py-2 text-sm"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/25 font-heading text-sm font-bold text-secondary">
                    {indeks + 1}
                  </span>
                  <span className="flex-1 font-semibold text-text">{produk.nama}</span>
                  <span className="text-xs font-bold text-primary">
                    {formatAngka(produk.jumlah_klik)} klik
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <section aria-labelledby="kelola-produk-judul" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="kelola-produk-judul" className="font-heading text-2xl font-bold text-secondary">
              Kelola Produk
            </h2>
            <p className="text-sm text-text-muted">
              {formatAngka(daftar.count)} produk ditemukan
              {q ? ` untuk pencarian “${q}”` : ""}.
            </p>
          </div>
        </div>

        <form action="/admin" method="get" className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Input
            label="Cari produk"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Cari nama produk..."
            maxLength={100}
            className="flex-1"
          />
          <div className="flex gap-2">
            <Button type="submit" variant="primary">
              Cari
            </Button>
            {q && (
              <Button href="/admin" variant="tertiary">
                Reset
              </Button>
            )}
          </div>
        </form>

        {daftar.error ? (
          <div
            role="alert"
            className="rounded-[20px] border border-error/30 bg-surface p-8 text-center shadow-warm"
          >
            <p className="font-heading text-xl font-bold text-error">Gagal memuat produk</p>
            <p className="mt-2 text-sm text-text-muted">{daftar.error}</p>
          </div>
        ) : daftar.data.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-[20px] border-[1.5px] border-border bg-surface p-10 text-center shadow-warm">
            <IconCookie size={54} stroke={1.4} aria-hidden="true" className="text-primary/70" />
            <div>
              <h3 className="font-heading text-2xl font-bold text-secondary">
                {q ? "Produk tidak ditemukan" : "Belum ada produk"}
              </h3>
              <p className="mt-1 text-sm text-text-muted">
                {q
                  ? "Coba kata kunci lain atau reset pencarian."
                  : "Mulai tambahkan varian donat mini pertamamu."}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {q ? (
                <Button href="/admin" variant="secondary">
                  Reset pencarian
                </Button>
              ) : (
                <Button href="/admin/produk/baru" variant="primary">
                  Tambah Produk
                </Button>
              )}
            </div>
          </div>
        ) : (
          <TabelProduk daftarProduk={daftar.data} />
        )}

        <Pagination
          basePath="/admin"
          halaman={hal}
          total={daftar.count}
          perHalaman={ADMIN_PER_HALAMAN}
          params={{ q }}
          label="produk"
        />
      </section>
    </div>
  );
}
