# PilahIn Bali — Foto Sampah, AI Bantu Memilah

PilahIn Bali adalah aplikasi web yang membantu warga Bali memilah sampah dengan benar. Pengguna cukup memotret sampah, lalu AI mengenali jenisnya (organik, anorganik, B3, residu), warna tong yang tepat, cara membuang, ide daur ulang, perkiraan nilai jual di bank sampah, dan poin edukasi. Aplikasi juga menyediakan simulasi dampak pemilahan dan direktori tempat penyaluran sampah di Bali.

## Problem & Target User

- **Masalah:** Volume sampah di Bali tinggi dan sebagian besar belum terpilah dari sumbernya. Banyak warga tidak tahu jenis sampah yang mereka pegang dan ke mana harus menyalurkannya.
- **Target user:** Warga Bali (rumah tangga, pelajar, komunitas banjar) yang ingin memilah sampah tetapi bingung memulai.

## Key Features

- **Pindai sampah dengan AI (core):** foto sampah → jenis, kategori, warna tong, cara buang, ide daur ulang, waktu terurai, nilai bank sampah, fakta menarik, dan poin.
- **Poin & level edukasi:** Pemula → Sahabat Subak → Pahlawan Banjar → Penjaga Pulau (tersimpan di perangkat pengguna).
- **Simulasi dampak:** proyeksi ilustratif sampah yang berhasil diolah vs. menuju TPA (7 hari / 30 hari / 1 tahun).
- **Direktori penyaluran:** bank sampah, pengolah daur ulang, dan kontak resmi di Bali, dengan filter per kategori sampah.
- **Riwayat pilahan:** daftar sampah yang pernah dipindai beserta poinnya.

## Tech Stack

- **Frontend:** React 19, TanStack Start (SSR), TanStack Router, Tailwind CSS v4, shadcn/ui, lucide-react
- **Backend:** TanStack Start server functions (`createServerFn`)
- **Database:** Tidak ada — riwayat dan poin disimpan lokal di perangkat (localStorage)
- **Hosting:** Lovable

## AI Implementation

- **Model:** LLM multimodal (vision) melalui Lovable AI Gateway (`google/gemini-2.5-flash` atau model serupa yang tersedia di gateway).
- **Fungsi:** menganalisis foto sampah dan menghasilkan klasifikasi terstruktur (divalidasi dengan skema Zod) berisi kategori, cara pembuangan, ide daur ulang, dan metadata edukasi.
- **Alur:** foto dikompresi di browser (maks. 1024px, JPEG) → dikirim ke server function → server memanggil AI gateway dengan instruksi pemilahan konteks Indonesia/Bali → hasil tervalidasi ditampilkan ke pengguna.
- **Alasan AI diperlukan:** jenis sampah sangat beragam dan tidak bisa dikenali dengan aturan if-else; diperlukan computer vision + penalaran bahasa untuk memberi rekomendasi penanganan yang kontekstual.

## Run Instructions

```sh
npm install        # atau: bun install
npm run dev        # atau: bun dev
```

Buka `http://localhost:8080`. Untuk fitur AI, sediakan variabel lingkungan sesuai `.env.example`.

## Architecture / Data Flow

```text
User (foto sampah)
  -> Frontend (kompresi gambar di browser)
  -> Server Function (scanWaste)
  -> Lovable AI Gateway (model vision)
  -> Validasi skema (Zod)
  -> Hasil klasifikasi & rekomendasi ke pengguna
```

## Deployment URL

https://sampah-jadi-berkah.lovable.app

## Team Members

- Gede Pratama — pengembang

## Known Limitations

- Hasil klasifikasi AI bersifat perkiraan dan bisa keliru; pengguna tetap dianjurkan memastikan ke pengelola setempat.
- Angka dampak pada simulasi bersifat ilustratif, bukan hasil pengukuran.
- Harga bank sampah dan daftar tempat penyaluran bersifat panduan; ketersediaan layanan dapat berubah.
- Riwayat dan poin hanya tersimpan di perangkat pengguna (belum tersinkron antarperangkat).

## Third-party Resources

- Framework & library open-source: React, TanStack Start/Router, Tailwind CSS, shadcn/ui, lucide-react, AI SDK (`ai`, `@ai-sdk/openai`), Zod.
- AI: Lovable AI Gateway (model vision multimodal).
- Gambar hero: dibuat dengan AI image generator (Lovable).
- AI coding assistant: Lovable (AI) digunakan sebagai development assistant.

## AI & Technology Disclosure

Lihat bagian di atas (AI Implementation dan Third-party Resources). Seluruh kode dapat dijelaskan dan dipertanggungjawabkan oleh tim.
