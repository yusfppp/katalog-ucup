"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ambilAdminAksi } from "@/lib/auth";
import { buatKlienSesiAdmin, buatKlienServer } from "@/lib/supabase/server";
import { catatLog } from "@/lib/log";
import {
  bilanganBulat,
  validasiFileFoto,
  validasiProduk,
} from "@/lib/validasi";
import { hapusFotoStorage, unggahFoto } from "@/lib/storage";
import { buatPromptDeskripsi, panggilGemini } from "@/lib/gemini";

const FOTO_BAWAAN = "/produk/nastar.svg";

function pesanDb(error) {
  if (
    /column .* does not exist|schema cache|relation .* does not exist/i.test(
      error?.message || ""
    )
  ) {
    return "Skema database belum diperbarui. Jalankan docs/migration-fitur-bonus.sql di Supabase SQL Editor.";
  }
  return error?.message || "Terjadi kesalahan pada database.";
}

function ambilNilai(formData, nama) {
  return formData.get(nama)?.toString().trim() ?? "";
}

function ambilDaftar(formData, nama) {
  return formData.getAll(nama).map((item) => item?.toString() ?? "");
}

function revalidasiProduk(id) {
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/kategori", "layout");
  if (id) revalidatePath(`/produk/${id}`);
  revalidatePath("/sitemap.xml");
}

async function ambilKategoriIds() {
  try {
    const supabase = buatKlienServer();
    const { data } = await supabase.from("kategori").select("id");
    return (data || []).map((item) => Number(item.id));
  } catch {
    return [];
  }
}

async function namaKategori(kategoriId) {
  try {
    const supabase = buatKlienServer();
    const { data } = await supabase
      .from("kategori")
      .select("nama")
      .eq("id", kategoriId)
      .maybeSingle();
    return data?.nama || null;
  } catch {
    return null;
  }
}

async function urutanTerakhir() {
  try {
    const supabase = buatKlienServer();
    const { data } = await supabase
      .from("produk")
      .select("urutan")
      .order("urutan", { ascending: false })
      .limit(1)
      .maybeSingle();
    return Number(data?.urutan || 0) + 1;
  } catch {
    return 1;
  }
}

function dataProdukDariForm(formData, hasilValidasi) {
  return {
    nama: ambilNilai(formData, "nama"),
    harga: ambilNilai(formData, "harga"),
    harga_diskon: ambilNilai(formData, "harga_diskon"),
    stok: ambilNilai(formData, "stok"),
    kategori_id: ambilNilai(formData, "kategori_id"),
    deskripsi: ambilNilai(formData, "deskripsi"),
    badge: ambilNilai(formData, "badge"),
    aktif: formData.get("aktif") !== null,
    varian_label: ambilDaftar(formData, "varian_label"),
    varian_harga: ambilDaftar(formData, "varian_harga"),
    ...hasilValidasi,
  };
}

async function simpanVarian(supabase, produkId, varian) {
  const { error: hapusError } = await supabase
    .from("varian_produk")
    .delete()
    .eq("produk_id", produkId);
  if (hapusError) return hapusError;

  if (!varian.length) return null;

  const { error } = await supabase.from("varian_produk").insert(
    varian.map((item, indeks) => ({
      produk_id: produkId,
      label: item.label,
      harga: item.harga,
      urutan: indeks,
    }))
  );
  return error;
}

async function gantiGaleri(supabase, produkId, daftarUrl) {
  const unik = [...new Set(daftarUrl.filter(Boolean))];
  const { error: hapusError } = await supabase
    .from("foto_produk")
    .delete()
    .eq("produk_id", produkId);
  if (hapusError) return hapusError;

  if (!unik.length) return null;

  const { error } = await supabase.from("foto_produk").insert(
    unik.map((url, indeks) => ({
      produk_id: produkId,
      url,
      urutan: indeks,
    }))
  );
  return error;
}

