"use client";

import { useActionState } from "react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { imporProduk } from "@/lib/actions/impor";

export default function FormImpor() {
  const [state, formAction, isPending] = useActionState(imporProduk, null);

  return (
    <div className="flex flex-col gap-6">
      <form
        action={formAction}
        encType="multipart/form-data"
        className="flex max-w-2xl flex-col gap-5 rounded-[20px] border-[1.5px] border-border bg-surface p-5 shadow-warm sm:p-8"
      >
        {state?.error && (
          <div
            role="alert"
            className="rounded-xl border border-error/30 bg-error/10 p-3.5 text-sm font-semibold text-error"
          >
            {state.error}
          </div>
        )}

        {state?.ringkasan && (
          <div
            role="status"
            className="rounded-xl border border-info/30 bg-info/10 p-4 text-sm font-semibold text-info"
          >
            Impor selesai: <strong>{state.ringkasan.berhasil}</strong> berhasil,{" "}
            <strong>{state.ringkasan.gagal}</strong> gagal dari {state.ringkasan.total} baris.
          </div>
        )}

        <div className="rounded-xl border border-border bg-bg/40 p-4 text-sm text-text-muted">
          <p className="font-bold text-secondary">Format kolom CSV</p>
          <p className="mt-1 font-mono text-xs break-all">
            id, nama, harga, kategori, deskripsi, foto_url, stok, harga_diskon, badge, aktif, urutan
          </p>
          <p className="mt-2">
            Kolom <strong>nama</strong>, <strong>harga</strong>, dan <strong>kategori</strong> wajib
            berisi. Kategori harus sudah ada di /admin/kategori. Maksimal 200 baris dan 512KB.
          </p>
        </div>

        <Input
          label="File CSV"
          name="file"
          type="file"
          accept=".csv,text/csv"
          required
          error={state?.fieldErrors?.file}
          helperText="Unduh template di bawah agar format kolom sesuai."
          disabled={isPending}
        />

        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="primary" loading={isPending} disabled={isPending}>
            {isPending ? "Mengimpor..." : "Impor Produk"}
          </Button>
          <Button href="/admin/impor/template" variant="secondary" disabled={isPending}>
            Unduh Template CSV
          </Button>
          <Button href="/admin" variant="tertiary" disabled={isPending}>
            Kembali
          </Button>
        </div>
      </form>

      {state?.errors?.length > 0 && (
        <div className="max-w-3xl overflow-x-auto rounded-[20px] border-[1.5px] border-error/30 bg-surface shadow-warm">
          <table className="w-full min-w-[520px] text-left text-sm">
            <caption className="px-4 py-3 text-left font-heading text-lg font-bold text-error">
              Baris yang gagal
            </caption>
            <thead className="border-y border-border bg-error/5 text-secondary">
              <tr>
                <th className="px-4 py-3 font-heading text-base font-bold">Nomor Baris</th>
                <th className="px-4 py-3 font-heading text-base font-bold">Alasan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {state.errors.map((item) => (
                <tr key={`${item.baris}-${item.alasan}`}>
                  <td className="px-4 py-3 font-bold text-error">{item.baris}</td>
                  <td className="px-4 py-3 text-text">{item.alasan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
