import NavAdmin from "@/components/NavAdmin";
import FormBanner from "@/components/FormBanner";
import TabelBanner from "@/components/TabelBanner";
import { wajibAdmin } from "@/lib/auth";
import { buatKlienServer } from "@/lib/supabase/server";
import { tambahBanner, ubahBanner } from "@/lib/actions/banner";

export const dynamic = "force-dynamic";

export default async function HalamanBanner({ searchParams }) {
  await wajibAdmin();
  const params = await searchParams;
  const idUbah = Number.parseInt(params?.ubah, 10);

  let daftarBanner = [];
  let pesanError = null;

  try {
    const supabase = buatKlienServer();
    const { data, error } = await supabase
      .from("banner")
      .select("id, judul, teks, gambar_url, tautan, aktif, created_at")
      .order("created_at", { ascending: false });

    if (error) pesanError = error.message;
    else daftarBanner = data || [];
  } catch (err) {
    pesanError = err.message;
  }

  const bannerUbah = Number.isSafeInteger(idUbah)
    ? daftarBanner.find((item) => Number(item.id) === idUbah) || null
    : null;

  const actionUbah = bannerUbah ? ubahBanner.bind(null, bannerUbah.id) : null;

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-4 py-8 sm:px-6">
      <NavAdmin />

      <div>
        <h1 className="font-heading text-3xl font-bold text-secondary sm:text-4xl">
          Banner Promo
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Banner aktif tampil di beranda. Nonaktifkan banner lama sebelum menggantinya bila perlu.
        </p>
      </div>

      {pesanError && (
        <div
          role="alert"
          className="rounded-xl border border-error/30 bg-error/10 p-3.5 text-sm font-semibold text-error"
        >
          Gagal memuat banner: {pesanError}. Pastikan migration database sudah dijalankan.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:items-start">
        {bannerUbah ? (
          <FormBanner action={actionUbah} banner={bannerUbah} />
        ) : (
          <FormBanner action={tambahBanner} />
        )}
        <TabelBanner daftarBanner={daftarBanner} />
      </div>
    </div>
  );
}
