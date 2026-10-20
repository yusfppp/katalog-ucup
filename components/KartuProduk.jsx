import Button from "@/components/Button";
import { formatRupiah } from "@/lib/format";

export default function KartuProduk({ produk }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-[20px] border-[1.5px] border-border bg-surface shadow-warm hover:shadow-warm-lg transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-square w-full overflow-hidden bg-bg/50">
        <img
          src={produk.foto_url}
          alt={produk.nama}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {produk.kategori && (
          <span className="absolute top-3 left-3 rounded-full bg-surface/90 px-3 py-1 text-xs font-bold text-primary shadow-sm backdrop-blur-sm">
            {produk.kategori}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-4 sm:p-5">
        <h3 className="font-heading text-lg font-bold text-secondary group-hover:text-primary transition-colors line-clamp-1">
          {produk.nama}
        </h3>
        {produk.deskripsi && (
          <p className="text-xs leading-relaxed text-text-muted line-clamp-2">
            {produk.deskripsi}
          </p>
        )}
        <div className="mt-auto pt-3 flex items-center justify-between gap-2 border-t border-border/50">
          <span className="rounded-full bg-primary-soft px-3 py-1 text-sm font-bold text-primary">
            {formatRupiah(produk.harga)}
          </span>
          <Button
            href={`/produk/${produk.id}`}
            variant="secondary"
            size="sm"
          >
            Lihat Donat
          </Button>
        </div>
      </div>
    </div>
  );
}
