import "server-only";
import { buatKlienServer } from "@/lib/supabase/server";
import { slugify } from "@/lib/format";

export const PRODUK_PER_HALAMAN = 12;
export const ADMIN_PER_HALAMAN = 10;

const SELECT_PRODUK = `
  *,
  kategori:kategori_id ( id, nama, slug ),
  foto_produk ( id, url, urutan ),
  varian_produk ( id, label, harga, urutan )
`;

function errorSkema(error) {
  if (!error) return false;
  const kode = String(error.code || "");
  return (
    ["42703", "42P01", "PGRST200", "PGRST204", "PGRST205"].some((awal) =>
      kode.startsWith(awal)
    ) || /does not exist|schema cache|could not find/i.test(error.message || "")
  );
}

export function normalisasiProduk(produk) {
  if (!produk) return null;

  const kategoriData = Array.isArray(produk.kategori) ? produk.kategori[0] : produk.kategori;
  const kategoriNama =
    (kategoriData && typeof kategoriData === "object" ? kategoriData.nama : null) ||
    (typeof produk.kategori === "string" ? produk.kategori : null) ||
    "Tanpa kategori";
  const kategoriSlug =
    (kategoriData && typeof kategoriData === "object" ? kategoriData.slug : null) ||
    slugify(kategoriNama);

  const varian = [...(produk.varian_produk || [])]
    .filter((item) => item && item.label)
    .sort((a, b) => (a.urutan ?? 0) - (b.urutan ?? 0) || Number(a.id) - Number(b.id))
    .map((item) => ({ ...item, harga: Number(item.harga) || 0 }));

  const foto = [...(produk.foto_produk || [])]
    .filter((item) => item && item.url)
    .sort((a, b) => (a.urutan ?? 0) - (b.urutan ?? 0) || Number(a.id) - Number(b.id));

  const galeri = [];
  for (const url of [produk.foto_url, ...foto.map((item) => item.url)]) {
    if (url && !galeri.includes(url)) galeri.push(url);
  }

  const harga = Number(produk.harga) || 0;
  const hargaDiskon =
    produk.harga_diskon === null || produk.harga_diskon === undefined
      ? null
      : Number(produk.harga_diskon);
  const hargaEfektif = hargaDiskon !== null && hargaDiskon < harga ? hargaDiskon : harga;
  const hargaVarian = varian.map((item) => item.harga).filter((n) => n > 0);
  const hargaMulai = hargaVarian.length
    ? Math.min(hargaEfektif, ...hargaVarian)
    : hargaEfektif;

  return {
    ...produk,
    harga,
    harga_diskon: hargaDiskon,
    harga_efektif: hargaEfektif,
    harga_mulai: hargaMulai,
    stok: produk.stok === null || produk.stok === undefined ? 20 : Number(produk.stok),
    aktif: produk.aktif !== false,
    urutan: produk.urutan === null || produk.urutan === undefined ? 0 : Number(produk.urutan),
    badge: produk.badge || null,
    kategori_id: produk.kategori_id ?? kategoriData?.id ?? null,
    kategori_nama: kategoriNama,
    kategori_slug: kategoriSlug,
    varian,
    galeri_urls: galeri.length ? galeri : ["/produk/nastar.svg"],
    stok_habis: Number(produk.stok ?? 20) <= 0,
  };
}

function polaCari(q) {
  const aman = String(q || "").trim().slice(0, 100).replace(/[\\%_]/g, "\\$&");
  return `%${aman}%`;
}

function terapkanUrutan(query, urut) {
  switch (urut) {
    case "terbaru":
      return query.order("created_at", { ascending: false }).order("id", { ascending: false });
    case "termurah":
      return query.order("harga", { ascending: true }).order("id", { ascending: true });
    case "termahal":
      return query.order("harga", { ascending: false }).order("id", { ascending: false });
    case "pilihan":
    default:
      return query
        .order("urutan", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });
  }
}

function produkLegacy() {
  return [
    "id",
    "nama",
    "harga",
    "deskripsi",
    "foto_url",
    "kategori",
    "created_at",
  ];
}

async function ambilSemuaLegacy(supabase) {
  const { data, error } = await supabase
    .from("produk")
    .select(produkLegacy().join(","))
    .order("created_at", { ascending: false });

  if (error) return { data: [], error };
  return { data: (data || []).map(normalisasiProduk), error: null };
}

