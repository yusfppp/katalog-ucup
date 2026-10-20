"use server";

import { redirect } from "next/navigation";
import { buatKlienSesiAdmin } from "@/lib/supabase/server";

export async function login(formData) {
  const email = formData?.get("email");
  const password = formData?.get("password");

  if (!email || !password) {
    redirect("/admin/login?error=" + encodeURIComponent("Email dan password wajib diisi."));
  }

  let errorPesan = null;

  try {
    const supabase = await buatKlienSesiAdmin();
    const { error } = await supabase.auth.signInWithPassword({
      email: String(email).trim(),
      password: String(password),
    });

    if (error) {
      if (error.message?.toLowerCase().includes("invalid login credentials")) {
        errorPesan = "Email atau password salah.";
      } else {
        errorPesan = error.message;
      }
    }
  } catch (err) {
    if (err?.message === "NEXT_REDIRECT" || err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    errorPesan = err.message || "Terjadi kesalahan pada server.";
  }

  if (errorPesan) {
    const queryParams = new URLSearchParams();
    queryParams.set("error", errorPesan);
    if (email) {
      queryParams.set("email", String(email).trim());
    }
    redirect(`/admin/login?${queryParams.toString()}`);
  }

  redirect("/admin");
}

export async function keluar() {
  try {
    const supabase = await buatKlienSesiAdmin();
    await supabase.auth.signOut();
  } catch (err) {
    if (err?.message === "NEXT_REDIRECT" || err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    // Abaikan error lain saat sign out
  }

  redirect("/admin/login");
}

export async function gantiPassword(formData) {
  const passwordBaru = formData?.get("password_baru");
  const konfirmasiPassword = formData?.get("konfirmasi_password");

  if (!passwordBaru || passwordBaru.length < 8) {
    redirect("/admin/password?error=" + encodeURIComponent("Password baru minimal 8 karakter."));
  }

  if (passwordBaru !== konfirmasiPassword) {
    redirect("/admin/password?error=" + encodeURIComponent("Password baru dan konfirmasi harus sama."));
  }

  let errorPesan = null;

  try {
    const supabase = await buatKlienSesiAdmin();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      redirect("/admin/login?error=" + encodeURIComponent("Silakan login terlebih dahulu."));
    }

    const { error } = await supabase.auth.updateUser({
      password: String(passwordBaru),
    });

    if (error) {
      errorPesan = error.message;
    }
  } catch (err) {
    if (err?.message === "NEXT_REDIRECT" || err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    errorPesan = err.message || "Terjadi kesalahan saat mengganti password.";
  }

  if (errorPesan) {
    redirect("/admin/password?error=" + encodeURIComponent(errorPesan));
  }

  redirect("/admin/password?sukses=" + encodeURIComponent("Password berhasil diganti."));
}

export async function tambahProduk(prevState, formData) {
  // 1. Verifikasi login admin di server (US-08)
  let supabase;
  try {
    supabase = await buatKlienSesiAdmin();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { error: "Akses ditolak: silakan login sebagai admin terlebih dahulu." };
    }
  } catch (err) {
    return { error: err.message || "Gagal memverifikasi sesi admin." };
  }

  // 2. Ambil dan validasi input data produk
  const nama = formData?.get("nama")?.toString().trim();
  const hargaRaw = formData?.get("harga")?.toString().trim();
  const kategori = formData?.get("kategori")?.toString().trim() || null;
  const deskripsi = formData?.get("deskripsi")?.toString().trim() || null;
  const foto_url = formData?.get("foto_url")?.toString().trim() || "/produk/kopi.svg";

  if (!nama) {
    return { error: "Nama donat wajib diisi." };
  }

  const harga = parseInt(hargaRaw, 10);
  if (isNaN(harga) || harga < 0) {
    return { error: "Harga donat harus berupa angka valid (minimal 0)." };
  }

  // 3. Simpan ke tabel 'produk' di Supabase
  try {
    const { error: insertError } = await supabase.from("produk").insert({
      nama,
      harga,
      kategori,
      deskripsi,
      foto_url,
    });

    if (insertError) {
      return { error: `Gagal menyimpan produk: ${insertError.message}` };
    }
  } catch (err) {
    return { error: err.message || "Terjadi kesalahan saat menyimpan produk." };
  }

  // 4. Redirect kembali ke /admin setelah berhasil
  redirect("/admin");
}

export async function ubahProduk(id, prevState, formData) {
  // 1. Verifikasi login admin di server (US-09)
  let supabase;
  try {
    supabase = await buatKlienSesiAdmin();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { error: "Akses ditolak: silakan login sebagai admin terlebih dahulu." };
    }
  } catch (err) {
    return { error: err.message || "Gagal memverifikasi sesi admin." };
  }

  // 2. Validasi id produk
  const idAngka = parseInt(id, 10);
  if (isNaN(idAngka)) {
    return { error: "ID produk tidak valid." };
  }

  // 3. Ambil dan validasi input
  const nama = formData?.get("nama")?.toString().trim();
  const hargaRaw = formData?.get("harga")?.toString().trim();
  const kategori = formData?.get("kategori")?.toString().trim() || null;
  const deskripsi = formData?.get("deskripsi")?.toString().trim() || null;
  const foto_url = formData?.get("foto_url")?.toString().trim() || null;

  if (!nama) {
    return { error: "Nama donat wajib diisi." };
  }

  const harga = parseInt(hargaRaw, 10);
  if (isNaN(harga) || harga < 0) {
    return { error: "Harga donat harus berupa angka valid (minimal 0)." };
  }

  // 4. Update baris di tabel 'produk'
  try {
    const { error: updateError } = await supabase
      .from("produk")
      .update({ nama, harga, kategori, deskripsi, foto_url })
      .eq("id", idAngka);

    if (updateError) {
      return { error: `Gagal menyimpan perubahan: ${updateError.message}` };
    }
  } catch (err) {
    return { error: err.message || "Terjadi kesalahan saat menyimpan perubahan." };
  }

  // 5. Redirect kembali ke /admin setelah berhasil
  redirect("/admin");
}
