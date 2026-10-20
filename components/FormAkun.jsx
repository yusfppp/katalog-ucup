"use client";

import { useActionState } from "react";
import Input from "@/components/Input";
import Button from "@/components/Button";

export default function FormAkun({ action }) {
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-[20px] border-[1.5px] border-border bg-surface p-5 shadow-warm sm:p-6"
    >
      <div>
        <h2 className="font-heading text-xl font-bold text-secondary">Tambah admin baru</h2>
        <p className="text-xs text-text-muted">
          Akun dibuat lewat Supabase Auth dan langsung bisa masuk ke dashboard.
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
        label="Email admin"
        name="email"
        type="email"
        autoComplete="off"
        placeholder="nama@contoh.com"
        required
        error={state?.fieldErrors?.email}
        disabled={isPending}
      />
      <Input
        label="Password awal"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        placeholder="Minimal 8 karakter"
        required
        helperText="Minimal 8 karakter. Minta admin baru menggantinya setelah masuk."
        error={state?.fieldErrors?.password}
        disabled={isPending}
      />

      <Button type="submit" variant="primary" loading={isPending} disabled={isPending}>
        {isPending ? "Menambahkan..." : "Tambah Admin"}
      </Button>
    </form>
  );
}
