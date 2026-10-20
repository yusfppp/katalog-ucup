"use server";

import { revalidatePath } from "next/cache";
import { ambilAdminAksi } from "@/lib/auth";
import { buatKlienSesiAdmin, buatKlienServer } from "@/lib/supabase/server";
import { catatLog } from "@/lib/log";

async function produkDariUlasan(idUlasan) {
  try {
    const supabase = buatKlienServer();
    const { data } = await supabase
      .from("ulasan")
      .select("id, produk_id, nama, tampil")
      .eq("id", idUlasan)
      .maybeSingle();
    return data || null;
  } catch {
    return null;
  }
}

export async function ubahStatusUlasan(id, tampil) {
  const { user, error: authError } = await ambilAdminAksi();
  if (!user) return { error: authError };

  const idAngka = Number(id);
  if (!Number.isSafeInteger(idAngka) || idAngka <= 0) {
    return { error: "ID ulasan tidak valid." };
  }

  try {
    const supabase = await buatKlienSesiAdmin();
    const { data, error } = await supabase
      .from("ulasan")
      .update({ tampil: Boolean(tampil) })
      .eq("id", idAngka)
      .select("id, produk_id, nama")
      .maybeSingle();

    if (error) return { error: error.message };
    if (!data) return { error: "Ulasan tidak ditemukan." };

    await catatLog({
      adminEmail: user.email,
      aksi: tampil ? "tampilkan" : "sembunyikan",
      entitas: "ulasan",
      detail: `${tampil ? "Menampilkan" : "Menyembunyikan"} ulasan dari "${data.nama}".`,
    });

    revalidatePath("/admin/ulasan");
    revalidatePath("/");
    revalidatePath(`/produk/${data.produk_id}`);
    return { success: `Ulasan berhasil ${tampil ? "ditampilkan" : "disembunyikan"}.` };
  } catch (err) {
    return { error: err.message || "Gagal mengubah status ulasan." };
  }
}

export async function hapusUlasan(id) {
  const { user, error: authError } = await ambilAdminAksi();
  if (!user) return { error: authError };

  const idAngka = Number(id);
  if (!Number.isSafeInteger(idAngka) || idAngka <= 0) {
    return { error: "ID ulasan tidak valid." };
  }

  const ulasan = await produkDariUlasan(idAngka);
  if (!ulasan) return { error: "Ulasan tidak ditemukan." };

  try {
    const supabase = await buatKlienSesiAdmin();
    const { error } = await supabase.from("ulasan").delete().eq("id", idAngka);
    if (error) return { error: error.message };

    await catatLog({
      adminEmail: user.email,
      aksi: "hapus",
      entitas: "ulasan",
      detail: `Menghapus ulasan dari "${ulasan.nama}" (ID ${idAngka}).`,
    });

    revalidatePath("/admin/ulasan");
    revalidatePath("/");
    revalidatePath(`/produk/${ulasan.produk_id}`);
    return { success: "Ulasan berhasil dihapus." };
  } catch (err) {
    return { error: err.message || "Gagal menghapus ulasan." };
  }
}
