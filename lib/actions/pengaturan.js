"use server";

import { revalidatePath } from "next/cache";
import { ambilAdminAksi } from "@/lib/auth";
import { buatKlienSesiAdmin } from "@/lib/supabase/server";
import { catatLog } from "@/lib/log";
import { validasiPengaturan } from "@/lib/validasi";

export async function simpanPengaturan(prevState, formData) {
  const { user, error: authError } = await ambilAdminAksi();
  if (!user) return { error: authError, fieldErrors: {} };

  const cek = validasiPengaturan({
    nama: formData.get("nama"),
    tagline: formData.get("tagline"),
    whatsapp: formData.get("whatsapp"),
    alamat: formData.get("alamat"),
    jam_buka: formData.get("jam_buka"),
    instagram: formData.get("instagram"),
  });

  if (!cek.valid) {
    return { error: "Periksa kembali data toko yang diisi.", fieldErrors: cek.errors };
  }

  try {
    const supabase = await buatKlienSesiAdmin();
    const { error } = await supabase.from("pengaturan_toko").upsert(
      {
        id: 1,
        nama: cek.data.nama,
        tagline: cek.data.tagline,
        whatsapp: cek.data.whatsapp,
        alamat: cek.data.alamat,
        jam_buka: cek.data.jam_buka,
        instagram: cek.data.instagram,
      },
      { onConflict: "id" }
    );

    if (error) {
      if (/relation .* does not exist|schema cache/i.test(error.message || "")) {
        return {
          error:
            "Tabel pengaturan_toko belum ada. Jalankan docs/migration-fitur-bonus.sql di Supabase SQL Editor.",
          fieldErrors: {},
        };
      }
      return { error: `Gagal menyimpan pengaturan: ${error.message}`, fieldErrors: {} };
    }

    await catatLog({
      adminEmail: user.email,
      aksi: "ubah",
      entitas: "pengaturan",
      detail: `Memperbarui pengaturan toko "${cek.data.nama}".`,
    });

    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/tentang");
    revalidatePath("/admin/pengaturan");

    return { success: "Pengaturan toko berhasil disimpan." };
  } catch (err) {
    return { error: err.message || "Terjadi kesalahan saat menyimpan pengaturan.", fieldErrors: {} };
  }
}
