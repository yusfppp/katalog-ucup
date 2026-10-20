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

