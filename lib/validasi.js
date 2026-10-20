export const BATAS = {
  namaProduk: 120,
  deskripsiProduk: 2000,
  namaKategori: 60,
  labelVarian: 60,
  maksVarian: 20,
  namaUlasan: 50,
  komentarUlasan: 500,
  pertanyaanAI: 200,
  jumlahImpor: 200,
  ukuranFoto: 2 * 1024 * 1024,
  ukuranCSV: 512 * 1024,
};

export const BADGE_VALID = ["Baru", "Terlaris"];

function teks(nilai) {
  return String(nilai ?? "").trim();
}

export function bilanganBulat(nilai) {
  const bersih = teks(nilai);
  if (!/^-?\d+$/.test(bersih)) return null;
  const angka = Number(bersih);
  return Number.isSafeInteger(angka) ? angka : null;
}

export function booleanDari(nilai, bawaan = false) {
  if (nilai === undefined || nilai === null || nilai === "") return bawaan;
  return ["1", "true", "on", "ya", "yes"].includes(teks(nilai).toLowerCase());
}

export function validasiProduk(input = {}, opsi = {}) {
  const errors = {};
  const kategoriIds = Array.isArray(opsi.kategoriIds) ? opsi.kategoriIds : [];

  const nama = teks(input.nama);
  if (!nama) errors.nama = "Nama produk wajib diisi.";
  else if (nama.length > BATAS.namaProduk) {
    errors.nama = `Nama produk maksimal ${BATAS.namaProduk} karakter.`;
  }

  const harga = bilanganBulat(input.harga);
  if (harga === null) errors.harga = "Harga wajib berupa angka bulat.";
  else if (harga <= 0) errors.harga = "Harga harus lebih dari 0.";

  const hargaDiskonRaw = teks(input.harga_diskon);
  let hargaDiskon = null;
  if (hargaDiskonRaw) {
    hargaDiskon = bilanganBulat(hargaDiskonRaw);
    if (hargaDiskon === null) {
      errors.harga_diskon = "Harga diskon harus berupa angka bulat.";
    } else if (hargaDiskon < 0) {
      errors.harga_diskon = "Harga diskon tidak boleh negatif.";
    } else if (harga !== null && hargaDiskon >= harga) {
      errors.harga_diskon = "Harga diskon harus lebih kecil dari harga normal.";
    }
  }

  const stokRaw = teks(input.stok);
  const stok = stokRaw === "" ? 20 : bilanganBulat(stokRaw);
  if (stok === null) errors.stok = "Stok harus berupa bilangan bulat.";
  else if (stok < 0) errors.stok = "Stok tidak boleh negatif.";

  const kategoriId = bilanganBulat(input.kategori_id);
  if (kategoriId === null) {
    errors.kategori_id = "Kategori wajib dipilih.";
  } else if (kategoriIds.length > 0 && !kategoriIds.includes(kategoriId)) {
    errors.kategori_id = "Kategori yang dipilih tidak valid.";
  }

  const deskripsi = teks(input.deskripsi);
  if (deskripsi.length > BATAS.deskripsiProduk) {
    errors.deskripsi = `Deskripsi maksimal ${BATAS.deskripsiProduk} karakter.`;
  }

  const badge = teks(input.badge);
  if (badge && !BADGE_VALID.includes(badge)) {
    errors.badge = "Badge hanya boleh Baru atau Terlaris.";
  }

  const varian = [];
  const labelVarian = Array.isArray(input.varian_label) ? input.varian_label : [];
  const hargaVarian = Array.isArray(input.varian_harga) ? input.varian_harga : [];
  const labelTerpakai = new Set();

  const jumlahBaris = Math.max(labelVarian.length, hargaVarian.length);
  for (let i = 0; i < jumlahBaris; i += 1) {
    const label = teks(labelVarian[i]);
    const hargaBarisRaw = teks(hargaVarian[i]);

    if (!label && !hargaBarisRaw) continue;

    if (!label) {
      errors.varian = `Label varian baris ${i + 1} wajib diisi.`;
      continue;
    }
    if (label.length > BATAS.labelVarian) {
      errors.varian = `Label varian maksimal ${BATAS.labelVarian} karakter.`;
      continue;
    }
    if (labelTerpakai.has(label.toLowerCase())) {
      errors.varian = `Label varian "${label}" dipakai lebih dari sekali.`;
      continue;
    }

    const hargaBaris = bilanganBulat(hargaBarisRaw);
    if (hargaBaris === null || hargaBaris <= 0) {
      errors.varian = `Harga varian "${label}" harus berupa angka lebih dari 0.`;
      continue;
    }

    labelTerpakai.add(label.toLowerCase());
    varian.push({ label, harga: hargaBaris, urutan: varian.length });
  }

  if (varian.length > BATAS.maksVarian) {
    errors.varian = `Maksimal ${BATAS.maksVarian} varian per produk.`;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data: {
      nama,
      harga,
      harga_diskon: hargaDiskon,
      stok,
      kategori_id: kategoriId,
      deskripsi: deskripsi || null,
      badge: badge || null,
      aktif: booleanDari(input.aktif, true),
      varian,
    },
  };
}

