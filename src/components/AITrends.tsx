import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, TrendingUp, Cpu, Clock, Wrench, RefreshCw, AlertCircle, Calendar } from 'lucide-react';
import { formatTimeSaved } from '../utils/timeFormat';

export interface MonthlyTrend {
  monthKey: string;
  monthName: string;
  trendingTopic: string;
  category: string;
  summary: string;
  topTool: string;
  highlights: string[];
  hoursSaved: number;
}

interface AITrendsProps {
  entriesCount: number;
}

export default function AITrends({ entriesCount }: AITrendsProps) {
  const [trends, setTrends] = useState<MonthlyTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchTrends = async (forceRefresh = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await fetch('/api/entries/trends');
      if (!response.ok) {
        throw new Error('Gagal mengambil data analisis tren AI');
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setTrends(data);
        if (data.length > 0) {
          // Default to the first (latest) month
          setSelectedMonthKey(data[0].monthKey);
        }
      } else {
        throw new Error('Format data tidak valid');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan saat memproses analisis AI.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, [entriesCount]);

  if (loading) {
    return (
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-48 bg-slate-800 rounded-lg animate-pulse" />
          <div className="h-4 w-24 bg-slate-800 rounded-lg animate-pulse" />
        </div>
        <div className="space-y-3">
          <div className="h-24 bg-slate-900/60 rounded-xl border border-slate-800/40 animate-pulse" />
          <div className="h-16 bg-slate-900/60 rounded-xl border border-slate-800/40 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-6 text-center space-y-3">
        <div className="inline-flex p-3 bg-rose-500/10 border border-rose-500/25 rounded-full text-rose-400">
          <AlertCircle size={24} />
        </div>
        <h4 className="text-sm font-bold text-white">Gagal Memuat Analisis AI</h4>
        <p className="text-xs text-slate-400 max-w-md mx-auto">{error}</p>
        <button
          onClick={() => fetchTrends(true)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 mx-auto mt-2"
        >
          <RefreshCw size={12} /> Coba Lagi
        </button>
      </div>
    );
  }

  if (trends.length === 0) {
    return (
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-6 text-center space-y-2">
        <div className="inline-flex p-3 bg-slate-900 border border-slate-850 rounded-full text-slate-400">
          <Sparkles size={20} />
        </div>
        <h4 className="text-sm font-bold text-white">Belum Ada Data Tren</h4>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          Analisis tren AI bulanan akan otomatis terbuat setelah ada laporan masuk dalam sistem.
        </p>
      </div>
    );
  }

  const selectedTrend = trends.find((t) => t.monthKey === selectedMonthKey) || trends[0];

  return (
    <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-6 space-y-5 shadow-xs" id="ai-trends-widget">
      {/* Widget Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-900 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-teal-500/10 border border-teal-500/25 rounded-xl text-teal-400 shrink-0">
            <Sparkles size={16} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white uppercase tracking-tight flex items-center gap-1.5">
              Analisis Tren AI Bulanan
              <span className="px-1.5 py-0.5 bg-teal-950/60 text-teal-400 border border-teal-900 rounded-full text-[8px] font-extrabold uppercase tracking-wide">
                System Engine
              </span>
            </h3>
            <p className="text-[11px] text-[#999999] mt-0.5">
              Rangkuman topik AI paling populer & dampak efisiensinya berdasarkan laporan divisi.
            </p>
          </div>
        </div>
        
        {/* Actions Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Dropdown Selector */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-850 px-3 py-1.5 rounded-xl shrink-0">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
              <Calendar size={11} className="text-teal-400" /> Pilih Bulan:
            </span>
            <select
              value={selectedMonthKey}
              onChange={(e) => setSelectedMonthKey(e.target.value)}
              className="bg-transparent border-0 text-xs font-bold text-teal-400 focus:ring-0 focus:outline-hidden cursor-pointer p-0 pr-6"
            >
              {trends.map((t) => (
                <option key={t.monthKey} value={t.monthKey} className="bg-[#141414] text-slate-350">
                  {t.monthName}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => fetchTrends(true)}
            disabled={isRefreshing}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 disabled:bg-slate-950 disabled:text-slate-600 text-slate-200 border border-slate-800/80 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <RefreshCw size={11} className={`${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Menganalisis...' : 'Segarkan'}
          </button>
        </div>
      </div>

      {/* Selected Monthly Highlight Block */}
      {selectedTrend && (
        <motion.div
          key={selectedTrend.monthKey}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-slate-950/40 border border-teal-950/80 rounded-xl p-5 space-y-4"
        >
          {/* Title & Category */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-900/60">
            <div>
              <span className="px-2.5 py-0.5 bg-teal-950/60 text-teal-400 border border-teal-900 rounded-full text-[9px] font-extrabold uppercase tracking-wider">
                {selectedTrend.monthName} Highlight
              </span>
              <h4 className="text-sm font-extrabold text-white mt-1.5 tracking-tight">
                {selectedTrend.trendingTopic}
              </h4>
            </div>
            <div className="self-start sm:self-center">
              <span className="text-[10px] text-slate-350 font-bold bg-slate-900/80 border border-slate-800/65 px-2.5 py-1 rounded-lg">
                {selectedTrend.category}
              </span>
            </div>
          </div>

          {/* AI-generated Summary */}
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/10 p-3.5 rounded-xl border border-slate-900/40">
            {selectedTrend.summary}
          </p>

          <div className="flex flex-col md:flex-row gap-4">
            {/* Insights Panel */}
            <div className="space-y-3 bg-slate-900/15 p-4 rounded-xl border border-slate-900/30 md:w-[220px] shrink-0">
              <h5 className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
                <Wrench size={11} className="text-teal-400" /> Alat Utama & Dampak
              </h5>
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-slate-400">Top AI Tool:</span>
                  <span className="font-extrabold text-teal-450 bg-teal-950/40 border border-teal-900/30 px-2 py-0.5 rounded-md">
                    {selectedTrend.topTool}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-slate-400">Waktu Dihemat:</span>
                  <span className="font-bold text-teal-400">
                    {formatTimeSaved(selectedTrend.hoursSaved)}
                  </span>
                </div>
              </div>
            </div>

            {/* Highlights Panel */}
            <div className="flex-1 space-y-3.5 bg-slate-900/15 p-4 rounded-xl border border-slate-900/30">
              <h5 className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
                <TrendingUp size={11} className="text-teal-400" /> Sorotan Pencapaian
              </h5>
              <ul className="space-y-2">
                {selectedTrend.highlights.map((highlight, hIdx) => (
                  <li key={hIdx} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                    <span className="text-teal-500 font-bold shrink-0 mt-0.5">&bull;</span>
                    <span className="leading-relaxed">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
