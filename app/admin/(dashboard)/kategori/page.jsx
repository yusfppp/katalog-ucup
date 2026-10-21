import FormKategori from "@/components/FormKategori";
import TabelKategori from "@/components/TabelKategori";
import { wajibAdmin } from "@/lib/auth";
import { buatKlienServer } from "@/lib/supabase/server";
import { tambahKategori, ubahKategori } from "@/lib/actions/kategori";

export const dynamic = "force-dynamic";

export default async function HalamanKategori({ searchParams }) {
  await wajibAdmin();
  const params = await searchParams;
  const idUbah = Number.parseInt(params?.ubah, 10);

  let daftarKategori = [];
  let pesanError = null;

  try {
    const supabase = buatKlienServer();
    const [kategoriRes, produkRes] = await Promise.all([
      supabase.from("kategori").select("id, nama, slug, created_at").order("nama"),
      supabase.from("produk").select("id, kategori_id"),
    ]);

    if (kategoriRes.error) {
      pesanError = kategoriRes.error.message;
    } else {
      const hitung = new Map();
      for (const produk of produkRes.data || []) {
        const id = Number(produk.kategori_id);
        if (id) hitung.set(id, (hitung.get(id) || 0) + 1);
      }
      daftarKategori = (kategoriRes.data || []).map((kategori) => ({
        ...kategori,
        jumlah: hitung.get(Number(kategori.id)) || 0,
      }));
    }
  } catch (err) {
    pesanError = err.message;
  }

  const kategoriUbah = Number.isSafeInteger(idUbah)
    ? daftarKategori.find((item) => Number(item.id) === idUbah) || null
    : null;

  const actionUbah = kategoriUbah ? ubahKategori.bind(null, kategoriUbah.id) : null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-secondary sm:text-4xl">
          Kelola Kategori
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Kelompokkan produk ke kategori. Kategori yang masih dipakai produk tidak bisa dihapus.
        </p>
      </div>

      {pesanError && (
        <div
          role="alert"
          className="rounded-xl border border-error/30 bg-error/10 p-3.5 text-sm font-semibold text-error"
        >
          Gagal memuat kategori: {pesanError}. Pastikan migration database sudah dijalankan.
        </div>
      )}

      {kategoriUbah ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <FormKategori action={actionUbah} kategori={kategoriUbah} />
          <TabelKategori daftarKategori={daftarKategori} />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <FormKategori action={tambahKategori} />
          <TabelKategori daftarKategori={daftarKategori} />
        </div>
      )}
    </div>
  );
}
