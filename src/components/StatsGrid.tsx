import React from 'react';
import { AILearningEntry } from '../types';
import { formatTimeSaved } from '../utils/timeFormat';

interface StatsGridProps {
  entries: AILearningEntry[];
}

export default function StatsGrid({ entries }: StatsGridProps) {
  const totalSubmissions = entries.length;
  const totalTimeSaved = entries.reduce((acc, curr) => acc + (curr.estimasiWaktuDihemat || 0), 0);

  const averageTimeSaved =
    totalSubmissions > 0 ? parseFloat((totalTimeSaved / totalSubmissions).toFixed(1)) : 0;

  const implementedCount = entries.filter(e => e.sudahDicoba).length;
  const implementationRate =
    totalSubmissions > 0 ? Math.round((implementedCount / totalSubmissions) * 100) : 0;

  const aiCounts: { [key: string]: number } = {};
  entries.forEach(e => {
    if (e.aiYangDipakai) {
      aiCounts[e.aiYangDipakai] = (aiCounts[e.aiYangDipakai] || 0) + 1;
    }
  });

  let mostPopularAI = '-';
  let maxCount = 0;
  Object.entries(aiCounts).forEach(([ai, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostPopularAI = ai;
    }
  });

  const stats = [
    {
      id: 'time-saved',
      title: 'Total Waktu Dihemat',
      value: formatTimeSaved(totalTimeSaved),
      subtext: `Dari ${totalSubmissions} laporan masuk`,
      highlight: true
    },
    {
      id: 'submissions',
      title: 'Total Laporan',
      value: `${totalSubmissions}`,
      subtext: 'Laporan pembelajaran AI',
      highlight: false
    },
    {
      id: 'avg-saved',
      title: 'Rata-rata Hemat Waktu',
      value: formatTimeSaved(averageTimeSaved),
      subtext: 'Per topik pembelajaran',
      highlight: false
    },
    {
      id: 'impl-rate',
      title: 'Tingkat Implementasi',
      value: `${implementationRate}%`,
      subtext: `${implementedCount} dari ${totalSubmissions} sudah dipraktikkan`,
      highlight: false
    },
    {
      id: 'pop-ai',
      title: 'AI Paling Banyak Dipakai',
      value: mostPopularAI,
      subtext: maxCount > 0 ? `Digunakan di ${maxCount} laporan` : 'Belum ada data',
      highlight: false
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800 overflow-hidden">
      {stats.map(stat => (
        <div
          key={stat.id}
          id={`stat-card-${stat.id}`}
          className="p-5 flex flex-col justify-between gap-3"
        >
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {stat.title}
          </span>
          <div>
            <div
              className={`text-2xl font-bold tracking-tight tabular-nums font-display truncate ${
                stat.highlight
                  ? 'text-teal-700 dark:text-teal-400'
                  : 'text-slate-900 dark:text-white'
              }`}
              title={stat.value}
            >
              {stat.value}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 tabular-nums">
              {stat.subtext}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
