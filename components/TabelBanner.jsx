"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconSpeakerphone } from "@tabler/icons-react";
import Button from "@/components/Button";
import { formatTanggal } from "@/lib/format";
import { hapusBanner, ubahStatusBanner } from "@/lib/actions/banner";

export default function TabelBanner({ daftarBanner = [] }) {
  const router = useRouter();
  const [sibuk, setSibuk] = useState(null);
  const [notifikasi, setNotifikasi] = useState(null);
  const [konfirmasi, setKonfirmasi] = useState(null);

  async function jalankan(kunci, aksi) {
    setSibuk(kunci);
    setNotifikasi(null);
    try {
      const hasil = await aksi();
      if (hasil?.error) setNotifikasi({ tipe: "error", pesan: hasil.error });
      else {
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

      {daftarBanner.length === 0 ? (
        <div className="rounded-[20px] border-[1.5px] border-border bg-surface p-8 text-center shadow-warm">
          <IconSpeakerphone
            size={40}
            stroke={1.6}
            aria-hidden="true"
            className="text-primary/70"
          />
          <p className="mt-2 font-heading text-xl font-bold text-secondary">Belum ada banner</p>
          <p className="mt-1 text-sm text-text-muted">
            Tambahkan banner promo agar beranda lebih hidup.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {daftarBanner.map((banner) => (
            <article
              key={banner.id}
              className="flex flex-col gap-3 rounded-[20px] border-[1.5px] border-border bg-surface p-4 shadow-warm sm:flex-row sm:items-center"
            >
              {banner.gambar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={banner.gambar_url}
                  alt=""
                  className="h-20 w-full rounded-xl object-cover sm:w-32"
                />
              ) : (
                <div className="flex h-20 w-full items-center justify-center rounded-xl bg-primary-soft text-primary sm:w-32">
                  <IconSpeakerphone size={30} stroke={1.7} aria-hidden="true" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-heading text-lg font-bold text-secondary">{banner.judul}</h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      banner.aktif
                        ? "bg-success/15 text-success"
                        : "bg-error/10 text-error"
                    }`}
                  >
                    {banner.aktif ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-text-muted">{banner.teks}</p>
                <p className="mt-1 text-xs text-text-muted">
                  Dibuat {formatTanggal(banner.created_at)}
                  {banner.tautan ? ` • ${banner.tautan}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 sm:flex-col">
                <Button href={`/admin/banner?ubah=${banner.id}`} variant="secondary" size="sm">
                  Ubah
                </Button>
                <Button
                  type="button"
                  variant={banner.aktif ? "tertiary" : "primary"}
                  size="sm"
                  loading={sibuk === `status-${banner.id}`}
                  disabled={Boolean(sibuk)}
                  onClick={() =>
                    jalankan(`status-${banner.id}`, () =>
                      ubahStatusBanner(banner.id, !banner.aktif)
                    )
                  }
                >
                  {banner.aktif ? "Nonaktifkan" : "Aktifkan"}
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  disabled={Boolean(sibuk)}
                  onClick={() => {
                    setNotifikasi(null);
                    setKonfirmasi(banner);
                  }}
                >
                  Hapus
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {konfirmasi && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="hapus-banner-judul"
          className="rounded-[20px] border-[1.5px] border-error/40 bg-surface p-5 shadow-warm"
        >
          <h3 id="hapus-banner-judul" className="font-heading text-lg font-bold text-secondary">
            Hapus banner “{konfirmasi.judul}”?
          </h3>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="danger"
              loading={sibuk === `hapus-${konfirmasi.id}`}
              disabled={Boolean(sibuk)}
              onClick={() => jalankan(`hapus-${konfirmasi.id}`, () => hapusBanner(konfirmasi.id))}
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
