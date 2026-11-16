import React, { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { AILearningEntry } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ChartsViewProps {
  entries: AILearningEntry[];
  isDark?: boolean;
}

export default function ChartsView({ entries, isDark = false }: ChartsViewProps) {
  const aiChartData = useMemo(() => {
    const aiData: { [key: string]: { name: string; totalHours: number; count: number } } = {};
    entries.forEach(e => {
      const ai = e.aiYangDipakai || 'Lainnya';
      if (!aiData[ai]) {
        aiData[ai] = { name: ai, totalHours: 0, count: 0 };
      }
      aiData[ai].totalHours += e.estimasiWaktuDihemat || 0;
      aiData[ai].count += 1;
    });

    return Object.values(aiData).sort((a, b) => b.totalHours - a.totalHours);
  }, [entries]);

  const divisionChartData = useMemo(() => {
    const divData: { [key: string]: { name: string; totalHours: number; count: number } } = {};
    entries.forEach(e => {
      const div = e.divisi || 'Vascomm';
      if (!divData[div]) {
        divData[div] = { name: div, totalHours: 0, count: 0 };
      }
      divData[div].totalHours += e.estimasiWaktuDihemat || 0;
      divData[div].count += 1;
    });

    return Object.values(divData).sort((a, b) => b.totalHours - a.totalHours);
  }, [entries]);

  const implementationChartData = useMemo(() => {
    let sudah = 0;
    let belum = 0;
    entries.forEach(e => {
      if (e.sudahDicoba) sudah++;
      else belum++;
    });

    return [
      { name: 'Sudah Dipraktikkan', value: sudah },
      { name: 'Eksplorasi & Teori', value: belum }
    ];
  }, [entries]);

  const monthlyDivisionChartData = useMemo(() => {
    const uniqueDivisions = new Set<string>();
    const grouped: { [key: string]: { [div: string]: number } } = {};

    entries.forEach(e => {
      if (!e.tanggalIsi) return;
      const parts = e.tanggalIsi.split('-');
      if (parts.length < 2) return;
      const yearMonth = `${parts[0]}-${parts[1]}`;
      const div = e.divisi || 'Vascomm';
      uniqueDivisions.add(div);

      if (!grouped[yearMonth]) grouped[yearMonth] = {};
      if (!grouped[yearMonth][div]) grouped[yearMonth][div] = 0;
      grouped[yearMonth][div] += e.estimasiWaktuDihemat || 0;
    });

    const sortedKeys = Object.keys(grouped).sort();
    const monthsMap: { [key: string]: string } = {
      '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr',
      '05': 'Mei', '06': 'Jun', '07': 'Jul', '08': 'Ags',
      '09': 'Sep', '10': 'Okt', '11': 'Nov', '12': 'Des'
    };

    const data = sortedKeys.map(key => {
      const [year, month] = key.split('-');
      const label = `${monthsMap[month] || month} ${year}`;
      const item: any = { name: label };

      uniqueDivisions.forEach(div => {
        item[div] = parseFloat((grouped[key][div] || 0).toFixed(1));
      });

      return item;
    });

    return {
      data,
      divisions: Array.from(uniqueDivisions)
    };
  }, [entries]);

  const monthlyAIToolsChartData = useMemo(() => {
    const uniqueAIs = new Set<string>();
    const grouped: { [key: string]: { [ai: string]: number } } = {};

    entries.forEach(e => {
      if (!e.tanggalIsi) return;
      const parts = e.tanggalIsi.split('-');
      if (parts.length < 2) return;
      const yearMonth = `${parts[0]}-${parts[1]}`;
      const ai = e.aiYangDipakai || 'Lainnya';
      uniqueAIs.add(ai);

      if (!grouped[yearMonth]) grouped[yearMonth] = {};
      if (!grouped[yearMonth][ai]) grouped[yearMonth][ai] = 0;
      grouped[yearMonth][ai] += 1;
    });

    const sortedKeys = Object.keys(grouped).sort();
    const monthsMap: { [key: string]: string } = {
      '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr',
      '05': 'Mei', '06': 'Jun', '07': 'Jul', '08': 'Ags',
      '09': 'Sep', '10': 'Okt', '11': 'Nov', '12': 'Des'
    };

    const data = sortedKeys.map(key => {
      const [year, month] = key.split('-');
      const label = `${monthsMap[month] || month} ${year}`;
      const item: any = { name: label };

      uniqueAIs.forEach(ai => {
        item[ai] = grouped[key][ai] || 0;
      });

      return item;
    });

    return {
      data,
      ais: Array.from(uniqueAIs)
    };
  }, [entries]);

  const [aiToolChunkIndex, setAiToolChunkIndex] = useState(0);
  const aiToolTotalChunks = useMemo(
    () => Math.ceil(monthlyAIToolsChartData.data.length / 6) || 1,
    [monthlyAIToolsChartData.data]
  );
  const safeAiToolChunkIndex = Math.min(aiToolChunkIndex, aiToolTotalChunks - 1);

  const currentAIToolData = useMemo(() => {
    const startIdx = safeAiToolChunkIndex * 6;
    return monthlyAIToolsChartData.data.slice(startIdx, startIdx + 6);
  }, [monthlyAIToolsChartData.data, safeAiToolChunkIndex]);

  const aiToolRangeOptions = useMemo(() => {
    const options = [];
    const list = monthlyAIToolsChartData.data;
    for (let i = 0; i < list.length; i += 6) {
      const sub = list.slice(i, i + 6);
      if (sub.length > 0) {
        options.push({
          index: i / 6,
          label: `${sub[0].name} – ${sub[sub.length - 1].name}`
        });
      }
    }
    return options;
  }, [monthlyAIToolsChartData.data]);

  const gridStroke = isDark ? '#1F2937' : '#E2E8F0';
  const axisStroke = isDark ? '#94A3B8' : '#64748B';
  const dotFill = isDark ? '#111827' : '#FFFFFF';

  const SERIES_COLORS = [
    '#0F766E', // Deep Teal
    '#0284C7', // Ocean Blue
    '#D97706', // Warm Amber
    '#4F46E5', // Indigo
    '#059669', // Emerald
    '#E11D48', // Crimson
    '#7C3AED', // Violet
    '#0891B2', // Cyan
    '#EA580C', // Orange
    '#65A30D', // Olive
    '#64748B'  // Slate
  ];

  const IMPL_COLORS = [isDark ? '#14B8A6' : '#0F766E', '#D97706'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const activePayload = payload.filter((item: any) => item.value > 0);
      if (activePayload.length === 0) return null;

      return (
        <div className="bg-white dark:bg-[#111827] text-slate-900 dark:text-white p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg text-xs max-h-60 overflow-y-auto">
          <p className="font-semibold text-slate-900 dark:text-white mb-2 pb-1.5 border-b border-slate-100 dark:border-slate-800">
            {label}
          </p>
          <div className="space-y-1">
            {activePayload.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.name}
                </span>
                <span className="font-semibold text-slate-900 dark:text-white tabular-nums font-mono">
                  {item.value} {item.unit || ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white dark:bg-[#111827] text-slate-900 dark:text-white p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg text-xs">
          <p className="font-semibold text-slate-900 dark:text-white">{data.name}</p>
          <p className="font-semibold text-teal-700 dark:text-teal-400 mt-1 tabular-nums">
            {data.value} laporan
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Tren Penghematan Waktu per Divisi per Bulan */}
      <div
        className="bg-white dark:bg-[#111827] p-6 rounded-xl border border-slate-200 dark:border-slate-800 lg:col-span-2"
        id="chart-monthly-division-savings"
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Tren Penghematan Waktu Divisi per Bulan
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Akumulasi jam kerja yang dihemat di tiap divisi setiap bulan
            </p>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1.5 max-w-xl">
            {monthlyDivisionChartData.divisions.map((div, index) => (
              <div key={div} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                <span
                  className="w-2.5 h-2.5 rounded-xs shrink-0"
                  style={{ backgroundColor: SERIES_COLORS[index % SERIES_COLORS.length] }}
                />
                <span className="truncate max-w-[130px]">{div}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="h-80">
          {monthlyDivisionChartData.data.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              Belum ada data bulanan untuk ditampilkan.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyDivisionChartData.data} margin={{ top: 10, right: 16, left: -16, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="name" stroke={axisStroke} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={axisStroke} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                {monthlyDivisionChartData.divisions.map((div, index) => (
                  <Line
                    key={div}
                    type="monotone"
                    dataKey={div}
                    name={div}
                    unit=" jam"
                    stroke={SERIES_COLORS[index % SERIES_COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 3.5, strokeWidth: 1.5, fill: dotFill }}
                    activeDot={{ r: 5.5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 2. Tren Penggunaan Tools AI per Bulan */}
      <div
        className="bg-white dark:bg-[#111827] p-6 rounded-xl border border-slate-200 dark:border-slate-800 lg:col-span-2"
        id="chart-monthly-aitools-savings"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Tren Penggunaan Tools AI per Bulan
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Frekuensi laporan per tool AI · Menampilkan 6 bulan per halaman
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {aiToolRangeOptions.length > 1 && (
              <select
                value={safeAiToolChunkIndex}
                onChange={(e) => setAiToolChunkIndex(Number(e.target.value))}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 px-3 py-1.5 cursor-pointer focus:outline-hidden focus:border-teal-600"
              >
                {aiToolRangeOptions.map((opt) => (
                  <option key={opt.index} value={opt.index}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}

            {aiToolTotalChunks > 1 && (
              <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 bg-slate-50 dark:bg-slate-900">
                <button
                  type="button"
                  onClick={() => setAiToolChunkIndex(prev => Math.max(0, prev - 1))}
                  disabled={safeAiToolChunkIndex === 0}
                  className="p-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 transition cursor-pointer"
                  title="6 bulan sebelumnya"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300 px-2 tabular-nums select-none">
                  {safeAiToolChunkIndex + 1} / {aiToolTotalChunks}
                </span>
                <button
                  type="button"
                  onClick={() => setAiToolChunkIndex(prev => Math.min(aiToolTotalChunks - 1, prev + 1))}
                  disabled={safeAiToolChunkIndex >= aiToolTotalChunks - 1}
                  className="p-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 transition cursor-pointer"
                  title="6 bulan berikutnya"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
          {monthlyAIToolsChartData.ais.map((ai, index) => (
            <div key={ai} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
              <span
                className="w-2.5 h-2.5 rounded-xs shrink-0"
                style={{ backgroundColor: SERIES_COLORS[index % SERIES_COLORS.length] }}
              />
              <span className="truncate max-w-[120px]">{ai}</span>
            </div>
          ))}
        </div>

        <div className="h-80">
          {currentAIToolData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              Belum ada data tools bulanan untuk rentang ini.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={currentAIToolData} margin={{ top: 10, right: 16, left: -16, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="name" stroke={axisStroke} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={axisStroke} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                {monthlyAIToolsChartData.ais.map((ai, index) => (
                  <Line
                    key={ai}
                    type="monotone"
                    dataKey={ai}
                    name={ai}
                    unit=" laporan"
                    stroke={SERIES_COLORS[index % SERIES_COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 3.5, strokeWidth: 1.5, fill: dotFill }}
                    activeDot={{ r: 5.5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 3. Bar Chart: Efisiensi Waktu Berdasarkan Tools AI */}
      <div
        className="bg-white dark:bg-[#111827] p-6 rounded-xl border border-slate-200 dark:border-slate-800"
        id="chart-ai-savings"
      >
        <div className="mb-6">
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            Efisiensi Waktu Berdasarkan Tools AI
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Total estimasi waktu dihemat dalam jam
          </p>
        </div>

        <div className="h-72">
          {aiChartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              Belum ada data untuk ditampilkan.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aiChartData} margin={{ top: 10, right: 10, left: -16, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="name" stroke={axisStroke} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke={axisStroke} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="totalHours"
                  name="Waktu Dihemat"
                  unit=" jam"
                  fill={isDark ? '#14B8A6' : '#0F766E'}
                  radius={[5, 5, 0, 0]}
                  barSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 4. Donut Chart: Distribusi Pilihan AI */}
      <div
        className="bg-white dark:bg-[#111827] p-6 rounded-xl border border-slate-200 dark:border-slate-800"
        id="chart-ai-distribution"
      >
        <div className="mb-6">
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            Distribusi Pilihan AI
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Proporsi jumlah laporan berdasarkan jenis AI
          </p>
        </div>

        <div className="h-72 flex flex-col sm:flex-row items-center justify-center gap-4">
          {aiChartData.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">
              Belum ada data untuk ditampilkan.
            </div>
          ) : (
            <>
              <div className="w-full sm:w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Pie
                      data={aiChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={56}
                      outerRadius={82}
                      paddingAngle={3}
                      dataKey="count"
                    >
                      {aiChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={SERIES_COLORS[index % SERIES_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full sm:w-1/2 max-h-64 overflow-y-auto pr-1">
                <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                  {aiChartData.map((entry, index) => (
                    <div key={entry.name} className="flex items-start gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 mt-1"
                        style={{ backgroundColor: SERIES_COLORS[index % SERIES_COLORS.length] }}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {entry.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                          {entry.count} laporan
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 5. Bar Chart: Efisiensi per Divisi */}
      <div
        className="bg-white dark:bg-[#111827] p-6 rounded-xl border border-slate-200 dark:border-slate-800"
        id="chart-division-savings"
      >
        <div className="mb-6">
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            Efisiensi Waktu Berdasarkan Divisi
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Perbandingan total jam yang dihemat antar divisi
          </p>
        </div>

        <div className="h-72">
          {divisionChartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              Belum ada data untuk ditampilkan.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={divisionChartData} margin={{ top: 10, right: 10, left: -16, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="name" stroke={axisStroke} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke={axisStroke} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="totalHours"
                  name="Waktu Dihemat"
                  unit=" jam"
                  fill="#0284C7"
                  radius={[5, 5, 0, 0]}
                  barSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 6. Donut Chart: Status Implementasi */}
      <div
        className="bg-white dark:bg-[#111827] p-6 rounded-xl border border-slate-200 dark:border-slate-800"
        id="chart-implementation-rate"
      >
        <div className="mb-6">
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            Tingkat Penyerapan Praktik AI
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Perbandingan topik yang sudah diterapkan vs tahap eksplorasi
          </p>
        </div>

        <div className="h-72 flex flex-col sm:flex-row items-center justify-center gap-4">
          {entries.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">
              Belum ada data untuk ditampilkan.
            </div>
          ) : (
            <>
              <div className="w-full sm:w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Pie
                      data={implementationChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={56}
                      outerRadius={82}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {implementationChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={IMPL_COLORS[index]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full sm:w-1/2 flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
                {implementationChartData.map((entry, index) => {
                  const percent =
                    entries.length > 0 ? Math.round((entry.value / entries.length) * 100) : 0;
                  return (
                    <div
                      key={entry.name}
                      className="py-3.5 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: IMPL_COLORS[index] }}
                        />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          {entry.name}
                        </span>
                      </div>
                      <div className="text-right tabular-nums">
                        <span className="text-base font-bold text-slate-900 dark:text-white">
                          {entry.value}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 ml-1.5">
                          ({percent}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
