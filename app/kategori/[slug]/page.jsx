import { notFound } from "next/navigation";
import { IconArrowLeft, IconSearch } from "@tabler/icons-react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import KartuProduk from "@/components/KartuProduk";
import Pagination from "@/components/Pagination";
import {
  ambilKategoriBySlug,
  ambilProdukPublik,
  PRODUK_PER_HALAMAN,
} from "@/lib/produk";

export const dynamic = "force-dynamic";

const URUTAN = [
  { label: "Pilihan toko", value: "pilihan" },
  { label: "Terbaru", value: "terbaru" },
  { label: "Termurah", value: "termurah" },
  { label: "Termahal", value: "termahal" },
];

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { data: kategori } = await ambilKategoriBySlug(slug);

  if (!kategori) {
    return { title: "Kategori tidak ditemukan" };
  }

  return {
    title: `Kategori ${kategori.nama}`,
    description: `Lihat semua produk kategori ${kategori.nama} dari katalog toko.`,
    alternates: { canonical: `/kategori/${kategori.slug}` },
  };
}

export default async function HalamanKategori({ params, searchParams }) {
  const { slug } = await params;
  const sp = await searchParams;
  const kataKunci = typeof sp?.q === "string" ? sp.q.trim().slice(0, 100) : "";
  const urut = URUTAN.some((item) => item.value === sp?.urut) ? sp.urut : "pilihan";
  const halaman = Math.max(1, Number.parseInt(sp?.hal, 10) || 1);

  const kategoriRes = await ambilKategoriBySlug(slug);
  if (!kategoriRes.data) {
    notFound();
  }

  const kategori = kategoriRes.data;
  const produkRes = await ambilProdukPublik({
    q: kataKunci,
    kategoriSlug: kategori.slug,
    urut,
    hal: halaman,
    perHalaman: PRODUK_PER_HALAMAN,
  });

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-4 py-10 sm:px-6 md:py-14">
      <div>
        <Button
          href="/#katalog"
          variant="tertiary"
          size="sm"
          leftIcon={<IconArrowLeft size={17} stroke={2} aria-hidden="true" />}
        >
          Kembali ke Katalog
        </Button>
      </div>

      <header className="flex flex-col gap-3">
        <span className="w-fit rounded-full bg-primary-soft px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">
          Kategori
        </span>
        <h1 className="font-heading text-3xl font-bold text-secondary sm:text-4xl">
          {kategori.nama}
        </h1>
        <p className="max-w-2xl text-sm text-text-muted sm:text-base">
          Semua produk dalam kategori {kategori.nama}. Gunakan pencarian dan urutan untuk menemukan
          pilihan yang tepat.
        </p>
      </header>

      <form
        action={`/kategori/${kategori.slug}#katalog`}
        method="get"
        className="grid gap-3 md:grid-cols-[1.6fr_1fr_auto] md:items-end"
      >
        <Input
          label="Cari dalam kategori"
          name="q"
          type="search"
          defaultValue={kataKunci}
          maxLength={100}
          placeholder="Nama produk..."
        />
        <Input
          label="Urutkan"
          name="urut"
          type="select"
          defaultValue={urut}
          options={URUTAN}
        />
        <Button type="submit" variant="primary">
          Terapkan
        </Button>
      </form>

      <div id="katalog">
        {produkRes.error ? (
          <div className="rounded-[20px] border-[1.5px] border-error/30 bg-surface p-8 text-center shadow-warm">
            <p className="font-heading text-xl font-bold text-error">Gagal memuat produk</p>
            <p className="mt-2 text-sm text-text-muted">{produkRes.error}</p>
          </div>
        ) : produkRes.data.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-[20px] border-[1.5px] border-border bg-surface p-10 text-center shadow-warm">
            <IconSearch size={52} stroke={1.5} aria-hidden="true" className="text-primary/70" />
            <p className="font-heading text-2xl font-bold text-secondary">
              {kataKunci ? "Produk tidak ditemukan" : "Belum ada produk di kategori ini"}
            </p>
            <p className="text-sm text-text-muted">
              {kataKunci
                ? "Coba kata kunci lain atau lihat semua produk."
                : "Silakan cek kategori lain atau kembali lagi nanti."}
            </p>
            <Button href="/#katalog" variant="primary">
              Lihat Semua Produk
            </Button>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-text-muted">
              {produkRes.count} produk ditemukan{kataKunci ? ` untuk “${kataKunci}”` : ""}.
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {produkRes.data.map((produk) => (
                <KartuProduk key={produk.id} produk={produk} />
              ))}
            </div>
          </>
        )}
      </div>

      <Pagination
        basePath={`/kategori/${kategori.slug}`}
        halaman={halaman}
        total={produkRes.count || 0}
        perHalaman={PRODUK_PER_HALAMAN}
        params={{ q: kataKunci, urut: urut === "pilihan" ? "" : urut }}
        anchor="#katalog"
        label="produk"
      />
    </div>
  );
}
