import { notFound } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { wajibAdmin } from "@/lib/auth";
import { ambilKategoriPublik, ambilProdukAdminById } from "@/lib/produk";
import { ubahProduk } from "@/lib/actions/produk";

export const dynamic = "force-dynamic";

export default async function HalamanUbahProduk({ params }) {
  await wajibAdmin();
  const { id } = await params;

  const [produk, kategori] = await Promise.all([
    ambilProdukAdminById(id),
    ambilKategoriPublik(),
  ]);

  if (produk.error || !produk.data) {
    notFound();
  }

  const actionUbah = ubahProduk.bind(null, id);

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-8 sm:px-6">
      <NavAdmin />
      <div>
        <h1 className="font-heading text-3xl font-bold text-secondary">Ubah Donat</h1>
        <p className="mt-1 text-sm text-text-muted">
          Perbarui informasi donat{" "}
          <span className="font-bold text-primary">{produk.data.nama}</span>.
        </p>
      </div>
      <FormProduk
        produk={produk.data}
        kategoriList={kategori.data}
        labelTombol="Simpan Perubahan"
        action={actionUbah}
      />
    </div>
  );
}
