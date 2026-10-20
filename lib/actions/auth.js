"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { buatKlienSesiAdmin } from "@/lib/supabase/server";
import { ambilAdminAksi } from "@/lib/auth";
import { catatLog } from "@/lib/log";

export async function login(formData) {
  const email = formData?.get("email")?.toString().trim();
  const password = formData?.get("password")?.toString();

  if (!email || !password) {
    redirect("/admin/login?error=" + encodeURIComponent("Email dan password wajib diisi."));
  }

  let errorPesan = null;

  try {
    const supabase = await buatKlienSesiAdmin();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      errorPesan = error.message?.toLowerCase().includes("invalid login credentials")
        ? "Email atau password salah."
        : error.message;
    } else if (data?.user?.banned_until && new Date(data.user.banned_until) > new Date()) {
      await supabase.auth.signOut();
      errorPesan = "Akun admin ini sedang dinonaktifkan.";
    } else {
      await catatLog({
        adminEmail: data?.user?.email || email,
        aksi: "login",
        entitas: "akun",
        detail: "Admin masuk ke dashboard.",
      });
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
    if (email) queryParams.set("email", email);
    redirect(`/admin/login?${queryParams.toString()}`);
  }

  redirect("/admin");
}

export async function keluar() {
  try {
    const supabase = await buatKlienSesiAdmin();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.email) {
      await catatLog({
        adminEmail: user.email,
        aksi: "keluar",
        entitas: "akun",
        detail: "Admin keluar dari dashboard.",
      });
    }

    await supabase.auth.signOut();
  } catch (err) {
    if (err?.message === "NEXT_REDIRECT" || err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
  }

  redirect("/admin/login");
}

export async function gantiPassword(prevState, formData) {
  const { user, error: authError } = await ambilAdminAksi();
  if (!user) {
    return { error: authError };
  }

  const passwordBaru = formData?.get("password_baru")?.toString() || "";
  const konfirmasi = formData?.get("konfirmasi_password")?.toString() || "";
  const errors = {};

  if (passwordBaru.length < 8) {
    errors.password_baru = "Password baru minimal 8 karakter.";
  }
  if (passwordBaru.length > 72) {
    errors.password_baru = "Password maksimal 72 karakter.";
  }
  if (passwordBaru !== konfirmasi) {
    errors.konfirmasi_password = "Password baru dan konfirmasi harus sama.";
  }

  if (Object.keys(errors).length) {
    return { error: "Periksa kembali password yang diisi.", fieldErrors: errors };
  }

  try {
    const supabase = await buatKlienSesiAdmin();
    const { error } = await supabase.auth.updateUser({ password: passwordBaru });
    if (error) {
      return { error: error.message || "Gagal mengganti password." };
    }

    await catatLog({
      adminEmail: user.email,
      aksi: "ubah",
      entitas: "akun",
      detail: "Mengganti password akun sendiri.",
    });

    revalidatePath("/admin/password");
    return { success: "Password berhasil diganti." };
  } catch (err) {
    return { error: err.message || "Terjadi kesalahan saat mengganti password." };
  }
}
