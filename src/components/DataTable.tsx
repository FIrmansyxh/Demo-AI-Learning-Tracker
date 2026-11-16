import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ArrowUpDown, Eye, Trash2, Check, Clock } from 'lucide-react';
import { AILearningEntry, AppUser } from '../types';
import { formatTimeSaved } from '../utils/timeFormat';

interface DataTableProps {
  entries: AILearningEntry[];
  onView: (entry: AILearningEntry) => void;
  onDelete: (id: string) => void;
  isAdmin?: boolean;
  currentUser?: AppUser | null;
}

export default function DataTable({ entries, onView, onDelete, isAdmin = false, currentUser = null }: DataTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDivisi, setFilterDivisi] = useState('Semua Divisi');
  const [filterAI, setFilterAI] = useState('Semua AI');
  const [filterStatus, setFilterStatus] = useState('Semua Status');

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'tanggalIsi' | 'nama' | 'estimasiWaktuDihemat'>('tanggalIsi');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const divisionOptions = useMemo(() => {
    const options = new Set<string>();
    entries.forEach(e => {
      if (e.divisi) options.add(e.divisi);
    });
    return ['Semua Divisi', ...Array.from(options)];
  }, [entries]);

  const aiOptions = useMemo(() => {
    const options = new Set<string>();
    entries.forEach(e => {
      if (e.aiYangDipakai) options.add(e.aiYangDipakai);
    });
    return ['Semua AI', ...Array.from(options)];
  }, [entries]);

  const handleSort = (field: 'tanggalIsi' | 'nama' | 'estimasiWaktuDihemat') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const processedEntries = useMemo(() => {
    let result = entries.map(e => ({ ...e, _score: 0 }));

    const activeSearch = searchQuery.trim() !== '';
    if (activeSearch) {
      const q = searchQuery.toLowerCase().trim();
      const terms = q.split(/\s+/).filter(Boolean);

      if (terms.length > 0) {
        result = result.filter(e => {
          const nameLower = e.nama.toLowerCase();
          const positionLower = e.posisiJabatan.toLowerCase();
          const topicLower = e.namaFiturTopik.toLowerCase();
          const aiLower = e.aiYangDipakai.toLowerCase();
          const descLower = e.deskripsiSingkat.toLowerCase();
          const divisionLower = (e.divisi || '').toLowerCase();

          const allTermsMatch = terms.every(
            term =>
              nameLower.includes(term) ||
              positionLower.includes(term) ||
              topicLower.includes(term) ||
              aiLower.includes(term) ||
              descLower.includes(term) ||
              divisionLower.includes(term)
          );

          if (!allTermsMatch) return false;

          let score = 0;
          if (nameLower === q) score += 1000;
          else if (nameLower.includes(q)) score += 500;
          if (positionLower === q) score += 300;
          else if (positionLower.includes(q)) score += 150;
          if (topicLower.includes(q)) score += 100;

          terms.forEach(term => {
            if (nameLower.startsWith(term)) score += 80;
            else if (nameLower.includes(term)) score += 40;
            if (positionLower.startsWith(term)) score += 40;
            else if (positionLower.includes(term)) score += 20;
            if (topicLower.includes(term)) score += 15;
            if (aiLower.includes(term)) score += 10;
            if (descLower.includes(term)) score += 5;
          });

          e._score = score;
          return true;
        });
      }
    }

    if (filterDivisi !== 'Semua Divisi') {
      result = result.filter(e => e.divisi === filterDivisi);
    }
    if (filterAI !== 'Semua AI') {
      result = result.filter(e => e.aiYangDipakai === filterAI);
    }
    if (filterStatus !== 'Semua Status') {
      const isTried = filterStatus === 'Sudah Dipraktikkan';
      result = result.filter(e => e.sudahDicoba === isTried);
    }

    result.sort((a, b) => {
      if (activeSearch && b._score !== a._score) {
        return b._score - a._score;
      }

      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (valA === undefined) valA = '';
      if (valB === undefined) valB = '';

      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    return result.map(({ _score, ...rest }) => rest as AILearningEntry);
  }, [entries, searchQuery, filterDivisi, filterAI, filterStatus, sortField, sortOrder]);

  const totalPages = Math.ceil(processedEntries.length / itemsPerPage);
  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedEntries.slice(start, start + itemsPerPage);
  }, [processedEntries, currentPage]);

  const changePage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterDivisi, filterAI, filterStatus]);

  const canDeleteEntry = (entry: AILearningEntry): boolean => {
    if (isAdmin) return true;
    if (!currentUser) return false;
    if (entry.userId && currentUser.id && entry.userId === currentUser.id) {
      return true;
    }
    if (entry.nama && currentUser.name) {
      return entry.nama.trim().toLowerCase() === currentUser.name.trim().toLowerCase();
    }
    return false;
  };

  return (
    <div
      className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden"
      id="data-table-container"
    >
      {/* Search & Filter Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, jabatan, topik..."
            className="w-full text-sm pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 focus:outline-hidden text-slate-900 dark:text-white placeholder-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <select
              value={filterDivisi}
              onChange={(e) => setFilterDivisi(e.target.value)}
              className="text-xs font-medium pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg appearance-none cursor-pointer focus:outline-hidden focus:border-teal-600 text-slate-700 dark:text-slate-200"
            >
              {divisionOptions.map(opt => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
          </div>

          <div className="relative">
            <select
              value={filterAI}
              onChange={(e) => setFilterAI(e.target.value)}
              className="text-xs font-medium pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg appearance-none cursor-pointer focus:outline-hidden focus:border-teal-600 text-slate-700 dark:text-slate-200"
            >
              {aiOptions.map(opt => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
          </div>

          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs font-medium pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg appearance-none cursor-pointer focus:outline-hidden focus:border-teal-600 text-slate-700 dark:text-slate-200"
            >
              <option value="Semua Status">Semua Status</option>
              <option value="Sudah Dipraktikkan">Sudah Dipraktikkan</option>
              <option value="Belum Dipraktikkan">Teori &amp; Eksplorasi</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs font-semibold">
              <th className="py-3 px-4 pl-5 w-12">No.</th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition"
                onClick={() => handleSort('tanggalIsi')}
              >
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  Tanggal
                  <ArrowUpDown size={12} className="text-slate-400" />
                </div>
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition"
                onClick={() => handleSort('nama')}
              >
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  Karyawan
                  <ArrowUpDown size={12} className="text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">Topik &amp; Tool AI</th>
              <th className="py-3 px-4 whitespace-nowrap">Status Penerapan</th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white text-right transition"
                onClick={() => handleSort('estimasiWaktuDihemat')}
              >
                <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                  Waktu Dihemat
                  <ArrowUpDown size={12} className="text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 pr-5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
            {paginatedEntries.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                  Tidak ada laporan yang cocok dengan filter saat ini.
                </td>
              </tr>
            ) : (
              paginatedEntries.map((entry, index) => {
                const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                return (
                  <tr
                    key={entry.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3.5 px-4 pl-5 font-mono text-xs text-slate-400 tabular-nums">
                      {globalIndex < 10 ? `0${globalIndex}` : globalIndex}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400 font-mono tabular-nums whitespace-nowrap">
                      {entry.tanggalIsi}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white text-sm">
                        {entry.nama}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {entry.posisiJabatan} · {entry.divisi}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-teal-700 dark:text-teal-400 whitespace-nowrap shrink-0">
                          {entry.aiYangDipakai}
                        </span>
                        <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">·</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
                          {entry.namaFiturTopik}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {entry.deskripsiSingkat}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs">
                      {entry.sudahDicoba ? (
                        <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
                          <Check size={13} strokeWidth={2.5} />
                          Sudah ({entry.frekuensiPenggunaan})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 font-medium text-amber-700 dark:text-amber-400">
                          <Clock size={13} />
                          Teori &amp; Eksplorasi
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-slate-900 dark:text-white font-mono text-xs tabular-nums whitespace-nowrap">
                      +{formatTimeSaved(entry.estimasiWaktuDihemat)}
                    </td>
                    <td className="py-3.5 px-4 pr-5 text-right">
                      {deletingId === entry.id && canDeleteEntry(entry) ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              if (canDeleteEntry(entry)) {
                                onDelete(entry.id);
                              }
                              setDeletingId(null);
                            }}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium rounded-md transition cursor-pointer"
                          >
                            Hapus
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-md transition cursor-pointer"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => onView(entry)}
                            title="Lihat Detail"
                            className="p-1.5 text-slate-500 hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                          >
                            <Eye size={15} />
                          </button>
                          {canDeleteEntry(entry) && (
                            <button
                              onClick={() => setDeletingId(entry.id)}
                              title="Hapus Laporan"
                              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/30">
          <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            Menampilkan <strong className="font-semibold text-slate-900 dark:text-white">{paginatedEntries.length}</strong> dari{' '}
            <strong className="font-semibold text-slate-900 dark:text-white">{processedEntries.length}</strong> laporan
          </span>

          <div className="flex items-center gap-1 flex-wrap">
            <button
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 transition cursor-pointer"
            >
              Sebelumnya
            </button>
            {(() => {
              const pages: (number | string)[] = [];
              if (totalPages <= 7) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
              } else {
                pages.push(1);
                if (currentPage > 3) pages.push('...');
                const start = Math.max(2, currentPage - 1);
                const end = Math.min(totalPages - 1, currentPage + 1);
                for (let i = start; i <= end; i++) pages.push(i);
                if (currentPage < totalPages - 2) pages.push('...');
                pages.push(totalPages);
              }
              return pages.map((page, idx) =>
                typeof page === 'string' ? (
                  <span key={`ellipsis-${idx}`} className="px-1.5 text-xs text-slate-400 select-none">
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => changePage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition cursor-pointer tabular-nums ${
                      currentPage === page
                        ? 'bg-[#0F766E] text-white'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                    }`}
                  >
                    {page}
                  </button>
                )
              );
            })()}
            <button
              onClick={() => changePage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 transition cursor-pointer"
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
