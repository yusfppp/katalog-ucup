import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { wajibAdmin } from "@/lib/auth";
import { ambilKategoriPublik } from "@/lib/produk";

export const dynamic = "force-dynamic";

export default async function HalamanTambahProduk() {
  await wajibAdmin();
  const kategori = await ambilKategoriPublik();

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-8 sm:px-6">
      <NavAdmin />
      <div>
        <h1 className="font-heading text-3xl font-bold text-secondary">Tambah Donat Baru</h1>
        <p className="mt-1 text-sm text-text-muted">
          Lengkapi informasi produk, foto, dan varian harga. Data akan tersimpan di Supabase.
        </p>
      </div>
      <FormProduk labelTombol="Simpan Donat" kategoriList={kategori.data} />
    </div>
  );
}
