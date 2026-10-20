"use server";

import { revalidatePath } from "next/cache";
import { ambilAdminAksi } from "@/lib/auth";
import { buatKlienSesiAdmin, buatKlienServer } from "@/lib/supabase/server";
import { catatLog } from "@/lib/log";
import { validasiBanner, validasiFileFoto } from "@/lib/validasi";
import { hapusFotoStorage, unggahFoto } from "@/lib/storage";

function revalidasiBanner() {
  revalidatePath("/admin/banner");
  revalidatePath("/");
}

function dataBanner(formData) {
  return validasiBanner({
    judul: formData.get("judul"),
    teks: formData.get("teks"),
    tautan: formData.get("tautan"),
  });
}

export async function tambahBanner(prevState, formData) {
  const { user, error: authError } = await ambilAdminAksi();
  if (!user) return { error: authError, fieldErrors: {} };

  const cek = dataBanner(formData);
  if (!cek.valid) return { error: "Periksa kembali data banner.", fieldErrors: cek.errors };

  const file = formData.get("gambar");
  const cekFile = validasiFileFoto(file);
  if (!cekFile.valid) return { error: cekFile.error, fieldErrors: { gambar: cekFile.error } };

  let urlGambar = null;
  try {
    if (cekFile.file) {
      const hasil = await unggahFoto(cekFile.file, { folder: "banner" });
      if (hasil.error) return { error: hasil.error, fieldErrors: { gambar: hasil.error } };
      urlGambar = hasil.url;
    }

    const supabase = await buatKlienSesiAdmin();
    const { error } = await supabase.from("banner").insert({
      judul: cek.data.judul,
      teks: cek.data.teks,
      tautan: cek.data.tautan,
      gambar_url: urlGambar,
      aktif: formData.get("aktif") !== null,
    });

    if (error) {
      await hapusFotoStorage([urlGambar]);
      return { error: `Gagal menyimpan banner: ${error.message}`, fieldErrors: {} };
    }

    await catatLog({
      adminEmail: user.email,
      aksi: "tambah",
      entitas: "banner",
      detail: `Menambah banner "${cek.data.judul}".`,
    });

    revalidasiBanner();
    return { success: "Banner berhasil ditambahkan." };
  } catch (err) {
    await hapusFotoStorage([urlGambar]);
    return { error: err.message || "Gagal menambah banner.", fieldErrors: {} };
  }
}

export async function ubahBanner(id, prevState, formData) {
  const { user, error: authError } = await ambilAdminAksi();
  if (!user) return { error: authError, fieldErrors: {} };

  const idAngka = Number(id);
  if (!Number.isSafeInteger(idAngka) || idAngka <= 0) {
    return { error: "ID banner tidak valid.", fieldErrors: {} };
  }

  const cek = dataBanner(formData);
  if (!cek.valid) return { error: "Periksa kembali data banner.", fieldErrors: cek.errors };

  const file = formData.get("gambar");
  const cekFile = validasiFileFoto(file);
  if (!cekFile.valid) return { error: cekFile.error, fieldErrors: { gambar: cekFile.error } };

  let urlBaru = null;
  try {
    const secret = buatKlienServer();
    const { data: lama, error: bacaError } = await secret
      .from("banner")
      .select("id, judul, gambar_url")
      .eq("id", idAngka)
      .maybeSingle();

    if (bacaError) return { error: bacaError.message, fieldErrors: {} };
    if (!lama) return { error: "Banner tidak ditemukan.", fieldErrors: {} };

    if (cekFile.file) {
      const hasil = await unggahFoto(cekFile.file, { folder: "banner" });
      if (hasil.error) return { error: hasil.error, fieldErrors: { gambar: hasil.error } };
      urlBaru = hasil.url;
    }

    const supabase = await buatKlienSesiAdmin();
    const { error } = await supabase
      .from("banner")
      .update({
        judul: cek.data.judul,
        teks: cek.data.teks,
        tautan: cek.data.tautan,
        gambar_url: urlBaru || lama.gambar_url,
        aktif: formData.get("aktif") !== null,
      })
      .eq("id", idAngka);

    if (error) {
      await hapusFotoStorage([urlBaru]);
      return { error: `Gagal mengubah banner: ${error.message}`, fieldErrors: {} };
    }

    if (urlBaru && lama.gambar_url) {
      await hapusFotoStorage([lama.gambar_url]);
    }

    await catatLog({
      adminEmail: user.email,
      aksi: "ubah",
      entitas: "banner",
      detail: `Mengubah banner "${cek.data.judul}" (ID ${idAngka}).`,
    });

    revalidasiBanner();
    return { success: "Banner berhasil diubah." };
  } catch (err) {
    await hapusFotoStorage([urlBaru]);
    return { error: err.message || "Gagal mengubah banner.", fieldErrors: {} };
  }
}

export async function ubahStatusBanner(id, aktif) {
  const { user, error: authError } = await ambilAdminAksi();
  if (!user) return { error: authError };

  const idAngka = Number(id);
  if (!Number.isSafeInteger(idAngka) || idAngka <= 0) {
    return { error: "ID banner tidak valid." };
  }

  try {
    const supabase = await buatKlienSesiAdmin();
    const { data, error } = await supabase
      .from("banner")
      .update({ aktif: Boolean(aktif) })
      .eq("id", idAngka)
      .select("judul")
      .maybeSingle();

    if (error) return { error: error.message };
    if (!data) return { error: "Banner tidak ditemukan." };

    await catatLog({
      adminEmail: user.email,
      aksi: aktif ? "aktifkan" : "nonaktifkan",
      entitas: "banner",
      detail: `${aktif ? "Mengaktifkan" : "Menonaktifkan"} banner "${data.judul}".`,
    });

    revalidasiBanner();
    return { success: `Banner berhasil ${aktif ? "diaktifkan" : "dinonaktifkan"}.` };
  } catch (err) {
    return { error: err.message || "Gagal mengubah status banner." };
  }
}

export async function hapusBanner(id) {
  const { user, error: authError } = await ambilAdminAksi();
  if (!user) return { error: authError };

  const idAngka = Number(id);
  if (!Number.isSafeInteger(idAngka) || idAngka <= 0) {
    return { error: "ID banner tidak valid." };
  }

  try {
    const supabase = await buatKlienSesiAdmin();
    const { data, error } = await supabase
      .from("banner")
      .delete()
      .eq("id", idAngka)
      .select("judul, gambar_url")
      .maybeSingle();

    if (error) return { error: error.message };
    if (!data) return { error: "Banner tidak ditemukan." };

    await hapusFotoStorage([data.gambar_url]);

    await catatLog({
      adminEmail: user.email,
      aksi: "hapus",
      entitas: "banner",
      detail: `Menghapus banner "${data.judul}".`,
    });

    revalidasiBanner();
    return { success: "Banner berhasil dihapus." };
  } catch (err) {
    return { error: err.message || "Gagal menghapus banner." };
  }
}
