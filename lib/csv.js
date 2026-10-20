export const KOLOM_CSV = [
  "id",
  "nama",
  "harga",
  "kategori",
  "deskripsi",
  "foto_url",
  "stok",
  "harga_diskon",
  "badge",
  "aktif",
  "urutan",
];

export function escapeCSV(nilai) {
  const teks = nilai === null || nilai === undefined ? "" : String(nilai);
  if (/[",\r\n]/.test(teks)) {
    return `"${teks.replace(/"/g, '""')}"`;
  }
  return teks;
}

export function buatCSV(baris = []) {
  return baris.map((kolom) => kolom.map(escapeCSV).join(",")).join("\r\n");
}

/**
 * Parser CSV sederhana yang mendukung field berkutip, koma, dan baris baru
 * di dalam tanda kutip.
 */
export function parseCSV(teks) {
  const sumber = String(teks || "").replace(/^\uFEFF/, "");
  const baris = [];
  let barisSekarang = [];
  let field = "";
  let dalamKutip = false;

  for (let i = 0; i < sumber.length; i += 1) {
    const karakter = sumber[i];

    if (dalamKutip) {
      if (karakter === '"') {
        if (sumber[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          dalamKutip = false;
        }
      } else {
        field += karakter;
      }
      continue;
    }

    if (karakter === '"' && field === "") {
      dalamKutip = true;
    } else if (karakter === ",") {
      barisSekarang.push(field);
      field = "";
    } else if (karakter === "\n") {
      barisSekarang.push(field);
      baris.push(barisSekarang);
      barisSekarang = [];
      field = "";
    } else if (karakter === "\r") {
      // Abaikan CR; LF berikutnya yang menutup baris.
    } else {
      field += karakter;
    }
  }

  barisSekarang.push(field);
  if (barisSekarang.some((sel) => String(sel).trim() !== "") || baris.length === 0) {
    baris.push(barisSekarang);
  }

  return baris;
}

export function parseCSVKeObjek(teks) {
  const baris = parseCSV(teks);
  if (baris.length === 0) {
    return { error: "File CSV kosong.", data: [] };
  }

  const header = baris[0].map((kolom) => String(kolom).trim().toLowerCase());
  if (!header.includes("nama") || !header.includes("harga")) {
    return { error: "Header CSV wajib memuat kolom nama dan harga.", data: [] };
  }

  const data = [];
  for (let i = 1; i < baris.length; i += 1) {
    const kolom = baris[i];
    if (kolom.every((sel) => String(sel).trim() === "")) continue;

    const objek = {};
    header.forEach((namaKolom, indeks) => {
      objek[namaKolom] = kolom[indeks] !== undefined ? String(kolom[indeks]).trim() : "";
    });
    objek.__baris = i + 1;
    data.push(objek);
  }

  return { error: null, data };
}
