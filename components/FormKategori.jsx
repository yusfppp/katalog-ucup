"use client";

import { useActionState } from "react";
import Input from "@/components/Input";
import Button from "@/components/Button";

export default function FormKategori({ action, kategori = null }) {
  const [state, formAction, isPending] = useActionState(action, null);
  const sedangUbah = Boolean(kategori);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-[20px] border-[1.5px] border-border bg-surface p-5 shadow-warm sm:p-6"
    >
      <div>
        <h2 className="font-heading text-xl font-bold text-secondary">
          {sedangUbah ? `Ubah kategori "${kategori.nama}"` : "Tambah kategori baru"}
        </h2>
        <p className="text-xs text-text-muted">
          Slug dibuat otomatis dari nama kategori dan selalu unik.
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
        label="Nama kategori"
        name="nama"
        defaultValue={kategori?.nama || ""}
        required
        maxLength={60}
        placeholder="Contoh: Donat Klasik"
        error={state?.fieldErrors?.nama}
        disabled={isPending}
      />

      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="primary" loading={isPending} disabled={isPending}>
          {isPending ? "Menyimpan..." : sedangUbah ? "Simpan Perubahan" : "Tambah Kategori"}
        </Button>
        {sedangUbah && (
          <Button href="/admin/kategori" variant="secondary" disabled={isPending}>
            Batal
          </Button>
        )}
      </div>
    </form>
  );
}
