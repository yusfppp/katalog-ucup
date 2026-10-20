"use client";

import { useState } from "react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { toko } from "@/lib/toko";

export default function FormPemesanan() {
  const [nama, setNama] = useState("");
  const [telepon, setTelepon] = useState("");
  const [paket, setPaket] = useState("Box 12 - Favorit Keluarga (Rp 65.000)");
  const [jumlah, setJumlah] = useState(1);
  const [catatan, setCatatan] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [waktu, setWaktu] = useState("");

  const paketOptions = [
    { label: "Box 6 - Mini Bites (Rp 35.000)", value: "Box 6 - Mini Bites (Rp 35.000)" },
    { label: "Box 12 - Favorit Keluarga (Rp 65.000) [Paling Populer]", value: "Box 12 - Favorit Keluarga (Rp 65.000)" },
    { label: "Box 24 - Party Box (Rp 120.000)", value: "Box 24 - Party Box (Rp 120.000)" },
    { label: "Custom Mix Sesuai Selera", value: "Custom Mix Sesuai Selera" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const nomor = (toko.nomorWhatsApp || "").replace(/\D/g, "");

    const pesan = [
      `Halo Alfa Bites! Saya ingin memesan donat mini:`,
      `• Nama: ${nama || "-"}`,
      `• WhatsApp: ${telepon || "-"}`,
      `• Paket: ${paket}`,
      `• Jumlah: ${jumlah} Box`,
      tanggal ? `• Tanggal Kirim: ${tanggal}` : null,
      waktu ? `• Jam Pengantaran: ${waktu}` : null,
      catatan ? `• Pilihan Topping / Catatan: ${catatan}` : null,
      `Mohon info total dan ketersediaannya ya. Terima kasih! 🍩`,
    ]
      .filter(Boolean)
      .join("\n");

    const urlWA = `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;
    window.open(urlWA, "_blank", "noopener,noreferrer");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[20px] border-[1.5px] border-border bg-surface p-6 sm:p-10 shadow-warm flex flex-col gap-5 max-w-2xl mx-auto"
    >
      <div className="border-b border-border/60 pb-4">
        <h3 className="font-heading text-2xl font-bold text-secondary">
          Formulir Pemesanan Donat
        </h3>
        <p className="text-sm text-text-muted mt-1">
          Isi detail pesanan di bawah ini, lalu klik tombol untuk langsung terhubung ke WhatsApp toko kami.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Nama Lengkap"
          name="nama"
          placeholder="Nama Anda"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          required
        />
        <Input
          label="Nomor WhatsApp"
          name="telepon"
          type="tel"
          placeholder="0812-xxxx-xxxx"
          value={telepon}
          onChange={(e) => setTelepon(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <div className="sm:col-span-2">
          <Input
            label="Pilihan Paket Donat"
            name="paket"
            type="select"
            options={paketOptions}
            value={paket}
            onChange={(e) => setPaket(e.target.value)}
            required
          />
        </div>
        <div>
          <Input
            label="Jumlah Box"
            name="jumlah"
            type="stepper"
            min={1}
            max={50}
            value={jumlah}
            onChange={(e) => setJumlah(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Tanggal Kirim / Ambil"
          name="tanggal"
          type="date"
          value={tanggal}
          onChange={(e) => setTanggal(e.target.value)}
        />
        <Input
          label="Jam Pengantaran"
          name="waktu"
          type="time"
          value={waktu}
          onChange={(e) => setWaktu(e.target.value)}
        />
      </div>

      <Input
        label="Request Topping & Catatan Khusus"
        name="catatan"
        type="textarea"
        rows={3}
        placeholder="Contoh: Tolong topping Choco Crunch 4 pcs, Tiramisu 4 pcs, Lotus Biscoff 4 pcs. Donat jangan terlalu manis."
        value={catatan}
        onChange={(e) => setCatatan(e.target.value)}
        maxLength={200}
      />

      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          leftIcon={<span className="text-xl">💬</span>}
          rightIcon={<span>👉</span>}
          className="shadow-lg"
        >
          Kirim Pesanan ke WhatsApp Sekarang
        </Button>
        <p className="text-center text-xs text-text-muted mt-2.5">
          🔒 Pesanan langsung terhubung secara aman ke WhatsApp resmi {toko.nama}.
        </p>
      </div>
    </form>
  );
}