export async function tambahProduk(prevState, formData) {
  const { user, error: authError } = await ambilAdminAksi();
  if (!user) return { error: authError, fieldErrors: {} };

  const kategoriIds = await ambilKategoriIds();
  const cek = validasiProduk(dataProdukDariForm(formData, {}), { kategoriIds });
  if (!cek.valid) {
    return {
      error: "Periksa kembali data produk yang diisi.",
      fieldErrors: cek.errors,
    };
  }

  const fotoUtama = formData.get("foto");
  const cekFoto = validasiFileFoto(fotoUtama);
  if (!cekFoto.valid) {
    return { error: cekFoto.error, fieldErrors: { foto: cekFoto.error } };
  }

  const fileTambahan = formData
    .getAll("foto_tambahan")
    .filter((file) => file && typeof file !== "string" && file.size > 0);

  for (const file of fileTambahan) {
    const cekFile = validasiFileFoto(file);
    if (!cekFile.valid) {
      return { error: cekFile.error, fieldErrors: { foto_tambahan: cekFile.error } };
    }
  }

  const diunggah = [];
  try {
    let urlUtama = FOTO_BAWAAN;
    if (cekFoto.file) {
      const hasil = await unggahFoto(cekFoto.file, { folder: "produk" });
      if (hasil.error) {
        return { error: hasil.error, fieldErrors: { foto: hasil.error } };
      }
      urlUtama = hasil.url;
      diunggah.push(hasil.url);
    }

    const urlTambahan = [];
    for (const file of fileTambahan) {
      const hasil = await unggahFoto(file, { folder: "produk" });
      if (hasil.error) {
        await hapusFotoStorage(diunggah);
        return { error: hasil.error, fieldErrors: { foto_tambahan: hasil.error } };
      }
      urlTambahan.push(hasil.url);
      diunggah.push(hasil.url);
    }

    const kategoriNama = await namaKategori(cek.data.kategori_id);
    const urutan = await urutanTerakhir();
    const supabase = await buatKlienSesiAdmin();

    const { data: produkBaru, error: insertError } = await supabase
      .from("produk")
      .insert({
        nama: cek.data.nama,
        harga: cek.data.harga,
        harga_diskon: cek.data.harga_diskon,
        stok: cek.data.stok,
        kategori_id: cek.data.kategori_id,
        kategori: kategoriNama,
        deskripsi: cek.data.deskripsi,
        badge: cek.data.badge,
        aktif: cek.data.aktif,
        urutan,
        foto_url: urlUtama,
      })
      .select("id")
      .single();

    if (insertError) {
      await hapusFotoStorage(diunggah);
      return { error: `Gagal menyimpan produk: ${pesanDb(insertError)}`, fieldErrors: {} };
    }

    const galeriError = await gantiGaleri(supabase, produkBaru.id, [urlUtama, ...urlTambahan]);
    const varianError = await simpanVarian(supabase, produkBaru.id, cek.data.varian);

    if (galeriError || varianError) {
      await supabase.from("produk").delete().eq("id", produkBaru.id);
      await hapusFotoStorage(diunggah);
      return {
        error: `Gagal menyimpan detail produk: ${pesanDb(galeriError || varianError)}`,
        fieldErrors: {},
      };
    }

    await catatLog({
      adminEmail: user.email,
      aksi: "tambah",
      entitas: "produk",
      detail: `Menambah produk "${cek.data.nama}" (ID ${produkBaru.id}).`,
    });

    revalidasiProduk(produkBaru.id);
  } catch (err) {
    await hapusFotoStorage(diunggah);
    return { error: err.message || "Terjadi kesalahan saat menyimpan produk.", fieldErrors: {} };
  }

  redirect("/admin?sukses=" + encodeURIComponent("Produk berhasil ditambahkan."));
}

