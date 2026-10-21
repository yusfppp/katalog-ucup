import FormImpor from "@/components/FormImpor";
import { wajibAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HalamanImpor() {
  await wajibAdmin();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-secondary sm:text-4xl">
          Impor Produk dari CSV
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-text-muted">
          Unggah banyak produk sekaligus. Setiap baris divalidasi di server; baris yang salah
          dilaporkan dengan nomor baris dan alasannya.
        </p>
      </div>
      <FormImpor />
    </div>
  );
}