function filterLegacy(daftar, { q = "", kategoriSlug = "", urut = "pilihan", hal = 1, perHalaman = 12 }) {
  let hasil = [...daftar];
  const cari = String(q || "").trim().toLowerCase();
  if (cari) {
    hasil = hasil.filter((produk) => produk.nama.toLowerCase().includes(cari));
  }
  if (kategoriSlug) {
    hasil = hasil.filter((produk) => produk.kategori_slug === kategoriSlug);
  }

  switch (urut) {
    case "terbaru":
      hasil.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      break;
    case "termurah":
      hasil.sort((a, b) => a.harga - b.harga);
      break;
    case "termahal":
      hasil.sort((a, b) => b.harga - a.harga);
      break;
    default:
      hasil.sort((a, b) => a.urutan - b.urutan || new Date(b.created_at) - new Date(a.created_at));
  }

  const total = hasil.length;
  const mulai = (Math.max(1, hal) - 1) * perHalaman;
  return { data: hasil.slice(mulai, mulai + perHalaman), count: total };
}

export async function ambilKategoriPublik() {
  try {
    const supabase = buatKlienServer();
    const { data, error } = await supabase
      .from("kategori")
      .select("id, nama, slug")
      .order("nama", { ascending: true });

    if (!error && data) {
      return { data, error: null };
    }

    if (error && !errorSkema(error)) {
      return { data: [], error: error.message };
    }
  } catch (err) {
    return { data: [], error: err.message };
  }

  // Fallback skema lama: susun kategori dari kolom teks produk.
  try {
    const supabase = buatKlienServer();
    const { data, error } = await supabase
      .from("produk")
      .select("kategori")
      .not("kategori", "is", null);

    if (error) return { data: [], error: error.message };

    const peta = new Map();
    for (const item of data || []) {
      const nama = String(item.kategori || "").trim();
      if (!nama) continue;
      const slug = slugify(nama);
      if (!peta.has(slug)) peta.set(slug, { id: null, nama, slug });
    }

    return {
      data: [...peta.values()].sort((a, b) => a.nama.localeCompare(b.nama, "id")),
      error: null,
    };
  } catch (err) {
    return { data: [], error: err.message };
  }
}

export async function ambilKategoriBySlug(slug) {
  const slugBersih = String(slug || "").trim().toLowerCase();
  if (!slugBersih) return { data: null, error: null };

  try {
    const supabase = buatKlienServer();
    const { data, error } = await supabase
      .from("kategori")
      .select("id, nama, slug")
      .eq("slug", slugBersih)
      .maybeSingle();

    if (!error) return { data: data || null, error: null };
    if (!errorSkema(error)) return { data: null, error: error.message };
  } catch (err) {
    return { data: null, error: err.message };
  }

  const { data: kategoriLama } = await ambilKategoriPublik();
  return {
    data: kategoriLama.find((item) => item.slug === slugBersih) || null,
    error: null,
  };
}

export async function ambilProdukPublik({
  q = "",
  kategoriSlug = "",
  urut = "pilihan",
  hal = 1,
  perHalaman = PRODUK_PER_HALAMAN,
} = {}) {
  const halaman = Math.max(1, Number.parseInt(hal, 10) || 1);
  const batas = Math.max(1, Number(perHalaman) || PRODUK_PER_HALAMAN);

  let kategori = null;
  if (kategoriSlug) {
    const hasilKategori = await ambilKategoriBySlug(kategoriSlug);
    kategori = hasilKategori.data;
    if (!kategori) {
      return { data: [], count: 0, kategori: null, error: null };
    }
  }

  try {
    const supabase = buatKlienServer();
    let query = supabase
      .from("produk")
      .select(SELECT_PRODUK, { count: "exact" })
      .eq("aktif", true);

    if (q) query = query.ilike("nama", polaCari(q));
    if (kategori?.id) query = query.eq("kategori_id", kategori.id);

    query = terapkanUrutan(query, urut);
    const dari = (halaman - 1) * batas;
    query = query.range(dari, dari + batas - 1);

    const { data, error, count } = await query;
    if (!error) {
      return {
        data: (data || []).map(normalisasiProduk),
        count: count || 0,
        kategori,
        error: null,
      };
    }

    if (!errorSkema(error)) {
      return { data: [], count: 0, kategori, error: error.message };
    }
  } catch (err) {
    return { data: [], count: 0, kategori, error: err.message };
  }

  const legacy = await ambilSemuaLegacy(buatKlienServer());
  if (legacy.error) {
    return { data: [], count: 0, kategori, error: legacy.error.message };
  }
  const hasil = filterLegacy(legacy.data, { q, kategoriSlug, urut, hal: halaman, perHalaman: batas });
  return { ...hasil, kategori, error: null };
}

