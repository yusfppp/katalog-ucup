"use client";

import { useState } from "react";
import { IconBrandWhatsapp, IconLink, IconShoppingCart } from "@tabler/icons-react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import TombolFavorit from "@/components/TombolFavorit";
import TombolBandingkan from "@/components/TombolBandingkan";
import { useKeranjang } from "@/components/KeranjangProvider";
import { formatRupiah, urlWhatsApp } from "@/lib/format";
import { catatKlikWA } from "@/lib/actions/publik";

export default function PanelProduk({ produk, toko }) {
  const { tambah } = useKeranjang();
  const varian = Array.isArray(produk.varian) ? produk.varian : [];
  const [indeksVarian, setIndeksVarian] = useState(0);
  const [jumlah, setJumlah] = useState(1);
  const [pesanAksi, setPesanAksi] = useState("");

  const varianDipilih = varian.length > 0 ? varian[indeksVarian] : null;
  const hargaNormal = Number(produk.harga) || 0;
  const hargaDasar = Number(produk.harga_efektif) || hargaNormal;
  const harga = varianDipilih ? Number(varianDipilih.harga) : hargaDasar;
  const adaDiskon = hargaNormal > hargaDasar && !varianDipilih;
  const stok = produk.stok === null || produk.stok === undefined ? 20 : Number(produk.stok);
  const habis = stok <= 0;
  const maks = Math.max(1, Math.min(99, stok || 1));
  const total = harga * jumlah;

  function tambahKeKeranjang() {
    if (habis) return;
    tambah(
      {
        id: produk.id,
        nama: produk.nama,
        harga,
        harga_normal: hargaNormal,
        foto_url: produk.foto_url || produk.galeri_urls?.[0] || "",
        kategori_nama: produk.kategori_nama,
        kategori_slug: produk.kategori_slug,
        varian_label: varianDipilih?.label || "",
        varian_harga: varianDipilih?.harga || null,
        stok,
      },
      jumlah
    );
    setPesanAksi(
      `${jumlah} ${produk.nama}${varianDipilih ? ` (${varianDipilih.label})` : ""} ditambahkan ke keranjang.`
    );
  }

  function pesanWhatsApp() {
    if (habis) return;
    const rincian = [
      `Halo ${toko.nama}! Saya ingin memesan:`,
      `• Produk: ${produk.nama}`,
      varianDipilih ? `• Varian: ${varianDipilih.label}` : null,
      `• Jumlah: ${jumlah}`,
      `• Harga: ${formatRupiah(harga)} x ${jumlah} = ${formatRupiah(total)}`,
      "",
      "Apakah masih tersedia? Terima kasih!",
    ]
      .filter((baris) => baris !== null)
      .join("\n");

    const url = urlWhatsApp(toko.nomorWhatsApp, rincian);
    window.open(url, "_blank", "noopener,noreferrer");
    catatKlikWA([produk.id]);
  }

  async function bagikan() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const data = {
      title: produk.nama,
      text: `Lihat ${produk.nama} di ${toko.nama}`,
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(data);
        setPesanAksi("Terima kasih sudah membagikan produk ini.");
        return;
      }
      await navigator.clipboard.writeText(url);
      setPesanAksi("Link produk tersalin.");
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setPesanAksi("Link produk tersalin.");
      } catch {
        window.prompt("Salin link produk berikut:", url);
      }
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        {produk.badge && (
          <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-on-accent">
            {produk.badge}
          </span>
        )}
        <Button
          href={`/kategori/${produk.kategori_slug}`}
          variant="tertiary"
          size="sm"
          className="!px-0"
        >
          {produk.kategori_nama}
        </Button>
        {habis ? (
          <span className="rounded-full bg-error/10 px-3 py-1 text-xs font-bold text-error">
            Stok habis
          </span>
        ) : (
          <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-bold text-success">
            Stok tersedia: {stok}
          </span>
        )}
      </div>

      <h1 className="font-heading text-3xl font-bold leading-tight text-secondary sm:text-4xl lg:text-5xl">
        {produk.nama}
      </h1>

      <div className="flex flex-wrap items-end gap-3">
        {adaDiskon && (
          <span className="text-sm font-semibold text-text-muted line-through">
            {formatRupiah(hargaNormal)}
          </span>
        )}
        <span className="rounded-full bg-primary-soft px-4 py-1.5 font-heading text-2xl font-bold text-primary shadow-sm sm:text-3xl">
          {formatRupiah(harga)}
        </span>
        {varianDipilih && <span className="text-xs font-semibold text-text-muted">/ varian</span>}
      </div>

      {produk.deskripsi && (
        <div className="rounded-xl border border-border/60 bg-bg/60 p-4">
          <p className="whitespace-pre-line text-sm leading-relaxed text-text sm:text-base">
            {produk.deskripsi}
          </p>
        </div>
      )}

      {varian.length > 0 && (
        <Input
          label="Pilih varian"
          name="varian"
          type="select"
          value={String(indeksVarian)}
          onChange={(event) => {
            setIndeksVarian(Number(event.target.value));
            setJumlah(1);
          }}
          options={varian.map((item, indeks) => ({
            label: `${item.label} - ${formatRupiah(item.harga)}`,
            value: String(indeks),
          }))}
          disabled={habis}
          helperText="Harga menyesuaikan varian yang dipilih."
        />
      )}

      <div className="flex flex-col gap-2">
        <span className="text-sm font-bold text-secondary">Jumlah</span>
        <Input
          label=""
          name="jumlah"
          type="stepper"
          min={1}
          max={maks}
          defaultValue={1}
          onChange={(event) => setJumlah(Math.max(1, Math.min(maks, Number(event.target.value) || 1)))}
          disabled={habis}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-primary-soft/50 px-4 py-3">
        <span className="text-sm font-semibold text-text">Subtotal</span>
        <span className="font-heading text-2xl font-bold text-primary">{formatRupiah(total)}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={tambahKeKeranjang}
          disabled={habis}
          leftIcon={<IconShoppingCart size={19} stroke={1.9} aria-hidden="true" />}
        >
          {habis ? "Stok Habis" : "Tambah ke Keranjang"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={pesanWhatsApp}
          disabled={habis}
          leftIcon={<IconBrandWhatsapp size={19} stroke={1.9} aria-hidden="true" />}
        >
          Pesan via WhatsApp
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <TombolFavorit id={produk.id} nama={produk.nama} tampilTeks size="sm" />
        <TombolBandingkan id={produk.id} nama={produk.nama} tampilTeks size="sm" />
        <Button
          type="button"
          variant="tertiary"
          size="sm"
          onClick={bagikan}
          leftIcon={<IconLink size={17} stroke={1.9} aria-hidden="true" />}
        >
          Bagikan
        </Button>
      </div>

      <span className="text-sm font-semibold text-success" role="status" aria-live="polite">
        {pesanAksi}
      </span>
    </div>
  );
}
