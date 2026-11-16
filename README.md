# 🚀 Dashboard Pemantauan Pasca Pelatihan & Portal Pembelajaran AI Karyawan

Aplikasi web full-stack interaktif berbasis **React (TypeScript)**, **Tailwind CSS**, dan **Express.js** yang dirancang untuk mengelola, memantau, serta menganalisis kepatuhan dan efisiensi laporan penggunaan AI karyawan di lingkungan kerja.

---

## 🌟 Fitur Utama

- **Dual Mode Switcher (Portal Karyawan & Portal Admin)**:
  - **Portal Karyawan**: Pengisian laporan jurnal pembelajaran AI, riwayat mandiri, dan membaca artikel edukasi AI.
  - **Portal Admin**: Dasbor statistik, analitik efisiensi jam dihemat, pemantauan kepatuhan karyawan, manajemen user & reset password, serta pengaturan siklus pelaporan.
- **Analisis Tren AI & Efisiensi Waktu**:
  - Rekapitulasi otomatis topik AI terpopuler, penghematan waktu operasional, dan tren bulanan.
- **Manajemen Pengguna & Hak Akses**:
  - Tiga tingkatan akun: **Super Admin**, **Admin**, dan **Karyawan**.
  - Alur pengajuan dan persetujuan (approval) reset password secara aman.
- **Artikel Edukasi & Highlight Skill**:
  - Publikasi artikel tutorial setup skill, update teknologi AI, serta highlight artikel pilihan di halaman utama.
- **Otomatisasi Google Sheets QA Matrix**:
  - Generate skenario pengujian QA otomatis ke Google Drive / Sheets menggunakan Google Access Token.

---

## 🛠️ Teknologi yang Digunakan

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion (Framer Motion)
- **Backend API**: Express.js
- **Database**: File-based JSON Database (`database.json`) dengan dukungan otomatis Vercel `/tmp` fallback
- **Build Tool**: Vite & esbuild

---

## 📁 Struktur Direktori Utama

```
.
├── api/
│   └── index.ts               # Serverless Function Entrypoint untuk Vercel
├── server/
│   ├── app.ts                 # Definisi Express API Routes & Business Logic
│   ├── db.ts                  # Helper Local JSON Database Reader & Writer
│   └── googleSheets.ts        # Helper Integrasi Google Sheets API
├── src/
│   ├── components/            # Komponen UI (Login, Dashboard, Form, User Management, dll)
│   ├── data/                  # Mock Data Awal (Karyawan, Laporan, Artikel)
│   ├── lib/                   # Utility Google Auth & Firebase config
│   ├── utils/                 # Utility fungsi (Format Waktu, Helper)
│   ├── App.tsx                # Layout Utama & Router/Portal Handler
│   ├── main.tsx               # Entry Point React
│   └── types.ts               # Definisi TypeScript Interfaces & Enums
├── database.json              # Data Utama (Users, Laporan, Artikel, Settings)
├── vercel.json                # Konfigurasi Deployment Vercel (Routes & Serverless)
├── package.json               # Dependencies & NPM Scripts
├── vite.config.ts             # Konfigurasi Vite
└── README.md                  # Dokumentasi Proyek
```

---

## 🚀 Cara Menjalankan di Komputer Lokal (Local Setup)

### 1. Prasyarat Sistem
- **Node.js**: v18.0.0 atau lebih baru
- **NPM**: v9.0.0 atau lebih baru

### 2. Langkah Instalasi & Jalankan Server Dev

```bash
# 1. Clone repository ini (jika dari GitHub)
git clone https://github.com/USERNAME/NAMA-REPO.git
cd NAMA-REPO

# 2. Install dependencies
npm install

# 3. Jalankan server pengembangan (Vite + Express)
npm run dev
```

Aplikasi akan berjalan di **`http://localhost:3000`**.

---

## 📦 Panduan Upload ke GitHub

Sebelum melakukan deploy ke Vercel, pastikan seluruh kode telah di-push ke GitHub.

### Langkah-langkah Push ke GitHub:

```bash
# 1. Inisialisasi git (jika belum)
git init

# 2. Tambahkan seluruh berkas ke staging
git add .

# 3. Commit perubahan
git commit -m "feat: siapkan dashboard untuk deployment Vercel"

# 4. Hubungkan ke repositori GitHub Anda
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPO.git

# 5. Push kode ke GitHub
git push -u origin main
```

---

## 🌐 Panduan Deploy ke Vercel

Proyek ini telah dikonfigurasi lengkap dengan `vercel.json` dan serverless API (`/api/index.ts`) sehingga dapat langsung di-deploy ke **Vercel** hanya dalam beberapa klik.

### Langkah-langkah Deployment di Vercel:

1. **Buka Vercel Dashboard**: Masuk ke [vercel.com](https://vercel.com) dan login dengan akun Anda.
2. **Tambah Proyek Baru**:
   - Klik tombol **"Add New..."** -> **"Project"**.
   - Pilih repositori GitHub proyek yang baru saja Anda push.
3. **Konfigurasi Project Settings**:
   - **Framework Preset**: Pilih **Vite** (atau letakkan pada *Other / Auto-detected*).
   - **Root Directory**: `./` (default).
   - **Build Command**: `npm run build` (otomatis terdeteksi).
   - **Output Directory**: `dist` (otomatis terdeteksi).
4. **Environment Variables**:
   - Jika Anda menggunakan fitur Google Drive / Gemini API tambahan di masa mendatang, Anda dapat menambahkan environment variable di bagian ini (Opsional).
5. **Klik "Deploy"**:
   - Tunggu proses build selesai (~1-2 menit).
   - Vercel akan memberikan URL publik resmi (misal: `https://nama-proyek.vercel.app`).

---

## 🔑 Kredensial Akun Default (Super Admin)

| Peran (Role) | Email / Username | Password Default | Akses Hak |
|---|---|---|---|
| **Super Admin** | `admin@vascomm.co.id` / `Super Admin` | `Superadmin@11` | Akses Penuh (Portal Admin & Portal Karyawan, Kelola Pengguna, Settings) |

*Catatan: Seluruh data contoh laporan, artikel, dan akun pengujian lainnya telah dibersihkan sehingga siap untuk diisi manual oleh tim Anda.*

---

## 📄 Lisensi

Hak Cipta © 2026 Vascomm. All Rights Reserved.
