"use client";

import { useActionState } from "react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { tanyaProdukAI } from "@/lib/actions/publik";

export default function TanyaAI({ produkId, namaProduk }) {
  const [state, formAction, isPending] = useActionState(tanyaProdukAI, null);

  return (
    <div className="flex flex-col gap-4 rounded-[20px] border-[1.5px] border-border bg-surface p-5 shadow-warm sm:p-6">
      <div>
        <h3 className="font-heading text-xl font-bold text-secondary">Tanya Asisten AI</h3>
        <p className="text-xs text-text-muted">
          Jawaban dibuat dari data produk {namaProduk}. Untuk kepastian stok dan pengiriman,
          konfirmasi lewat WhatsApp.
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-3">
        <input type="hidden" name="produk_id" value={produkId} />
        <Input
          label="Pertanyaan"
          name="pertanyaan"
          textarea
          rows={3}
          maxLength={200}
          required
          placeholder="Contoh: Apakah produk ini cocok untuk hadiah?"
          disabled={isPending}
        />
        <Button type="submit" variant="secondary" loading={isPending} disabled={isPending}>
          {isPending ? "Mencari jawaban..." : "Tanya AI"}
        </Button>
      </form>

      {state?.error && (
        <div
          role="alert"
          className="rounded-xl border border-error/30 bg-error/10 p-3 text-sm font-semibold text-error"
        >
          {state.error}
        </div>
      )}

      {state?.jawaban && (
        <div
          role="status"
          className="rounded-xl border border-success/30 bg-success/10 p-4 text-sm leading-relaxed text-text"
        >
          <p className="mb-1 font-bold text-success">Jawaban asisten</p>
          <p className="whitespace-pre-line">{state.jawaban}</p>
        </div>
      )}
    </div>
  );
}
