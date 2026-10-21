import { ambilAdmin } from "@/lib/auth";
import { ambilSemuaProduk } from "@/lib/produk";
import { KOLOM_CSV, buatCSV } from "@/lib/csv";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await ambilAdmin();
  if (!admin) {
    return new Response("Tidak diizinkan. Silakan login sebagai admin.", {
      status: 401,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const { data, error } = await ambilSemuaProduk({ hanyaAktif: false });
  if (error) {
    return new Response(`Gagal mengambil produk: ${error}`, {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const baris = [KOLOM_CSV];
  for (const produk of data) {
    baris.push([
      produk.id,
      produk.nama,
      produk.harga,
      produk.kategori_nama || "",
      produk.deskripsi || "",
      produk.foto_url || "",
      produk.stok,
      produk.harga_diskon ?? "",
      produk.badge || "",
      produk.aktif ? "true" : "false",
      produk.urutan,
    ]);
  }

  const csv = `\uFEFF${buatCSV(baris)}`;
  const tanggal = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="produk-alfa-bites-${tanggal}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
