import Button from "@/components/Button";

export const metadata = {
  title: "Halaman Tidak Ditemukan",
  description: "Halaman atau produk yang kamu cari tidak tersedia.",
};

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-4 px-4 py-20 text-center sm:px-6">
      <span className="text-7xl" aria-hidden="true">🍩</span>
      <p className="font-heading text-6xl font-bold text-primary">404</p>
      <h1 className="font-heading text-3xl font-bold text-secondary">Halaman tidak ditemukan</h1>
      <p className="max-w-md text-sm text-text-muted">
        Halaman atau produk yang kamu cari mungkin sudah dihapus, dinonaktifkan, atau alamatnya
        salah.
      </p>
      <div className="flex flex-wrap justify-center gap-2 pt-2">
        <Button href="/" variant="primary" size="lg">
          Kembali ke Beranda
        </Button>
        <Button href="/#katalog" variant="secondary" size="lg">
          Lihat Katalog
        </Button>
      </div>
    </div>
  );
}
