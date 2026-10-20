import { notFound } from "next/navigation";
import Button from "@/components/Button";
import TombolWhatsApp from "@/components/TombolWhatsApp";
import { buatKlienServer } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function HalamanDetailProduk({ params }) {
  const { id } = await params;
  const supabase = buatKlienServer();

  const { data: produk, error } = await supabase
    .from("produk")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !produk) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 md:py-16">
      {/* TOMBOL KEMBALI MENGGUNAKAN BUTTON TERTIARY */}
      <div className="mb-8">
        <Button
          href="/"
          variant="tertiary"
          size="sm"
          leftIcon={<span>←</span>}
        >
          Kembali ke Katalog Donat
        </Button>
      </div>

      <article className="grid gap-10 lg:grid-cols-2 lg:gap-14 items-center bg-surface p-6 sm:p-10 rounded-[20px] border-[1.5px] border-border shadow-warm">
        {/* GAMBAR PRODUK */}
        <div className="relative aspect-square w-full overflow-hidden rounded-[20px] border border-border bg-bg/50 shadow-inner">
          <img
            src={produk.foto_url}
            alt={produk.nama}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
          {produk.kategori && (
            <span className="absolute top-4 left-4 rounded-full bg-surface/95 px-4 py-1.5 text-xs font-bold text-primary shadow-sm backdrop-blur-sm">
              🍩 {produk.kategori}
            </span>
          )}
        </div>

        {/* DETAIL INFO */}
        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Fresh Homemade Donut
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary leading-tight">
              {produk.nama}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-primary-soft px-4 py-1.5 font-heading text-2xl sm:text-3xl font-bold text-primary shadow-sm">
              {formatRupiah(produk.harga)}
            </span>
            <span className="text-xs text-text-muted font-semibold">
              / box mini bites
            </span>
          </div>

          <div className="rounded-xl bg-bg/60 p-4 border border-border/60">
            <p className="text-sm sm:text-base leading-relaxed text-text">
              {produk.deskripsi || "Donat mini lembut dengan topping premium pilihan. Dibuat dengan cinta setiap pagi untuk menjaga cita rasa dan tekstur empuk maksimal."}
            </p>
          </div>

          <div className="space-y-3 pt-2 border-t border-border/60">
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-text-muted">
              <span className="flex items-center gap-1.5">
                <span className="text-accent">✓</span> Fresh From Oven
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-accent">✓</span> Topping Melimpah
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-accent">✓</span> Halal & Higienis
              </span>
            </div>

            <div className="pt-2">
              <TombolWhatsApp produk={produk} size="lg" className="w-full sm:w-auto shadow-lg" />
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
