import { redirect } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { buatKlienSesiAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// US-08: tambah produk baru ke database
export default async function HalamanTambahProduk() {
  // Verifikasi login admin di sisi server
  try {
    const supabase = await buatKlienSesiAdmin();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      redirect("/admin/login");
    }
  } catch (err) {
    if (err?.message === "NEXT_REDIRECT" || err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    redirect("/admin/login");
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 flex flex-col gap-6">
      <NavAdmin />
      <div>
        <h1 className="font-heading text-3xl font-bold text-secondary">Tambah Donat Baru</h1>
        <p className="text-sm text-text-muted mt-1">
          Lengkapi formulir di bawah ini untuk menambahkan varian donat baru ke katalog database.
        </p>
      </div>
      <FormProduk labelTombol="Simpan Donat" />
    </div>
  );
}
