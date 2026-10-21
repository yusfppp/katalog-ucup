"use client";

import Button from "@/components/Button";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";
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
      {aktif ? (
        <IconHeartFilled size={18} aria-hidden="true" />
      ) : (
        <IconHeart size={18} stroke={1.9} aria-hidden="true" />
      )}
      {tampilTeks && <span>{aktif ? "Tersimpan di favorit" : "Simpan favorit"}</span>}
    </Button>
  );
}
