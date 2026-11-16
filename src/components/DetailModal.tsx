import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, Clock } from 'lucide-react';
import { AILearningEntry } from '../types';
import { formatTimeSaved } from '../utils/timeFormat';

interface DetailModalProps {
  entry: AILearningEntry | null;
  onClose: () => void;
}

export default function DetailModal({ entry, onClose }: DetailModalProps) {
  if (!entry) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 8 }}
          transition={{ duration: 0.16 }}
          className="relative bg-white dark:bg-[#111827] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full overflow-hidden z-10 max-h-[90vh] flex flex-col"
          id="detail-modal-card"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start gap-4">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-teal-700 dark:text-teal-400">
                  {entry.aiYangDipakai}
                </span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{entry.tanggalIsi}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                {entry.namaFiturTopik}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer shrink-0"
              aria-label="Tutup detail"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Employee Metadata Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Karyawan</span>
                <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                  {entry.nama}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Posisi &amp; Divisi</span>
                <p className="text-sm font-medium text-slate-900 dark:text-white mt-0.5">
                  {entry.posisiJabatan}
                </p>
                <span className="text-xs text-slate-500 dark:text-slate-400">{entry.divisi}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Waktu Dihemat</span>
                <p className="text-sm font-bold text-teal-700 dark:text-teal-400 mt-0.5 tabular-nums font-mono">
                  +{formatTimeSaved(entry.estimasiWaktuDihemat)}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Deskripsi Singkat Aktivitas
              </h4>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {entry.deskripsiSingkat}
              </p>
            </div>

            {/* Key Learning Points */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Poin Penting yang Dipelajari
              </h4>
              <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-4 rounded-xl text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {entry.poinPenting}
              </div>
            </div>

            {/* Implementation Status */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Status Penerapan
              </h4>
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 text-sm ${
                  entry.sudahDicoba
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200'
                    : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200'
                }`}
              >
                {entry.sudahDicoba ? (
                  <CheckCircle2 className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" size={18} />
                ) : (
                  <Clock className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={18} />
                )}
                <div>
                  <span className="font-semibold block">
                    {entry.sudahDicoba ? 'Sudah Dipraktikkan' : 'Teori & Eksplorasi'}
                  </span>
                  <p className="text-xs opacity-85 mt-0.5">
                    {entry.sudahDicoba
                      ? `Rutin digunakan dengan frekuensi: ${entry.frekuensiPenggunaan}.`
                      : 'Masih dalam tahap mempelajari teori atau uji coba mandiri sebelum diterapkan ke pekerjaan harian.'}
                  </p>
                </div>
              </div>
            </div>

            {entry.catatanTambahan && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Catatan Tambahan
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
                  &ldquo;{entry.catatanTambahan}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
