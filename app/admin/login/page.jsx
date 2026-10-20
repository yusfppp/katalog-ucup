import Input from "@/components/Input";
import Button from "@/components/Button";
import { login } from "@/lib/actions/auth";

export const dynamic = "force-dynamic";

export default async function HalamanLogin({ searchParams }) {
  const sp = await searchParams;
  const pesanError = sp?.error;
  const defaultEmail = sp?.email || "";

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6">
      <div className="mx-auto flex max-w-md flex-col gap-6 rounded-[20px] border-[1.5px] border-border bg-surface p-8 sm:p-10 shadow-warm">
        <div className="text-center space-y-1">
          <span className="text-4xl">🍩</span>
          <h1 className="font-heading text-3xl font-bold text-secondary">Masuk Admin Toko</h1>
          <p className="text-sm text-text-muted">
            Khusus pengelola Alfa Bites untuk mengatur varian donat.
          </p>
        </div>

        {pesanError && (
          <div className="rounded-xl border border-error/30 bg-error/10 p-3.5 text-sm font-semibold text-error flex items-center gap-2">
            <span>⚠️</span>
            <span>{pesanError}</span>
          </div>
        )}

        <form action={login} className="flex flex-col gap-4">
          <Input
            label="Email Admin"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={defaultEmail}
            placeholder="admin@alfabites.com"
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
          />
          <div className="pt-2">
            <Button type="submit" variant="primary" size="lg" fullWidth>
              Masuk ke Dashboard
            </Button>
          </div>
        </form>

        <div className="text-center pt-2 border-t border-border/50">
          <Button href="/" variant="tertiary" size="sm">
            ← Kembali ke Website Utama
          </Button>
        </div>
      </div>
    </div>
  );
}
