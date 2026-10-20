"use client";

import { useEffect, useState } from "react";
import Button from "@/components/Button";
import { KUNCI_SIMPAN } from "@/lib/penyimpanan";

function bacaTema() {
  const tersimpan = window.localStorage.getItem(KUNCI_SIMPAN.tema);
  if (tersimpan === "dark" || tersimpan === "light") return tersimpan;
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
}

export default function TombolTema({ size = "sm" }) {
  const [tema, setTema] = useState(null);

  useEffect(() => {
    setTema(document.documentElement.dataset.theme || bacaTema());
  }, []);

  function ganti() {
    const baru = tema === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = baru;
    try {
      window.localStorage.setItem(KUNCI_SIMPAN.tema, baru);
    } catch {
      // abaikan bila localStorage diblokir
    }
    setTema(baru);
  }

  const gelap = tema === "dark";

  return (
    <Button
      type="button"
      variant="tertiary"
      size={size}
      iconOnly
      onClick={ganti}
      aria-label={gelap ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
      title={gelap ? "Mode terang" : "Mode gelap"}
    >
      <span aria-hidden="true">{gelap ? "☀️" : "🌙"}</span>
    </Button>
  );
}