export async function ubahProduk(id, prevState, formData) {
  const { user, error: authError } = await ambilAdminAksi();
  if (!user) return { error: authError, fieldErrors: {} };

  const idAngka = bilanganBulat(id);
  if (!idAngka || idAngka <= 0) {
    return { error: "ID produk tidak valid.", fieldErrors: {} };
  }

  const kategoriIds = await ambilKategoriIds();
  const cek = validasiProduk(dataProdukDariForm(formData, {}), { kategoriIds });
  if (!cek.valid) {
    return {
      error: "Periksa kembali data produk yang diisi.",
      fieldErrors: cek.errors,
    };
  }

  const fotoBaru = formData.get("foto");
  const cekFoto = validasiFileFoto(fotoBaru);
  if (!cekFoto.valid) {
    return { error: cekFoto.error, fieldErrors: { foto: cekFoto.error } };
  }

  const fileTambahan = formData
    .getAll("foto_tambahan")
    .filter((file) => file && typeof file !== "string" && file.size > 0);
  for (const file of fileTambahan) {
    const cekFile = validasiFileFoto(file);
    if (!cekFile.valid) {
      return { error: cekFile.error, fieldErrors: { foto_tambahan: cekFile.error } };
    }
  }

  let lama;
  try {
    const supabaseBaca = buatKlienServer();
    const { data, error } = await supabaseBaca
      .from("produk")
      .select("id, nama, foto_url, foto_produk ( id, url, urutan )")
      .eq("id", idAngka)
      .maybeSingle();
    if (error) return { error: pesanDb(error), fieldErrors: {} };
    if (!data) return { error: "Produk tidak ditemukan.", fieldErrors: {} };
    lama = data;
  } catch (err) {
    return { error: err.message || "Gagal membaca produk.", fieldErrors: {} };
  }

  const fotoLama = lama.foto_produk || [];
  const idDihapus = new Set(
    ambilDaftar(formData, "hapus_foto")
      .map((nilai) => Number(nilai))
      .filter((nilai) => Number.isSafeInteger(nilai) && nilai > 0)
  );
  const galeriLamaTambahan = fotoLama.filter((item) => Number(item.urutan) > 0);
  const urlDihapus = galeriLamaTambahan
    .filter((item) => idDihapus.has(Number(item.id)))
    .map((item) => item.url);

  const diunggah = [];
  try {
    let urlUtama = lama.foto_url || FOTO_BAWAAN;
    if (cekFoto.file) {
      const hasil = await unggahFoto(cekFoto.file, { folder: "produk" });
      if (hasil.error) {
        return { error: hasil.error, fieldErrors: { foto: hasil.error } };
      }
      urlUtama = hasil.url;
      diunggah.push(hasil.url);
    }

    const urlTambahanBaru = [];
    for (const file of fileTambahan) {
      const hasil = await unggahFoto(file, { folder: "produk" });
      if (hasil.error) {
        await hapusFotoStorage(diunggah);
        return { error: hasil.error, fieldErrors: { foto_tambahan: hasil.error } };
      }
      urlTambahanBaru.push(hasil.url);
      diunggah.push(hasil.url);
    }

    const galeriDipertahankan = galeriLamaTambahan
      .filter((item) => !idDihapus.has(Number(item.id)))
      .map((item) => item.url);
    const galeriBaru = [urlUtama, ...galeriDipertahankan, ...urlTambahanBaru];

    const kategoriNama = await namaKategori(cek.data.kategori_id);
    const supabase = await buatKlienSesiAdmin();

    const { error: updateError } = await supabase
      .from("produk")
      .update({
        nama: cek.data.nama,
        harga: cek.data.harga,
        harga_diskon: cek.data.harga_diskon,
        stok: cek.data.stok,
        kategori_id: cek.data.kategori_id,
        kategori: kategoriNama,
        deskripsi: cek.data.deskripsi,
        badge: cek.data.badge,
        aktif: cek.data.aktif,
        foto_url: urlUtama,
      })
      .eq("id", idAngka);

    if (updateError) {
      await hapusFotoStorage(diunggah);
      return { error: `Gagal menyimpan perubahan: ${pesanDb(updateError)}`, fieldErrors: {} };
    }

    const galeriError = await gantiGaleri(supabase, idAngka, galeriBaru);
    const varianError = await simpanVarian(supabase, idAngka, cek.data.varian);

    if (galeriError || varianError) {
      await hapusFotoStorage(diunggah);
      return {
        error: `Perubahan produk tersimpan, tetapi detail gagal disimpan: ${pesanDb(
          galeriError || varianError
        )}`,
        fieldErrors: {},
      };
    }

    const urlTakDipakai = [
      ...urlDihapus,
      ...(cekFoto.file && lama.foto_url ? [lama.foto_url] : []),
    ];
    if (urlTakDipakai.length) {
      await hapusFotoStorage(urlTakDipakai);
    }

    await catatLog({
      adminEmail: user.email,
      aksi: "ubah",
      entitas: "produk",
      detail: `Mengubah produk "${cek.data.nama}" (ID ${idAngka}).`,
    });

    revalidasiProduk(idAngka);
  } catch (err) {
    await hapusFotoStorage(diunggah);
    return { error: err.message || "Terjadi kesalahan saat mengubah produk.", fieldErrors: {} };
  }

  redirect("/admin?sukses=" + encodeURIComponent("Perubahan produk berhasil disimpan."));
}

