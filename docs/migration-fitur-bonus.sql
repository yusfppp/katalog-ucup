-- ============================================================
-- Alfa Bites - Migration Fitur Bonus (US-11 s.d. US-50)
-- Cara menjalankan:
--   1. Buka Supabase Dashboard > SQL Editor > New query.
--   2. Tempel seluruh isi file ini, lalu klik Run.
--   3. Jalankan sekali. File ini aman dijalankan ulang (idempotent).
--   4. Pastikan bucket "foto-produk" muncul di Storage dan bersifat public.
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 0. Helper slug
-- ------------------------------------------------------------
create or replace function public.buat_slug(teks text)
returns text
language sql
immutable
as $$
  select coalesce(
    nullif(trim(both '-' from regexp_replace(lower(coalesce(teks, '')), '[^a-z0-9]+', '-', 'g')), ''),
    'kategori'
  );
$$;

-- ------------------------------------------------------------
-- 1. Kategori
-- ------------------------------------------------------------
create table if not exists public.kategori (
  id bigint generated always as identity primary key,
  nama text not null,
  slug text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists kategori_nama_unik on public.kategori (lower(nama));
create unique index if not exists kategori_slug_unik on public.kategori (slug);

-- Migrasikan kategori teks lama ke tabel kategori.
insert into public.kategori (nama, slug)
select distinct on (lower(trim(kategori)))
  trim(kategori) as nama,
  public.buat_slug(trim(kategori)) as slug
from public.produk
where kategori is not null and trim(kategori) <> ''
order by lower(trim(kategori)), trim(kategori)
on conflict do nothing;

-- ------------------------------------------------------------
-- 2. Kolom baru pada produk (kolom lama tetap dipertahankan)
-- ------------------------------------------------------------
alter table public.produk add column if not exists kategori_id bigint;
alter table public.produk add column if not exists deskripsi text;
alter table public.produk add column if not exists stok integer not null default 20;
alter table public.produk add column if not exists harga_diskon integer;
alter table public.produk add column if not exists badge text;
alter table public.produk add column if not exists aktif boolean not null default true;
alter table public.produk add column if not exists urutan integer not null default 0;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'produk_kategori_id_fkey'
  ) then
    alter table public.produk
      add constraint produk_kategori_id_fkey
      foreign key (kategori_id) references public.kategori(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'produk_stok_check'
  ) then
    alter table public.produk
      add constraint produk_stok_check check (stok >= 0);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'produk_harga_diskon_check'
  ) then
    alter table public.produk
      add constraint produk_harga_diskon_check
      check (harga_diskon is null or (harga_diskon >= 0 and harga_diskon < harga));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'produk_badge_check'
  ) then
    alter table public.produk
      add constraint produk_badge_check
      check (badge is null or badge in ('Baru', 'Terlaris'));
  end if;
end $$;

-- Isi kategori_id dari kolom teks lama.
update public.produk p
set kategori_id = k.id
from public.kategori k
where p.kategori_id is null
  and lower(trim(coalesce(p.kategori, ''))) = lower(k.nama);

-- Isi urutan awal berdasarkan created_at.
with berurut as (
  select id, row_number() over (order by created_at asc, id asc) as rn
  from public.produk
)
update public.produk p
set urutan = b.rn
from berurut b
where p.id = b.id
  and (p.urutan is null or p.urutan = 0);

create index if not exists produk_aktif_urutan_idx on public.produk (aktif, urutan, created_at desc);
create index if not exists produk_kategori_idx on public.produk (kategori_id);

-- ------------------------------------------------------------
-- 3. Foto produk (galeri)
-- ------------------------------------------------------------
create table if not exists public.foto_produk (
  id bigint generated always as identity primary key,
  produk_id bigint not null references public.produk(id) on delete cascade,
  url text not null,
  urutan integer not null default 0
);

create unique index if not exists foto_produk_unik_urutan on public.foto_produk (produk_id, urutan);
create index if not exists foto_produk_produk_idx on public.foto_produk (produk_id);

-- Foto utama lama menjadi foto pertama di galeri.
insert into public.foto_produk (produk_id, url, urutan)
select p.id, p.foto_url, 0
from public.produk p
where p.foto_url is not null
  and trim(p.foto_url) <> ''
  and not exists (
    select 1 from public.foto_produk f
    where f.produk_id = p.id and f.urutan = 0
  );

