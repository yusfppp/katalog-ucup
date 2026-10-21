"use client";

import { usePathname } from "next/navigation";

export default function ChromeSitus({ header, footer, children }) {
  const pathname = usePathname() || "";
  const halamanAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (halamanAdmin) return children;

  return (
    <>
      {header}
      <main className="w-full flex-1">{children}</main>
      {footer}
    </>
  );
}
