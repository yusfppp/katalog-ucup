import NavAdmin from "@/components/NavAdmin";
import FormAkun from "@/components/FormAkun";
import TabelAkun from "@/components/TabelAkun";
import { wajibAdmin } from "@/lib/auth";
import { buatKlienAuthAdmin } from "@/lib/supabase/server";
import { tambahAdmin } from "@/lib/actions/akun";

export const dynamic = "force-dynamic";

function akunAktif(user) {
  if (!user?.banned_until) return true;
  return new Date(user.banned_until).getTime() <= Date.now();
}

export default async function HalamanAkun() {
  const adminSekarang = await wajibAdmin();

  let daftarAdmin = [];
  let pesanError = null;

  try {
    const supabase = buatKlienAuthAdmin();
    const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (error) throw new Error(error.message);

    daftarAdmin = (data?.users || [])
      .map((user) => ({
        id: user.id,
        email: user.email || "-",
        aktif: akunAktif(user),
        banned_until: user.banned_until || null,
        last_sign_in_at: user.last_sign_in_at || null,
        created_at: user.created_at || null,
      }))
      .sort((a, b) => String(a.email).localeCompare(String(b.email)));
  } catch (err) {
    pesanError = err.message;
  }

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-4 py-8 sm:px-6">
      <NavAdmin />

      <div>
        <h1 className="font-heading text-3xl font-bold text-secondary sm:text-4xl">Kelola Akun Admin</h1>
        <p className="mt-1 text-sm text-text-muted">
          Tambah admin baru, nonaktifkan sementara, atau hapus akun. Kamu tidak bisa menonaktifkan
          atau menghapus akunmu sendiri.
        </p>
      </div>

      {pesanError && (
        <div
          role="alert"
          className="rounded-xl border border-error/30 bg-error/10 p-3.5 text-sm font-semibold text-error"
        >
          Gagal memuat daftar admin: {pesanError}. Pastikan `SUPABASE_SECRET_KEY` sudah diisi.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:items-start">
        <FormAkun action={tambahAdmin} />
        <TabelAkun daftarAdmin={daftarAdmin} adminSekarangId={adminSekarang?.id || ""} />
      </div>
    </div>
  );
}
