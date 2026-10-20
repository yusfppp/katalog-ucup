export function formatRupiah(angka) {
  const nilai = Number(angka);
  if (!Number.isFinite(nilai)) {
    return "Rp 0";
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(nilai);
}

export function formatAngka(angka) {
  return new Intl.NumberFormat("id-ID").format(Number(angka) || 0);
}

export function formatTanggal(tanggal) {
  if (!tanggal) return "-";
  const date = new Date(tanggal);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatTanggalWaktu(tanggal) {
  if (!tanggal) return "-";
  const date = new Date(tanggal);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function slugify(teks) {
  return (
    String(teks || "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "kategori"
  );
}

export function normalisasiNomorWA(nomor) {
  let digit = String(nomor || "").replace(/\D/g, "");
  if (digit.startsWith("0")) {
    digit = `62${digit.slice(1)}`;
  }
  return digit;
}

export function urlWhatsApp(nomor, pesan = "") {
  const nomorBersih = normalisasiNomorWA(nomor);
  const teks = pesan ? `?text=${encodeURIComponent(pesan)}` : "";
  return `https://wa.me/${nomorBersih}${teks}`;
}

export function potongTeks(teks, panjang = 160) {
  const bersih = String(teks || "").trim();
  if (bersih.length <= panjang) return bersih;
  return `${bersih.slice(0, Math.max(0, panjang - 1)).trimEnd()}…`;
}

export function urlInstagram(instagram) {
  const nilai = String(instagram || "").trim();
  if (!nilai) return "";
  if (/^https?:\/\//i.test(nilai)) return nilai;
  return `https://instagram.com/${nilai.replace(/^@/, "")}`;
}
