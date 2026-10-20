import NavAdmin from "@/components/NavAdmin";
import Pagination from "@/components/Pagination";
import { wajibAdmin } from "@/lib/auth";
import { buatKlienServer } from "@/lib/supabase/server";
import { formatTanggalWaktu } from "@/lib/format";

export const dynamic = "force-dynamic";

const PER_HALAMAN = 50;

export default async function HalamanLog({ searchParams }) {
  await wajibAdmin();
  const params = await searchParams;
  const hal = Math.max(1, Number.parseInt(params?.hal, 10) || 1);

  let daftar = [];
  let total = 0;
  let pesanError = null;

  try {
    const supabase = buatKlienServer();
    const dari = (hal - 1) * PER_HALAMAN;
    const { data, error, count } = await supabase
      .from("log_aktivitas")
      .select("id, admin_email, aksi, entitas, detail, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(dari, dari + PER_HALAMAN - 1);

    if (error) pesanError = error.message;
    else {
      daftar = data || [];
      total = count || 0;
    }
  } catch (err) {
    pesanError = err.message;
  }

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-4 py-8 sm:px-6">
      <NavAdmin />
      <div>
        <h1 className="font-heading text-3xl font-bold text-secondary sm:text-4xl">
          Log Aktivitas Admin
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Riwayat perubahan terbaru, 50 entri per halaman. Hanya bisa diakses setelah login.
        </p>
      </div>

      {pesanError ? (
        <div
          role="alert"
          className="rounded-xl border border-error/30 bg-error/10 p-3.5 text-sm font-semibold text-error"
        >
          Gagal memuat log: {pesanError}. Pastikan migration database sudah dijalankan.
        </div>
      ) : daftar.length === 0 ? (
        <div className="rounded-[20px] border-[1.5px] border-border bg-surface p-10 text-center shadow-warm">
          <span aria-hidden="true" className="text-5xl">
            📝
          </span>
          <h2 className="mt-3 font-heading text-2xl font-bold text-secondary">Belum ada log</h2>
          <p className="mt-1 text-sm text-text-muted">
            Log akan tercatat otomatis saat admin mengubah data.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[20px] border-[1.5px] border-border bg-surface shadow-warm">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-border bg-primary-soft/40 text-secondary">
              <tr>
                <th className="px-4 py-4 font-heading text-base font-bold">Waktu</th>
                <th className="px-4 py-4 font-heading text-base font-bold">Admin</th>
                <th className="px-4 py-4 font-heading text-base font-bold">Aksi</th>
                <th className="px-4 py-4 font-heading text-base font-bold">Entitas</th>
                <th className="px-4 py-4 font-heading text-base font-bold">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {daftar.map((log) => (
                <tr key={log.id} className="align-top hover:bg-bg/40">
                  <td className="whitespace-nowrap px-4 py-3.5 text-text-muted">
                    {formatTanggalWaktu(log.created_at)}
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-text">{log.admin_email}</td>
                  <td className="px-4 py-3.5">
                    <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-bold capitalize text-primary">
                      {log.aksi}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-semibold capitalize text-text">{log.entitas}</td>
                  <td className="px-4 py-3.5 text-text-muted">{log.detail || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        basePath="/admin/log"
        halaman={hal}
        total={total}
        perHalaman={PER_HALAMAN}
        label="log"
      />
    </div>
  );
}
