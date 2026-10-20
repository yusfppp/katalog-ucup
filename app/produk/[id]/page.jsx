import { notFound } from "next/navigation";
import Button from "@/components/Button";
import KartuProduk from "@/components/KartuProduk";
import GaleriProduk from "@/components/GaleriProduk";
import PanelProduk from "@/components/PanelProduk";
import FormUlasan from "@/components/FormUlasan";
import TanyaAI from "@/components/TanyaAI";
import CatatTerakhirDilihat from "@/components/CatatTerakhirDilihat";
import { ambilPengaturan } from "@/lib/toko";
import {
  ambilProdukDetail,
  ambilProdukTerkait,
  ambilUlasanProduk,
} from "@/lib/produk";
import { formatTanggal, potongTeks } from "@/lib/format";

export const dynamic = "force-dynamic";

function bintang(rating) {
  const nilai = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  return "★".repeat(nilai) + "☆".repeat(5 - nilai);
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const { data: produk } = await ambilProdukDetail(id);

  if (!produk) {
    return {
      title: "Produk tidak ditemukan",
      description: "Produk yang kamu cari tidak tersedia atau sudah tidak aktif.",
    };
  }

  const deskripsi = potongTeks(
    produk.deskripsi ||
      `Pesan ${produk.nama} dari katalog ${produk.kategori_nama || "toko kami"} langsung lewat WhatsApp.`,
    160
  );

  return {
    title: produk.nama,
    description: deskripsi,
    alternates: { canonical: `/produk/${produk.id}` },
    openGraph: {
      title: produk.nama,
      description: deskripsi,
      type: "website",
      images: (produk.galeri_urls || [])
        .slice(0, 3)
        .map((url) => ({ url, alt: produk.nama })),
    },
  };
}

export default async function HalamanDetailProduk({ params }) {
  const { id } = await params;
  const produkRes = await ambilProdukDetail(id);

  if (produkRes.error || !produkRes.data) {
    notFound();
  }

  const produk = produkRes.data;
  const [terkait, ulasan, toko] = await Promise.all([
    ambilProdukTerkait(produk, 4),
    ambilUlasanProduk(produk.id),
    ambilPengaturan(),
  ]);

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-12 px-4 py-10 sm:px-6 md:py-14">
      <CatatTerakhirDilihat id={produk.id} />

      <div>
        <Button href="/#katalog" variant="tertiary" size="sm" leftIcon={<span>←</span>}>
          Kembali ke Katalog
        </Button>
      </div>

      <article className="grid gap-8 rounded-[20px] border-[1.5px] border-border bg-surface p-5 shadow-warm sm:p-8 lg:grid-cols-2 lg:gap-12 lg:p-10">
        <GaleriProduk nama={produk.nama} gambar={produk.galeri_urls} />
        <PanelProduk produk={produk} toko={toko} />
      </article>

      <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="font-heading text-2xl font-bold text-secondary sm:text-3xl">
                Ulasan Pembeli
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                {ulasan.jumlah > 0
                  ? `${ulasan.jumlah} ulasan tampil, rata-rata ${ulasan.rataRata} dari 5.`
                  : "Belum ada ulasan yang tampil untuk produk ini."}
              </p>
            </div>
            {ulasan.jumlah > 0 && (
              <span className="rounded-full bg-primary-soft px-3 py-1 text-sm font-bold text-primary">
                {bintang(ulasan.rataRata)} {ulasan.rataRata}
              </span>
            )}
          </div>

          {ulasan.data.length > 0 ? (
            <div className="flex flex-col gap-3">
              {ulasan.data.map((item) => (
                <article
                  key={item.id}
                  className="rounded-[20px] border-[1.5px] border-border bg-surface p-4 shadow-warm sm:p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-heading text-base font-bold text-secondary">{item.nama}</p>
                      <p className="text-xs text-text-muted">{formatTanggal(item.created_at)}</p>
                    </div>
                    <span
                      className="text-sm text-accent"
                      aria-label={`${item.rating} dari 5 bintang`}
                    >
                      {bintang(item.rating)}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-line text-sm text-text">{item.komentar}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[20px] border-[1.5px] border-border bg-surface p-8 text-center shadow-warm">
              <span className="text-4xl" aria-hidden="true">💬</span>
              <p className="mt-2 font-heading text-xl font-bold text-secondary">
                Jadilah yang pertama mengulas
              </p>
              <p className="mt-1 text-sm text-text-muted">
                Pengalamanmu membantu pembeli lain memilih.
              </p>
            </div>
          )}

          <FormUlasan produkId={produk.id} />
        </div>

        <TanyaAI produkId={produk.id} namaProduk={produk.nama} />
      </section>

      {terkait.length > 0 && (
        <section>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="font-heading text-2xl font-bold text-secondary sm:text-3xl">
                Produk Terkait
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                Pilihan lain dari kategori {produk.kategori_nama}.
              </p>
            </div>
            <Button
              href={`/kategori/${produk.kategori_slug}`}
              variant="secondary"
              size="sm"
            >
              Lihat Kategori
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {terkait.map((item) => (
              <KartuProduk key={item.id} produk={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
