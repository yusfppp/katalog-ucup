# Jurnal Prompt

Catat prompt penting selama membangun aplikasi: apa yang kamu minta, hasilnya, dan perbaikan yang dilakukan. Beri tanda **[SENDIRI]** untuk prompt yang kamu tulis sendiri (bukan dari lembar kerja).

## US-01 Katalog dari database

**Prompt:**
Baca AGENTS.md dan docs/user-stories.md bagian US-01.

Ubah app/page.jsx supaya daftar produk diambil dari tabel "produk" di Supabase, di sisi server, memakai SUPABASE_URL dan SUPABASE_SECRET_KEY dari environment variable. Buat koneksi Supabase untuk server di folder lib/supabase.

Tampilkan produk dengan komponen KartuProduk yang sudah ada, tanpa mengubah tampilannya. Kalau gagal mengambil data, tampilkan pesan error yang jelas di halaman. Kalau tabel kosong, tampilkan tulisan "Belum ada produk". Hapus CatatanBelumAktif dari halaman ini.

**Hasil:**
- Membuat helper koneksi Supabase server di `lib/supabase/server.js` dan `lib/supabase/index.js` dengan `SUPABASE_URL` dan `SUPABASE_SECRET_KEY`.
- Memperbarui `app/page.jsx` menjadi Server Component yang mengambil produk langsung dari tabel `produk` di Supabase.
- Menampilkan daftar produk menggunakan komponen `KartuProduk`.
- Menampilkan pesan "Belum ada produk" saat tabel kosong dan pesan error jika query gagal.
- Menghapus komponen `CatatanBelumAktif` dan ketergantungan pada `lib/data-contoh.js`.

**Perbaikan:**
- Menambahkan sanitasi URL pada koneksi Supabase untuk otomatis membersihkan trailing slash atau path `/rest/v1` bila ada pada environment variable.

## US-02 Detail produk

**Prompt:**
Baca docs/user-stories.md bagian US-02.

Ubah app/produk/[id]/page.jsx supaya mengambil satu produk dari tabel "produk" di Supabase berdasarkan id di URL, di sisi server, memakai koneksi Supabase yang sudah dibuat di lib/supabase. Kalau produk tidak ditemukan, panggil notFound(). Jangan ubah tampilannya. Hapus CatatanBelumAktif dari halaman ini, tapi biarkan tombol WhatsApp.

**Hasil:**
- Mengubah `app/produk/[id]/page.jsx` agar mengambil data produk dari tabel `produk` di database Supabase berdasarkan parameter `id` di sisi server menggunakan `buatKlienServer`.
- Menangani produk yang tidak ditemukan atau query error dengan memanggil `notFound()`.
- Menghapus komponen `CatatanBelumAktif` dan pemanggilan `cariProdukContoh` dari `lib/data-contoh.js`.
- Mempertahankan tata letak tampilan serta komponen `TombolWhatsApp`.

**Perbaikan:**
- Tidak ada perbaikan / kendala: implementasi dan build berhasil tanpa hambatan.

## US-03 Pesan via WhatsApp

**Prompt:**
Baca docs/rancangan-teknis.md bagian "Pesan WhatsApp (US-03)".

Ubah components/TombolWhatsApp.jsx menjadi tautan yang membuka https://wa.me/ ke nomor di lib/toko.js, dengan pesan otomatis berisi nama dan harga produk dalam format rupiah. Pesan di-encode dengan encodeURIComponent dan dibuka di tab baru. Pertahankan tampilan tombolnya. Hapus CatatanBelumAktif yang menyebut US-03 di halaman detail produk.

**Hasil:**
- Mengubah `components/TombolWhatsApp.jsx` menjadi elemen tautan (`<a>`) yang mengarah ke `https://wa.me/<nomor>?text=<pesan>`.
- Nomor WhatsApp diambil dari `lib/toko.js`.
- Pesan otomatis dibuat menyertakan nama produk dan harga terformat rupiah (`formatRupiah`), serta di-encode dengan `encodeURIComponent`.
- Menambahkan `target="_blank"` dan `rel="noopener noreferrer"` untuk membuka WhatsApp di tab baru.
- Mempertahankan tampilan dan class tombol.
- Memastikan komponen `CatatanBelumAktif` sudah bersih dari halaman detail produk.

**Perbaikan:**
- Tidak ada perbaikan / kendala: implementasi dan build berhasil tanpa hambatan.

## US-04 Login admin

**Prompt:**
Baca AGENTS.md bagian aturan keamanan dan docs/user-stories.md bagian US-04.

Buat login admin memakai Supabase Auth (email dan password) dengan @supabase/ssr dan cookie, memakai SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY. Login diproses dengan Server Action di app/admin/actions.js dan disambungkan ke form di app/admin/login/page.jsx. Login berhasil diarahkan ke /admin; login gagal menampilkan pesan error yang jelas di halaman login. Buat juga tombol "Keluar" di components/NavAdmin.jsx berfungsi: mengakhiri sesi lalu kembali ke /admin/login. Jangan ubah tampilan. Hapus CatatanBelumAktif dari halaman login.

**Hasil:**
- Menambahkan fungsi helper `buatKlienSesiAdmin` di `lib/supabase/server.js` menggunakan `@supabase/ssr` dan cookie storage berbasis Next.js `cookies()`, didukung `SUPABASE_URL` dan `SUPABASE_PUBLISHABLE_KEY`.
- Membuat Server Action `login` dan `keluar` di `app/admin/actions.js` untuk autentikasi Supabase Auth (`signInWithPassword` dan `signOut`).
- Memperbarui `app/admin/login/page.jsx` agar memproses login via Server Action, menampilkan pesan error yang ramah pengguna jika gagal, dan mempertahankan input email.
- Mengaktifkan tombol "Keluar" pada `components/NavAdmin.jsx` untuk mengakhiri sesi dan mengarahkan kembali ke `/admin/login`.
- Menghapus komponen `CatatanBelumAktif` dari halaman login.

**Perbaikan:**
- Tidak ada perbaikan / kendala: implementasi dan build berhasil tanpa hambatan.

## US-05 Ganti password

**Prompt:**
Baca docs/user-stories.md bagian US-05.

Buat Server Action ganti password di app/admin/actions.js untuk admin yang sedang login, memakai Supabase Auth. Validasi di server: password baru minimal 8 karakter dan harus sama dengan konfirmasi. Tampilkan pesan berhasil atau pesan error yang jelas di halaman. Sambungkan ke form di app/admin/password/page.jsx tanpa mengubah tampilannya. Hapus CatatanBelumAktif dari halaman ini.

**Hasil:**
- Membuat Server Action `gantiPassword` di `app/admin/actions.js` dengan validasi server (minimal 8 karakter dan kesamaan dengan konfirmasi).
- Memeriksa sesi aktif admin menggunakan `supabase.auth.getUser()` sebelum memperbarui password dengan `supabase.auth.updateUser({ password })`.
- Menyambungkan form di `app/admin/password/page.jsx` ke Server Action `gantiPassword`.
- Menampilkan pesan sukses berwarna hijau (`text-utama`) atau pesan error berwarna merah (`text-bahaya`) di atas form.
- Menghapus komponen `CatatanBelumAktif` dari halaman ganti password tanpa mengubah layout form.

**Perbaikan:**
- Tidak ada perbaikan / kendala: validasi dan build berhasil tanpa hambatan.

## US-06 Proteksi halaman admin

**Prompt:**

**Hasil:**

**Perbaikan:**

## Debugging dan fitur bonus

Tambahkan bagian baru untuk setiap error yang kamu perbaiki atau fitur bonus yang kamu kerjakan.
