"use client";

import { useEffect } from "react";
import { catatTerakhirDilihat } from "@/lib/penyimpanan";

export default function CatatTerakhirDilihat({ id }) {
  useEffect(() => {
    catatTerakhirDilihat(id);
  }, [id]);

  return null;
}
