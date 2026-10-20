"use server";

import { revalidatePath } from "next/cache";
import { ambilAdminAksi } from "@/lib/auth";
import { buatKlienAuthAdmin } from "@/lib/supabase/server";
import { catatLog } from "@/lib/log";
import { validasiAkunAdmin } from "@/lib/validasi";

function akunAktif(user) {
  if (!user) return false;
  if (!user.banned_until) return true;
  return new Date(user.banned_until).getTime() <= Date.now();
}

async function daftarAdminAdmin() {
  const supabase = buatKlienAuthAdmin();
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw new Error(error.message);
  return data?.users || [];
}

export async function tambahAdmin(prevState, formData) {
  const { user, error: authError } = await ambilAdminAksi();
  if (!user) return { error: authError, fieldErrors: {} };

  const cek = validasiAkunAdmin({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!cek.valid) {
    return { error: "Periksa kembali data admin baru.", fieldErrors: cek.errors };
  }

  try {
    const supabase = buatKlienAuthAdmin();
    const { data, error } = await supabase.auth.admin.createUser({
      email: cek.data.email,
      password: cek.data.password,
      email_confirm: true,
    });

    if (error) {
      const pesan = /already been registered|already exists/i.test(error.message || "")
        ? "Email tersebut sudah terdaftar sebagai admin."
        : error.message;
      return { error: pesan, fieldErrors: {} };
    }

    await catatLog({
      adminEmail: user.email,
      aksi: "tambah",
      entitas: "akun",
      detail: `Menambah admin baru ${cek.data.email} (ID ${data.user?.id}).`,
    });

    revalidatePath("/admin/akun");
    return { success: `Admin ${cek.data.email} berhasil ditambahkan.` };
  } catch (err) {
    return { error: err.message || "Gagal menambah admin.", fieldErrors: {} };
  }
}

export async function ubahStatusAdmin(id, aktif) {
  const { user, error: authError } = await ambilAdminAksi();
  if (!user) return { error: authError };
  if (!id) return { error: "ID admin tidak valid." };
  if (String(id) === String(user.id) && !aktif) {
    return { error: "Kamu tidak bisa menonaktifkan akunmu sendiri." };
  }

  try {
    const supabase = buatKlienAuthAdmin();
    const { data: targetData, error: targetError } = await supabase.auth.admin.getUserById(id);
    if (targetError || !targetData?.user) {
      return { error: "Admin tidak ditemukan." };
    }
    const target = targetData.user;

    if (!aktif) {
      const semua = await daftarAdminAdmin();
      const aktifCount = semua.filter(akunAktif).length;
      if (akunAktif(target) && aktifCount <= 1) {
        return { error: "Tidak bisa menonaktifkan admin terakhir yang masih aktif." };
      }
    }

    const { error } = await supabase.auth.admin.updateUserById(id, {
      ban_duration: aktif ? "none" : "876000h",
    });

    if (error) return { error: error.message };

    await catatLog({
      adminEmail: user.email,
      aksi: aktif ? "aktifkan" : "nonaktifkan",
      entitas: "akun",
      detail: `${aktif ? "Mengaktifkan" : "Menonaktifkan"} admin ${target.email}.`,
    });

    revalidatePath("/admin/akun");
    return { success: `Admin ${target.email} berhasil ${aktif ? "diaktifkan" : "dinonaktifkan"}.` };
  } catch (err) {
    return { error: err.message || "Gagal mengubah status admin." };
  }
}

export async function hapusAdmin(id) {
  const { user, error: authError } = await ambilAdminAksi();
  if (!user) return { error: authError };
  if (!id) return { error: "ID admin tidak valid." };
  if (String(id) === String(user.id)) {
    return { error: "Kamu tidak bisa menghapus akunmu sendiri." };
  }

  try {
    const supabase = buatKlienAuthAdmin();
    const { data: targetData, error: targetError } = await supabase.auth.admin.getUserById(id);
    if (targetError || !targetData?.user) {
      return { error: "Admin tidak ditemukan." };
    }
    const target = targetData.user;

    const semua = await daftarAdminAdmin();
    const aktifCount = semua.filter(akunAktif).length;
    if (akunAktif(target) && aktifCount <= 1) {
      return { error: "Tidak bisa menghapus admin terakhir yang masih aktif." };
    }

    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) return { error: error.message };

    await catatLog({
      adminEmail: user.email,
      aksi: "hapus",
      entitas: "akun",
      detail: `Menghapus admin ${target.email}.`,
    });

    revalidatePath("/admin/akun");
    return { success: `Admin ${target.email} berhasil dihapus.` };
  } catch (err) {
    return { error: err.message || "Gagal menghapus admin." };
  }
}