export async function ambilProdukDetail(id) {
  const idBersih = String(id ?? "");
  if (!/^\d+$/.test(idBersih)) return { data: null, error: null };

  try {
    const supabase = buatKlienServer();
    const { data, error } = await supabase
      .from("produk")
      .select(SELECT_PRODUK)
      .eq("id", Number(idBersih))
      .eq("aktif", true)
      .maybeSingle();

    if (!error) return { data: normalisasiProduk(data), error: null };
    if (!errorSkema(error)) return { data: null, error: error.message };
  } catch (err) {
    return { data: null, error: err.message };
  }

  const { data, error } = await buatKlienServer()
    .from("produk")
    .select(produkLegacy().join(","))
    .eq("id", Number(idBersih))
    .maybeSingle();

  return { data: data ? normalisasiProduk(data) : null, error: error?.message || null };
}

export async function ambilProdukAdminById(id) {
  const idBersih = String(id ?? "");
  if (!/^\d+$/.test(idBersih)) return { data: null, error: null };

  try {
    const supabase = buatKlienServer();
    const { data, error } = await supabase
      .from("produk")
      .select(SELECT_PRODUK)
      .eq("id", Number(idBersih))
      .maybeSingle();

    if (!error) return { data: normalisasiProduk(data), error: null };
    if (!errorSkema(error)) return { data: null, error: error.message };
  } catch (err) {
    return { data: null, error: err.message };
  }

  const { data, error } = await buatKlienServer()
    .from("produk")
    .select(produkLegacy().join(","))
    .eq("id", Number(idBersih))
    .maybeSingle();

  return { data: data ? normalisasiProduk(data) : null, error: error?.message || null };
}

export async function ambilProdukAdmin({ q = "", hal = 1, perHalaman = ADMIN_PER_HALAMAN } = {}) {
  const halaman = Math.max(1, Number.parseInt(hal, 10) || 1);
  const batas = Math.max(1, Number(perHalaman) || ADMIN_PER_HALAMAN);

  try {
    const supabase = buatKlienServer();
    let query = supabase.from("produk").select(SELECT_PRODUK, { count: "exact" });
    if (q) query = query.ilike("nama", polaCari(q));
    query = query
      .order("urutan", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });

    const dari = (halaman - 1) * batas;
    const { data, error, count } = await query.range(dari, dari + batas - 1);

    if (!error) {
      return {
        data: (data || []).map(normalisasiProduk),
        count: count || 0,
        error: null,
      };
    }

    if (!errorSkema(error)) return { data: [], count: 0, error: error.message };
  } catch (err) {
    return { data: [], count: 0, error: err.message };
  }

  const legacy = await ambilSemuaLegacy(buatKlienServer());
  if (legacy.error) return { data: [], count: 0, error: legacy.error.message };

  let hasil = legacy.data;
  if (q) {
    const cari = String(q).toLowerCase();
    hasil = hasil.filter((produk) => produk.nama.toLowerCase().includes(cari));
  }
  const total = hasil.length;
  const mulai = (halaman - 1) * batas;
  return { data: hasil.slice(mulai, mulai + batas), count: total, error: null };
}

