const MODEL_BAWAAN = "gemini-2.0-flash";

function ambilKunci() {
  return (process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || "").trim();
}

function pesanRamah(status) {
  if (status === 429) {
    return "Layanan AI sedang sibuk. Coba lagi beberapa saat lagi.";
  }
  if (status === 400 || status === 403) {
    return "Layanan AI menolak permintaan. Periksa konfigurasi GEMINI_API_KEY.";
  }
  return "Layanan AI sedang tidak dapat dihubungi. Silakan coba lagi.";
}

/**
 * Memanggil Gemini API dari server. Kunci tidak pernah dikirim ke browser.
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

  try {
    const respons = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature,
          maxOutputTokens: 512,
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
        ],
      }),
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });

    if (!respons.ok) {
      return { error: pesanRamah(respons.status) };
    }

    const data = await respons.json();
    const teksJawaban = (data?.candidates?.[0]?.content?.parts || [])
      .map((bagian) => bagian.text || "")
      .join(" ")
      .trim();

    if (!teksJawaban) {
      return { error: "AI belum bisa memberikan jawaban. Silakan coba lagi." };
    }

    return { teks: teksJawaban };
  } catch (err) {
    if (err?.name === "TimeoutError" || err?.name === "AbortError") {
      return { error: "Layanan AI terlalu lama merespons. Silakan coba lagi." };
    }
    return { error: "Terjadi kesalahan saat menghubungi layanan AI." };
  }
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
