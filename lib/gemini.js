const MODEL_BAWAAN = "gemini-3.5-flash";

// Status sementara dari layanan AI (ramai / gangguan sementara), pantas dicoba ulang.
const STATUS_SIBUK = new Set([429, 500, 502, 503, 504]);

function ambilKunci() {
  return (process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || "").trim();
}

function pesanRamah(status) {
  if (STATUS_SIBUK.has(status)) {
    return "Layanan AI sedang sibuk (beban tinggi). Coba lagi beberapa saat lagi.";
  }
  if (status === 404) {
    return "Model AI pada GEMINI_MODEL tidak tersedia. Ubah nilai GEMINI_MODEL di environment variable.";
  }
  if (status === 401 || status === 403) {
    return "GEMINI_API_KEY ditolak oleh layanan AI. Periksa kembali API key di environment variable.";
  }
  if (status === 400) {
    return "Permintaan ditolak oleh layanan AI. Periksa nilai GEMINI_API_KEY dan GEMINI_MODEL.";
  }
  return "Layanan AI sedang tidak dapat dihubungi. Silakan coba lagi.";
}

function beriJeda(ms) {
  return new Promise((tuntas) => setTimeout(tuntas, ms));
}

function buatBody(prompt, temperature, denganThinking) {
  const generationConfig = {
    temperature,
    maxOutputTokens: 512,
  };

  // Model keluaran baru memakai "thinking" internal: tanpa batas nol,
  // jawaban bisa terpotong karena token habis dipakai berpikir.
  if (denganThinking) {
    generationConfig.thinkingConfig = { thinkingBudget: 0 };
  }

  return {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig,
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
    ],
  };
}

/**
 * Memanggil Gemini API dari server. Kunci tidak pernah dikirim ke browser.
 * Otomatis mencoba ulang saat layanan sedang ramai, dan menyiapkan
 * pesan error yang jelas untuk model/API key yang salah konfigurasi.
 * @param {string} prompt
 * @param {{ timeoutMs?: number, temperature?: number }} opsi
 */
export async function panggilGemini(prompt, { timeoutMs = 15000, temperature = 0.7 } = {}) {
  const kunci = ambilKunci();
  if (!kunci) {
    return {
      error: "Fitur AI belum dikonfigurasi. Hubungi admin untuk mengatur GEMINI_API_KEY.",
    };
  }

  const model = (process.env.GEMINI_MODEL || MODEL_BAWAAN).trim();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(kunci)}`;

  const BATAS_PERCOBAAN = 3;
  let denganThinking = true;

  for (let percobaan = 0; percobaan < BATAS_PERCOBAAN; percobaan += 1) {
    const terakhir = percobaan === BATAS_PERCOBAAN - 1;
    let respons;

    try {
      respons = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buatBody(prompt, temperature, denganThinking)),
        signal: AbortSignal.timeout(timeoutMs),
        cache: "no-store",
      });
    } catch (err) {
      if (err?.name === "TimeoutError" || err?.name === "AbortError") {
        return { error: "Layanan AI terlalu lama merespons. Silakan coba lagi." };
      }
      if (!terakhir) {
        await beriJeda(700);
        continue;
      }
      return { error: "Terjadi kesalahan saat menghubungi layanan AI." };
    }

    if (respons.ok) {
      const data = await respons.json().catch(() => null);
      const teksJawaban = (data?.candidates?.[0]?.content?.parts || [])
        .map((bagian) => bagian.text || "")
        .join(" ")
        .trim();

      if (!teksJawaban) {
        return { error: "AI belum bisa memberikan jawaban. Silakan coba lagi." };
      }

      return { teks: teksJawaban };
    }

    // Beberapa model tidak mengenal thinkingConfig; ulangi tanpa parameter itu.
    if (respons.status === 400 && denganThinking && !terakhir) {
      denganThinking = false;
      continue;
    }

    // Layanan sedang ramai: tunggu sebentar lalu ulangi.
    if (STATUS_SIBUK.has(respons.status) && !terakhir) {
      await beriJeda(700 * (percobaan + 1));
      continue;
    }

    return { error: pesanRamah(respons.status) };
  }

  return { error: pesanRamah(503) };
}

export function buatPromptDeskripsi({ nama, kategori }) {
  return [
    "Kamu adalah penulis konten untuk toko donat mini rumahan bernama Alfa Bites.",
    `Buat deskripsi produk dalam bahasa Indonesia yang hangat, ramah, dan menggugah selera untuk produk "${nama}" dengan kategori "${kategori || "Donat"}".`,
    "Tulis 2 sampai 3 kalimat saja. Jangan mengarang bahan, klaim kesehatan, sertifikasi halal, atau harga.",
    "Jangan memakai tanda kutip pembuka/penutup. Langsung berikan paragraf deskripsinya.",
  ].join("\n");
}

export function buatPromptTanyaProduk({ produk, pertanyaan }) {
  const varian = (produk.varian || [])
    .map((v) => `${v.label}: ${v.harga}`)
    .join("; ");

  return [
    "Kamu adalah asisten toko donat mini rumahan Alfa Bites.",
    "Jawab dengan ramah dalam bahasa Indonesia, singkat (maksimal 4 kalimat), dan HANYA berdasarkan data produk berikut.",
    "Jika informasi tidak ada dalam data, katakan dengan jujur bahwa kamu belum punya informasinya dan sarankan menghubungi admin lewat WhatsApp.",
    "Jangan mengarang harga, bahan, stok, sertifikasi, atau janji pengiriman.",
    "",
    "DATA PRODUK:",
    `Nama: ${produk.nama}`,
    `Kategori: ${produk.kategori_nama || "-"}`,
    `Harga: ${produk.harga}`,
    `Harga diskon: ${produk.harga_diskon ?? "tidak ada"}`,
    `Stok tersedia: ${produk.stok}`,
    `Deskripsi: ${produk.deskripsi || "-"}`,
    `Varian: ${varian || "tidak ada varian"}`,
    "",
    `PERTANYAAN PENGUNJUNG: ${pertanyaan}`,
  ].join("\n");
}
