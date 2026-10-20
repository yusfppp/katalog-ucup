"use client";

import { useActionState } from "react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { tambahProduk } from "@/app/admin/actions";

// Dipakai untuk tambah produk (US-08) dan ubah produk (US-09).
export default function FormProduk({
  produk = {},
  labelTombol = "Simpan Donat",
  action = tambahProduk,
}) {
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <form
      action={formAction}
      className="flex max-w-xl flex-col gap-5 bg-surface p-6 sm:p-8 rounded-[20px] border-[1.5px] border-border shadow-warm"
    >
      {/* PESAN ERROR DARI SERVER ACTION */}
      {state?.error && (
        <div className="rounded-xl border border-error/30 bg-error/10 p-3.5 text-sm font-semibold text-error flex items-center gap-2">
          <span>⚠️</span>
          <span>{state.error}</span>
        </div>
      )}

      <Input
        label="Nama donat"
        name="nama"
        defaultValue={produk.nama}
        required
        placeholder="Contoh: Donat Mini Choco Crunch"
        disabled={isPending}
      />

      <Input
        label="Harga (Rp)"
        name="harga"
        type="number"
        min="0"
        defaultValue={produk.harga}
        required
        placeholder="Contoh: 35000"
        disabled={isPending}
      />

      <Input
        label="Kategori"
        name="kategori"
        defaultValue={produk.kategori}
        placeholder="Contoh: Best Seller / Special Topping"
        disabled={isPending}
      />

      <Input
        label="Link foto donat"
        name="foto_url"
        placeholder="https://... atau /produk/nama-file.svg"
        defaultValue={produk.foto_url}
        disabled={isPending}
      />

      <Input
        label="Deskripsi donat"
        name="deskripsi"
        textarea
        defaultValue={produk.deskripsi}
        placeholder="Jelaskan rasa, tekstur, dan topping donat ini..."
        disabled={isPending}
      />

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          variant="primary"
          loading={isPending}
          disabled={isPending}
        >
          {isPending ? "Menyimpan donat..." : labelTombol}
        </Button>
        <Button href="/admin" variant="secondary" disabled={isPending}>
          Batal
        </Button>
      </div>
    </form>
  );
}
