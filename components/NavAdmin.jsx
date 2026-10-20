import Button from "@/components/Button";
import { keluar } from "@/lib/actions/auth";

const menu = [
  { href: "/admin", label: "Dashboard", icon: "🍩" },
  { href: "/admin/kategori", label: "Kategori", icon: "🏷️" },
  { href: "/admin/banner", label: "Banner", icon: "📢" },
  { href: "/admin/ulasan", label: "Ulasan", icon: "⭐" },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: "⚙️" },
  { href: "/admin/log", label: "Log", icon: "📝" },
  { href: "/admin/akun", label: "Akun", icon: "👤" },
  { href: "/admin/password", label: "Password", icon: "🔑" },
];

export default function NavAdmin() {
  return (
    <nav
      aria-label="Navigasi admin"
      className="flex flex-wrap items-center gap-2 border-b border-border pb-4"
    >
      {menu.map((item) => (
        <Button key={item.href} href={item.href} variant="tertiary" size="sm">
          <span aria-hidden="true">{item.icon}</span> {item.label}
        </Button>
      ))}
      <Button href="/" variant="tertiary" size="sm">
        <span aria-hidden="true">🌐</span> Lihat Website
      </Button>
      <form action={keluar} className="ml-auto">
        <Button type="submit" variant="danger" size="sm">
          Keluar
        </Button>
      </form>
    </nav>
  );
}
