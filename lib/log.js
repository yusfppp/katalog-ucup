import { buatKlienServer } from "@/lib/supabase/server";

/**
 * Helper terpusat pencatatan aktivitas admin.
 * Kegagalan mencatat log tidak boleh menggagalkan aksi utama.
 */
export async function catatLog({ adminEmail, aksi, entitas, detail = null }) {
  try {
    const supabase = buatKlienServer();
    await supabase.from("log_aktivitas").insert({
      admin_email: String(adminEmail || "admin"),
      aksi: String(aksi || "ubah"),
      entitas: String(entitas || "-"),
      detail: detail ? String(detail).slice(0, 500) : null,
    });
  } catch {
    // Sengaja diabaikan: log bukan bagian dari transaksi utama.
  }
}
