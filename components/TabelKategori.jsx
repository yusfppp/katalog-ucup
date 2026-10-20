"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { hapusKategori } from "@/lib/actions/kategori";

export default function TabelKategori({ daftarKategori = [] }) {
  const router = useRouter();
  const [sibuk, setSibuk] = useState(null);
  const [notifikasi, setNotifikasi] = useState(null);
  const [konfirmasi, setKonfirmasi] = useState(null);

  async function hapus(kategori) {
    setSibuk(kategori.id);
    setNotifikasi(null);
    try {
      const hasil = await hapusKategori(kategori.id);
      if (hasil?.error) {
        setNotifikasi({ tipe: "error", pesan: hasil.error });
      } else {
        setNotifikasi({ tipe: "success", pesan: hasil?.success || "Kategori dihapus." });
        setKonfirmasi(null);
        router.refresh();
      }
    } catch {
      setNotifikasi({ tipe: "error", pesan: "Terjadi kesalahan saat menghapus kategori." });
    } finally {
      setSibuk(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {notifikasi && (
        <div
          role={notifikasi.tipe === "error" ? "alert" : "status"}
          className={`rounded-xl border p-3 text-sm font-semibold ${
            notifikasi.tipe === "error"
              ? "border-error/30 bg-error/10 text-error"
              : "border-success/30 bg-success/10 text-success"
          }`}
        >
          {notifikasi.pesan}
        </div>
      )}

      <div className="overflow-x-auto rounded-[20px] border-[1.5px] border-border bg-surface shadow-warm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border bg-primary-soft/40 text-secondary">
            <tr>
              <th className="px-4 py-4 font-heading text-base font-bold">Nama Kategori</th>
              <th className="px-4 py-4 font-heading text-base font-bold">Slug</th>
              <th className="px-4 py-4 font-heading text-base font-bold">Jumlah Produk</th>
              <th className="px-4 py-4 text-right font-heading text-base font-bold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {daftarKategori.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-text-muted">
                  Belum ada kategori. Tambahkan kategori pertama di form atas.
                </td>
              </tr>
            ) : (
              daftarKategori.map((kategori) => (
                <tr key={kategori.id} className="hover:bg-bg/40">
                  <td className="px-4 py-3.5 font-bold text-secondary">{kategori.nama}</td>
                  <td className="px-4 py-3.5 font-mono text-xs text-text-muted">{kategori.slug}</td>
                  <td className="px-4 py-3.5">
                    <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-bold text-primary">
                      {kategori.jumlah} produk
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        href={`/admin/kategori?ubah=${kategori.id}`}
                        variant="secondary"
                        size="sm"
                      >
                        Ubah
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        disabled={Boolean(sibuk)}
                        loading={sibuk === kategori.id}
                        onClick={() => {
                          setNotifikasi(null);
                          setKonfirmasi(kategori);
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

      {konfirmasi && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="konfirmasi-kategori-judul"
          className="rounded-[20px] border-[1.5px] border-error/40 bg-surface p-5 shadow-warm"
        >
          <h3 id="konfirmasi-kategori-judul" className="font-heading text-lg font-bold text-secondary">
            Hapus kategori “{konfirmasi.nama}”?
          </h3>
          <p className="mt-1 text-sm text-text-muted">
            Kategori yang masih dipakai produk akan ditolak oleh server. Pindahkan produknya lebih
            dulu jika perlu.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="danger"
              loading={sibuk === konfirmasi.id}
              disabled={Boolean(sibuk)}
              onClick={() => hapus(konfirmasi)}
            >
              Ya, Hapus
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={Boolean(sibuk)}
              onClick={() => setKonfirmasi(null)}
            >
              Batal
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