export async function ambilProdukByIds(ids = [], { hanyaAktif = true } = {}) {
  const daftarId = [...new Set((Array.isArray(ids) ? ids : []).map((id) => Number(id)))]
    .filter((id) => Number.isSafeInteger(id) && id > 0)
    .slice(0, 50);
  if (daftarId.length === 0) return { data: [], error: null };

  try {
    const supabase = buatKlienServer();
    let query = supabase.from("produk").select(SELECT_PRODUK).in("id", daftarId);
    if (hanyaAktif) query = query.eq("aktif", true);
    const { data, error } = await query;

    if (!error) {
      const urutanPeta = new Map(daftarId.map((id, indeks) => [id, indeks]));
      return {
        data: (data || [])
          .map(normalisasiProduk)
          .sort((a, b) => (urutanPeta.get(Number(a.id)) ?? 99) - (urutanPeta.get(Number(b.id)) ?? 99)),
        error: null,
      };
    }
    if (!errorSkema(error)) return { data: [], error: error.message };
  } catch (err) {
    return { data: [], error: err.message };
  }

  const legacy = await ambilSemuaLegacy(buatKlienServer());
  if (legacy.error) return { data: [], error: legacy.error.message };
  return {
    data: legacy.data.filter((produk) => daftarId.includes(Number(produk.id))),
    error: null,
  };
}

export async function ambilProdukTerkait(produk, batas = 4) {
  if (!produk) return [];
  const jumlah = Math.max(1, Math.min(4, Number(batas) || 4));

  try {
    const supabase = buatKlienServer();
    if (produk.kategori_id) {
      const { data, error } = await supabase
        .from("produk")
        .select(SELECT_PRODUK)
        .eq("aktif", true)
        .eq("kategori_id", produk.kategori_id)
        .neq("id", produk.id)
        .order("urutan", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(jumlah);

      if (!error) {
        const hasil = (data || []).map(normalisasiProduk);
        if (hasil.length >= jumlah) return hasil;

        const { data: tambahan } = await supabase
          .from("produk")
          .select(SELECT_PRODUK)
          .eq("aktif", true)
          .neq("id", produk.id)
          .order("created_at", { ascending: false })
          .limit(jumlah + hasil.length);

        const sudahAda = new Set(hasil.map((item) => Number(item.id)));
        for (const item of tambahan || []) {
          if (sudahAda.has(Number(item.id))) continue;
          hasil.push(normalisasiProduk(item));
          if (hasil.length >= jumlah) break;
        }
        return hasil;
      }
      if (!errorSkema(error)) return [];
    }
  } catch {
    // lanjut ke fallback
  }

  const { data } = await ambilProdukPublik({ urut: "terbaru", perHalaman: jumlah + 1 });
  return data.filter((item) => Number(item.id) !== Number(produk.id)).slice(0, jumlah);
}

export async function ambilSemuaProduk({ hanyaAktif = false } = {}) {
  try {
    const supabase = buatKlienServer();
    let query = supabase
      .from("produk")
      .select(SELECT_PRODUK)
      .order("urutan", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true });

    if (hanyaAktif) query = query.eq("aktif", true);

    const { data, error } = await query;
    if (!error) return { data: (data || []).map(normalisasiProduk), error: null };
    if (!errorSkema(error)) return { data: [], error: error.message };
  } catch (err) {
    return { data: [], error: err.message };
  }

  const legacy = await ambilSemuaLegacy(buatKlienServer());
  return legacy.error
    ? { data: [], error: legacy.error.message }
    : { data: legacy.data, error: null };
}

export async function ambilBannerAktif() {
  try {
    const supabase = buatKlienServer();
    const { data, error } = await supabase
      .from("banner")
      .select("id, judul, teks, gambar_url, tautan, aktif, created_at")
      .eq("aktif", true)
      .order("created_at", { ascending: false });

    if (error) return { data: [], error: error.message };
    return { data: data || [], error: null };
  } catch (err) {
    return { data: [], error: err.message };
  }
}

export async function ambilUlasanProduk(produkId) {
  const id = Number(produkId);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return { data: [], rataRata: 0, jumlah: 0, error: null };
  }

  try {
    const supabase = buatKlienServer();
    const { data, error } = await supabase
      .from("ulasan")
      .select("id, nama, rating, komentar, created_at")
      .eq("produk_id", id)
      .eq("tampil", true)
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) return { data: [], rataRata: 0, jumlah: 0, error: error.message };

    const daftar = data || [];
    const total = daftar.reduce((jumlah, item) => jumlah + Number(item.rating || 0), 0);
    return {
      data: daftar,
      jumlah: daftar.length,
      rataRata: daftar.length ? Math.round((total / daftar.length) * 10) / 10 : 0,
      error: null,
    };
  } catch (err) {
    return { data: [], rataRata: 0, jumlah: 0, error: err.message };
  }
}

