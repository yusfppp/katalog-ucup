import Button from "@/components/Button";
import { keluar } from "@/app/admin/actions";

export default function NavAdmin() {
  return (
    <nav className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
      <Button href="/admin" variant="tertiary" size="sm">
        🍩 Kelola Produk
      </Button>
      <Button href="/admin/password" variant="tertiary" size="sm">
        🔑 Ganti Password
      </Button>
      <Button href="/" variant="tertiary" size="sm">
        🌐 Lihat Website
      </Button>
      <form action={keluar} className="ml-auto">
        <Button type="submit" variant="danger" size="sm">
          Keluar
        </Button>
      </form>
    </nav>
  );
}
