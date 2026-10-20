"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { KUNCI_SIMPAN, bacaSimpanan, tulisSimpanan } from "@/lib/penyimpanan";

const KeranjangContext = createContext(null);

export function kunciItem(item) {
  return `${item.id}::${item.varian_label || ""}`;
}

function rapikanItem(item) {
  const angka = (nilai, cadangan = 0) => {
    const hasil = Number(nilai);
    return Number.isFinite(hasil) ? hasil : cadangan;
  };

  return {
    id: Number(item.id),
    nama: String(item.nama || ""),
    harga: Math.max(0, angka(item.harga)),
    harga_normal: Math.max(0, angka(item.harga_normal, angka(item.harga))),
    foto_url: item.foto_url || "",
    kategori_nama: item.kategori_nama || "",
    kategori_slug: item.kategori_slug || "",
    varian_label: item.varian_label || "",
    varian_harga: item.varian_harga ? angka(item.varian_harga) : null,
    stok: item.stok === null || item.stok === undefined ? 99 : Math.max(0, angka(item.stok, 99)),
    jumlah: Math.max(1, Math.min(99, angka(item.jumlah, 1))),
  };
}

function bacaKeranjang() {
  const data = bacaSimpanan(KUNCI_SIMPAN.keranjang, []);
  if (!Array.isArray(data)) return [];
  return data
    .filter((item) => item && Number.isSafeInteger(Number(item.id)) && Number(item.id) > 0)
    .map(rapikanItem);
}

export function KeranjangProvider({ children }) {
  const [items, setItems] = useState([]);
  const [sudahSiap, setSudahSiap] = useState(false);

  useEffect(() => {
    setItems(bacaKeranjang());
    setSudahSiap(true);
  }, []);

  useEffect(() => {
    if (sudahSiap) tulisSimpanan(KUNCI_SIMPAN.keranjang, items);
  }, [items, sudahSiap]);

  function tambah(item, jumlah = 1) {
    const baru = rapikanItem({ ...item, jumlah });
    setItems((lama) => {
      const kunci = kunciItem(baru);
      const indeks = lama.findIndex((isi) => kunciItem(isi) === kunci);
      if (indeks >= 0) {
        const berikut = [...lama];
        const maks = Math.max(1, Math.min(99, baru.stok || 99));
        berikut[indeks] = {
          ...berikut[indeks],
          ...baru,
          jumlah: Math.min(maks, berikut[indeks].jumlah + baru.jumlah),
        };
        return berikut;
      }
      return [...lama, { ...baru, jumlah: Math.min(Math.max(1, jumlah), Math.max(1, baru.stok || 99)) }];
    });
  }

  function ubahJumlah(kunci, jumlah) {
    setItems((lama) =>
      lama.map((item) => {
        if (kunciItem(item) !== kunci) return item;
        const maks = Math.max(1, Math.min(99, item.stok || 99));
        return { ...item, jumlah: Math.max(1, Math.min(maks, Number(jumlah) || 1)) };
      })
    );
  }

  function hapus(kunci) {
    setItems((lama) => lama.filter((item) => kunciItem(item) !== kunci));
  }

  function kosongkan() {
    setItems([]);
  }

  function gantiSemua(daftar) {
    setItems(Array.isArray(daftar) ? daftar.map(rapikanItem) : []);
  }

  const total = useMemo(
    () => items.reduce((jumlah, item) => jumlah + item.harga * item.jumlah, 0),
    [items]
  );
  const jumlahItem = useMemo(
    () => items.reduce((jumlah, item) => jumlah + item.jumlah, 0),
    [items]
  );

  const nilai = useMemo(
    () => ({
      items,
      sudahSiap,
      total,
      jumlahItem,
      tambah,
      ubahJumlah,
      hapus,
      kosongkan,
      gantiSemua,
    }),
    [items, sudahSiap, total, jumlahItem]
  );

  return <KeranjangContext.Provider value={nilai}>{children}</KeranjangContext.Provider>;
}

export function useKeranjang() {
  const konteks = useContext(KeranjangContext);
  if (!konteks) {
    throw new Error("useKeranjang harus dipakai di dalam KeranjangProvider.");
  }
  return konteks;
}
