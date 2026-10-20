"use client";

import { useActionState, useState } from "react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { tambahProduk, buatDeskripsiAI } from "@/lib/actions/produk";

export default function FormProduk({
  produk = {},
  kategoriList = [],
  labelTombol = "Simpan Donat",
  action = tambahProduk,
}) {
  const [state, formAction, isPending] = useActionState(action, null);
  const [nama, setNama] = useState(produk.nama || "");
  const [kategoriId, setKategoriId] = useState(
    produk.kategori_id ? String(produk.kategori_id) : ""
  );
  const [deskripsi, setDeskripsi] = useState(produk.deskripsi || "");
  const [varian, setVarian] = useState(
    (produk.varian || []).map((item) => ({
      label: item.label || "",
      harga: String(item.harga ?? ""),
    }))
  );
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const fotoGaleri = (produk.foto_produk || []).filter(
    (foto) => Number(foto.urutan) > 0
  );

  const kategoriOptions = kategoriList.map((kategori) => ({
    value: String(kategori.id),
    label: kategori.nama,
  }));

  const tambahBarisVarian = () => {
    setVarian((sebelum) => [...sebelum, { label: "", harga: "" }]);
  };

  const ubahBarisVarian = (indeks, field, nilai) => {
    setVarian((sebelum) =>
      sebelum.map((item, i) => (i === indeks ? { ...item, [field]: nilai } : item))
    );
  };

  const hapusBarisVarian = (indeks) => {
    setVarian((sebelum) => sebelum.filter((_, i) => i !== indeks));
  };

  const buatDeskripsi = async () => {
    setAiError("");
    if (!nama.trim()) {
      setAiError("Isi nama produk terlebih dahulu.");
      return;
    }

    setAiLoading(true);
    try {
      const hasil = await buatDeskripsiAI(nama, kategoriId);
      if (hasil?.error) {
        setAiError(hasil.error);
      } else if (hasil?.deskripsi) {
        setDeskripsi(hasil.deskripsi);
      }
    } catch {
      setAiError("Gagal menghubungi layanan AI. Coba lagi.");
    } finally {
      setAiLoading(false);
    }
  };

  const fieldErrors = state?.fieldErrors || {};

  return (
    <form
      action={formAction}
      encType="multipart/form-data"
      className="flex w-full max-w-3xl flex-col gap-6 rounded-[20px] border-[1.5px] border-border bg-surface p-5 shadow-warm sm:p-8"
    >
      {state?.error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-error/30 bg-error/10 p-3.5 text-sm font-semibold text-error"
        >
          <span aria-hidden="true">⚠️</span>
          <span>{state.error}</span>
        </div>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-xl font-bold text-secondary">Informasi Produk</h2>

        <Input
          label="Nama produk"
          name="nama"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          required
          maxLength={120}
          placeholder="Contoh: Donat Mini Choco Crunch"
          error={fieldErrors.nama}
          disabled={isPending}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Harga normal (Rp)"
            name="harga"
            type="number"
            min="1"
            step="1"
            defaultValue={produk.harga ?? ""}
            required
            placeholder="Contoh: 35000"
            error={fieldErrors.harga}
            helperText="Angka bulat, tanpa titik atau koma."
            disabled={isPending}
          />
          <Input
            label="Harga diskon (Rp)"
            name="harga_diskon"
            type="number"
            min="0"
            step="1"
            defaultValue={produk.harga_diskon ?? ""}
            placeholder="Kosongkan jika tidak ada diskon"
            error={fieldErrors.harga_diskon}
            helperText="Harus lebih kecil dari harga normal."
            disabled={isPending}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Stok"
            name="stok"
            type="number"
            min="0"
            step="1"
            defaultValue={produk.stok ?? 20}
            required
            error={fieldErrors.stok}
            helperText="Isi 0 untuk menandai produk habis."
            disabled={isPending}
          />
          <Input
            label="Kategori"
            name="kategori_id"
            type="select"
            options={kategoriOptions}
            value={kategoriId}
            onChange={(e) => setKategoriId(e.target.value)}
            required
            placeholder="Pilih kategori"
            error={fieldErrors.kategori_id}
            disabled={isPending || kategoriOptions.length === 0}
            helperText={
              kategoriOptions.length === 0
                ? "Belum ada kategori. Tambahkan kategori lebih dulu di /admin/kategori."
                : undefined
            }
          />
        </div>

        <Input
          label="Badge produk"
          name="badge"
          type="select"
          options={[
            { value: "", label: "Tanpa badge" },
            { value: "Baru", label: "Baru" },
            { value: "Terlaris", label: "Terlaris" },
          ]}
          defaultValue={produk.badge || ""}
          error={fieldErrors.badge}
          disabled={isPending}
        />

        <Input
          label="Tampilkan produk di katalog"
          name="aktif"
          type="switch"
          defaultChecked={produk.aktif !== false}
          helperText="Produk nonaktif tidak muncul di katalog dan tidak bisa dibuka pengunjung."
          disabled={isPending}
        />
      </section>

      <section className="flex flex-col gap-4 border-t border-border/60 pt-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-heading text-xl font-bold text-secondary">Deskripsi</h2>
            <p className="text-xs text-text-muted">
              Bisa ditulis manual atau dibuat dengan bantuan AI, lalu tetap bisa diedit.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            loading={aiLoading}
            disabled={isPending || aiLoading}
            onClick={buatDeskripsi}
            leftIcon={<span aria-hidden="true">✨</span>}
          >
            {aiLoading ? "Membuat deskripsi..." : "Buat deskripsi dengan AI"}
          </Button>
        </div>

        {aiError && (
          <div
            role="alert"
            className="rounded-xl border border-error/30 bg-error/10 p-3 text-sm font-semibold text-error"
          >
            {aiError}
          </div>
        )}

        <Input
          label="Deskripsi produk"
          name="deskripsi"
          textarea
          rows={5}
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          maxLength={2000}
          placeholder="Jelaskan rasa, tekstur, dan topping donat ini..."
          error={fieldErrors.deskripsi}
          disabled={isPending}
        />
      </section>

      <section className="flex flex-col gap-4 border-t border-border/60 pt-5">
        <div>
          <h2 className="font-heading text-xl font-bold text-secondary">Foto Produk</h2>
          <p className="text-xs text-text-muted">
            Format JPG, PNG, atau WEBP. Maksimal 2MB per foto.
          </p>
        </div>

        <Input
          label="Foto utama"
          name="foto"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          previewUrl={produk.foto_url || ""}
          error={fieldErrors.foto}
          helperText="Foto utama tampil di kartu katalog."
          disabled={isPending}
        />
        {produk.foto_url && (
          <input type="hidden" name="foto_lama" value={produk.foto_url} />
        )}

        {fotoGaleri.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-bold text-secondary">Foto galeri saat ini</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {fotoGaleri.map((foto) => (
                <div
                  key={foto.id}
                  className="flex flex-col gap-2 rounded-xl border border-border bg-bg/30 p-2"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={foto.url}
                    alt="Foto galeri produk"
                    className="h-28 w-full rounded-lg object-cover"
                  />
                  <Input
                    label="Hapus foto ini"
                    name="hapus_foto"
                    id={`hapus_foto_${foto.id}`}
                    type="checkbox"
                    value={foto.id}
                    disabled={isPending}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <Input
          label="Tambah foto galeri"
          name="foto_tambahan"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          error={fieldErrors.foto_tambahan}
          helperText="Bisa pilih beberapa foto sekaligus."
          disabled={isPending}
        />
      </section>

      <section className="flex flex-col gap-4 border-t border-border/60 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-xl font-bold text-secondary">Varian Harga</h2>
            <p className="text-xs text-text-muted">
              Contoh: Box 6, Box 12. Kosongkan jika produk hanya punya satu harga.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={tambahBarisVarian}
            disabled={isPending || varian.length >= 20}
            leftIcon={<span aria-hidden="true">➕</span>}
          >
            Tambah varian
          </Button>
        </div>

        {fieldErrors.varian && (
          <div
            role="alert"
            className="rounded-xl border border-error/30 bg-error/10 p-3 text-sm font-semibold text-error"
          >
            {fieldErrors.varian}
          </div>
        )}

        {varian.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-bg/30 p-4 text-sm text-text-muted">
            Belum ada varian. Produk akan memakai harga normal.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {varian.map((item, indeks) => (
              <div
                key={indeks}
                className="grid grid-cols-1 items-end gap-3 rounded-xl border border-border bg-bg/30 p-3 sm:grid-cols-[1fr_1fr_auto]"
              >
                <Input
                  label={`Label varian ${indeks + 1}`}
                  name="varian_label"
                  id={`varian_label_${indeks}`}
                  value={item.label}
                  onChange={(e) => ubahBarisVarian(indeks, "label", e.target.value)}
                  maxLength={60}
                  placeholder="Contoh: Box 6"
                  disabled={isPending}
                />
                <Input
                  label={`Harga varian ${indeks + 1} (Rp)`}
                  name="varian_harga"
                  id={`varian_harga_${indeks}`}
                  type="number"
                  min="1"
                  step="1"
                  value={item.harga}
                  onChange={(e) => ubahBarisVarian(indeks, "harga", e.target.value)}
                  placeholder="Contoh: 35000"
                  disabled={isPending}
                />
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => hapusBarisVarian(indeks)}
                  disabled={isPending}
                  aria-label={`Hapus varian ${item.label || indeks + 1}`}
                >
                  Hapus
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="flex flex-col-reverse gap-3 border-t border-border/60 pt-5 sm:flex-row">
        <Button
          type="submit"
          variant="primary"
          loading={isPending}
          disabled={isPending || aiLoading}
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
