"use server";

import { revalidatePath } from "next/cache";
import { ambilAdminAksi } from "@/lib/auth";
import { buatKlienSesiAdmin } from "@/lib/supabase/server";
import { catatLog } from "@/lib/log";
import { validasiKategori } from "@/lib/validasi";
import { slugify } from "@/lib/format";

function pesanDb(error) {
  if (/duplicate key|unique constraint/i.test(error?.message || "")) {
    return "Nama atau slug kategori sudah dipakai.";
  }
  return error?.message || "Terjadi kesalahan pada database.";
}

async function slugUnik(supabase, nama, idKecuali = null) {
  const dasar = slugify(nama);
  let kandidat = dasar;
  let nomor = 2;

  while (true) {
    let query = supabase.from("kategori").select("id").eq("slug", kandidat);
    if (idKecuali) query = query.neq("id", idKecuali);
    const { data, error } = await query.maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return kandidat;
    kandidat = `${dasar}-${nomor}`;
    nomor += 1;
    if (nomor > 100) return `${dasar}-${Date.now()}`;
  }
}

async function namaSudahAda(supabase, nama, idKecuali = null) {
  let query = supabase.from("kategori").select("id").ilike("nama", nama);
  if (idKecuali) query = query.neq("id", idKecuali);
  const { data, error } = await query.maybeSingle();
  if (error) throw new Error(error.message);
  return Boolean(data);
}

function revalidasiKategori() {
  revalidatePath("/admin/kategori");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/kategori", "layout");
  revalidatePath("/sitemap.xml");
}

export async function tambahKategori(prevState, formData) {
  const { user, error: authError } = await ambilAdminAksi();
  if (!user) return { error: authError, fieldErrors: {} };

  const cek = validasiKategori(formData.get("nama"));
  if (!cek.valid) return { error: cek.error, fieldErrors: { nama: cek.error } };

  try {
    const supabase = await buatKlienSesiAdmin();

    if (await namaSudahAda(supabase, cek.nama)) {
      return {
        error: "Nama kategori sudah ada.",
        fieldErrors: { nama: "Nama kategori harus unik." },
      };
    }

    const slug = await slugUnik(supabase, cek.nama);
    const { data, error } = await supabase
      .from("kategori")
      .insert({ nama: cek.nama, slug })
      .select("id")
      .single();

    if (error) return { error: pesanDb(error), fieldErrors: {} };

    await catatLog({
      adminEmail: user.email,
      aksi: "tambah",
      entitas: "kategori",
      detail: `Menambah kategori "${cek.nama}" (${slug}).`,
    });

    revalidasiKategori();
    return { success: `Kategori "${cek.nama}" berhasil ditambahkan.`, id: data.id };
  } catch (err) {
    return { error: err.message || "Gagal menambah kategori.", fieldErrors: {} };
  }
}

export async function ubahKategori(id, prevState, formData) {
  const { user, error: authError } = await ambilAdminAksi();
  if (!user) return { error: authError, fieldErrors: {} };

  const idAngka = Number(id);
  if (!Number.isSafeInteger(idAngka) || idAngka <= 0) {
    return { error: "ID kategori tidak valid.", fieldErrors: {} };
  }

  const cek = validasiKategori(formData.get("nama"));
  if (!cek.valid) return { error: cek.error, fieldErrors: { nama: cek.error } };

  try {
    const supabase = await buatKlienSesiAdmin();

    if (await namaSudahAda(supabase, cek.nama, idAngka)) {
      return {
        error: "Nama kategori sudah ada.",
        fieldErrors: { nama: "Nama kategori harus unik." },
      };
    }

    const slug = await slugUnik(supabase, cek.nama, idAngka);
    const { error } = await supabase
      .from("kategori")
      .update({ nama: cek.nama, slug })
      .eq("id", idAngka);

    if (error) return { error: pesanDb(error), fieldErrors: {} };

    // Jaga kompatibilitas kolom teks lama.
    await supabase.from("produk").update({ kategori: cek.nama }).eq("kategori_id", idAngka);

    await catatLog({
      adminEmail: user.email,
      aksi: "ubah",
      entitas: "kategori",
      detail: `Mengubah kategori ID ${idAngka} menjadi "${cek.nama}" (${slug}).`,
    });

    revalidasiKategori();
    return { success: `Kategori berhasil diubah menjadi "${cek.nama}".` };
  } catch (err) {
    return { error: err.message || "Gagal mengubah kategori.", fieldErrors: {} };
  }
}

export async function hapusKategori(id) {
  const { user, error: authError } = await ambilAdminAksi();
  if (!user) return { error: authError };

  const idAngka = Number(id);
  if (!Number.isSafeInteger(idAngka) || idAngka <= 0) {
    return { error: "ID kategori tidak valid." };
  }

  try {
    const supabase = await buatKlienSesiAdmin();
    const { data: kategori, error: bacaError } = await supabase
      .from("kategori")
      .select("id, nama, slug")
      .eq("id", idAngka)
      .maybeSingle();

    if (bacaError) return { error: pesanDb(bacaError) };
    if (!kategori) return { error: "Kategori tidak ditemukan." };

    const { count, error: hitungError } = await supabase
      .from("produk")
      .select("id", { count: "exact", head: true })
      .eq("kategori_id", idAngka);

    if (hitungError) return { error: pesanDb(hitungError) };
    if ((count || 0) > 0) {
      return {
        error: `Kategori "${kategori.nama}" masih dipakai oleh ${count} produk. Pindahkan produk ke kategori lain terlebih dahulu.`,
      };
    }

    // Produk lama yang belum punya kategori_id tetapi teks kategorinya sama.
    const { count: countLama } = await supabase
      .from("produk")
      .select("id", { count: "exact", head: true })
      .is("kategori_id", null)
      .ilike("kategori", kategori.nama);

    if ((countLama || 0) > 0) {
      return {
        error: `Kategori "${kategori.nama}" masih dipakai oleh ${countLama} produk lama. Pindahkan produk tersebut terlebih dahulu.`,
      };
    }

    const { error } = await supabase.from("kategori").delete().eq("id", idAngka);
    if (error) return { error: pesanDb(error) };

    await catatLog({
      adminEmail: user.email,
      aksi: "hapus",
      entitas: "kategori",
      detail: `Menghapus kategori "${kategori.nama}" (${kategori.slug}).`,
    });

    revalidasiKategori();
    return { success: `Kategori "${kategori.nama}" berhasil dihapus.` };
  } catch (err) {
    return { error: err.message || "Gagal menghapus kategori." };
  }
}
