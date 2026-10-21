"use client";

import { useMemo } from "react";
import { IconCirclePlus, IconQuestionMark, IconScale } from "@tabler/icons-react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { useDaftarBandingkan } from "@/components/useBandingkan";
import { KUNCI_SIMPAN, tulisDaftarId } from "@/lib/penyimpanan";
import { formatRupiah } from "@/lib/format";

const MAKS = 2;

export default function HalamanBandingkan({ daftarProduk = [] }) {
  const { ids, siap } = useDaftarBandingkan();
  const peta = useMemo(
    () => new Map(daftarProduk.map((produk) => [Number(produk.id), produk])),
    [daftarProduk]
  );
  const terpilih = ids.map((id) => peta.get(id)).filter(Boolean);
  const hilang = ids.filter((id) => !peta.has(id));

  function pilih(indeks, nilai) {
    const baru = [...ids];
    const angka = Number(nilai);
    if (!angka) baru.splice(indeks, 1);
    else baru[indeks] = angka;
    tulisDaftarId(KUNCI_SIMPAN.banding, baru.filter(Boolean).slice(0, MAKS));
  }

  const opsi = daftarProduk.map((produk) => ({
    label: produk.nama,
    value: String(produk.id),
  }));

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-4 py-10 sm:px-6 md:py-14">
      <div>
        <span className="rounded-full bg-primary-soft px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">
          Alat Bantu
        </span>
        <h1 className="mt-2 font-heading text-3xl font-bold text-secondary sm:text-4xl">
          Bandingkan Produk
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-text-muted">
          Pilih maksimal dua produk. Memilih produk ketiga akan menggantikan pilihan paling lama.
        </p>
      </div>

      <div className="grid gap-3 rounded-[20px] border-[1.5px] border-border bg-surface p-4 shadow-warm sm:grid-cols-2 sm:p-5">
        <Input
          label="Produk pertama"
          name="produk-1"
          type="select"
          placeholder="Pilih produk"
          value={ids[0] ? String(ids[0]) : ""}
          onChange={(event) => pilih(0, event.target.value)}
          options={opsi}
        />
        <Input
          label="Produk kedua"
          name="produk-2"
          type="select"
          placeholder="Pilih produk"
          value={ids[1] ? String(ids[1]) : ""}
          onChange={(event) => pilih(1, event.target.value)}
          options={opsi}
        />
      </div>

      {!siap ? (
        <div className="h-64 animate-pulse rounded-[20px] bg-border/50" />
      ) : ids.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[24px] border-[1.5px] border-border bg-surface p-8 text-center shadow-warm sm:p-12">
          <IconScale size={56} stroke={1.5} aria-hidden="true" className="text-primary/70" />
          <p className="font-heading text-2xl font-bold text-secondary">Belum ada produk dipilih</p>
          <p className="max-w-md text-sm text-text-muted">
            Gunakan pilihan di atas atau tombol timbangan pada kartu produk untuk memulai
            perbandingan.
          </p>
          {daftarProduk.length > 0 && (
            <Button
              type="button"
              variant="primary"
              className="mt-2"
              onClick={() =>
                tulisDaftarId(
                  KUNCI_SIMPAN.banding,
                  [daftarProduk[0]?.id, daftarProduk[1]?.id].filter(Boolean).slice(0, MAKS)
                )
              }
            >
              Pilih Dua Produk Pertama
            </Button>
          )}
        </div>
      ) : (
        <>
          {hilang.length > 0 && (
            <div
              role="alert"
              className="rounded-xl border border-error/30 bg-error/10 p-3.5 text-sm font-semibold text-error"
            >
              {hilang.length} produk yang tersimpan sudah tidak tersedia. Pilih produk pengganti.
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            {ids.map((id, indeks) => {
              const produk = peta.get(id);
              return (
                <article
                  key={`${id}-${indeks}`}
                  className="flex flex-col overflow-hidden rounded-[20px] border-[1.5px] border-border bg-surface shadow-warm"
                >
                  {produk ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={produk.foto_url || "/produk/nastar.svg"}
                        alt={produk.nama}
                        className="h-52 w-full object-cover"
                        loading="lazy"
                      />
                      <div className="flex flex-1 flex-col gap-3 p-5">
                        <h2 className="font-heading text-2xl font-bold text-secondary">
                          {produk.nama}
                        </h2>
                        <p className="text-sm text-text-muted">
                          Kategori:{" "}
                          <span className="font-semibold text-primary">{produk.kategori_nama}</span>
                        </p>
                        <p className="font-heading text-2xl font-bold text-primary">
                          {formatRupiah(produk.harga_efektif ?? produk.harga)}
                          {produk.varian?.length > 0 && (
                            <span className="ml-2 text-xs font-normal text-text-muted">
                              mulai dari
                            </span>
                          )}
                        </p>
                        <p className="flex-1 whitespace-pre-line text-sm text-text">
                          {produk.deskripsi || "Belum ada deskripsi."}
                        </p>
                        <p className="text-xs font-semibold text-text-muted">
                          Stok: {produk.stok ?? 20}
                          {produk.badge ? ` • Badge: ${produk.badge}` : ""}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-2">
                          <Button href={`/produk/${produk.id}`} variant="primary" size="sm">
                            Lihat Detail
                          </Button>
                          <Button
                            type="button"
                            variant="tertiary"
                            size="sm"
                            onClick={() =>
                              tulisDaftarId(
                                KUNCI_SIMPAN.banding,
                                ids.filter((item) => item !== id)
                              )
                            }
                          >
                            Hapus
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
                      <IconQuestionMark
                        size={40}
                        stroke={1.7}
                        aria-hidden="true"
                        className="text-text-muted"
                      />
                      <p className="font-heading text-lg font-bold text-secondary">
                        Produk tidak ditemukan
                      </p>
                      <p className="text-sm text-text-muted">
                        Produk mungkin sudah dihapus atau dinonaktifkan.
                      </p>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          tulisDaftarId(
                            KUNCI_SIMPAN.banding,
                            ids.filter((item) => item !== id)
                          )
                        }
                      >
                        Hapus dari Perbandingan
                      </Button>
                    </div>
                  )}
                </article>
              );
            })}
            {terpilih.length === 1 && (
              <div className="flex flex-col items-center justify-center gap-2 rounded-[20px] border-2 border-dashed border-border bg-surface/50 p-8 text-center">
                <IconCirclePlus
                  size={38}
                  stroke={1.6}
                  aria-hidden="true"
                  className="text-primary/70"
                />
                <p className="font-heading text-lg font-bold text-secondary">
                  Pilih produk kedua
                </p>
                <p className="text-sm text-text-muted">
                  Gunakan pilihan di atas atau tombol timbangan pada kartu produk.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
