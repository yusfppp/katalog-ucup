/**
 * Rate limit sederhana in-memory. Cocok untuk satu instance server.
 * Di Vercel, batas ini berlaku per instance; tetap memberi perlindungan dasar.
 */
const gudang = globalThis.__alfaBitesRateLimit || new Map();
globalThis.__alfaBitesRateLimit = gudang;

export function batasiKunci(kunci, { maks = 5, jendelaMs = 10 * 60 * 1000 } = {}) {
  const sekarang = Date.now();

  if (gudang.size > 2000) {
    for (const [k, v] of gudang.entries()) {
      if (sekarang - v.mulai > jendelaMs) gudang.delete(k);
    }
  }

  const catatan = gudang.get(kunci);
  if (!catatan || sekarang - catatan.mulai > jendelaMs) {
    gudang.set(kunci, { mulai: sekarang, jumlah: 1 });
    return { diizinkan: true, sisa: maks - 1, detikTunggu: 0 };
  }

  if (catatan.jumlah >= maks) {
    const detikTunggu = Math.ceil((catatan.mulai + jendelaMs - sekarang) / 1000);
    return { diizinkan: false, sisa: 0, detikTunggu };
  }

  catatan.jumlah += 1;
  return { diizinkan: true, sisa: maks - catatan.jumlah, detikTunggu: 0 };
}

export function kunciRateLimit(prefix, ip) {
  return `${prefix}:${String(ip || "tanpa-ip").slice(0, 80)}`;
}
