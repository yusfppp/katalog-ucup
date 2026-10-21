import { ambilAdmin } from "@/lib/auth";
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

  const csv = `${buatCSV([KOLOM_CSV])}\r\n`;
  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="template-impor-produk.csv"',
      "Cache-Control": "no-store",
    },
  });
}
