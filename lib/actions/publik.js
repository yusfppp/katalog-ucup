"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { buatKlienServer } from "@/lib/supabase/server";
import {
  validasiPertanyaanAI,
  validasiUlasan,
} from "@/lib/validasi";
import { ambilProdukByIds, ambilProdukDetail, ambilProdukUntukKeranjang } from "@/lib/produk";
import { buatPromptTanyaProduk, panggilGemini } from "@/lib/gemini";
import { batasiKunci, kunciRateLimit } from "@/lib/rate-limit";

async function ipPengunjung() {
  try {
    const header = await headers();
    const ip =
      header.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      header.get("x-real-ip") ||
      "tanpa-ip";
    return ip.slice(0, 80);
  } catch {
    return "tanpa-ip";
  }
}

export async function kirimUlasan(prevState, formData) {
  const produkId = Number(formData.get("produk_id"));
  if (!Number.isSafeInteger(produkId) || produkId <= 0) {
    return { error: "Produk tidak valid.", fieldErrors: {} };
  }

  const honeypot = formData.get("website")?.toString() || "";
  const cek = validasiUlasan({
    nama: formData.get("nama"),
    rating: formData.get("rating"),
    komentar: formData.get("komentar"),
    website: honeypot,
  });

  if (!cek.valid) {
    return {
      error: cek.errors.umum || "Periksa kembali ulasan yang diisi.",
      fieldErrors: cek.errors,
    };
  }

  const ip = await ipPengunjung();
  const batas = batasiKunci(kunciRateLimit("ulasan", ip), {
    maks: 5,
    jendelaMs: 10 * 60 * 1000,
  });
  if (!batas.diizinkan) {
    return {
      error: `Terlalu banyak mengirim ulasan. Coba lagi dalam ${Math.ceil(
        batas.detikTunggu / 60
      )} menit.`,
      fieldErrors: {},
    };
  }

  try {
    const produk = await ambilProdukDetail(produkId);
    if (!produk.data) {
      return { error: "Produk tidak ditemukan atau sudah tidak aktif.", fieldErrors: {} };
    }

    const supabase = buatKlienServer();
    const { error } = await supabase.from("ulasan").insert({
      produk_id: produkId,
      nama: cek.data.nama,
      rating: cek.data.rating,
      komentar: cek.data.komentar,
      tampil: true,
    });

    if (error) {
      return { error: `Gagal menyimpan ulasan: ${error.message}`, fieldErrors: {} };
    }

    revalidatePath(`/produk/${produkId}`);
    revalidatePath("/");
    return { success: "Terima kasih! Ulasan kamu sudah tampil." };
  } catch (err) {
    return { error: err.message || "Terjadi kesalahan saat menyimpan ulasan.", fieldErrors: {} };
  }
}

export async function catatKlikWA(produkIds = []) {
  try {
    const daftar = (Array.isArray(produkIds) ? produkIds : [produkIds])
      .map((id) => Number(id))
      .filter((id) => Number.isSafeInteger(id) && id > 0)
      .slice(0, 20);

    const supabase = buatKlienServer();

    if (daftar.length === 0) {
      await supabase.from("klik_wa").insert({ produk_id: null });
      return { success: true };
    }

    const { data } = await supabase.from("produk").select("id").in("id", daftar);
    const idsValid = (data || []).map((item) => Number(item.id));
    if (idsValid.length === 0) {
      return { success: true };
    }

    await supabase.from("klik_wa").insert(idsValid.map((id) => ({ produk_id: id })));
    return { success: true };
  } catch {
    // Pencatatan klik tidak boleh menghambat pembukaan WhatsApp.
    return { success: false };
  }
}

export async function tanyaProdukAI(prevState, formData) {
  const produkId = Number(formData.get("produk_id"));
  if (!Number.isSafeInteger(produkId) || produkId <= 0) {
    return { error: "Produk tidak valid." };
  }

  const cek = validasiPertanyaanAI(formData.get("pertanyaan"));
  if (!cek.valid) return { error: cek.error };

  const ip = await ipPengunjung();
  const batas = batasiKunci(kunciRateLimit("tanya-ai", ip), {
    maks: 6,
    jendelaMs: 10 * 60 * 1000,
  });
  if (!batas.diizinkan) {
    return {
      error: `Terlalu banyak pertanyaan. Coba lagi dalam ${Math.ceil(
        batas.detikTunggu / 60
      )} menit.`,
    };
  }

  try {
    const { data: produk } = await ambilProdukDetail(produkId);
    if (!produk) return { error: "Produk tidak ditemukan atau sudah tidak aktif." };

    const hasil = await panggilGemini(
      buatPromptTanyaProduk({ produk, pertanyaan: cek.pertanyaan }),
      { timeoutMs: 15000, temperature: 0.4 }
    );

    if (hasil.error) return { error: hasil.error };
    return { jawaban: hasil.teks };
  } catch (err) {
    return { error: err.message || "Terjadi kesalahan saat menghubungi asisten AI." };
  }
}

export async function ambilProdukUntukDaftar(ids = []) {
  const hasil = await ambilProdukByIds(ids, { hanyaAktif: true });
  if (hasil.error) return { data: [], error: hasil.error };
  return {
    data: hasil.data.map((produk) => ({
      id: produk.id,
      nama: produk.nama,
      harga: produk.harga,
      harga_diskon: produk.harga_diskon,
      harga_efektif: produk.harga_efektif,
      harga_mulai: produk.harga_mulai,
      stok: produk.stok,
      aktif: produk.aktif,
      foto_url: produk.foto_url,
      kategori_nama: produk.kategori_nama,
      kategori_slug: produk.kategori_slug,
      badge: produk.badge,
      varian: produk.varian,
    })),
    error: null,
  };
}

export async function periksaKeranjang(items = []) {
  const daftar = Array.isArray(items) ? items.slice(0, 50) : [];
  const ids = daftar.map((item) => Number(item?.id)).filter((id) => Number.isSafeInteger(id));
  const hasil = await ambilProdukUntukKeranjang(ids);

  if (hasil.error) return { data: [], error: hasil.error };

  const peta = new Map(hasil.data.map((produk) => [Number(produk.id), produk]));
  const status = daftar.map((item) => {
    const produk = peta.get(Number(item.id));
    if (!produk) return { id: item.id, status: "dihapus", stok: 0, aktif: false };
    return {
      id: produk.id,
      nama: produk.nama,
      harga: Number(produk.harga_diskon ?? produk.harga),
      harga_normal: Number(produk.harga),
      stok: Number(produk.stok ?? 0),
      aktif: produk.aktif !== false,
      status:
        produk.aktif === false
          ? "nonaktif"
          : Number(produk.stok ?? 0) <= 0
          ? "habis"
          : Number(item.jumlah || 0) > Number(produk.stok ?? 0)
          ? "stok-kurang"
          : "tersedia",
    };
  });

  return { data: status, error: null };
}