export async function hapusProduk(id) {
  const { user, error: authError } = await ambilAdminAksi();
  if (!user) return { error: authError };

  const idAngka = bilanganBulat(id);
  if (!idAngka || idAngka <= 0) return { error: "ID produk tidak valid." };

  let produk;
  try {
    const supabaseBaca = buatKlienServer();
    const { data, error } = await supabaseBaca
      .from("produk")
      .select("id, nama, foto_url, foto_produk ( id, url )")
      .eq("id", idAngka)
      .maybeSingle();
    if (error) return { error: pesanDb(error) };
    if (!data) return { error: "Produk tidak ditemukan atau sudah dihapus." };
    produk = data;
  } catch (err) {
    return { error: err.message || "Gagal memeriksa produk." };
  }

  try {
    const supabase = await buatKlienSesiAdmin();
    const { data, error } = await supabase
      .from("produk")
      .delete()
      .eq("id", idAngka)
      .select("id")
      .maybeSingle();

    if (error) return { error: `Gagal menghapus produk: ${pesanDb(error)}` };
    if (!data) return { error: "Produk tidak ditemukan atau sudah dihapus." };
  } catch (err) {
    return { error: err.message || "Terjadi kesalahan saat menghapus produk." };
  }

  const semuaFoto = [
    produk.foto_url,
    ...(produk.foto_produk || []).map((item) => item.url),
  ];
  const hasilStorage = await hapusFotoStorage(semuaFoto);

  await catatLog({
    adminEmail: user.email,
    aksi: "hapus",
    entitas: "produk",
    detail: `Menghapus produk "${produk.nama}" (ID ${idAngka}).`,
  });

  revalidasiProduk(idAngka);

  return {
    success: hasilStorage.sukses
      ? "Produk dan fotonya berhasil dihapus."
      : "Produk berhasil dihapus, tetapi sebagian foto gagal dihapus dari storage.",
  };
}

