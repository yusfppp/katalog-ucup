"use client";

import { useState } from "react";
import Button from "@/components/Button";
import TombolFavorit from "@/components/TombolFavorit";
import TombolBandingkan from "@/components/TombolBandingkan";
import { useKeranjang } from "@/components/KeranjangProvider";
import { formatRupiah } from "@/lib/format";

export default function KartuProduk({ produk }) {
  const { tambah } = useKeranjang();
  const [pesan, setPesan] = useState("");
  const harga = Number(produk.harga) || 0;
  const hargaDiskon = produk.harga_diskon === null || produk.harga_diskon === undefined
    ? null
    : Number(produk.harga_diskon);
  const adaDiskon = hargaDiskon !== null && hargaDiskon < harga;
  const hargaTampil = Number(produk.harga_efektif ?? (adaDiskon ? hargaDiskon : harga));
  const stok = produk.stok === null || produk.stok === undefined ? 20 : Number(produk.stok);
  const habis = stok <= 0;
  const varian = Array.isArray(produk.varian) ? produk.varian : [];
  const foto = produk.foto_url || "/produk/nastar.svg";

  function tambahCepat() {
    if (habis) return;
    tambah({
      id: produk.id,
      nama: produk.nama,
      harga: hargaTampil,
      harga_normal: harga,
      foto_url: foto,
      kategori_nama: produk.kategori_nama,
      kategori_slug: produk.kategori_slug,
      stok,
    });
    setPesan("Ditambahkan ke keranjang.");
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-[20px] border-[1.5px] border-border bg-surface shadow-warm transition-all duration-300 hover:-translate-y-1 hover:shadow-warm-lg">
      <div className="relative aspect-square w-full overflow-hidden bg-bg/50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={foto}
          alt={produk.nama}
          loading="lazy"
          className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            habis ? "opacity-60 grayscale" : ""
          }`}
        />

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {produk.badge && (
            <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-on-accent shadow-sm">
              {produk.badge}
            </span>
          )}
          {adaDiskon && (
            <span className="rounded-full bg-error px-2.5 py-1 text-[11px] font-bold text-on-error shadow-sm">
              -{Math.round(((harga - hargaTampil) / harga) * 100)}%
            </span>
          )}
        </div>

        {habis && (
          <span className="absolute right-3 top-3 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold text-on-secondary shadow-sm">
            Habis
          </span>
        )}

        <div className="absolute bottom-3 right-3 flex gap-1.5">
          <TombolFavorit id={produk.id} nama={produk.nama} />
          <TombolBandingkan id={produk.id} nama={produk.nama} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4 sm:p-5">
        {produk.kategori_nama && (
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
            {produk.kategori_nama}
          </span>
        )}
        <h3 className="line-clamp-2 font-heading text-lg font-bold text-secondary transition-colors group-hover:text-primary">
          {produk.nama}
        </h3>
        {produk.deskripsi && (
          <p className="line-clamp-2 text-xs leading-relaxed text-text-muted">{produk.deskripsi}</p>
        )}

        <div className="mt-auto flex flex-wrap items-end gap-x-2 gap-y-1 pt-3">
          {adaDiskon && (
            <span className="text-xs font-semibold text-text-muted line-through">
              {formatRupiah(harga)}
            </span>
          )}
          <span className="rounded-full bg-primary-soft px-3 py-1 text-sm font-bold text-primary">
            {varian.length > 0 ? "Mulai " : ""}
            {formatRupiah(produk.harga_mulai ?? hargaTampil)}
          </span>
          {varian.length > 0 && (
            <span className="text-[11px] text-text-muted">{varian.length} varian</span>
          )}
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          {varian.length > 0 ? (
            <Button href={`/produk/${produk.id}`} variant="primary" size="sm" fullWidth>
              Pilih Varian
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="sm"
              fullWidth
              disabled={habis}
              onClick={tambahCepat}
            >
              {habis ? "Stok Habis" : "Tambah ke Keranjang"}
            </Button>
          )}
          <Button href={`/produk/${produk.id}`} variant="secondary" size="sm" fullWidth>
            Lihat Detail
          </Button>
        </div>

        <span className="sr-only" role="status" aria-live="polite">
          {pesan}
        </span>
      </div>
    </article>
  );
}
