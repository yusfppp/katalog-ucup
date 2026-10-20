"use client";

import Button from "@/components/Button";
import { useFavorit } from "@/components/useFavorit";

export default function TombolFavorit({
  id,
  nama = "produk",
  tampilTeks = false,
  size = "sm",
  className = "",
}) {
  const { aktif, toggle, siap } = useFavorit(id);

  return (
    <Button
      type="button"
      variant={aktif ? "secondary" : "tertiary"}
      size={size}
      iconOnly={!tampilTeks}
      onClick={toggle}
      className={className}
      aria-label={aktif ? `Hapus ${nama} dari favorit` : `Simpan ${nama} ke favorit`}
      aria-pressed={siap ? aktif : undefined}
      title={aktif ? "Hapus dari favorit" : "Simpan ke favorit"}
    >
      <span aria-hidden="true">{aktif ? "❤️" : "🤍"}</span>
      {tampilTeks && <span>{aktif ? "Tersimpan di favorit" : "Simpan favorit"}</span>}
    </Button>
  );
}
