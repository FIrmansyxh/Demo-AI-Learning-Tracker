/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  ListCollapse,
  PlusCircle,
  BookOpen,
  Users,
  Calendar,
  Settings,
  Database,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Download,
  Plus
} from 'lucide-react';

import { AILearningEntry, AppUser } from './types';

// Component Imports
import StatsGrid from './components/StatsGrid';
import ChartsView from './components/ChartsView';
import SubmissionForm from './components/SubmissionForm';
import DataTable from './components/DataTable';
import DetailModal from './components/DetailModal';
import ArticlesView from './components/ArticlesView';
import LoginView from './components/LoginView';
import UserManagementView from './components/UserManagementView';
import SubmissionTrackingWidget from './components/SubmissionTrackingWidget';
import SettingsView from './components/SettingsView';

type ActiveTab = 'dashboard' | 'laporan' | 'tabel' | 'artikel' | 'users' | 'kepatuhan' | 'pengaturan';

export default function App() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('degree_theme');
    return saved === 'dark';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('degree_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const stored = localStorage.getItem('degree_tracker_current_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [entries, setEntries] = useState<AILearningEntry[]>([]);
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const getUniqueMonths = (entriesList: AILearningEntry[]) => {
    const monthsMap = new Map<string, string>();
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    entriesList.forEach((e) => {
      if (e.tanggalIsi) {
        const parts = e.tanggalIsi.split('-');
        if (parts.length >= 2) {
          const year = parts[0];
          const month = parts[1];
          const key = `${year}-${month}`;
          const monthIndex = parseInt(month, 10) - 1;
          if (monthNames[monthIndex]) {
            monthsMap.set(key, `${monthNames[monthIndex]} ${year}`);
          }
        }
      }
    });

    return Array.from(monthsMap.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  };

  const filteredEntriesForStats = useMemo(() => {
    if (timeFilter === 'all') {
      return entries;
    }
    if (timeFilter === '6months') {
      if (entries.length === 0) return [];

      let latestDate = new Date(0);
      entries.forEach((e) => {
        const d = new Date(e.tanggalIsi);
        if (d > latestDate) {
          latestDate = d;
        }
      });

      if (latestDate.getTime() === 0) {
        latestDate = new Date();
      }

      const sixMonthsAgo = new Date(latestDate);
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      return entries.filter((e) => {
        const d = new Date(e.tanggalIsi);
        return d >= sixMonthsAgo;
      });
    }

    return entries.filter((e) => e.tanggalIsi && e.tanggalIsi.startsWith(timeFilter));
  }, [entries, timeFilter]);

  const [portalMode, setPortalMode] = useState<'karyawan' | 'analis'>(() => {
    const stored = localStorage.getItem('degree_tracker_current_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.role === 'admin' || parsed.role === 'superadmin' ? 'analis' : 'karyawan';
      } catch {
        return 'karyawan';
      }
    }
    return 'karyawan';
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    const stored = localStorage.getItem('degree_tracker_current_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.role === 'admin' || parsed.role === 'superadmin' ? 'dashboard' : 'laporan';
      } catch {
        return 'laporan';
      }
    }
    return 'laporan';
  });

  const [selectedEntry, setSelectedEntry] = useState<AILearningEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState<AILearningEntry | null>(null);

  const [users, setUsers] = useState<AppUser[]>([]);
  const [reportingFrequency, setReportingFrequency] = useState<'bulan' | '2minggu'>('bulan');
  const [divisionOptions, setDivisionOptions] = useState<string[]>([]);
  const [aiOptions, setAiOptions] = useState<string[]>([]);

  const fetchSettings = () => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.frequency) {
          setReportingFrequency(data.frequency);
          setDivisionOptions(data.divisions || []);
          setAiOptions(data.aiTools || []);
        }
      })
      .catch((err) => {
        console.error('Failed to load system settings from server', err);
      });
  };

  const fetchUsersList = () => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch users list', err);
      });
  };

  const fetchEntriesList = () => {
    fetch('/api/entries')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setEntries(data);
        }
      })
      .catch((err) => {
        console.error('Failed to load entries from server db, falling back to localStorage.', err);
        const stored = localStorage.getItem('degree_ai_tracker_data');
        if (stored) {
          try {
            setEntries(JSON.parse(stored));
          } catch {
            setEntries([]);
          }
        } else {
          setEntries([]);
        }
      });
  };

  const handleSystemSettingsUpdated = () => {
    fetchSettings();
    fetchUsersList();
    fetchEntriesList();
  };

  useEffect(() => {
    fetchEntriesList();
    fetchUsersList();
    fetchSettings();
  }, []);

  useEffect(() => {
    fetchUsersList();
  }, [activeTab]);

  // Enforce role-based access controls
  useEffect(() => {
    if (currentUser) {
      const isAdminUser = currentUser.role === 'admin' || currentUser.role === 'superadmin';
      if (!isAdminUser) {
        if (portalMode !== 'karyawan') {
          setPortalMode('karyawan');
        }
        if (activeTab === 'users' || activeTab === 'dashboard' || activeTab === 'kepatuhan' || activeTab === 'pengaturan') {
          setActiveTab('laporan');
        }
      } else {
        if (portalMode === 'analis') {
          if (activeTab === 'laporan') {
            setActiveTab('dashboard');
          }
        } else if (portalMode === 'karyawan') {
          if (activeTab === 'users' || activeTab === 'dashboard' || activeTab === 'kepatuhan' || activeTab === 'pengaturan') {
            setActiveTab('laporan');
          }
        }
      }
    }
  }, [currentUser, portalMode, activeTab]);

  const saveEntries = async (updatedEntries: AILearningEntry[], changedEntry?: AILearningEntry, deleteId?: string) => {
    const sanitized = updatedEntries.map((entry) => ({
      ...entry,
      estimasiWaktuDihemat: isNaN(Number(entry.estimasiWaktuDihemat))
        ? 0
        : parseFloat(Number(entry.estimasiWaktuDihemat || 0).toFixed(2))
    }));

    setEntries(sanitized);
    localStorage.setItem('degree_ai_tracker_data', JSON.stringify(sanitized));

    try {
      if (deleteId) {
        const res = await fetch(`/api/entries/${deleteId}`, {
          method: 'DELETE',
          headers: {
            'x-user-id': currentUser?.id || ''
          }
        });
        if (!res.ok) {
          fetchEntriesList();
        }
      } else if (changedEntry) {
        await fetch('/api/entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(changedEntry)
        });
      }
    } catch (err) {
      console.error('Failed to sync entry with server database:', err);
    }
  };

  const handleSubmitEntry = (entryData: Omit<AILearningEntry, 'id'> & { id?: string }) => {
    let finalEntry: AILearningEntry;
    if (entryData.id) {
      finalEntry = entryData as AILearningEntry;
      const updated = entries.map((item) => (item.id === entryData.id ? finalEntry : item));
      saveEntries(updated, finalEntry);
      setEditingEntry(null);
    } else {
      finalEntry = {
        ...entryData,
        id: `tr-${Math.random().toString(36).substr(2, 9)}`
      } as AILearningEntry;
      saveEntries([finalEntry, ...entries], finalEntry);
    }

    setTimeout(() => {
      const isAdminUser = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';
      if (isAdminUser) {
        setPortalMode('analis');
        setActiveTab('tabel');
      } else {
        setPortalMode('karyawan');
        setActiveTab('laporan');
      }
    }, 2000);
  };

  const handleDeleteEntry = (id: string) => {
    const targetEntry = entries.find((item) => item.id === id);
    if (!targetEntry || !currentUser) return;

    const canManageAll =
      (currentUser.role === 'admin' || currentUser.role === 'superadmin') &&
      portalMode === 'analis';
    const isOwner =
      (targetEntry.userId && targetEntry.userId === currentUser.id) ||
      (targetEntry.nama &&
        targetEntry.nama.trim().toLowerCase() === currentUser.name.trim().toLowerCase());

    if (!canManageAll && !isOwner) {
      return;
    }

    const filtered = entries.filter((item) => item.id !== id);
    saveEntries(filtered, undefined, id);
  };

  const handleExportCSV = () => {
    const headers = [
      'No.',
      'Tanggal Isi',
      'Nama',
      'Divisi',
      'Posisi / Jabatan',
      'AI yang Dipakai',
      'Nama Fitur / Topik yang Dipelajari',
      'Deskripsi Singkat',
      'Poin Penting yang Dipelajari',
      'Sudah Dicoba / Dipraktikkan?',
      'Frekuensi Penggunaan (Jika sudah rutin)',
      'Estimasi Waktu yang Dihemat (dalam jam)',
      'Catatan Tambahan (opsional)'
    ];

    const rows = entries.map((e, index) => [
      index + 1,
      e.tanggalIsi,
      e.nama,
      e.divisi,
      e.posisiJabatan,
      e.aiYangDipakai,
      e.namaFiturTopik,
      e.deskripsiSingkat.replace(/\n/g, ' '),
      e.poinPenting.replace(/\n/g, ' '),
      e.sudahDicoba ? 'Ya' : 'Belum',
      e.frekuensiPenggunaan,
      e.estimasiWaktuDihemat,
      (e.catatanTambahan || '').replace(/\n/g, ' ')
    ]);

    const csvContent =
      '\uFEFF' +
      [
        headers.join(','),
        ...rows.map((row) =>
          row
            .map((val) => {
              const str = String(val);
              if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
              }
              return str;
            })
            .join(',')
        )
      ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Degree_AI_Learning_Tracker_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLoginSuccess = (user: AppUser) => {
    setCurrentUser(user);
    if (user.role === 'admin' || user.role === 'superadmin') {
      setPortalMode('analis');
      setActiveTab('dashboard');
    } else {
      setPortalMode('karyawan');
      setActiveTab('laporan');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('degree_tracker_current_user');
    setCurrentUser(null);
    setMobileMenuOpen(false);
  };

  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'superadmin';
  const roleLabel =
    currentUser.role === 'superadmin'
      ? 'Super Admin'
      : currentUser.role === 'admin'
      ? 'Admin'
      : 'Karyawan';

  const userInitials = currentUser.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'DG';

  const navigateTo = (tab: ActiveTab) => {
    setActiveTab(tab);
    setEditingEntry(null);
    setMobileMenuOpen(false);
  };

  const pageMeta: Record<ActiveTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Dashboard Analisis',
      subtitle: 'Ringkasan efisiensi waktu, adopsi alat AI, dan tren pembelajaran divisi'
    },
    kepatuhan: {
      title: 'Kepatuhan Laporan',
      subtitle: 'Pantau partisipasi pengisian laporan berkala karyawan aktif'
    },
    tabel: {
      title: 'Daftar Laporan',
      subtitle: 'Rekapitulasi riwayat pembelajaran AI yang tercatat dalam sistem'
    },
    laporan: {
      title: editingEntry ? 'Sunting Laporan' : 'Input Laporan Baru',
      subtitle: 'Catat fitur AI yang dipelajari dan estimasi efisiensi kerjanya'
    },
    artikel: {
      title: 'Artikel & Panduan AI',
      subtitle: 'Basis pengetahuan, catatan praktik terbaik, dan referensi tim'
    },
    users: {
      title: 'Manajemen Karyawan',
      subtitle: 'Kelola akun karyawan, divisi, status aktif, dan permintaan sandi'
    },
    pengaturan: {
      title: 'Pengaturan Sistem',
      subtitle: 'Konfigurasi siklus pelaporan, daftar divisi, dan katalog alat AI'
    }
  };

  const currentMeta = pageMeta[activeTab];

  const navItems: Array<{
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    count?: number;
  }> =
    portalMode === 'karyawan'
      ? [
          {
            id: 'laporan',
            label: editingEntry ? 'Sunting Laporan' : 'Input Laporan',
            icon: <PlusCircle size={18} />
          },
          {
            id: 'tabel',
            label: 'Daftar Laporan',
            icon: <ListCollapse size={18} />,
            count: entries.length
          },
          {
            id: 'artikel',
            label: 'Artikel & Panduan',
            icon: <BookOpen size={18} />
          }
        ]
      : [
          {
            id: 'dashboard',
            label: 'Dashboard Analisis',
            icon: <LayoutDashboard size={18} />
          },
          {
            id: 'kepatuhan',
            label: 'Kepatuhan Laporan',
            icon: <Calendar size={18} />
          },
          {
            id: 'tabel',
            label: 'Daftar Laporan',
            icon: <ListCollapse size={18} />,
            count: entries.length
          },
          {
            id: 'artikel',
            label: 'Artikel & Panduan',
            icon: <BookOpen size={18} />
          },
          {
            id: 'users',
            label: 'Manajemen Karyawan',
            icon: <Users size={18} />
          },
          {
            id: 'pengaturan',
            label: 'Pengaturan Sistem',
            icon: <Settings size={18} />
          }
        ];

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#0F766E] text-white flex items-center justify-center shrink-0">
            <Database size={18} />
          </div>
          <div className="min-w-0">
            <div className="font-display font-bold text-sm text-slate-900 dark:text-white tracking-tight truncate">
              Degree
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
              AI Learning Tracker
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          aria-label="Tutup menu"
        >
          <X size={18} />
        </button>
      </div>

      {/* Portal Switcher for Admins */}
      {isAdmin && (
        <div className="px-3.5 pt-4 pb-1 shrink-0">
          <div
            id="portal-switcher-toggle"
            className="p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl grid grid-cols-2 gap-1"
          >
            <button
              type="button"
              id="portal-switch-karyawan-btn"
              onClick={() => {
                if (portalMode !== 'karyawan') {
                  setPortalMode('karyawan');
                  setActiveTab('laporan');
                  setMobileMenuOpen(false);
                }
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                portalMode === 'karyawan'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Karyawan
            </button>
            <button
              type="button"
              id="portal-switch-admin-btn"
              onClick={() => {
                if (portalMode !== 'analis') {
                  setPortalMode('analis');
                  setActiveTab('dashboard');
                  setMobileMenuOpen(false);
                }
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                portalMode === 'analis'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Admin
            </button>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-1.5 text-xs font-medium text-slate-400 dark:text-slate-500">
          {portalMode === 'karyawan' ? 'Workspace Karyawan' : 'Manajemen & Analisis'}
        </div>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigateTo(item.id)}
              className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
              }`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <span className={isActive ? 'text-teal-700 dark:text-teal-400 shrink-0' : 'text-slate-400 dark:text-slate-500 shrink-0'}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </span>
              {typeof item.count === 'number' && (
                <span
                  className={`text-xs tabular-nums shrink-0 ${
                    isActive
                      ? 'text-teal-700 dark:text-teal-300 font-semibold'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer: Theme & User */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 space-y-2 shrink-0">
        <button
          type="button"
          onClick={() => setIsDark((prev) => !prev)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
        >
          <span>Mode Tampilan</span>
          <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-medium">
            {isDark ? <Moon size={14} className="text-teal-400" /> : <Sun size={14} className="text-amber-500" />}
            {isDark ? 'Gelap' : 'Terang'}
          </span>
        </button>

        <div className="flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#0F766E] text-white text-xs font-semibold flex items-center justify-center shrink-0">
              {userInitials}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {currentUser.name}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {roleLabel}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Keluar dari akun"
            aria-label="Keluar dari akun"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div
      id="app-root"
      className="min-h-screen flex bg-[#F8FAFC] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 font-sans"
    >
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-slate-800 sticky top-0 h-screen">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Drawer Backdrop & Panel */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-slate-800 h-full z-10 shadow-xl">
            {renderSidebarContent()}
          </aside>
        </div>
      )}

      {/* Right Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Context Top Bar */}
        <header className="h-16 bg-white/85 dark:bg-[#111827]/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-1 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="Buka menu navigasi"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <h1 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight truncate">
                {currentMeta.title}
              </h1>
              <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 truncate">
                {currentMeta.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {activeTab === 'dashboard' && (
              <>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5">
                  <span className="hidden sm:inline text-xs font-medium text-slate-500 dark:text-slate-400">
                    Periode:
                  </span>
                  <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    aria-label="Filter periode"
                    className="bg-transparent border-0 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:ring-0 focus:outline-hidden cursor-pointer pr-1"
                  >
                    <option value="all" className="bg-white dark:bg-slate-900">
                      Semua Periode
                    </option>
                    <option value="6months" className="bg-white dark:bg-slate-900">
                      6 Bulan Terakhir
                    </option>
                    {getUniqueMonths(entries).map(([key, label]) => (
                      <option key={key} value={key} className="bg-white dark:bg-slate-900">
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPortalMode('karyawan');
                    setActiveTab('laporan');
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Plus size={15} />
                  <span className="hidden sm:inline">Tambah Laporan</span>
                </button>
              </>
            )}

            {(activeTab === 'tabel' || activeTab === 'kepatuhan') && (
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                <Download size={15} />
                <span>Unduh CSV</span>
              </button>
            )}
          </div>
        </header>

        {/* Main Content Stage */}
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 overflow-x-hidden">
          {activeTab === 'dashboard' && (
            <div className="space-y-6" id="dashboard-tab">
              <StatsGrid entries={filteredEntriesForStats} />
              <ChartsView entries={entries} isDark={isDark} />
            </div>
          )}

          {activeTab === 'tabel' && (
            <div className="space-y-4" id="table-tab">
              <DataTable
                entries={entries}
                onView={(entry) => setSelectedEntry(entry)}
                onDelete={handleDeleteEntry}
                isAdmin={isAdmin && portalMode === 'analis'}
                currentUser={currentUser}
              />
            </div>
          )}

          {activeTab === 'kepatuhan' && (
            <div className="space-y-6" id="compliance-tab">
              <SubmissionTrackingWidget
                entries={entries}
                users={users}
                frequency={reportingFrequency}
              />

              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <h2 className="font-display text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    Rekapitulasi Laporan Karyawan
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Daftar laporan pembelajaran AI yang tercatat dalam sistem
                  </p>
                </div>

                <DataTable
                  entries={entries}
                  onView={(entry) => setSelectedEntry(entry)}
                  onDelete={handleDeleteEntry}
                  isAdmin={isAdmin && portalMode === 'analis'}
                  currentUser={currentUser}
                />
              </div>
            </div>
          )}

          {activeTab === 'laporan' && (
            <div className="w-full" id="form-tab">
              <SubmissionForm
                onSubmit={handleSubmitEntry}
                onCancel={
                  editingEntry
                    ? () => {
                        setEditingEntry(null);
                        setActiveTab('tabel');
                      }
                    : undefined
                }
                editEntry={editingEntry}
                currentUser={currentUser}
                divisionOptions={divisionOptions.length > 0 ? divisionOptions : undefined}
                aiOptions={aiOptions.length > 0 ? aiOptions : undefined}
              />
            </div>
          )}

          {activeTab === 'artikel' && (
            <div className="space-y-6" id="articles-tab">
              <ArticlesView currentUser={currentUser} />
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6" id="users-tab">
              <UserManagementView currentUser={currentUser} />
            </div>
          )}

          {activeTab === 'pengaturan' && (
            <div className="space-y-6" id="settings-tab">
              <SettingsView
                currentUser={currentUser}
                onSettingsUpdated={handleSystemSettingsUpdated}
              />
            </div>
          )}
        </main>

        {/* Detail Modal */}
        <DetailModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />

        {/* Minimal Footer */}
        <footer className="border-t border-slate-200/80 dark:border-slate-800 py-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>Degree AI Learning Tracker</span>
            <span>Portal Pembelajaran &amp; Produktivitas Internal</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
