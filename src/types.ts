/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AILearningEntry {
  id: string;
  userId?: string;
  tanggalIsi: string; // YYYY-MM-DD
  nama: string;
  divisi: string;
  posisiJabatan: string;
  aiYangDipakai: string;
  namaFiturTopik: string;
  deskripsiSingkat: string;
  poinPenting: string;
  sudahDicoba: boolean;
  frekuensiPenggunaan: string; // 'Harian' | 'Beberapa kali seminggu' | 'Mingguan' | 'Bulanan' | 'Belum rutin'
  estimasiWaktuDihemat: number; // in hours
  catatanTambahan: string;
}

export interface Article {
  id: string;
  title: string;
  category: string; // 'Update AI' | 'Tutorial Setup Skill' | 'Setup AI Project' | 'Lainnya'
  content: string; // Markdown content
  createdAt: string; // YYYY-MM-DD
  author: string;
  imageUrl?: string; // Optional cover or body photo URL or Base64
  images?: Record<string, string>; // Optional dictionary of inline images indexed by reference ID
  status?: 'draft' | 'pending' | 'published'; // draft: draft pribadi, pending: menunggu acc admin, published: rilis
  highlighted?: boolean; // Highlight status
}

export interface AppUser {
  id: string;
  username: string;
  name: string;
  role: 'karyawan' | 'admin' | 'superadmin';
  password?: string;
  division?: string;
  position?: string;
  email?: string;
  joinDate?: string;
  status?: 'active' | 'inactive';
  passwordResetRequest?: 'none' | 'pending_approval' | 'approved';
}

export interface DashboardStats {
  totalSubmissions: number;
  totalTimeSaved: number;
  averageTimeSaved: number;
  implementationRate: number; // percentage
  mostPopularAI: string;
}
