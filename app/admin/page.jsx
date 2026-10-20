import { redirect } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Button from "@/components/Button";
import { buatKlienServer, buatKlienSesiAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HalamanAdmin() {
  // 1. Verifikasi autentikasi sesi admin di sisi server
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

  // 2. Ambil data produk dari tabel "produk" di Supabase (US-07)
  let daftarProduk = [];
  let pesanError = null;

  try {
    const supabase = buatKlienServer();
    const { data, error } = await supabase
      .from("produk")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      pesanError = `Gagal memuat produk dari database: ${error.message}`;
    } else {
      daftarProduk = data || [];
    }
  } catch (err) {
    pesanError = `Gagal memuat produk: ${err.message || "Terjadi kesalahan pada server."}`;
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 flex flex-col gap-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-secondary">
            Daftar Produk Donat
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Kelola menu donat mini, harga, dan ketersediaan stok toko dari database Supabase.
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

      {/* STATE ERROR */}
      {pesanError ? (
        <div className="rounded-[20px] border-[1.5px] border-error/30 bg-surface p-8 shadow-warm text-center flex flex-col items-center gap-2">
          <span className="text-3xl">⚠️</span>
          <p className="font-heading text-xl font-bold text-error">{pesanError}</p>
          <p className="text-sm text-text-muted">
            Pastikan koneksi Supabase dan kredensial database sudah sesuai.
          </p>
        </div>
      ) : daftarProduk.length === 0 ? (
        /* STATE KOSONG */
        <div className="rounded-[20px] border-[1.5px] border-border bg-surface p-12 shadow-warm text-center flex flex-col items-center gap-4">
          <span className="text-5xl">🍩</span>
          <div className="space-y-1">
            <h3 className="font-heading text-2xl font-bold text-secondary">Belum Ada Produk Donat</h3>
            <p className="text-sm text-text-muted max-w-md">
              Tabel produk di database masih kosong. Mulai tambahkan varian donat mini pertamamu sekarang!
            </p>
          </div>
          <Button
            href="/admin/produk/baru"
            variant="primary"
            size="md"
            leftIcon={<span>➕</span>}
          >
            Tambah Donat Sekarang
          </Button>
        </div>
      ) : (
        /* TABEL PRODUK DATABASE */
        <TabelProduk daftarProduk={daftarProduk} />
      )}
    </div>
  );
}
