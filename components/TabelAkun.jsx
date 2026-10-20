"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { formatTanggalWaktu } from "@/lib/format";
import { hapusAdmin, ubahStatusAdmin } from "@/lib/actions/akun";

export default function TabelAkun({ daftarAdmin = [], adminSekarangId = "" }) {
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

      <div className="overflow-x-auto rounded-[20px] border-[1.5px] border-border bg-surface shadow-warm">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-border bg-primary-soft/40 text-secondary">
            <tr>
              <th className="px-4 py-4 font-heading text-base font-bold">Email</th>
              <th className="px-4 py-4 font-heading text-base font-bold">Status</th>
              <th className="px-4 py-4 font-heading text-base font-bold">Terakhir Masuk</th>
              <th className="px-4 py-4 text-right font-heading text-base font-bold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {daftarAdmin.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-text-muted">
                  Belum ada akun admin.
                </td>
              </tr>
            ) : (
              daftarAdmin.map((admin) => {
                const akunSendiri = String(admin.id) === String(adminSekarangId);
                return (
                  <tr key={admin.id} className="hover:bg-bg/40">
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-secondary">{admin.email}</p>
                      {akunSendiri && (
                        <span className="text-xs font-semibold text-primary">Akun kamu</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          admin.aktif
                            ? "bg-success/15 text-success"
                            : "bg-error/10 text-error"
                        }`}
                      >
                        {admin.aktif ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-text-muted">
                      {admin.last_sign_in_at ? formatTanggalWaktu(admin.last_sign_in_at) : "Belum pernah"}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          type="button"
                          variant={admin.aktif ? "tertiary" : "primary"}
                          size="sm"
                          loading={sibuk === `status-${admin.id}`}
                          disabled={Boolean(sibuk) || akunSendiri || !admin.bisaDiubah}
                          onClick={() =>
                            jalankan(`status-${admin.id}`, () =>
                              ubahStatusAdmin(admin.id, !admin.aktif)
                            )
                          }
                        >
                          {admin.aktif ? "Nonaktifkan" : "Aktifkan"}
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          disabled={Boolean(sibuk) || akunSendiri}
                          onClick={() => {
                            setNotifikasi(null);
                            setKonfirmasi(admin);
                          }}
                        >
                          Hapus
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {konfirmasi && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="hapus-admin-judul"
          className="rounded-[20px] border-[1.5px] border-error/40 bg-surface p-5 shadow-warm"
        >
          <h3 id="hapus-admin-judul" className="font-heading text-lg font-bold text-secondary">
            Hapus admin “{konfirmasi.email}”?
          </h3>
          <p className="mt-1 text-sm text-text-muted">
            Akun akan dihapus permanen dari Supabase Auth. Tindakan ini tidak bisa dibatalkan.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="danger"
              loading={sibuk === `hapus-${konfirmasi.id}`}
              disabled={Boolean(sibuk)}
              onClick={() => jalankan(`hapus-${konfirmasi.id}`, () => hapusAdmin(konfirmasi.id))}
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
