"use client";

import { useActionState } from "react";
import Input from "@/components/Input";
import Button from "@/components/Button";

export default function FormPassword({ action }) {
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
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
        label="Password baru"
        name="password_baru"
        type="password"
        autoComplete="new-password"
        minLength={8}
        maxLength={72}
        placeholder="Minimal 8 karakter"
        required
        error={state?.fieldErrors?.password_baru}
        disabled={isPending}
      />
      <Input
        label="Ulangi password baru"
        name="konfirmasi_password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        maxLength={72}
        placeholder="Ketik ulang password baru"
        required
        error={state?.fieldErrors?.konfirmasi_password}
        disabled={isPending}
      />
      <div className="pt-2">
        <Button type="submit" variant="primary" size="md" loading={isPending} disabled={isPending}>
          {isPending ? "Menyimpan..." : "Simpan Password Baru"}
        </Button>
      </div>
    </form>
  );
}
