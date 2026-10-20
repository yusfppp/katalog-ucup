"use server";

import { revalidatePath } from "next/cache";
import { ambilAdminAksi } from "@/lib/auth";
import { buatKlienServer, buatKlienSesiAdmin } from "@/lib/supabase/server";
import { catatLog } from "@/lib/log";
import { BATAS, booleanDari, validasiProduk } from "@/lib/validasi";
import { parseCSVKeObjek } from "@/lib/csv";

const FOTO_BAWAAN = "/produk/nastar.svg";

function ringkasError(fieldErrors) {
  return Object.values(fieldErrors).filter(Boolean).slice(0, 2).join(" ");
}

export async function imporProduk(prevState, formData) {
  const { user, error: authError } = await ambilAdminAksi();
  if (!user) return { error: authError, fieldErrors: {} };

  const file = formData.get("file");
  if (!file || typeof file === "string" || !file.size) {
    return { error: "Pilih file CSV terlebih dahulu.", fieldErrors: { file: "File CSV wajib diunggah." } };
  }

  const namaFile = String(file.name || "").toLowerCase();
  if (!namaFile.endsWith(".csv")) {
    return { error: "File harus berformat .csv.", fieldErrors: { file: "Gunakan file .csv." } };
  }
  if (file.size > BATAS.ukuranCSV) {
    return {
      error: "Ukuran file CSV maksimal 512KB.",
      fieldErrors: { file: "Ukuran file terlalu besar (maksimal 512KB)." },
    };
  }

  let teks;
  try {
    teks = await file.text();
  } catch {
    return { error: "Gagal membaca file CSV.", fieldErrors: { file: "File tidak bisa dibaca." } };
  }

  const hasilParse = parseCSVKeObjek(teks);
  if (hasilParse.error) {
    return { error: hasilParse.error, fieldErrors: { file: hasilParse.error } };
  }
  if (hasilParse.data.length === 0) {
    return { error: "File CSV tidak berisi baris produk.", fieldErrors: { file: "CSV kosong." } };
  }
  if (hasilParse.data.length > BATAS.jumlahImpor) {
    return {
      error: `Maksimal ${BATAS.jumlahImpor} baris per impor.`,
      fieldErrors: { file: `File berisi ${hasilParse.data.length} baris.` },
    };
  }

  let kategori;
  let maxUrutan = 0;
  try {
    const secret = buatKlienServer();
    const [kategoriRes, urutanRes] = await Promise.all([
      secret.from("kategori").select("id, nama, slug"),
      secret.from("produk").select("urutan").order("urutan", { ascending: false }).limit(1).maybeSingle(),
    ]);

    if (kategoriRes.error) {
      return { error: `Gagal memuat kategori: ${kategoriRes.error.message}`, fieldErrors: {} };
    }

    kategori = kategoriRes.data || [];
    maxUrutan = Number(urutanRes.data?.urutan || 0);
  } catch (err) {
    return { error: err.message || "Gagal menyiapkan impor.", fieldErrors: {} };
  }

  const petaKategori = new Map();
  for (const item of kategori) {
    petaKategori.set(item.nama.toLowerCase(), item);
    petaKategori.set(item.slug.toLowerCase(), item);
  }
  const kategoriIds = kategori.map((item) => Number(item.id));

  const valid = [];
  const gagal = [];

  for (const baris of hasilParse.data) {
    const namaKategori = String(baris.kategori || "").trim();
    const kategoriData = petaKategori.get(namaKategori.toLowerCase());

    if (!kategoriData) {
      gagal.push({
        baris: baris.__baris,
        alasan: `Kategori "${namaKategori || "(kosong)"}" tidak ditemukan. Buat kategorinya dulu di /admin/kategori.`,
      });
      continue;
    }

    const fotoUrl = String(baris.foto_url || "").trim() || FOTO_BAWAAN;
    if (!/^(https?:\/\/|\/)/.test(fotoUrl)) {
      gagal.push({ baris: baris.__baris, alasan: "foto_url harus berupa path /... atau URL http(s)." });
      continue;
    }

    const cek = validasiProduk(
      {
        nama: baris.nama,
        harga: baris.harga,
        harga_diskon: baris.harga_diskon,
        stok: baris.stok,
        kategori_id: kategoriData.id,
        deskripsi: baris.deskripsi,
        badge: baris.badge,
        aktif: booleanDari(baris.aktif, true),
      },
      { kategoriIds }
    );

    if (!cek.valid) {
      gagal.push({ baris: baris.__baris, alasan: ringkasError(cek.errors) });
      continue;
    }

    valid.push({
      baris: baris.__baris,
      data: {
        ...cek.data,
        kategori: kategoriData.nama,
        foto_url: fotoUrl,
        urutan: maxUrutan + valid.length + 1,
      },
    });
  }

  let berhasil = 0;
  if (valid.length > 0) {
    try {
      const supabase = await buatKlienSesiAdmin();
      const { data, error } = await supabase
        .from("produk")
        .insert(
          valid.map((item) => ({
            nama: item.data.nama,
            harga: item.data.harga,
            harga_diskon: item.data.harga_diskon,
            stok: item.data.stok,
            kategori_id: item.data.kategori_id,
            kategori: item.data.kategori,
            deskripsi: item.data.deskripsi,
            foto_url: item.data.foto_url,
            badge: item.data.badge,
            aktif: item.data.aktif,
            urutan: item.data.urutan,
          }))
        )
        .select("id, foto_url");

      if (error) {
        return {
          error: `Gagal menyimpan baris valid: ${error.message}`,
          fieldErrors: {},
          ringkasan: { berhasil: 0, gagal: gagal.length + valid.length },
          errors: gagal,
        };
      }

      berhasil = data?.length || 0;

      if (data?.length) {
        await supabase.from("foto_produk").insert(
          data.map((produk, indeks) => ({
            produk_id: produk.id,
            url: produk.foto_url || FOTO_BAWAAN,
            urutan: 0,
          }))
        );
      }
    } catch (err) {
      return {
        error: err.message || "Terjadi kesalahan saat menyimpan hasil impor.",
        fieldErrors: {},
        ringkasan: { berhasil: 0, gagal: gagal.length + valid.length },
        errors: gagal,
      };
    }
  }

  await catatLog({
    adminEmail: user.email,
    aksi: "impor",
    entitas: "produk",
    detail: `Impor CSV: ${berhasil} berhasil, ${gagal.length} gagal dari ${hasilParse.data.length} baris.`,
  });

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/sitemap.xml");

  return {
    success: `Impor selesai: ${berhasil} berhasil, ${gagal.length} gagal.`,
    ringkasan: { berhasil, gagal: gagal.length, total: hasilParse.data.length },
    errors: gagal,
    fieldErrors: {},
  };
}
