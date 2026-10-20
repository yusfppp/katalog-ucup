"use client";

import { useActionState } from "react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { simpanPengaturan } from "@/lib/actions/pengaturan";

export default function FormPengaturan({ toko }) {
  const [state, formAction, isPending] = useActionState(simpanPengaturan, null);

  return (
    <form
      action={formAction}
      className="flex w-full max-w-2xl flex-col gap-5 rounded-[20px] border-[1.5px] border-border bg-surface p-5 shadow-warm sm:p-8"
    >
      {state?.error && (
        <div
          role="alert"
          className="rounded-xl border border-error/30 bg-error/10 p-3.5 text-sm font-semibold text-error"
        >
          {state.error}
        </div>
      )}
      {state?.success && (
        <div
          role="status"
          className="rounded-xl border border-success/30 bg-success/10 p-3.5 text-sm font-semibold text-success"
        >
          {state.success}
        </div>
      )}

      <Input
        label="Nama toko"
        name="nama"
        defaultValue={toko.nama}
        required
        maxLength={100}
        error={state?.fieldErrors?.nama}
        disabled={isPending}
      />
      <Input
        label="Tagline"
        name="tagline"
        defaultValue={toko.tagline}
        required
        maxLength={160}
        error={state?.fieldErrors?.tagline}
        disabled={isPending}
      />
      <Input
        label="Nomor WhatsApp"
        name="whatsapp"
        type="tel"
        defaultValue={toko.nomorWhatsApp}
        required
        placeholder="6281234567890"
        error={state?.fieldErrors?.whatsapp}
        helperText="Boleh diawali 08 atau 62. Nomor akan disimpan dalam format internasional 62..."
        disabled={isPending}
      />
      <Input
        label="Alamat toko"
        name="alamat"
        textarea
        rows={3}
        defaultValue={toko.alamat}
        required
        maxLength={500}
        error={state?.fieldErrors?.alamat}
        disabled={isPending}
      />
      <Input
        label="Jam buka"
        name="jam_buka"
        defaultValue={toko.jamBuka}
        required
        maxLength={120}
        placeholder="Setiap hari, 08.00–20.00"
        error={state?.fieldErrors?.jam_buka}
        disabled={isPending}
      />
      <Input
        label="Instagram"
        name="instagram"
        defaultValue={toko.instagram || ""}
        maxLength={100}
        placeholder="alfabites"
        error={state?.fieldErrors?.instagram}
        helperText="Isi nama pengguna tanpa @, atau URL profil lengkap."
        disabled={isPending}
      />

      <div className="flex flex-wrap gap-2 pt-2">
        <Button type="submit" variant="primary" loading={isPending} disabled={isPending}>
          {isPending ? "Menyimpan..." : "Simpan Pengaturan"}
        </Button>
        <Button href="/admin" variant="secondary" disabled={isPending}>
          Kembali ke Dashboard
        </Button>
      </div>
    </form>
  );
}
