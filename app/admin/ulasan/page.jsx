import NavAdmin from "@/components/NavAdmin";
import TabelUlasan from "@/components/TabelUlasan";
import { wajibAdmin } from "@/lib/auth";
import { buatKlienServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HalamanUlasan() {
  await wajibAdmin();

  let daftarUlasan = [];
  let pesanError = null;

  try {
    const supabase = buatKlienServer();
    const [ulasanRes, produkRes] = await Promise.all([
      supabase
        .from("ulasan")
        .select("id, produk_id, nama, rating, komentar, tampil, created_at")
        .order("created_at", { ascending: false })
        .limit(500),
      supabase.from("produk").select("id, nama"),
    ]);

    if (ulasanRes.error) {
      pesanError = ulasanRes.error.message;
    } else {
      const namaProduk = new Map(
        (produkRes.data || []).map((produk) => [Number(produk.id), produk.nama])
      );
      daftarUlasan = (ulasanRes.data || []).map((ulasan) => ({
        ...ulasan,
        produk_nama: namaProduk.get(Number(ulasan.produk_id)) || null,
      }));
    }
  } catch (err) {
    pesanError = err.message;
  }

  const tampil = daftarUlasan.filter((ulasan) => ulasan.tampil).length;
  const disembunyikan = daftarUlasan.length - tampil;

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-4 py-8 sm:px-6">
      <NavAdmin />

      <div>
        <h1 className="font-heading text-3xl font-bold text-secondary sm:text-4xl">
          Moderasi Ulasan
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Ulasan yang disembunyikan tidak tampil di halaman publik dan tidak dihitung di rata-rata
          rating.
        </p>
      </div>

      {pesanError && (
        <div
          role="alert"
          className="rounded-xl border border-error/30 bg-error/10 p-3.5 text-sm font-semibold text-error"
        >
          Gagal memuat ulasan: {pesanError}. Pastikan migration database sudah dijalankan.
        </div>
      )}

      {!pesanError && daftarUlasan.length > 0 && (
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-primary-soft px-3 py-1 font-semibold text-primary">
            {daftarUlasan.length} ulasan
          </span>
          <span className="rounded-full bg-success/15 px-3 py-1 font-semibold text-success">
            {tampil} tampil
          </span>
          <span className="rounded-full bg-error/10 px-3 py-1 font-semibold text-error">
            {disembunyikan} disembunyikan
          </span>
        </div>
      )}

      <TabelUlasan daftarUlasan={daftarUlasan} />
    </div>
  );
}
