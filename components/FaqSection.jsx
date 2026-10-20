"use client";

import { useState } from "react";
import Button from "@/components/Button";

const faqData = [
  {
    q: "Apakah donat mini Alfa Bites dibuat fresh setiap hari?",
    a: "Ya! Semua donat mini kami dibuat fresh from the oven setiap pagi berdasarkan pesanan masuk. Kami tidak menggunakan bahan pengawet sehingga kelembutan dan aroma harumnya terjamin maksimal.",
  },
  {
    q: "Berapa lama ketahanan donat mini Alfa Bites?",
    a: "Donat mini kami bertahan 2 hingga 3 hari di suhu ruangan dalam box tertutup rapat, dan tahan hingga 5 hari jika disimpan di lemari pendingin. Cukup hangatkan 10 detik di microwave sebelum dinikmati kembali!",
  },
  {
    q: "Apakah bisa request mix aneka topping dalam satu box?",
    a: "Tentu bisa! Kamu bebas memilih dan mencampur topping favoritmu (Choco Crunch, Tiramisu, Lotus Biscoff, Keju Cheddar, Matcha Green Tea, Oreo, dll) dalam satu box tanpa biaya tambahan.",
  },
  {
    q: "Bagaimana sistem pembayaran dan konfirmasi pesanannya?",
    a: "Setelah klik tombol Pesan via WhatsApp, form order akan otomatis terkirim ke admin kami. Pembayaran dapat dilakukan via transfer Bank (BCA, Mandiri) atau scan QRIS yang praktis.",
  },
  {
    q: "Apakah melayani pesanan khusus acara ulang tahun, arisan, atau kantor?",
    a: "Sangat bisa! Kami sering melayani pesanan donat mini dalam jumlah banyak untuk pesta ulang tahun, hampers, rapat kantor, maupun arisan. Silakan hubungi kami H-1 atau H-2 untuk pesanan dalam jumlah besar.",
  },
];

export default function FaqSection() {
  const [bukaIndex, setBukaIndex] = useState(null);

  const toggleFaq = (index) => {
    setBukaIndex(bukaIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto">
      {faqData.map((item, idx) => {
        const isBuka = bukaIndex === idx;
        return (
          <div
            key={idx}
            className="overflow-hidden rounded-[20px] border-[1.5px] border-border bg-surface shadow-warm transition-all"
          >
            <Button
              variant="tertiary"
              fullWidth
              onClick={() => toggleFaq(idx)}
              className="!justify-between !px-6 !py-5 !h-auto !rounded-none text-left"
              aria-expanded={isBuka}
            >
              <span className="font-heading text-lg font-bold text-secondary pr-4">
                {item.q}
              </span>
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary font-bold text-sm transition-transform duration-200 ${
                  isBuka ? "rotate-180 bg-primary text-on-primary" : ""
                }`}
              >
                ▼
              </span>
            </Button>
            {isBuka && (
              <div className="px-6 pb-6 pt-1 text-sm text-text leading-relaxed border-t border-border/40 animate-in fade-in duration-200">
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

