"use client";

import { useActionState, useEffect, useRef } from "react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { kirimUlasan } from "@/lib/actions/publik";

const OPSI_RATING = [5, 4, 3, 2, 1].map((nilai) => ({
  label: `${"★".repeat(nilai)}${"☆".repeat(5 - nilai)} (${nilai})`,
  value: String(nilai),
}));

export default function FormUlasan({ produkId }) {
  const [state, formAction, isPending] = useActionState(kirimUlasan, null);
  const formRef = useRef(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state?.success]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-4 rounded-[20px] border-[1.5px] border-border bg-surface p-5 shadow-warm sm:p-6"
    >
      <input type="hidden" name="produk_id" value={produkId} />
      <input
        type="text"
        name="website"
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div>
        <h3 className="font-heading text-xl font-bold text-secondary">Tulis Ulasan</h3>
        <p className="text-xs text-text-muted">
          Ceritakan pengalamanmu. Ulasan tampil setelah dikirim dan bisa dimoderasi admin.
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
        label="Nama"
        name="nama"
        maxLength={50}
        minLength={2}
        required
        placeholder="Nama kamu"
        error={state?.fieldErrors?.nama}
        disabled={isPending}
      />
      <Input
        label="Rating"
        name="rating"
        type="radio"
        options={OPSI_RATING}
        defaultValue="5"
        required
        error={state?.fieldErrors?.rating}
        disabled={isPending}
      />
      <Input
        label="Komentar"
        name="komentar"
        textarea
        rows={4}
        minLength={5}
        maxLength={500}
        required
        placeholder="Apa yang kamu suka dari produk ini?"
        error={state?.fieldErrors?.komentar}
        disabled={isPending}
      />

      <Button type="submit" variant="primary" loading={isPending} disabled={isPending}>
        {isPending ? "Mengirim..." : "Kirim Ulasan"}
      </Button>
    </form>
  );
}
