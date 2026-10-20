"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatRupiah } from "@/lib/format";
import Button from "@/components/Button";
import {
  hapusProduk,
  pindahkanUrutanProduk,
  ubahStatusProduk,
} from "@/lib/actions/produk";

export default function TabelProduk({ daftarProduk = [] }) {
  const router = useRouter();
  const dialogRef = useRef(null);
  const [produkDipilih, setProdukDipilih] = useState(null);
  const [sedangMenghapus, setSedangMenghapus] = useState(false);
  const [sibuk, setSibuk] = useState("");
  const [notifikasi, setNotifikasi] = useState(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (produkDipilih && !dialog.open) dialog.showModal();
    else if (!produkDipilih && dialog.open) dialog.close();
  }, [produkDipilih]);

  const tampilkanHasil = (hasil, pesanSukses) => {
    if (hasil?.error) {
      setNotifikasi({ tipe: "error", pesan: hasil.error });
      return false;
    }
    setNotifikasi({ tipe: "success", pesan: hasil?.success || pesanSukses });
    router.refresh();
    return true;
  };

  async function konfirmasiHapus() {
    if (!produkDipilih || sedangMenghapus) return;
    setSedangMenghapus(true);
    setNotifikasi(null);
    try {
      const hasil = await hapusProduk(produkDipilih.id);
      if (hasil?.error) {
        setNotifikasi({ tipe: "error", pesan: hasil.error });
        return;
      }
      setNotifikasi({ tipe: "success", pesan: hasil?.success || "Produk berhasil dihapus." });
      setProdukDipilih(null);
      router.refresh();
    } catch {
      setNotifikasi({
        tipe: "error",
        pesan: "Terjadi kesalahan saat menghapus produk. Silakan coba lagi.",
      });
    } finally {
      setSedangMenghapus(false);
    }
  }

  async function jalankanAksi(kunci, aksi, pesanSukses) {
    if (sibuk) return;
    setSibuk(kunci);
    setNotifikasi(null);
    try {
      const hasil = await aksi();
      tampilkanHasil(hasil, pesanSukses);
    } catch {
      setNotifikasi({
        tipe: "error",
        pesan: "Terjadi kesalahan. Silakan coba lagi.",
      });
    } finally {
      setSibuk("");
    }
  }

  return (
    <>
      {notifikasi && (!produkDipilih || notifikasi.tipe !== "error") && (
        <div
          role={notifikasi.tipe === "error" ? "alert" : "status"}
          className={`rounded-xl border p-3.5 text-sm font-semibold ${
            notifikasi.tipe === "error"
              ? "border-error/30 bg-error/10 text-error"
              : "border-success/30 bg-success/10 text-success"
          }`}
        >
          {notifikasi.pesan}
        </div>
      )}

      <div className="overflow-x-auto rounded-[20px] border-[1.5px] border-border bg-surface shadow-warm">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-border bg-primary-soft/40 text-secondary">
            <tr>
              <th className="px-4 py-4 font-heading text-base font-bold">Produk</th>
              <th className="px-4 py-4 font-heading text-base font-bold">Kategori</th>
              <th className="px-4 py-4 font-heading text-base font-bold">Harga</th>
              <th className="px-4 py-4 font-heading text-base font-bold">Stok</th>
              <th className="px-4 py-4 font-heading text-base font-bold">Status</th>
              <th className="px-4 py-4 text-right font-heading text-base font-bold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {daftarProduk.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-text-muted">
                  <p className="font-semibold text-secondary">Belum ada produk donat</p>
                  <p className="mt-1 text-xs text-text-muted">
                    Data dari database Supabase masih kosong.
                  </p>
                </td>
              </tr>
            ) : (
              daftarProduk.map((produk, indeks) => (
                <tr key={produk.id} className="transition-colors hover:bg-bg/40">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={produk.foto_url || "/produk/nastar.svg"}
                        alt={produk.nama}
                        loading="lazy"
                        className="h-12 w-12 shrink-0 rounded-xl border border-border bg-bg/50 object-cover"
                      />
                      <div>
                        <span className="font-bold text-secondary">{produk.nama}</span>
                        <div className="mt-0.5 flex flex-wrap gap-1.5 text-[11px] text-text-muted">
                          <span>Urutan {produk.urutan}</span>
                          {produk.badge && <span>• {produk.badge}</span>}
                          {produk.varian?.length > 0 && (
                            <span>• {produk.varian.length} varian</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="rounded-full bg-primary-soft px-3 py-0.5 text-xs font-bold text-primary">
                      {produk.kategori_nama || "Tanpa kategori"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-primary">
                    {formatRupiah(produk.harga_efektif)}
                    {produk.harga_diskon !== null && (
                      <span className="block text-[11px] font-semibold text-text-muted line-through">
                        {formatRupiah(produk.harga)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    {produk.stok <= 0 ? (
                      <span className="font-bold text-error">Habis</span>
                    ) : (
                      <span className="font-semibold text-text">{produk.stok}</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`rounded-full px-3 py-0.5 text-xs font-bold ${
                        produk.aktif
                          ? "bg-success/15 text-success"
                          : "bg-error/10 text-error"
                      }`}
                    >
                      {produk.aktif ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap justify-end gap-1.5">
                      <Button
                        type="button"
                        variant="tertiary"
                        size="sm"
                        aria-label={`Naikkan urutan ${produk.nama}`}
                        disabled={Boolean(sibuk) || indeks === 0}
                        loading={sibuk === `naik-${produk.id}`}
                        onClick={() =>
                          jalankanAksi(
                            `naik-${produk.id}`,
                            () => pindahkanUrutanProduk(produk.id, "naik"),
                            "Urutan berhasil dinaikkan."
                          )
                        }
                      >
                        ↑
                      </Button>
                      <Button
                        type="button"
                        variant="tertiary"
                        size="sm"
                        aria-label={`Turunkan urutan ${produk.nama}`}
                        disabled={Boolean(sibuk) || indeks === daftarProduk.length - 1}
                        loading={sibuk === `turun-${produk.id}`}
                        onClick={() =>
                          jalankanAksi(
                            `turun-${produk.id}`,
                            () => pindahkanUrutanProduk(produk.id, "turun"),
                            "Urutan berhasil diturunkan."
                          )
                        }
                      >
                        ↓
                      </Button>
                      <Button
                        type="button"
                        variant={produk.aktif ? "secondary" : "primary"}
                        size="sm"
                        disabled={Boolean(sibuk)}
                        loading={sibuk === `status-${produk.id}`}
                        onClick={() =>
                          jalankanAksi(
                            `status-${produk.id}`,
                            () => ubahStatusProduk(produk.id, !produk.aktif),
                            "Status produk berhasil diubah."
                          )
                        }
                      >
                        {produk.aktif ? "Nonaktifkan" : "Aktifkan"}
                      </Button>
                      <Button href={`/admin/produk/${produk.id}/ubah`} variant="secondary" size="sm">
                        Ubah
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        disabled={Boolean(sibuk)}
                        onClick={() => {
                          setNotifikasi(null);
                          setProdukDipilih(produk);
                        }}
                      >
                        Hapus
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby="konfirmasi-hapus-judul"
        onCancel={(event) => {
          event.preventDefault();
          if (!sedangMenghapus) setProdukDipilih(null);
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-[20px] border-[1.5px] border-border bg-surface p-6 text-text shadow-warm-lg backdrop:bg-secondary/60 sm:p-8"
      >
        {produkDipilih && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 id="konfirmasi-hapus-judul" className="font-heading text-2xl font-bold text-secondary">
                Hapus produk?
              </h2>
              <p className="mt-2 text-sm text-text-muted">
                Produk <span className="font-bold text-secondary">{produkDipilih.nama}</span> akan
                dihapus permanen beserta foto dan datanya. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            {notifikasi?.tipe === "error" && (
              <div
                role="alert"
                className="rounded-xl border border-error/30 bg-error/10 p-3.5 text-sm font-semibold text-error"
              >
                {notifikasi.pesan}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                disabled={sedangMenghapus}
                onClick={() => setProdukDipilih(null)}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="danger"
                loading={sedangMenghapus}
                disabled={sedangMenghapus}
                onClick={konfirmasiHapus}
              >
                {sedangMenghapus ? "Menghapus..." : "Ya, Hapus"}
              </Button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
