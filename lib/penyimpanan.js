export const KUNCI_SIMPAN = {
  keranjang: "alfa-bites:keranjang",
  favorit: "alfa-bites:favorit",
  banding: "alfa-bites:banding",
  tema: "alfa-bites:tema",
  terakhir: "alfa-bites:terakhir-dilihat",
};

export const EVENT_SIMPANAN = "alfa-simpanan-berubah";

export function bacaSimpanan(kunci, cadangan) {
  if (typeof window === "undefined") return cadangan;
  try {
    const mentah = window.localStorage.getItem(kunci);
    if (!mentah) return cadangan;
    return JSON.parse(mentah);
  } catch {
    return cadangan;
  }
}

export function tulisSimpanan(kunci, nilai) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(kunci, JSON.stringify(nilai));
    window.dispatchEvent(new CustomEvent(EVENT_SIMPANAN, { detail: { kunci } }));
  } catch {
    // Penyimpanan penuh atau diblokir: fitur tetap berjalan tanpa persistensi.
  }
}

export function bacaDaftarId(kunci) {
  const nilai = bacaSimpanan(kunci, []);
  if (!Array.isArray(nilai)) return [];
  return nilai.map((id) => Number(id)).filter((id) => Number.isSafeInteger(id) && id > 0);
}

export function tulisDaftarId(kunci, ids) {
  const unik = [...new Set(ids.map((id) => Number(id)))].filter(
    (id) => Number.isSafeInteger(id) && id > 0
  );
  tulisSimpanan(kunci, unik);
  return unik;
}

export function catatTerakhirDilihat(id, maks = 6) {
  const angka = Number(id);
  if (!Number.isSafeInteger(angka) || angka <= 0) return;
  const lama = bacaDaftarId(KUNCI_SIMPAN.terakhir);
  const baru = [angka, ...lama.filter((item) => item !== angka)].slice(0, maks);
  tulisDaftarId(KUNCI_SIMPAN.terakhir, baru);
}
