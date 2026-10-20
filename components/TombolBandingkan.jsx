"use client";

import { useState } from "react";
import Button from "@/components/Button";
import { useBandingkan } from "@/components/useBandingkan";

export default function TombolBandingkan({
  id,
  nama = "produk",
  tampilTeks = false,
  size = "sm",
  className = "",
}) {
  const { aktif, toggle, siap } = useBandingkan(id);
  const [pesan, setPesan] = useState("");

  function klik() {
    const hasil = toggle();
    setPesan(hasil.pesan);
  }

  return (
    <span className={tampilTeks ? "inline-flex flex-col items-start gap-1" : "inline-flex"}>
      <Button
        type="button"
        variant={aktif ? "secondary" : "tertiary"}
        size={size}
        iconOnly={!tampilTeks}
        onClick={klik}
        className={className}
        aria-label={aktif ? `Hapus ${nama} dari perbandingan` : `Bandingkan ${nama}`}
        aria-pressed={siap ? aktif : undefined}
        title={aktif ? "Hapus dari perbandingan" : "Bandingkan produk ini"}
      >
        <span aria-hidden="true">⚖️</span>
        {tampilTeks && <span>{aktif ? "Dalam perbandingan" : "Bandingkan"}</span>}
      </Button>
      <span className="sr-only" role="status" aria-live="polite">
        {pesan}
      </span>
    </span>
  );
}
