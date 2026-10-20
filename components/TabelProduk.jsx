import { formatRupiah } from "@/lib/format";
import Button from "@/components/Button";

export default function TabelProduk({ daftarProduk }) {
  return (
    <div className="overflow-x-auto rounded-[20px] border-[1.5px] border-border bg-surface shadow-warm">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="bg-primary-soft/40 text-secondary border-b border-border">
          <tr>
            <th className="px-5 py-4 font-bold font-heading text-base">Produk Donat</th>
            <th className="px-5 py-4 font-bold font-heading text-base">Kategori</th>
            <th className="px-5 py-4 font-bold font-heading text-base">Harga</th>
            <th className="px-5 py-4 font-bold font-heading text-base text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {daftarProduk.map((produk) => (
            <tr key={produk.id} className="hover:bg-bg/40 transition-colors">
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <img
                    src={produk.foto_url}
                    alt=""
                    className="h-11 w-11 rounded-xl object-cover border border-border bg-bg/50"
                  />
                  <span className="font-bold text-secondary">{produk.nama}</span>
                </div>
              </td>
              <td className="px-5 py-3.5">
                <span className="rounded-full bg-primary-soft px-3 py-0.5 text-xs font-bold text-primary">
                  {produk.kategori || "Donat"}
                </span>
              </td>
              <td className="px-5 py-3.5 font-bold text-primary">
                {formatRupiah(produk.harga)}
              </td>
              <td className="px-5 py-3.5 text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    href={`/admin/produk/${produk.id}/ubah`}
                    variant="secondary"
                    size="sm"
                  >
                    Ubah
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                  >
                    Hapus
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
