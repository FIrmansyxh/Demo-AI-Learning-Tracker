import React, { useState, useMemo } from 'react';
import { CheckCircle2, AlertTriangle, Clock, Search } from 'lucide-react';
import { AILearningEntry, AppUser } from '../types';

interface SubmissionTrackingWidgetProps {
  entries: AILearningEntry[];
  users: AppUser[];
  frequency: 'bulan' | '2minggu';
}

export default function SubmissionTrackingWidget({
  entries,
  users,
  frequency
}: SubmissionTrackingWidgetProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const getIndonesianMonthName = (monthIdx: number) => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[monthIdx];
  };

  const getCycleRange = (freq: 'bulan' | '2minggu') => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    if (freq === 'bulan') {
      const startDate = new Date(year, month, 1, 0, 0, 0);
      const endDate = new Date(year, month + 1, 0, 23, 59, 59);
      return {
        startDate,
        endDate,
        label: `Siklus Bulanan (${getIndonesianMonthName(month)} ${year})`,
        subLabel: `1 – ${endDate.getDate()} ${getIndonesianMonthName(month)}`
      };
    }

    const day = now.getDate();
    if (day <= 14) {
      const startDate = new Date(year, month, 1, 0, 0, 0);
      const endDate = new Date(year, month, 14, 23, 59, 59);
      return {
        startDate,
        endDate,
        label: `2 Mingguan · Paruh Awal (${getIndonesianMonthName(month)} ${year})`,
        subLabel: `1 – 14 ${getIndonesianMonthName(month)}`
      };
    }

    const startDate = new Date(year, month, 15, 0, 0, 0);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);
    return {
      startDate,
      endDate,
      label: `2 Mingguan · Paruh Akhir (${getIndonesianMonthName(month)} ${year})`,
      subLabel: `15 – ${endDate.getDate()} ${getIndonesianMonthName(month)}`
    };
  };

  const { startDate, endDate, label: cycleLabel, subLabel: dateRangeLabel } = getCycleRange(frequency);

  const activeEmployees = users.filter(u => u.role === 'karyawan' && u.status !== 'inactive');
  const totalActiveCount = activeEmployees.length;

  const submittedEmployees = activeEmployees.filter(emp =>
    entries.some(entry => {
      if (!entry.tanggalIsi) return false;
      const entryDate = new Date(entry.tanggalIsi);
      const isSameName = entry.nama.toLowerCase().trim() === emp.name.toLowerCase().trim();
      const isInRange = entryDate >= startDate && entryDate <= endDate;
      return isSameName && isInRange;
    })
  );

  const unsubmittedEmployees = activeEmployees.filter(
    emp =>
      !entries.some(entry => {
        if (!entry.tanggalIsi) return false;
        const entryDate = new Date(entry.tanggalIsi);
        const isSameName = entry.nama.toLowerCase().trim() === emp.name.toLowerCase().trim();
        const isInRange = entryDate >= startDate && entryDate <= endDate;
        return isSameName && isInRange;
      })
  );

  const filteredUnsubmitted = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return unsubmittedEmployees;
    return unsubmittedEmployees.filter(
      emp =>
        emp.name.toLowerCase().includes(q) ||
        (emp.division || '').toLowerCase().includes(q)
    );
  }, [unsubmittedEmployees, searchTerm]);

  const submittedCount = submittedEmployees.length;
  const unsubmittedCount = unsubmittedEmployees.length;
  const progressPercentage =
    totalActiveCount > 0 ? Math.min(100, Math.round((submittedCount / totalActiveCount) * 100)) : 0;
  const isCriticalRemaining = unsubmittedCount <= 4 && unsubmittedCount > 0;

  return (
    <div
      className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6"
      id="submission-tracking-widget"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Pemantauan Kepatuhan Laporan
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Keaktifan pengisian laporan berkala seluruh karyawan aktif pada periode berjalan.
          </p>
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-300 font-medium tabular-nums shrink-0">
          <span>{cycleLabel}</span>
          <span className="mx-2 text-slate-300 dark:text-slate-600">·</span>
          <span className="text-slate-500 dark:text-slate-400">{dateRangeLabel}</span>
        </div>
      </div>

      {/* Main Stats & Progress */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-6 space-y-3">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Tingkat Kepatuhan Periode Ini
            </span>
            <div className="flex items-baseline gap-2 mt-1 tabular-nums">
              <span className="text-4xl font-bold text-slate-900 dark:text-white font-display">
                {submittedCount}
              </span>
              <span className="text-lg text-slate-400">/ {totalActiveCount}</span>
              <span className="text-sm font-semibold text-teal-700 dark:text-teal-400 ml-1">
                ({progressPercentage}%)
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isCriticalRemaining
                    ? 'bg-amber-500'
                    : 'bg-[#0F766E] dark:bg-teal-500'
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              <span>{submittedCount} sudah mengisi</span>
              <span>{unsubmittedCount} belum mengisi</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-6">
          {isCriticalRemaining ? (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-start gap-3">
              <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed text-amber-900 dark:text-amber-200">
                <p className="font-semibold">Tersisa {unsubmittedCount} karyawan belum mengisi</p>
                <p className="opacity-85 mt-0.5">
                  Ingatkan karyawan pada daftar di bawah agar target kepatuhan 100% tercapai tepat waktu.
                </p>
              </div>
            </div>
          ) : unsubmittedCount > 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
              <Clock size={18} className="text-teal-700 dark:text-teal-400 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                <p className="font-semibold text-slate-900 dark:text-white">
                  Siklus pelaporan sedang berjalan
                </p>
                <p className="mt-0.5">
                  Sebanyak <strong className="text-slate-900 dark:text-white">{unsubmittedCount} karyawan</strong> dari total {totalActiveCount} karyawan aktif belum mengirimkan laporan pada periode ini.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 flex items-start gap-3">
              <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed text-emerald-900 dark:text-emerald-200">
                <p className="font-semibold">Kepatuhan mencapai 100%</p>
                <p className="opacity-85 mt-0.5">
                  Seluruh karyawan aktif telah mengumpulkan laporan pembelajaran AI pada siklus ini.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Unsubmitted Employees List */}
      <div className="pt-5 border-t border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white tabular-nums">
            Belum Mengisi Laporan ({unsubmittedCount})
          </h4>

          {unsubmittedCount > 0 && (
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter nama atau divisi..."
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-teal-600"
              />
            </div>
          )}
        </div>

        {unsubmittedEmployees.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-500 dark:text-slate-400">
            Seluruh karyawan aktif sudah mengisi laporan untuk siklus ini.
          </div>
        ) : filteredUnsubmitted.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Tidak ada nama yang cocok dengan pencarian &ldquo;{searchTerm}&rdquo;.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {filteredUnsubmitted.map(emp => (
              <div
                key={emp.id}
                className="px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center shrink-0">
                  {emp.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white truncate" title={emp.name}>
                    {emp.name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {emp.division || 'IT SOLUTION'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
