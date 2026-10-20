"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { useKeranjang } from "@/components/KeranjangProvider";
import { formatRupiah, urlWhatsApp } from "@/lib/format";
import { catatKlikWA, periksaKeranjang } from "@/lib/actions/publik";

export default function HalamanKeranjang({ toko }) {
  const { items, sudahSiap, total, ubahJumlah, hapus, kosongkan } = useKeranjang();
  const [status, setStatus] = useState({});
  const [memeriksa, setMemeriksa] = useState(false);
  const [pesan, setPesan] = useState("");
  const [error, setError] = useState("");

  const adaMasalah = useMemo(
    () =>
      items.some((item) => {
        const info = status[item.id];
        return info && info.status !== "tersedia";
      }),
    [items, status]
  );

  useEffect(() => {
    if (!sudahSiap) return;
    let batal = false;

    async function periksa() {
      if (items.length === 0) {
        setStatus({});
        return;
      }
      setMemeriksa(true);
      const hasil = await periksaKeranjang(
        items.map((item) => ({ id: item.id, jumlah: item.jumlah }))
      );
      if (batal) return;
      const peta = {};
      for (const info of hasil?.data || []) peta[info.id] = info;
      setStatus(peta);
      if (hasil?.error) setError("Gagal memeriksa stok terbaru. Kamu tetap bisa memesan lewat WhatsApp.");
      else setError("");
      setMemeriksa(false);
    }

    periksa();
    return () => {
      batal = true;
    };
  }, [items, sudahSiap]);

  function pesanWhatsApp() {
    if (items.length === 0) return;
    if (adaMasalah) {
      setError("Ada item yang stoknya habis atau tidak tersedia. Hapus item tersebut sebelum memesan.");
      return;
    }

    const baris = items.map((item, indeks) => {
      const varian = item.varian_label ? ` (${item.varian_label})` : "";
      return `${indeks + 1}. ${item.nama}${varian} x${item.jumlah} = ${formatRupiah(
        item.harga * item.jumlah
      )}`;
    });

    const teks = [
      `Halo ${toko.nama}! Saya ingin memesan:`,
      ...baris,
      "",
      `Total: ${formatRupiah(total)}`,
      "",
      "Mohon konfirmasi ketersediaan dan total akhirnya. Terima kasih!",
    ].join("\n");

    const url = urlWhatsApp(toko.nomorWhatsApp, teks);
    window.open(url, "_blank", "noopener,noreferrer");
    catatKlikWA(items.map((item) => item.id));
    setPesan("Pesan WhatsApp dibuka. Selesaikan pengiriman pesan di aplikasi WhatsApp.");
    setError("");
  }

  if (!sudahSiap) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6">
        <div className="h-52 animate-pulse rounded-[20px] bg-border/50" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-10 sm:px-6 md:py-16">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-[24px] border-[1.5px] border-border bg-surface p-8 text-center shadow-warm sm:p-12">
          <span className="text-6xl" aria-hidden="true">🛒</span>
          <h1 className="font-heading text-3xl font-bold text-secondary">Keranjang masih kosong</h1>
          <p className="text-sm text-text-muted">
            Pilih produk favoritmu di katalog, lalu tambahkan ke keranjang.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <Button href="/#katalog" variant="primary" size="lg">
              Lihat Katalog
            </Button>
            <Button href="/favorit" variant="secondary" size="lg">
              Buka Favorit
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-4 py-10 sm:px-6 md:py-14">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="rounded-full bg-primary-soft px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">
            Pesanan
          </span>
          <h1 className="mt-2 font-heading text-3xl font-bold text-secondary sm:text-4xl">
            Keranjang Belanja
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Periksa jumlah dan varian sebelum mengirim pesanan lewat WhatsApp.
          </p>
        </div>
        <Button type="button" variant="tertiary" size="sm" onClick={kosongkan}>
          Kosongkan Keranjang
        </Button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-error/30 bg-error/10 p-3.5 text-sm font-semibold text-error"
        >
          {error}
        </div>
      )}
      {pesan && (
        <div
          role="status"
          className="rounded-xl border border-success/30 bg-success/10 p-3.5 text-sm font-semibold text-success"
        >
          {pesan}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <div className="flex flex-col gap-3">
          {items.map((item) => {
            const info = status[item.id];
            const bermasalah = info && info.status !== "tersedia";
            return (
              <article
                key={`${item.id}-${item.varian_label || ""}`}
                className="flex flex-col gap-4 rounded-[20px] border-[1.5px] border-border bg-surface p-4 shadow-warm sm:flex-row sm:items-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.foto_url || "/produk/nastar.svg"}
                  alt=""
                  className="h-24 w-full rounded-xl object-cover sm:h-20 sm:w-24"
                  loading="lazy"
                />
                <div className="flex-1">
                  <h2 className="font-heading text-lg font-bold text-secondary">{item.nama}</h2>
                  {item.varian_label && (
                    <p className="text-xs font-semibold text-primary">Varian: {item.varian_label}</p>
                  )}
                  <p className="mt-1 text-sm font-bold text-primary">
                    {formatRupiah(item.harga)}
                    <span className="text-xs font-normal text-text-muted"> / item</span>
                  </p>
                  {bermasalah && (
                    <p className="mt-1 text-xs font-semibold text-error">
                      {info.status === "habis"
                        ? "Stok habis. Hapus item ini."
                        : info.status === "nonaktif"
                        ? "Produk sudah tidak dijual."
                        : info.status === "dihapus"
                        ? "Produk tidak ditemukan."
                        : "Jumlah melebihi stok tersedia."}
                    </p>
                  )}
                  {!bermasalah && info && (
                    <p className="mt-1 text-xs text-text-muted">Stok tersedia: {info.stok}</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                  <Input
                    label=""
                    name={`jumlah-${item.id}-${item.varian_label || "dasar"}`}
                    type="stepper"
                    min={1}
                    max={Math.max(1, Math.min(99, item.stok || 99))}
                    defaultValue={item.jumlah}
                    onChange={(event) =>
                      ubahJumlah(
                        `${item.id}::${item.varian_label || ""}`,
                        Number(event.target.value)
                      )
                    }
                  />
                  <p className="text-sm font-bold text-secondary">
                    {formatRupiah(item.harga * item.jumlah)}
                  </p>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => hapus(`${item.id}::${item.varian_label || ""}`)}
                  >
                    Hapus
                  </Button>
                </div>
              </article>
            );
          })}
        </div>

        <aside className="flex flex-col gap-4 rounded-[20px] border-[1.5px] border-border bg-surface p-5 shadow-warm sm:p-6">
          <h2 className="font-heading text-2xl font-bold text-secondary">Ringkasan Pesanan</h2>
          <div className="flex items-center justify-between border-b border-border/60 pb-3 text-sm">
            <span className="text-text-muted">Jumlah item</span>
            <span className="font-bold text-secondary">
              {items.reduce((jumlah, item) => jumlah + item.jumlah, 0)}
            </span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-sm font-semibold text-text">Total</span>
            <span className="font-heading text-3xl font-bold text-primary">
              {formatRupiah(total)}
            </span>
          </div>

          {memeriksa && (
            <p className="text-xs text-text-muted" role="status">
              Memeriksa stok terbaru...
            </p>
          )}

          <Button
            type="button"
            variant="primary"
            size="lg"
            fullWidth
            onClick={pesanWhatsApp}
            disabled={adaMasalah}
            leftIcon={<span>💬</span>}
          >
            Pesan Semua via WhatsApp
          </Button>
          <Button href="/#katalog" variant="secondary" size="md" fullWidth>
            Lanjut Belanja
          </Button>
          <p className="text-xs leading-relaxed text-text-muted">
            Total di atas adalah perkiraan. Admin akan mengonfirmasi harga dan ketersediaan lewat
            WhatsApp.
          </p>
        </aside>
      </div>
    </div>
  );
}
