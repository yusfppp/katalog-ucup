import NavAdmin from "@/components/NavAdmin";
import FormPassword from "@/components/FormPassword";
import { wajibAdmin } from "@/lib/auth";
import { gantiPassword } from "@/lib/actions/auth";

export const dynamic = "force-dynamic";

export default async function HalamanGantiPassword() {
  await wajibAdmin();

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-4 py-8 sm:px-6">
      <NavAdmin />
      <div className="flex max-w-xl flex-col gap-6 rounded-[20px] border-[1.5px] border-border bg-surface p-6 shadow-warm sm:p-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-secondary">Ganti Password Admin</h1>
          <p className="mt-1 text-sm text-text-muted">
            Ganti password bawaan segera setelah pertama kali masuk. Minimal 8 karakter.
          </p>
        </div>
        <FormPassword action={gantiPassword} />
      </div>
    </div>
  );
}
