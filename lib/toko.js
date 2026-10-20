import { cache } from "react";
import { buatKlienServer } from "@/lib/supabase/server";
import { TOKO_CADANGAN } from "@/lib/toko-cadangan";

export { TOKO_CADANGAN };

function rapikanPengaturan(data) {
  if (!data) return TOKO_CADANGAN;

  return {
    id: data.id ?? 1,
    nama: data.nama?.trim() || TOKO_CADANGAN.nama,
    tagline: data.tagline?.trim() || TOKO_CADANGAN.tagline,
    nomorWhatsApp: data.whatsapp?.trim() || TOKO_CADANGAN.nomorWhatsApp,
    alamat: data.alamat?.trim() || TOKO_CADANGAN.alamat,
    jamBuka: data.jam_buka?.trim() || TOKO_CADANGAN.jamBuka,
    instagram: data.instagram?.trim() || "",
  };
}

/**
 * Satu helper terpusat untuk identitas toko.
 * Membaca tabel pengaturan_toko, dengan fallback ke nilai lama lib/toko.js.
 */
export const ambilPengaturan = cache(async () => {
  try {
    const supabase = buatKlienServer();
    const { data, error } = await supabase
      .from("pengaturan_toko")
      .select("id, nama, tagline, whatsapp, alamat, jam_buka, instagram")
      .eq("id", 1)
      .maybeSingle();

    if (error || !data) {
      return TOKO_CADANGAN;
    }

    return rapikanPengaturan(data);
  } catch {
    return TOKO_CADANGAN;
  }
});

// Alias lama agar import yang belum sempat diubah tetap berjalan.
export const toko = TOKO_CADANGAN;
