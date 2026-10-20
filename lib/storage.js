import { randomUUID } from "node:crypto";
import { buatKlienServer } from "@/lib/supabase/server";
import { validasiFileFoto } from "@/lib/validasi";

export const BUCKET_FOTO = "foto-produk";

function ekstensiDari(nama, tipe) {
  const namaLower = String(nama || "").toLowerCase();
  if (namaLower.endsWith(".jpg") || namaLower.endsWith(".jpeg")) return "jpg";
  if (namaLower.endsWith(".png")) return "png";
  if (namaLower.endsWith(".webp")) return "webp";
  if (tipe === "image/png") return "png";
  if (tipe === "image/webp") return "webp";
  return "jpg";
}

function tipeSesuaiIsi(buffer, tipe) {
  if (!buffer || buffer.length < 12) return false;
  const jpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const png =
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47;
  const webp =
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP";

  if (tipe === "image/jpeg") return jpeg;
  if (tipe === "image/png") return png;
  if (tipe === "image/webp") return webp;
  return jpeg || png || webp;
}

/**
 * Mengambil bucket dan path dari URL publik Supabase Storage.
 * URL non-Supabase (mis. /produk/kopi.svg) diabaikan.
 */
export function ambilReferensiStorage(url) {
  if (!url || !/^https?:\/\//i.test(url)) return null;

  let urlFoto;
  let urlSupabase;
  try {
    urlFoto = new URL(url);
    const supabaseUrl = process.env.SUPABASE_URL?.trim()
      .replace(/\/rest\/v1\/?$/, "")
      .replace(/\/+$/, "");
    if (!supabaseUrl) return null;
    urlSupabase = new URL(supabaseUrl);
  } catch {
    return null;
  }

  if (urlFoto.origin !== urlSupabase.origin) return null;

  const prefix = `${urlSupabase.pathname.replace(/\/+$/, "")}/storage/v1/object/`;
  if (!urlFoto.pathname.startsWith(prefix)) return null;

  const bagian = urlFoto.pathname.slice(prefix.length);
  const cocok = bagian.match(/^(?:public|sign|authenticated)\/([^/]+)\/(.+)$/);
  if (!cocok) return null;

  try {
    return {
      bucket: decodeURIComponent(cocok[1]),
      path: decodeURIComponent(cocok[2]),
    };
  } catch {
    return null;
  }
}

export async function unggahFoto(file, { folder = "produk" } = {}) {
  const cek = validasiFileFoto(file);
  if (!cek.valid) return { error: cek.error };
  if (!cek.file) return { url: null, path: null };

  let buffer;
  try {
    buffer = Buffer.from(await file.arrayBuffer());
  } catch {
    return { error: "Gagal membaca file foto." };
  }

  if (!tipeSesuaiIsi(buffer, file.type)) {
    return { error: "Isi file tidak cocok dengan tipe gambar JPG, PNG, atau WEBP." };
  }

  const ekstensi = ekstensiDari(file.name, file.type);
  const namaAman = `${folder}/${Date.now()}-${randomUUID()}.${ekstensi}`;

  try {
    const supabase = buatKlienServer();
    const { error } = await supabase.storage.from(BUCKET_FOTO).upload(namaAman, buffer, {
      contentType: file.type,
      upsert: false,
      cacheControl: "31536000",
    });

    if (error) {
      return { error: `Gagal mengunggah foto: ${error.message}` };
    }

    const { data } = supabase.storage.from(BUCKET_FOTO).getPublicUrl(namaAman);
    return { url: data.publicUrl, path: namaAman };
  } catch (err) {
    return { error: err.message || "Gagal mengunggah foto ke storage." };
  }
}

export async function hapusFotoStorage(urls = []) {
  const daftar = [...new Set((Array.isArray(urls) ? urls : [urls]).filter(Boolean))];
  if (daftar.length === 0) return { sukses: true };

  const perBucket = new Map();
  for (const url of daftar) {
    const ref = ambilReferensiStorage(url);
    if (!ref) continue;
    if (!perBucket.has(ref.bucket)) perBucket.set(ref.bucket, []);
    perBucket.get(ref.bucket).push(ref.path);
  }

  if (perBucket.size === 0) return { sukses: true };

  try {
    const supabase = buatKlienServer();
    for (const [bucket, paths] of perBucket.entries()) {
      const { error } = await supabase.storage.from(bucket).remove(paths);
      if (error) {
        return { sukses: false, error: error.message };
      }
    }
    return { sukses: true };
  } catch (err) {
    return { sukses: false, error: err.message || "Gagal menghapus foto dari storage." };
  }
}
