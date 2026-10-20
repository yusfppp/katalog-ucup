import NavAdmin from "@/components/NavAdmin";
import FormPengaturan from "@/components/FormPengaturan";
import { wajibAdmin } from "@/lib/auth";
import { ambilPengaturan } from "@/lib/toko";

export const dynamic = "force-dynamic";

export default async function HalamanPengaturan() {
  await wajibAdmin();
  const toko = await ambilPengaturan();

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-4 py-8 sm:px-6">
      <NavAdmin />
      <div>
        <h1 className="font-heading text-3xl font-bold text-secondary sm:text-4xl">
          Pengaturan Toko
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-text-muted">
          Data ini dipakai di header, footer, halaman tentang, tombol WhatsApp, metadata, dan pesan
          pemesanan. Perubahan langsung terlihat di halaman publik.
        </p>
      </div>
      <FormPengaturan toko={toko} />
    </div>
  );
}
