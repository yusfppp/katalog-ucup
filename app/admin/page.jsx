import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Button from "@/components/Button";
import { produkContoh } from "@/lib/data-contoh";

export default function HalamanAdmin() {
  const daftarProduk = produkContoh;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 flex flex-col gap-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-secondary">
            Daftar Produk Donat
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Kelola menu donat mini, harga, dan ketersediaan stok toko.
          </p>
        </div>
        <Button
          href="/admin/produk/baru"
          variant="primary"
          size="md"
          leftIcon={<span>➕</span>}
        >
          Tambah Donat Baru
        </Button>
      </div>
      <TabelProduk daftarProduk={daftarProduk} />
    </div>
  );
}
