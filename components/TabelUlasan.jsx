"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconStar } from "@tabler/icons-react";
import Button from "@/components/Button";
import BintangRating from "@/components/BintangRating";
import { formatTanggal } from "@/lib/format";
import { hapusUlasan, ubahStatusUlasan } from "@/lib/actions/ulasan-admin";

export default function TabelUlasan({ daftarUlasan = [] }) {
  const router = useRouter();
  const [sibuk, setSibuk] = useState(null);
  const [notifikasi, setNotifikasi] = useState(null);
  const [konfirmasi, setKonfirmasi] = useState(null);

  async function jalankan(kunci, aksi) {
    setSibuk(kunci);
    setNotifikasi(null);
    try {
      const hasil = await aksi();
      if (hasil?.error) {
        setNotifikasi({ tipe: "error", pesan: hasil.error });
      } else {
        setNotifikasi({ tipe: "success", pesan: hasil?.success || "Berhasil." });
        setKonfirmasi(null);
        router.refresh();
      }
    } catch {
      setNotifikasi({ tipe: "error", pesan: "Terjadi kesalahan. Coba lagi." });
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

      {daftarUlasan.length === 0 ? (
        <div className="rounded-[20px] border-[1.5px] border-border bg-surface p-8 text-center shadow-warm">
          <IconStar size={40} stroke={1.6} aria-hidden="true" className="text-accent" />
          <p className="mt-2 font-heading text-xl font-bold text-secondary">Belum ada ulasan</p>
          <p className="mt-1 text-sm text-text-muted">
            Ulasan dari pengunjung akan muncul di sini untuk dimoderasi.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {daftarUlasan.map((ulasan) => (
            <article
              key={ulasan.id}
              className="flex flex-col gap-3 rounded-[20px] border-[1.5px] border-border bg-surface p-4 shadow-warm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-heading text-lg font-bold text-secondary">{ulasan.nama}</h3>
                    <BintangRating nilai={Number(ulasan.rating) || 0} size={15} />
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        ulasan.tampil
                          ? "bg-success/15 text-success"
                          : "bg-error/10 text-error"
                      }`}
                    >
                      {ulasan.tampil ? "Tampil" : "Disembunyikan"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-text-muted">
                    {ulasan.produk_nama || "Produk tidak ditemukan"} •{" "}
                    {formatTanggal(ulasan.created_at)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant={ulasan.tampil ? "tertiary" : "primary"}
                    size="sm"
                    loading={sibuk === `status-${ulasan.id}`}
                    disabled={Boolean(sibuk)}
                    onClick={() =>
                      jalankan(`status-${ulasan.id}`, () =>
                        ubahStatusUlasan(ulasan.id, !ulasan.tampil)
                      )
                    }
                  >
                    {ulasan.tampil ? "Sembunyikan" : "Tampilkan"}
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    disabled={Boolean(sibuk)}
                    onClick={() => {
                      setNotifikasi(null);
                      setKonfirmasi(ulasan);
                    }}
                  >
                    Hapus
                  </Button>
                </div>
              </div>
              <p className="whitespace-pre-line text-sm text-text">{ulasan.komentar}</p>
            </article>
          ))}
        </div>
      )}

      {konfirmasi && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="hapus-ulasan-judul"
          className="rounded-[20px] border-[1.5px] border-error/40 bg-surface p-5 shadow-warm"
        >
          <h3 id="hapus-ulasan-judul" className="font-heading text-lg font-bold text-secondary">
            Hapus ulasan dari “{konfirmasi.nama}”?
          </h3>
          <p className="mt-1 text-sm text-text-muted">
            Ulasan akan dihapus permanen dari database.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="danger"
              loading={sibuk === `hapus-${konfirmasi.id}`}
              disabled={Boolean(sibuk)}
              onClick={() => jalankan(`hapus-${konfirmasi.id}`, () => hapusUlasan(konfirmasi.id))}
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
