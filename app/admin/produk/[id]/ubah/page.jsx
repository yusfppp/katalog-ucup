import { notFound } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import CatatanBelumAktif from "@/components/CatatanBelumAktif";
import { cariProdukContoh } from "@/lib/data-contoh";

// US-09 (bonus di jalur offline): ubah produk.
export default async function HalamanUbahProduk({ params }) {
  const { id } = await params;
  const produk = cariProdukContoh(id);

  if (!produk) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 flex flex-col gap-6">
      <NavAdmin />
      <h1 className="font-heading text-3xl font-bold text-secondary">Ubah Donat</h1>
      <CatatanBelumAktif>Simpan perubahan belum berfungsi: lihat US-09.</CatatanBelumAktif>
      <FormProduk produk={produk} labelTombol="Simpan Perubahan" />
    </div>
  );
}
