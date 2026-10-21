import AdminShell from "@/components/AdminShell";
import { wajibAdmin } from "@/lib/auth";
import { ambilPengaturan } from "@/lib/toko";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }) {
  const admin = await wajibAdmin();
  const toko = await ambilPengaturan();

  return (
    <AdminShell toko={toko} emailAdmin={admin?.email || ""}>
      {children}
    </AdminShell>
  );
}
