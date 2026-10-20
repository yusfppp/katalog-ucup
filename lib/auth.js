import { redirect } from "next/navigation";
import { buatKlienSesiAdmin } from "@/lib/supabase/server";

/**
 * Satu helper terpusat untuk memeriksa sesi admin di server.
 * Mengembalikan user Supabase atau null.
 */
export async function ambilAdmin() {
  try {
    const supabase = await buatKlienSesiAdmin();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

/**
 * Dipakai halaman /admin: redirect ke login bila belum masuk.
 */
export async function wajibAdmin() {
  const user = await ambilAdmin();
  if (!user) {
    redirect("/admin/login");
  }
  return user;
}

export const PESAN_TOLAK = "Akses ditolak: silakan login sebagai admin terlebih dahulu.";

/**
 * Dipakai Server Action: mengembalikan { user } atau { error }.
 */
export async function ambilAdminAksi() {
  const user = await ambilAdmin();
  if (!user) {
    return { user: null, error: PESAN_TOLAK };
  }
  return { user, error: null };
}
