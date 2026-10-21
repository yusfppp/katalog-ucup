"use client";

import { useEffect, useState } from "react";
import { IconHeart } from "@tabler/icons-react";
import Button from "@/components/Button";
import KartuProduk from "@/components/KartuProduk";
import { useDaftarFavorit } from "@/components/useFavorit";
import { ambilProdukUntukDaftar } from "@/lib/actions/publik";
import { KUNCI_SIMPAN, tulisDaftarId } from "@/lib/penyimpanan";

export default function HalamanFavorit() {
  const { ids, siap } = useDaftarFavorit();
  const [daftar, setDaftar] = useState([]);
  const [memuat, setMemuat] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!siap) return;
    let batal = false;

    async function muat() {
      if (ids.length === 0) {
        setDaftar([]);
        setMemuat(false);
        return;
      }
      setMemuat(true);
      const hasil = await ambilProdukUntukDaftar(ids);
      if (batal) return;
      setDaftar(hasil?.data || []);
      setError(hasil?.error || "");
      setMemuat(false);
    }

    muat();
    return () => {
      batal = true;
    };
  }, [ids, siap]);

  if (!siap || memuat) {
    return (
      <div className="mx-auto grid max-w-[1200px] gap-5 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-80 animate-pulse rounded-[20px] bg-border/50" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-4 py-10 sm:px-6 md:py-14">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="rounded-full bg-primary-soft px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">
            Koleksi Pribadi
          </span>
          <h1 className="mt-2 font-heading text-3xl font-bold text-secondary sm:text-4xl">
            Produk Favorit
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Tersimpan di browser ini. Kamu bisa menandai produk dengan tombol hati.
          </p>
        </div>
        {ids.length > 0 && (
          <Button
            type="button"
            variant="tertiary"
            size="sm"
            onClick={() => tulisDaftarId(KUNCI_SIMPAN.favorit, [])}
          >
            Hapus Semua Favorit
          </Button>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-error/30 bg-error/10 p-3.5 text-sm font-semibold text-error"
        >
          {error}
        </div>
      )}

      {daftar.length === 0 ? (
        <div className="mx-auto flex max-w-xl flex-col items-center gap-3 rounded-[24px] border-[1.5px] border-border bg-surface p-8 text-center shadow-warm sm:p-12">
          <IconHeart size={56} stroke={1.5} aria-hidden="true" className="text-primary/70" />
          <h2 className="font-heading text-2xl font-bold text-secondary">
            Belum ada produk favorit
          </h2>
          <p className="text-sm text-text-muted">
            Tekan ikon hati pada produk untuk menyimpannya di daftar ini.
          </p>
          <Button href="/#katalog" variant="primary" className="mt-2">
            Jelajahi Katalog
          </Button>
        </div>
      ) : (
        <>
          <p className="text-sm text-text-muted">{daftar.length} produk tersimpan.</p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {daftar.map((produk) => (
              <KartuProduk key={produk.id} produk={produk} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
