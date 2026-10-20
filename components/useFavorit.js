"use client";

import { useEffect, useState } from "react";
import {
  EVENT_SIMPANAN,
  KUNCI_SIMPAN,
  bacaDaftarId,
  tulisDaftarId,
} from "@/lib/penyimpanan";

export function useFavorit(id) {
  const angka = Number(id);
  const [ids, setIds] = useState([]);
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    const sinkron = () => setIds(bacaDaftarId(KUNCI_SIMPAN.favorit));
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
    const berikut = aktif ? ids.filter((item) => item !== angka) : [...ids, angka];
    const hasil = tulisDaftarId(KUNCI_SIMPAN.favorit, berikut);
    setIds(hasil);
    return !aktif;
  }

  return { aktif, toggle, siap };
}

export function useDaftarFavorit() {
  const [ids, setIds] = useState([]);
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    const sinkron = () => setIds(bacaDaftarId(KUNCI_SIMPAN.favorit));
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
