import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function ambilUrlSupabase() {
  return process.env.SUPABASE_URL?.trim()
    .replace(/\/rest\/v1\/?$/, "")
    .replace(/\/+$/, "");
}

function ambilKunciServer() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    ""
  );
}

/**
 * Koneksi server dengan kunci rahasia. Hanya untuk Server Component,
 * Server Action, dan Route Handler. Jangan pernah dipakai di browser.
 */
export function buatKlienServer() {
  const supabaseUrl = ambilUrlSupabase();
  const supabaseSecretKey = ambilKunciServer();

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error(
      "SUPABASE_URL atau SUPABASE_SECRET_KEY/SUPABASE_SERVICE_ROLE_KEY belum diatur di environment variable."
    );
  }

  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Klien khusus Supabase Auth Admin API (daftar/tambah/nonaktifkan admin).
 * Hanya boleh dipanggil dari server.
 */
export function buatKlienAuthAdmin() {
  return buatKlienServer();
}

/**
 * Klien sesi admin memakai cookie login dan kunci publishable,
 * sehingga RLS tetap berlaku.
 */
export async function buatKlienSesiAdmin() {
  const cookieStore = await cookies();
  const supabaseUrl = ambilUrlSupabase();
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!supabaseUrl || !publishableKey) {
    throw new Error(
      "SUPABASE_URL atau SUPABASE_PUBLISHABLE_KEY belum diatur di environment variable."
    );
  }

  return createServerClient(supabaseUrl, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Abaikan jika dipanggil dari Server Component saat cookies tidak bisa ditulis
        }
      },
    },
  });
}

export const createKlienServer = buatKlienServer;
export const createServerClientPublic = buatKlienServer;
export const buatKlienSesi = buatKlienSesiAdmin;
export default buatKlienServer;
