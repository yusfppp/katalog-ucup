import { notFound, redirect } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { buatKlienServer, buatKlienSesiAdmin } from "@/lib/supabase/server";
import { ubahProduk } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

// US-09: ubah data produk yang sudah ada.
export default async function HalamanUbahProduk({ params }) {
  const { id } = await params;

  // 1. Verifikasi login admin di sisi server
  try {
    const supabaseAdmin = await buatKlienSesiAdmin();
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser();
    if (userError || !user) {
      redirect("/admin/login");
    }
  } catch (err) {
    if (err?.message === "NEXT_REDIRECT" || err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    redirect("/admin/login");
  }

  // 2. Ambil data produk dari Supabase berdasarkan id
  const supabase = buatKlienServer();
  const { data: produk, error } = await supabase
    .from("produk")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !produk) {
    notFound();
  }

  // 3. Bind Server Action ubahProduk dengan id produk
  const actionUbah = ubahProduk.bind(null, id);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 flex flex-col gap-6">
      <NavAdmin />
      <div>
        <h1 className="font-heading text-3xl font-bold text-secondary">Ubah Donat</h1>
        <p className="text-sm text-text-muted mt-1">
          Perbarui informasi donat <span className="font-bold text-primary">{produk.nama}</span>.
        </p>
      </div>
      <FormProduk
        produk={produk}
        labelTombol="Simpan Perubahan"
        action={actionUbah}
      />
    </div>
  );
}