export async function ubahStatusProduk(id, aktif) {
  const { user, error: authError } = await ambilAdminAksi();
  if (!user) return { error: authError };

  const idAngka = bilanganBulat(id);
  if (!idAngka || idAngka <= 0) return { error: "ID produk tidak valid." };

  try {
    const supabase = await buatKlienSesiAdmin();
    const { data, error } = await supabase
      .from("produk")
      .update({ aktif: Boolean(aktif) })
      .eq("id", idAngka)
      .select("id, nama")
      .maybeSingle();

    if (error) return { error: `Gagal mengubah status: ${pesanDb(error)}` };
    if (!data) return { error: "Produk tidak ditemukan." };

    await catatLog({
      adminEmail: user.email,
      aksi: aktif ? "aktifkan" : "nonaktifkan",
      entitas: "produk",
      detail: `${aktif ? "Mengaktifkan" : "Menonaktifkan"} produk "${data.nama}" (ID ${idAngka}).`,
    });

    revalidasiProduk(idAngka);
    return { success: `Produk berhasil ${aktif ? "diaktifkan" : "dinonaktifkan"}.` };
  } catch (err) {
    return { error: err.message || "Terjadi kesalahan saat mengubah status." };
  }
}

export async function pindahkanUrutanProduk(id, arah) {
  const { user, error: authError } = await ambilAdminAksi();
  if (!user) return { error: authError };
  if (!["naik", "turun"].includes(arah)) return { error: "Arah urutan tidak valid." };

  const idAngka = bilanganBulat(id);
  if (!idAngka || idAngka <= 0) return { error: "ID produk tidak valid." };

  try {
    const supabaseBaca = buatKlienServer();
    const { data, error } = await supabaseBaca
      .from("produk")
      .select("id, nama, urutan")
      .order("urutan", { ascending: true, nullsFirst: false })
      .order("id", { ascending: true });

    if (error) return { error: pesanDb(error) };

    const daftar = data || [];
    const indeks = daftar.findIndex((item) => Number(item.id) === idAngka);
    if (indeks < 0) return { error: "Produk tidak ditemukan." };

    const indeksTetangga = arah === "naik" ? indeks - 1 : indeks + 1;
    if (indeksTetangga < 0 || indeksTetangga >= daftar.length) {
      return { success: "Produk sudah berada di posisi paling ujung." };
    }

    const sekarang = daftar[indeks];
    const tetangga = daftar[indeksTetangga];
    const urutanSekarang = Number(sekarang.urutan ?? indeks + 1);
    const urutanTetangga = Number(tetangga.urutan ?? indeksTetangga + 1);

    const supabase = await buatKlienSesiAdmin();
    const { error: error1 } = await supabase
      .from("produk")
      .update({ urutan: urutanTetangga })
      .eq("id", sekarang.id);
    if (error1) return { error: pesanDb(error1) };

    const { error: error2 } = await supabase
      .from("produk")
      .update({ urutan: urutanSekarang })
      .eq("id", tetangga.id);
    if (error2) {
      await supabase.from("produk").update({ urutan: urutanSekarang }).eq("id", sekarang.id);
      return { error: pesanDb(error2) };
    }

    await catatLog({
      adminEmail: user.email,
      aksi: "urutan",
      entitas: "produk",
      detail: `Menaikkan/menurunkan urutan "${sekarang.nama}" ke posisi ${indeksTetangga + 1}.`,
    });

    revalidasiProduk(sekarang.id);
    return { success: "Urutan produk berhasil diubah." };
  } catch (err) {
    return { error: err.message || "Terjadi kesalahan saat mengubah urutan." };
  }
}

export async function buatDeskripsiAI(nama, kategoriId) {
  const { user, error: authError } = await ambilAdminAksi();
  if (!user) return { error: authError };

  const namaBersih = String(nama || "").trim().slice(0, 120);
  if (!namaBersih) {
    return { error: "Isi nama produk terlebih dahulu sebelum membuat deskripsi." };
  }

  const kategori = kategoriId ? await namaKategori(Number(kategoriId)) : null;
  const hasil = await panggilGemini(buatPromptDeskripsi({ nama: namaBersih, kategori }));

  if (hasil.error) return { error: hasil.error };

  await catatLog({
    adminEmail: user.email,
    aksi: "buat_deskripsi_ai",
    entitas: "produk",
    detail: `Membuat draf deskripsi AI untuk "${namaBersih}".`,
  });

  return { deskripsi: hasil.teks };
}
