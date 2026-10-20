import NavAdmin from "@/components/NavAdmin";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { gantiPassword } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function HalamanGantiPassword({ searchParams }) {
  const sp = await searchParams;
  const pesanError = sp?.error;
  const pesanSukses = sp?.sukses;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 flex flex-col gap-8">
      <NavAdmin />
      <div className="max-w-xl flex flex-col gap-6 bg-surface p-6 sm:p-8 rounded-[20px] border-[1.5px] border-border shadow-warm">
        <div>
          <h1 className="font-heading text-3xl font-bold text-secondary">Ganti Password Admin</h1>
          <p className="mt-1 text-sm text-text-muted">
            Ganti password bawaan segera setelah pertama kali masuk. Minimal 8 karakter.
          </p>
        </div>

        {pesanError && (
          <div className="rounded-xl border border-error/30 bg-error/10 p-3.5 text-sm font-semibold text-error flex items-center gap-2">
            <span>⚠️</span>
            <span>{pesanError}</span>
          </div>
        )}

        {pesanSukses && (
          <div className="rounded-xl border border-success/30 bg-success/10 p-3.5 text-sm font-semibold text-success flex items-center gap-2">
            <span>✅</span>
            <span>{pesanSukses}</span>
          </div>
        )}

        <form action={gantiPassword} className="flex flex-col gap-4">
          <Input
            label="Password baru"
            name="password_baru"
            type="password"
            autoComplete="new-password"
            minLength={8}
            placeholder="Minimal 8 karakter"
            required
          />
          <Input
            label="Ulangi password baru"
            name="konfirmasi_password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            placeholder="Ketik ulang password baru"
            required
          />
          <div className="pt-2">
            <Button type="submit" variant="primary" size="md">
              Simpan Password Baru
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
