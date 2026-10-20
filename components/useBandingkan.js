"use client";

import { useEffect, useState } from "react";
import {
  EVENT_SIMPANAN,
  KUNCI_SIMPAN,
  bacaDaftarId,
  tulisDaftarId,
} from "@/lib/penyimpanan";

const MAKS_BANDING = 2;

export function useBandingkan(id) {
  const angka = Number(id);
  const [ids, setIds] = useState([]);
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    const sinkron = () => setIds(bacaDaftarId(KUNCI_SIMPAN.banding).slice(0, MAKS_BANDING));
    sinkron();
    setSiap(true);
    window.addEventListener(EVENT_SIMPANAN, sinkron);
    window.addEventListener("storage", sinkron);
    return () => {
      window.removeEventListener(EVENT_SIMPANAN, sinkron);
      window.removeEventListener("storage", sinkron);
    };
  }, []);

  const aktif = ids.includes(angka);

  function toggle() {
    if (aktif) {
      const hasil = tulisDaftarId(
        KUNCI_SIMPAN.banding,
        ids.filter((item) => item !== angka)
      );
      setIds(hasil);
      return { aktif: false, pesan: "Dihapus dari perbandingan." };
    }

    let berikut = [...ids, angka];
    let diganti = false;
    if (berikut.length > MAKS_BANDING) {
      berikut = berikut.slice(-MAKS_BANDING);
      diganti = true;
    }
    const hasil = tulisDaftarId(KUNCI_SIMPAN.banding, berikut);
    setIds(hasil);
    return {
      aktif: true,
      pesan: diganti
        ? "Ditambahkan. Pilihan paling lama diganti karena maksimal 2 produk."
        : "Ditambahkan ke perbandingan.",
    };
  }

  return { aktif, toggle, siap, ids };
}

export function useDaftarBandingkan() {
  const [ids, setIds] = useState([]);
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    const sinkron = () => setIds(bacaDaftarId(KUNCI_SIMPAN.banding).slice(0, MAKS_BANDING));
    sinkron();
    setSiap(true);
    window.addEventListener(EVENT_SIMPANAN, sinkron);
    window.addEventListener("storage", sinkron);
    return () => {
      window.removeEventListener(EVENT_SIMPANAN, sinkron);
      window.removeEventListener("storage", sinkron);
    };
  }, []);

  return { ids, siap };
}