-- ------------------------------------------------------------
-- 4. Varian produk
-- ------------------------------------------------------------
create table if not exists public.varian_produk (
  id bigint generated always as identity primary key,
  produk_id bigint not null references public.produk(id) on delete cascade,
  label text not null,
  harga integer not null check (harga >= 0),
  urutan integer not null default 0
);

create index if not exists varian_produk_produk_idx on public.varian_produk (produk_id);
create unique index if not exists varian_produk_unik on public.varian_produk (produk_id, lower(label));

-- ------------------------------------------------------------
-- 5. Ulasan
-- ------------------------------------------------------------
create table if not exists public.ulasan (
  id bigint generated always as identity primary key,
  produk_id bigint not null references public.produk(id) on delete cascade,
  nama text not null,
  rating smallint not null check (rating between 1 and 5),
  komentar text not null,
  tampil boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists ulasan_produk_tampil_idx on public.ulasan (produk_id, tampil, created_at desc);

-- ------------------------------------------------------------
-- 6. Catatan klik WhatsApp
-- ------------------------------------------------------------
create table if not exists public.klik_wa (
  id bigint generated always as identity primary key,
  produk_id bigint references public.produk(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists klik_wa_produk_waktu_idx on public.klik_wa (produk_id, created_at desc);

-- ------------------------------------------------------------
-- 7. Banner promo
-- ------------------------------------------------------------
create table if not exists public.banner (
  id bigint generated always as identity primary key,
  judul text not null,
  teks text not null,
  gambar_url text,
  tautan text,
  aktif boolean not null default true,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 8. Pengaturan toko (satu baris)
-- ------------------------------------------------------------
create table if not exists public.pengaturan_toko (
  id integer primary key default 1 check (id = 1),
  nama text not null,
  tagline text not null,
  whatsapp text not null,
  alamat text not null,
  jam_buka text not null,
  instagram text
);

insert into public.pengaturan_toko (id, nama, tagline, whatsapp, alamat, jam_buka, instagram)
values (
  1,
  'Alfa Bites',
  'Small Bites, Big Smiles.',
  '6285943094008',
  'Perumahan Masyeba Gading Mas, Blok B6 No. 35, RT 004, RW 012, Sei Harapan, Sekupang, Kota Batam, Kepulauan Riau, 29428',
  'Setiap hari, 08.00–20.00',
  'alfabites'
)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- 9. Log aktivitas admin
-- ------------------------------------------------------------
create table if not exists public.log_aktivitas (
  id bigint generated always as identity primary key,
  admin_email text not null,
  aksi text not null,
  entitas text not null,
  detail text,
  created_at timestamptz not null default now()
);

create index if not exists log_aktivitas_waktu_idx on public.log_aktivitas (created_at desc);

-- ------------------------------------------------------------
-- 10. Storage bucket foto-produk
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('foto-produk', 'foto-produk', true)
on conflict (id) do update set public = true;

-- ------------------------------------------------------------
-- 11. Row Level Security
-- ------------------------------------------------------------
alter table public.produk enable row level security;
alter table public.kategori enable row level security;
alter table public.foto_produk enable row level security;
alter table public.varian_produk enable row level security;
alter table public.ulasan enable row level security;
alter table public.klik_wa enable row level security;
alter table public.banner enable row level security;
alter table public.pengaturan_toko enable row level security;
alter table public.log_aktivitas enable row level security;

-- Produk: publik hanya produk aktif, admin penuh.
drop policy if exists "produk_baca_publik" on public.produk;
create policy "produk_baca_publik" on public.produk
  for select to anon, authenticated using (aktif = true);

drop policy if exists "produk_admin_semua" on public.produk;
create policy "produk_admin_semua" on public.produk
  for all to authenticated using (true) with check (true);

-- Kategori: publik boleh membaca.
drop policy if exists "kategori_baca_publik" on public.kategori;
create policy "kategori_baca_publik" on public.kategori
  for select to anon, authenticated using (true);

drop policy if exists "kategori_admin_semua" on public.kategori;
create policy "kategori_admin_semua" on public.kategori
  for all to authenticated using (true) with check (true);

-- Foto produk: publik boleh membaca.
drop policy if exists "foto_produk_baca_publik" on public.foto_produk;
create policy "foto_produk_baca_publik" on public.foto_produk
  for select to anon, authenticated using (true);

drop policy if exists "foto_produk_admin_semua" on public.foto_produk;
create policy "foto_produk_admin_semua" on public.foto_produk
  for all to authenticated using (true) with check (true);

-- Varian: publik boleh membaca.
drop policy if exists "varian_produk_baca_publik" on public.varian_produk;
create policy "varian_produk_baca_publik" on public.varian_produk
  for select to anon, authenticated using (true);

drop policy if exists "varian_produk_admin_semua" on public.varian_produk;
create policy "varian_produk_admin_semua" on public.varian_produk
  for all to authenticated using (true) with check (true);

-- Ulasan: publik hanya melihat tampil = true, boleh menambah ulasan.
drop policy if exists "ulasan_baca_publik" on public.ulasan;
create policy "ulasan_baca_publik" on public.ulasan
  for select to anon, authenticated using (tampil = true);

drop policy if exists "ulasan_tambah_publik" on public.ulasan;
create policy "ulasan_tambah_publik" on public.ulasan
  for insert to anon, authenticated with check (tampil = true);

drop policy if exists "ulasan_admin_semua" on public.ulasan;
create policy "ulasan_admin_semua" on public.ulasan
  for all to authenticated using (true) with check (true);

-- Klik WhatsApp: publik boleh menambah, tidak boleh membaca.
drop policy if exists "klik_wa_tambah_publik" on public.klik_wa;
create policy "klik_wa_tambah_publik" on public.klik_wa
  for insert to anon, authenticated with check (true);

drop policy if exists "klik_wa_admin_baca" on public.klik_wa;
create policy "klik_wa_admin_baca" on public.klik_wa
  for select to authenticated using (true);

-- Banner: publik hanya banner aktif.
drop policy if exists "banner_baca_publik" on public.banner;
create policy "banner_baca_publik" on public.banner
  for select to anon, authenticated using (aktif = true);

drop policy if exists "banner_admin_semua" on public.banner;
create policy "banner_admin_semua" on public.banner
  for all to authenticated using (true) with check (true);

-- Pengaturan toko: publik boleh membaca.
drop policy if exists "pengaturan_baca_publik" on public.pengaturan_toko;
create policy "pengaturan_baca_publik" on public.pengaturan_toko
  for select to anon, authenticated using (true);

drop policy if exists "pengaturan_admin_semua" on public.pengaturan_toko;
create policy "pengaturan_admin_semua" on public.pengaturan_toko
  for all to authenticated using (true) with check (true);

-- Log aktivitas: hanya admin yang boleh membaca/menulis.
drop policy if exists "log_admin_semua" on public.log_aktivitas;
create policy "log_admin_semua" on public.log_aktivitas
  for all to authenticated using (true) with check (true);

-- ------------------------------------------------------------
-- 12. Policy Storage (bucket foto-produk)
-- ------------------------------------------------------------
drop policy if exists "foto_produk_storage_baca" on storage.objects;
create policy "foto_produk_storage_baca" on storage.objects
  for select to anon, authenticated using (bucket_id = 'foto-produk');

drop policy if exists "foto_produk_storage_tulis" on storage.objects;
create policy "foto_produk_storage_tulis" on storage.objects
  for insert to authenticated with check (bucket_id = 'foto-produk');

drop policy if exists "foto_produk_storage_ubah" on storage.objects;
create policy "foto_produk_storage_ubah" on storage.objects
  for update to authenticated using (bucket_id = 'foto-produk') with check (bucket_id = 'foto-produk');

drop policy if exists "foto_produk_storage_hapus" on storage.objects;
create policy "foto_produk_storage_hapus" on storage.objects
  for delete to authenticated using (bucket_id = 'foto-produk');

-- ------------------------------------------------------------
-- 13. Reload schema cache PostgREST (opsional, aman)
-- ------------------------------------------------------------
notify pgrst, 'reload schema';
