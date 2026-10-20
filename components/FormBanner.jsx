"use client";

import { useActionState } from "react";
import Input from "@/components/Input";
import Button from "@/components/Button";

export default function FormBanner({ action, banner = null }) {
  const [state, formAction, isPending] = useActionState(action, null);
  const sedangUbah = Boolean(banner);

  return (
    <form
      action={formAction}
      encType="multipart/form-data"
      className="flex flex-col gap-4 rounded-[20px] border-[1.5px] border-border bg-surface p-5 shadow-warm sm:p-6"
    >
      <div>
        <h2 className="font-heading text-xl font-bold text-secondary">
          {sedangUbah ? "Ubah banner" : "Tambah banner promo"}
        </h2>
        <p className="text-xs text-text-muted">
          Banner aktif akan tampil di beranda. Gambar bersifat opsional.
        </p>
      </div>

      {state?.error && (
        <div
          role="alert"
          className="rounded-xl border border-error/30 bg-error/10 p-3 text-sm font-semibold text-error"
        >
          {state.error}
        </div>
      )}
      {state?.success && (
        <div
          role="status"
          className="rounded-xl border border-success/30 bg-success/10 p-3 text-sm font-semibold text-success"
        >
          {state.success}
        </div>
      )}

      <Input
        label="Judul banner"
        name="judul"
        defaultValue={banner?.judul || ""}
        required
        maxLength={120}
        error={state?.fieldErrors?.judul}
        disabled={isPending}
      />
      <Input
        label="Teks banner"
        name="teks"
        textarea
        rows={3}
        defaultValue={banner?.teks || ""}
        required
        maxLength={500}
        error={state?.fieldErrors?.teks}
        disabled={isPending}
      />
      <Input
        label="Tautan (opsional)"
        name="tautan"
        defaultValue={banner?.tautan || ""}
        placeholder="/produk/1 atau https://..."
        maxLength={300}
        error={state?.fieldErrors?.tautan}
        helperText="Boleh path internal (diawali /) atau URL lengkap."
        disabled={isPending}
      />
      <Input
        label="Gambar banner (opsional)"
        name="gambar"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        previewUrl={banner?.gambar_url || ""}
        error={state?.fieldErrors?.gambar}
        helperText="JPG, PNG, atau WEBP maksimal 2MB."
        disabled={isPending}
      />
      <Input
        label="Tampilkan banner"
        name="aktif"
        type="switch"
        defaultChecked={banner?.aktif !== false}
        disabled={isPending}
      />

      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="primary" loading={isPending} disabled={isPending}>
          {isPending ? "Menyimpan..." : sedangUbah ? "Simpan Perubahan" : "Tambah Banner"}
        </Button>
        {sedangUbah && (
          <Button href="/admin/banner" variant="secondary" disabled={isPending}>
            Batal
          </Button>
        )}
      </div>
    </form>
  );
}
