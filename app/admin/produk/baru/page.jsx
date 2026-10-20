import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import CatatanBelumAktif from "@/components/CatatanBelumAktif";

// US-08 (bonus di jalur offline): tambah produk.
export default function HalamanTambahProduk() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 flex flex-col gap-6">
      <NavAdmin />
      <h1 className="font-heading text-3xl font-bold text-secondary">Tambah Donat Baru</h1>
      <CatatanBelumAktif>Simpan produk belum berfungsi: lihat US-08.</CatatanBelumAktif>
      <FormProduk labelTombol="Simpan Donat" />
    </div>
  );
}