export async function ambilUlasanTerbaru(batas = 3) {
  try {
    const supabase = buatKlienServer();
    const { data, error } = await supabase
      .from("ulasan")
      .select("id, nama, rating, komentar, created_at, produk:produk_id ( id, nama )")
      .eq("tampil", true)
      .order("created_at", { ascending: false })
      .limit(Math.max(1, Math.min(6, Number(batas) || 3)));

    if (error) return { data: [], error: error.message };
    return { data: data || [], error: null };
  } catch (err) {
    return { data: [], error: err.message };
  }
}

export async function hitungRingkasanAdmin() {
  const kosong = {
    total: 0,
    aktif: 0,
    nonaktif: 0,
    ulasan: 0,
    perKategori: [],
    terlaris: [],
    error: null,
  };

  try {
    const supabase = buatKlienServer();
    const [totalRes, aktifRes, nonaktifRes, ulasanRes, kategoriRes] = await Promise.all([
      supabase.from("produk").select("id", { count: "exact", head: true }),
      supabase.from("produk").select("id", { count: "exact", head: true }).eq("aktif", true),
      supabase.from("produk").select("id", { count: "exact", head: true }).eq("aktif", false),
      supabase.from("ulasan").select("id", { count: "exact", head: true }),
      supabase.from("kategori").select("id, nama, slug").order("nama"),
    ]);

    const galat = [totalRes, aktifRes, nonaktifRes].find((res) => res.error);
    if (galat) return { ...kosong, error: galat.error.message };

    const kategori = kategoriRes.error ? [] : kategoriRes.data || [];
    const perKategori = await Promise.all(
      kategori.map(async (item) => {
        const { count } = await supabase
          .from("produk")
          .select("id", { count: "exact", head: true })
          .eq("kategori_id", item.id);
        return { ...item, jumlah: count || 0 };
      })
    );

    let terlaris = [];
    const { data: klik, error: klikError } = await supabase
      .from("klik_wa")
      .select("produk_id")
      .not("produk_id", "is", null)
      .limit(20000);

    if (!klikError && klik?.length) {
      const hitung = new Map();
      for (const item of klik) {
        const id = Number(item.produk_id);
        hitung.set(id, (hitung.get(id) || 0) + 1);
      }

      const ids = [...hitung.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id]) => id);

      const { data: produk } = await supabase
        .from("produk")
        .select("id, nama, foto_url")
        .in("id", ids);

      const peta = new Map((produk || []).map((item) => [Number(item.id), item]));
      terlaris = ids
        .map((id) => {
          const item = peta.get(id);
          return item ? { ...item, jumlah_klik: hitung.get(id) } : null;
        })
        .filter(Boolean);
    }

    return {
      total: totalRes.count || 0,
      aktif: aktifRes.count || 0,
      nonaktif: nonaktifRes.count || 0,
      ulasan: ulasanRes.error ? 0 : ulasanRes.count || 0,
      perKategori,
      terlaris,
      error: null,
    };
  } catch (err) {
    return { ...kosong, error: err.message };
  }
}

export async function ambilProdukUntukKeranjang(ids = []) {
  const daftarId = [...new Set((Array.isArray(ids) ? ids : []).map((id) => Number(id)))]
    .filter((id) => Number.isSafeInteger(id) && id > 0)
    .slice(0, 50);
  if (daftarId.length === 0) return { data: [], error: null };

  try {
    const supabase = buatKlienServer();
    const { data, error } = await supabase
      .from("produk")
      .select("id, nama, harga, harga_diskon, stok, aktif, foto_url")
      .in("id", daftarId);

    if (!error) return { data: data || [], error: null };
    if (!errorSkema(error)) return { data: [], error: error.message };
  } catch (err) {
    return { data: [], error: err.message };
  }

  // Fallback skema lama: stok dianggap tersedia dan produk dianggap aktif.
  try {
    const supabase = buatKlienServer();
    const { data, error } = await supabase
      .from("produk")
      .select("id, nama, harga, foto_url")
      .in("id", daftarId);

    if (error) return { data: [], error: error.message };
    return {
      data: (data || []).map((item) => ({
        ...item,
        harga_diskon: null,
        stok: 20,
        aktif: true,
      })),
      error: null,
    };
  } catch (err) {
    return { data: [], error: err.message };
  }
}
