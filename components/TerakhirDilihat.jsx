"use client";

import { useEffect, useState } from "react";
import KartuProduk from "@/components/KartuProduk";
import { ambilProdukUntukDaftar } from "@/lib/actions/publik";
import {
  EVENT_SIMPANAN,
  KUNCI_SIMPAN,
  bacaDaftarId,
} from "@/lib/penyimpanan";

export default function TerakhirDilihat() {
  const [daftar, setDaftar] = useState([]);
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    let batal = false;

    async function muat() {
      const ids = bacaDaftarId(KUNCI_SIMPAN.terakhir);
      if (ids.length === 0) {
        if (!batal) {
          setDaftar([]);
          setSiap(true);
        }
        return;
      }

      const hasil = await ambilProdukUntukDaftar(ids);
      if (batal) return;
      setDaftar(hasil?.data || []);
      setSiap(true);
    }

    const sinkron = (event) => {
      if (!event.detail || event.detail.kunci === KUNCI_SIMPAN.terakhir) muat();
    };

    muat();
    window.addEventListener(EVENT_SIMPANAN, sinkron);
    window.addEventListener("storage", sinkron);
    return () => {
      batal = true;
      window.removeEventListener(EVENT_SIMPANAN, sinkron);
      window.removeEventListener("storage", sinkron);
    };
  }, []);

  if (!siap || daftar.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="rounded-full bg-primary-soft px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">
            Lanjut lihat
          </span>
          <h2 className="mt-2 font-heading text-2xl font-bold text-secondary sm:text-3xl">
            Terakhir Dilihat
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Produk yang baru saja kamu buka, tersimpan di browser ini.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {daftar.slice(0, 3).map((produk) => (
          <KartuProduk key={produk.id} produk={produk} />
        ))}
      </div>
    </section>
  );
}
