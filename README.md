# Alfa Bites — Katalog UMKM + Order WhatsApp

Website katalog produk **Alfa Bites** (_Small Bites, Big Smiles._), UMKM makanan/minuman di Batam. Pengunjung melihat katalog dan detail produk dari database, lalu memesan langsung lewat WhatsApp dengan pesan otomatis. Pemilik toko mengelola produk lewat halaman admin yang aman.

**Link:** _isi dengan link Vercel-mu_

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyusfppp%2Fkatalog-ucup&project-name=katalog-ucup&repository-name=katalog-ucup)

## Fitur

### Utama

- Katalog produk dari database Supabase (bukan data contoh)
- Halaman detail produk per item
- Pesan via WhatsApp dengan pesan otomatis (nama produk, harga, jumlah)
- Login admin dengan Supabase Auth
- Ganti password admin
- Halaman admin terproteksi: hanya bisa dibuka admin yang sudah login

### Manajemen produk (admin)

- Daftar produk di halaman admin
- Tambah, ubah, dan hapus produk

## Menjalankan di laptop

1. **Clone repo.**

   ```bash
   git clone https://github.com/yusfppp/katalog-ucup.git
   cd katalog-ucup
   npm install
   ```

2. **Siapkan Supabase.** Buat proyek baru di [supabase.com](https://supabase.com), buka **SQL Editor**, tempel isi `docs/schema.sql`, lalu klik **Run**. Tabel `produk` beserta data awal akan terbentuk.
3. **Siapkan akun admin** lewat dashboard Supabase (**Authentication > Users**), lalu matikan pendaftaran akun baru di **Authentication > Sign In / Providers**.
4. **Buat file `.env.local`.** Salin `.env.example` menjadi `.env.local`, lalu isi ketiga variabelnya dengan nilai dari Supabase > **Project Settings > API**.
5. **Jalankan.**

   ```bash
   npm run dev
   ```

   Buka `http://localhost:3000`. Login admin ada di `http://localhost:3000/admin/login`.

## Deploy ke Vercel

1. Klik tombol **Deploy with Vercel** di atas, atau impor repo `yusfppp/katalog-ucup` lewat dashboard Vercel.
2. Isi ketiga environment variable di **Settings > Environment Variables** (nilai yang sama dengan `.env.local`).
3. Setelah selesai, setiap `git push` akan otomatis men-deploy versi terbaru.

## Struktur repo

| File atau folder | Isi |
| --- | --- |
| `AGENTS.md` | Aturan untuk AI agent, dibaca sebelum setiap prompt |
| `DESIGN.md` | Panduan warna, huruf, dan komponen |
| `PROMPTS.md` | Jurnal prompt |
| `docs/` | PRD, user story, rancangan teknis, skema database, checklist |
| `lib/toko.js` | Nama toko, nomor WhatsApp, alamat, jam buka |
| `app/` | Halaman aplikasi (katalog, detail produk, admin) |
| `components/` | Komponen tampilan |

## Menyesuaikan

- Identitas toko (nama, nomor WhatsApp, alamat, jam buka): ubah `lib/toko.js`.
- Warna: ubah bagian `@theme` di `app/globals.css` (lihat `DESIGN.md`).
- Produk: kelola langsung lewat halaman admin, atau lewat Supabase > **Table Editor > produk**.

## Aturan penting

- Jangan menyimpan kunci atau password di kode, dan jangan push file `.env.local`.
- Jangan memberi awalan `NEXT_PUBLIC_` pada environment variable.
- Akses Supabase hanya dari sisi server (Server Component, Server Action, atau Route Handler).
- Isi `PROMPTS.md` setiap menyelesaikan fitur.

## Tentang aplikasi ini

- **Nama usaha:** Alfa Bites
- **Pembuat:**
- **Link aplikasi:**
- **Fitur bonus yang dikerjakan:** List produk di admin (US-07), Tambah produk (US-08), Ubah produk (US-09), Hapus produk (US-10)
