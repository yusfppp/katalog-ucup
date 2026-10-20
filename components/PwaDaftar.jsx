"use client";

import { useEffect } from "react";

export default function PwaDaftar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const daftar = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // PWA tetap bisa dipakai tanpa service worker (misalnya saat dev).
      });
    };

    if (document.readyState === "complete") daftar();
    else window.addEventListener("load", daftar, { once: true });

    return () => window.removeEventListener("load", daftar);
  }, []);

  return null;
}
