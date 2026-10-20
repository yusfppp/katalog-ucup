"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatRupiah } from "@/lib/format";
import Button from "@/components/Button";
import { hapusProduk } from "@/app/admin/actions";

export default function TabelProduk({ daftarProduk = [] }) {
  const router = useRouter();
  const dialogRef = useRef(null);
  const [produkDipilih, setProdukDipilih] = useState(null);
  const [sedangMenghapus, setSedangMenghapus] = useState(false);
  const [notifikasi, setNotifikasi] = useState(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (produkDipilih && !dialog.open) {
      dialog.showModal();
    } else if (!produkDipilih && dialog.open) {
      dialog.close();
    }
  }, [produkDipilih]);

  async function konfirmasiHapus() {
    if (!produkDipilih || sedangMenghapus) {
      return;
    }

    setSedangMenghapus(true);
    setNotifikasi(null);

    try {
      const hasil = await hapusProduk(produkDipilih.id);
      if (hasil?.error) {
        setNotifikasi({ tipe: "error", pesan: hasil.error });
        return;
      }

      if (!hasil?.success) {
        setNotifikasi({
          tipe: "error",
          pesan: "Server tidak mengembalikan hasil penghapusan yang valid.",
        });
        return;
      }

      setNotifikasi({ tipe: "success", pesan: hasil.success });
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
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-primary-soft/40 text-secondary border-b border-border">
            <tr>
              <th className="px-5 py-4 font-bold font-heading text-base">Produk Donat</th>
              <th className="px-5 py-4 font-bold font-heading text-base">Kategori</th>
              <th className="px-5 py-4 font-bold font-heading text-base">Harga</th>
              <th className="px-5 py-4 font-bold font-heading text-base text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {daftarProduk.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-text-muted">
                  <p className="font-semibold text-secondary">Belum ada produk donat</p>
                  <p className="text-xs text-text-muted mt-1">Data dari database Supabase masih kosong.</p>
                </td>
              </tr>
            ) : (
              daftarProduk.map((produk) => (
                <tr key={produk.id} className="hover:bg-bg/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={produk.foto_url || "/produk/kopi.svg"}
                        alt={produk.nama}
                        loading="lazy"
                        className="h-11 w-11 rounded-xl object-cover border border-border bg-bg/50 shrink-0"
                      />
                      <span className="font-bold text-secondary">{produk.nama}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="rounded-full bg-primary-soft px-3 py-0.5 text-xs font-bold text-primary">
                      {produk.kategori || "Donat"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-primary">
                    {formatRupiah(produk.harga)}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        href={`/admin/produk/${produk.id}/ubah`}
                        variant="secondary"
                        size="sm"
                      >
                        Ubah
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
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
          if (!sedangMenghapus) {
            setProdukDipilih(null);
          }
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
                Produk <span className="font-bold text-secondary">{produkDipilih.nama}</span> akan dihapus
                permanen. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            {notifikasi?.tipe === "error" && (
              <div role="alert" className="rounded-xl border border-error/30 bg-error/10 p-3.5 text-sm font-semibold text-error">
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
