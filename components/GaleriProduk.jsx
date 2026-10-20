"use client";

import { useState } from "react";
import Button from "@/components/Button";

export default function GaleriProduk({ nama, gambar = [] }) {
  const daftar = gambar.length ? gambar : ["/produk/nastar.svg"];
  const [aktif, setAktif] = useState(0);
  const terpilih = daftar[Math.min(aktif, daftar.length - 1)];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-[20px] border border-border bg-bg/50 shadow-inner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={terpilih}
          alt={`${nama} - foto ${aktif + 1}`}
          className="h-full w-full object-cover"
        />
      </div>

      {daftar.length > 1 && (
        <div className="flex flex-wrap gap-2" aria-label="Pilih foto produk">
          {daftar.map((url, indeks) => (
            <Button
              key={`${url}-${indeks}`}
              type="button"
              variant={indeks === aktif ? "secondary" : "tertiary"}
              onClick={() => setAktif(indeks)}
              className="!h-20 !w-20 !min-h-20 overflow-hidden !rounded-xl !p-0"
              aria-label={`Tampilkan foto ${indeks + 1}`}
              aria-pressed={indeks === aktif}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