export function validasiKategori(namaInput) {
  const nama = teks(namaInput);
  if (!nama) return { valid: false, error: "Nama kategori wajib diisi." };
  if (nama.length > BATAS.namaKategori) {
    return { valid: false, error: `Nama kategori maksimal ${BATAS.namaKategori} karakter.` };
  }
  return { valid: true, nama };
}

export function validasiPengaturan(input = {}) {
  const errors = {};

  const nama = teks(input.nama);
  if (nama.length < 2 || nama.length > 100) {
    errors.nama = "Nama toko harus 2–100 karakter.";
  }

  const tagline = teks(input.tagline);
  if (!tagline || tagline.length > 160) {
    errors.tagline = "Tagline wajib diisi, maksimal 160 karakter.";
  }

  let whatsapp = teks(input.whatsapp).replace(/\D/g, "");
  if (whatsapp.startsWith("0")) whatsapp = `62${whatsapp.slice(1)}`;
  if (!/^62\d{8,14}$/.test(whatsapp)) {
    errors.whatsapp = "Nomor WhatsApp harus diawali 62 atau 08 dan terdiri dari 10–16 digit.";
  }

  const alamat = teks(input.alamat);
  if (alamat.length < 10 || alamat.length > 500) {
    errors.alamat = "Alamat harus 10–500 karakter.";
  }

  const jamBuka = teks(input.jam_buka);
  if (jamBuka.length < 3 || jamBuka.length > 120) {
    errors.jam_buka = "Jam buka harus 3–120 karakter.";
  }

  const instagram = teks(input.instagram).replace(/^@/, "");
  if (instagram.length > 100) {
    errors.instagram = "Instagram maksimal 100 karakter.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data: { nama, tagline, whatsapp, alamat, jam_buka: jamBuka, instagram: instagram || null },
  };
}

export function validasiBanner(input = {}) {
  const errors = {};
  const judul = teks(input.judul);
  const teksBanner = teks(input.teks);
  const tautan = teks(input.tautan);

  if (judul.length < 2 || judul.length > 120) {
    errors.judul = "Judul banner harus 2–120 karakter.";
  }
  if (teksBanner.length < 2 || teksBanner.length > 500) {
    errors.teks = "Teks banner harus 2–500 karakter.";
  }
  if (tautan && !/^(https?:\/\/|\/)/.test(tautan)) {
    errors.tautan = "Tautan harus dimulai dengan / atau http(s)://.";
  }
  if (tautan.length > 300) {
    errors.tautan = "Tautan maksimal 300 karakter.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data: { judul, teks: teksBanner, tautan: tautan || null },
  };
}

export function validasiUlasan(input = {}) {
  const errors = {};
  const nama = teks(input.nama);
  const komentar = teks(input.komentar);
  const rating = bilanganBulat(input.rating);

  if (nama.length < 2 || nama.length > BATAS.namaUlasan) {
    errors.nama = `Nama harus 2–${BATAS.namaUlasan} karakter.`;
  }
  if (rating === null || rating < 1 || rating > 5) {
    errors.rating = "Rating harus dipilih antara 1 sampai 5 bintang.";
  }
  if (komentar.length < 5 || komentar.length > BATAS.komentarUlasan) {
    errors.komentar = `Komentar harus 5–${BATAS.komentarUlasan} karakter.`;
  }
  if (teks(input.website)) {
    errors.umum = "Ulasan ditolak karena terdeteksi sebagai spam.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data: { nama, rating, komentar },
  };
}

export function validasiPertanyaanAI(pertanyaanInput) {
  const pertanyaan = teks(pertanyaanInput);
  if (!pertanyaan) return { valid: false, error: "Pertanyaan wajib diisi." };
  if (pertanyaan.length > BATAS.pertanyaanAI) {
    return { valid: false, error: `Pertanyaan maksimal ${BATAS.pertanyaanAI} karakter.` };
  }
  return { valid: true, pertanyaan };
}

export function validasiAkunAdmin(input = {}) {
  const errors = {};
  const email = teks(input.email).toLowerCase();
  const password = String(input.password ?? "");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 160) {
    errors.email = "Format email tidak valid.";
  }
  if (password.length < 8 || password.length > 72) {
    errors.password = "Password harus 8–72 karakter.";
  }

  return { valid: Object.keys(errors).length === 0, errors, data: { email, password } };
}

export function validasiFileFoto(file) {
  if (!file || typeof file === "string" || !file.size) {
    return { valid: true, file: null };
  }

  const nama = String(file.name || "").toLowerCase();
  const tipe = String(file.type || "").toLowerCase();
  const ekstensiValid = /\.(jpe?g|png|webp)$/.test(nama);
  const tipeValid = ["image/jpeg", "image/png", "image/webp"].includes(tipe);

  if (!ekstensiValid || !tipeValid) {
    return {
      valid: false,
      error: "Foto harus berformat JPG, PNG, atau WEBP.",
    };
  }

  if (file.size > BATAS.ukuranFoto) {
    return { valid: false, error: "Ukuran foto maksimal 2MB." };
  }

  return { valid: true, file };
}
