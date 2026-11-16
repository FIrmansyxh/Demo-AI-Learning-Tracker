import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Edit2,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';
import { AppUser } from '../types';

interface SystemSettings {
  frequency: 'bulan' | '2minggu';
  divisions: string[];
  aiTools: string[];
}

interface SettingsViewProps {
  currentUser: AppUser | null;
  onSettingsUpdated?: () => void;
}

export default function SettingsView({ currentUser, onSettingsUpdated }: SettingsViewProps) {
  const isAdmin = currentUser?.role === 'superadmin' || currentUser?.role === 'admin';
  const isSuperAdmin = currentUser?.role === 'superadmin';

  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [newDivision, setNewDivision] = useState('');
  const [newAiTool, setNewAiTool] = useState('');

  const [editingDivision, setEditingDivision] = useState<string | null>(null);
  const [editingDivisionVal, setEditingDivisionVal] = useState('');
  const [editingAiTool, setEditingAiTool] = useState<string | null>(null);
  const [editingAiToolVal, setEditingAiToolVal] = useState('');

  const [pendingFrequency, setPendingFrequency] = useState<'bulan' | '2minggu' | null>(null);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      } else {
        setErrorMsg('Gagal memuat pengaturan sistem dari server.');
      }
    } catch {
      setErrorMsg('Gagal menghubungkan ke server untuk memuat pengaturan.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (
    updatedSettings: SystemSettings,
    renameEvent?: { type: 'division' | 'ai'; oldVal: string; newVal: string }
  ) => {
    if (!isAdmin) {
      setErrorMsg('Hanya Admin atau Super Admin yang dapat mengubah pengaturan.');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMsg('');
      setSuccessMsg('');

      const bodyPayload = renameEvent ? { ...updatedSettings, renameEvent } : updatedSettings;

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });

      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        setSuccessMsg(
          renameEvent
            ? 'Nama diperbarui dan seluruh riwayat laporan terkait ikut disinkronkan.'
            : 'Pengaturan sistem berhasil disimpan.'
        );
        if (onSettingsUpdated) onSettingsUpdated();
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        const errData = await res.json();
        setErrorMsg(errData.error || 'Gagal menyimpan pengaturan.');
      }
    } catch {
      setErrorMsg('Terjadi kesalahan koneksi saat menyimpan pengaturan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateFrequency = (freq: 'bulan' | '2minggu') => {
    if (!settings) return;
    const next = { ...settings, frequency: freq };
    setSettings(next);
    handleSaveSettings(next);
  };

  const handleAddDivision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings || !newDivision.trim()) return;

    const trimmed = newDivision.trim().toUpperCase();
    if (settings.divisions.includes(trimmed)) {
      setErrorMsg('Divisi ini sudah terdaftar.');
      return;
    }

    const next = { ...settings, divisions: [...settings.divisions, trimmed] };
    setSettings(next);
    setNewDivision('');
    handleSaveSettings(next);
  };

  const handleStartEditDivision = (div: string) => {
    setEditingDivision(div);
    setEditingDivisionVal(div);
  };

  const handleSaveEditDivision = (oldDiv: string) => {
    if (!settings || !editingDivisionVal.trim()) return;
    const newVal = editingDivisionVal.trim().toUpperCase();
    if (newVal === oldDiv) {
      setEditingDivision(null);
      return;
    }
    if (settings.divisions.includes(newVal) && newVal !== oldDiv) {
      setErrorMsg('Divisi ini sudah terdaftar.');
      return;
    }

    const next = {
      ...settings,
      divisions: settings.divisions.map(d => (d === oldDiv ? newVal : d))
    };
    setSettings(next);
    setEditingDivision(null);
    handleSaveSettings(next, { type: 'division', oldVal: oldDiv, newVal });
  };

  const handleRemoveDivision = (div: string) => {
    if (!settings) return;
    if (settings.divisions.length <= 1) {
      setErrorMsg('Minimal harus menyisakan 1 divisi kerja.');
      return;
    }

    const next = { ...settings, divisions: settings.divisions.filter(d => d !== div) };
    setSettings(next);
    handleSaveSettings(next);
  };

  const handleAddAiTool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings || !newAiTool.trim()) return;

    const trimmed = newAiTool.trim();
    if (settings.aiTools.some(tool => tool.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMsg('Tool AI ini sudah terdaftar.');
      return;
    }

    const index = settings.aiTools.indexOf('Lainnya');
    let updatedTools = [];
    if (index !== -1) {
      updatedTools = [...settings.aiTools.slice(0, index), trimmed, 'Lainnya'];
    } else {
      updatedTools = [...settings.aiTools, trimmed, 'Lainnya'];
    }

    const next = { ...settings, aiTools: updatedTools };
    setSettings(next);
    setNewAiTool('');
    handleSaveSettings(next);
  };

  const handleStartEditAiTool = (tool: string) => {
    if (tool === 'Lainnya') return;
    setEditingAiTool(tool);
    setEditingAiToolVal(tool);
  };

  const handleSaveEditAiTool = (oldTool: string) => {
    if (!settings || !editingAiToolVal.trim()) return;
    const newVal = editingAiToolVal.trim();
    if (newVal === oldTool) {
      setEditingAiTool(null);
      return;
    }
    if (settings.aiTools.some(t => t.toLowerCase() === newVal.toLowerCase() && t !== oldTool)) {
      setErrorMsg('Tool AI ini sudah terdaftar.');
      return;
    }

    const next = {
      ...settings,
      aiTools: settings.aiTools.map(t => (t === oldTool ? newVal : t))
    };
    setSettings(next);
    setEditingAiTool(null);
    handleSaveSettings(next, { type: 'ai', oldVal: oldTool, newVal });
  };

  const handleRemoveAiTool = (tool: string) => {
    if (!settings) return;
    if (tool === 'Lainnya') {
      setErrorMsg('Opsi "Lainnya" tidak dapat dihapus.');
      return;
    }

    const next = { ...settings, aiTools: settings.aiTools.filter(t => t !== tool) };
    setSettings(next);
    handleSaveSettings(next);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <RefreshCw size={24} className="text-teal-700 dark:text-teal-400 animate-spin" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Memuat pengaturan sistem...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="settings-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Pengaturan Sistem
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Atur siklus pelaporan karyawan, daftar divisi kerja, serta daftar pilihan tools AI.
          </p>
        </div>

        {isSaving && (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <RefreshCw size={13} className="animate-spin" />
            <span>Menyimpan perubahan...</span>
          </div>
        )}
      </div>

      {/* Feedback Alerts */}
      <AnimatePresence mode="wait">
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium rounded-xl flex items-center gap-2.5"
          >
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </motion.div>
        )}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-medium rounded-xl flex items-center gap-2.5"
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {!isSuperAdmin && !isAdmin && (
        <div className="p-10 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] rounded-xl text-center space-y-2">
          <Shield size={28} className="text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Akses Terbatas</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Halaman ini hanya dapat diakses oleh Super Admin atau Admin.
          </p>
        </div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {pendingFrequency && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.97, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.97, y: 8 }}
              className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-xl"
            >
              <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400">
                <AlertTriangle size={20} />
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Ubah Siklus Pelaporan
                </h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Ubah jadwal siklus pelaporan karyawan menjadi{' '}
                <strong className="text-slate-900 dark:text-white">
                  {pendingFrequency === 'bulan' ? 'Bulanan' : 'Dua Mingguan'}
                </strong>
                ? Penghitungan kepatuhan aktif akan langsung menyesuaikan.
              </p>
              <div className="flex gap-2.5 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setPendingFrequency(null)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateFrequency(pendingFrequency);
                    setPendingFrequency(null);
                  }}
                  className="px-4 py-2 bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-semibold rounded-lg transition cursor-pointer"
                >
                  Ya, Ubah Siklus
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {(isSuperAdmin || isAdmin) && settings && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Reporting Cycle */}
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Siklus Pelaporan
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Menentukan periode evaluasi kepatuhan pengisian laporan karyawan aktif.
                </p>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  disabled={!isSuperAdmin && !isAdmin}
                  onClick={() => {
                    if (settings.frequency !== 'bulan') setPendingFrequency('bulan');
                  }}
                  className={`w-full p-4 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                    settings.frequency === 'bulan'
                      ? 'bg-teal-50/60 dark:bg-teal-950/20 border-teal-600 dark:border-teal-500'
                      : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                      settings.frequency === 'bulan'
                        ? 'border-teal-700 bg-teal-700 dark:border-teal-400 dark:bg-teal-400'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {settings.frequency === 'bulan' && (
                      <div className="w-1.5 h-1.5 bg-white dark:bg-slate-950 rounded-full" />
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white block">
                      Bulanan
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                      Dihitung dari tanggal 1 sampai akhir bulan berjalan.
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={!isSuperAdmin && !isAdmin}
                  onClick={() => {
                    if (settings.frequency !== '2minggu') setPendingFrequency('2minggu');
                  }}
                  className={`w-full p-4 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                    settings.frequency === '2minggu'
                      ? 'bg-teal-50/60 dark:bg-teal-950/20 border-teal-600 dark:border-teal-500'
                      : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                      settings.frequency === '2minggu'
                        ? 'border-teal-700 bg-teal-700 dark:border-teal-400 dark:bg-teal-400'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {settings.frequency === '2minggu' && (
                      <div className="w-1.5 h-1.5 bg-white dark:bg-slate-950 rounded-full" />
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white block">
                      Dua Mingguan
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                      Dibagi dua periode: tanggal 1–14 dan 15–akhir bulan.
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Divisions & AI Tools */}
          <div className="lg:col-span-8 space-y-6">
            {/* Divisions */}
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Daftar Divisi Kerja
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Mengubah nama divisi otomatis memperbarui data karyawan dan riwayat laporan terkait.
                </p>
              </div>

              <form onSubmit={handleAddDivision} className="flex gap-2">
                <input
                  type="text"
                  value={newDivision}
                  onChange={(e) => setNewDivision(e.target.value)}
                  placeholder="Tambah divisi baru (misal: CREATIVE)"
                  className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-teal-600"
                  disabled={!isSuperAdmin && !isAdmin}
                />
                <button
                  type="submit"
                  disabled={(!isSuperAdmin && !isAdmin) || !newDivision.trim()}
                  className="px-4 py-2 bg-[#0F766E] hover:bg-[#0D655E] text-white rounded-lg text-xs font-semibold transition cursor-pointer inline-flex items-center gap-1.5 shrink-0 disabled:opacity-40"
                >
                  <Plus size={14} /> Tambah
                </button>
              </form>

              <div className="flex flex-wrap gap-2 pt-1">
                {settings.divisions.map(div => {
                  const isEditing = editingDivision === div;
                  return (
                    <div key={div}>
                      {isEditing ? (
                        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-teal-600 px-2.5 py-1.5 rounded-lg">
                          <input
                            type="text"
                            value={editingDivisionVal}
                            onChange={(e) => setEditingDivisionVal(e.target.value)}
                            className="bg-transparent border-none text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden w-28 uppercase"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEditDivision(div);
                              if (e.key === 'Escape') setEditingDivision(null);
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEditDivision(div)}
                            className="text-emerald-600 hover:text-emerald-700 cursor-pointer p-0.5"
                            title="Simpan"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingDivision(null)}
                            className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                            title="Batal"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200 group">
                          <span>{div}</span>
                          {(isSuperAdmin || isAdmin) && (
                            <div className="flex items-center gap-1 text-slate-400">
                              <button
                                type="button"
                                onClick={() => handleStartEditDivision(div)}
                                className="hover:text-teal-700 dark:hover:text-teal-400 transition cursor-pointer p-0.5"
                                title={`Edit ${div}`}
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveDivision(div)}
                                className="hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer p-0.5"
                                title={`Hapus ${div}`}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Tools */}
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Daftar Tools AI
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Pilihan tool AI yang muncul pada formulir pelaporan karyawan.
                </p>
              </div>

              <form onSubmit={handleAddAiTool} className="flex gap-2">
                <input
                  type="text"
                  value={newAiTool}
                  onChange={(e) => setNewAiTool(e.target.value)}
                  placeholder="Tambah tool AI baru (misal: NotebookLM)"
                  className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-teal-600"
                  disabled={!isSuperAdmin && !isAdmin}
                />
                <button
                  type="submit"
                  disabled={(!isSuperAdmin && !isAdmin) || !newAiTool.trim()}
                  className="px-4 py-2 bg-[#0F766E] hover:bg-[#0D655E] text-white rounded-lg text-xs font-semibold transition cursor-pointer inline-flex items-center gap-1.5 shrink-0 disabled:opacity-40"
                >
                  <Plus size={14} /> Tambah
                </button>
              </form>

              <div className="flex flex-wrap gap-2 pt-1">
                {settings.aiTools.map(tool => {
                  const isEditing = editingAiTool === tool;
                  return (
                    <div key={tool}>
                      {isEditing ? (
                        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-teal-600 px-2.5 py-1.5 rounded-lg">
                          <input
                            type="text"
                            value={editingAiToolVal}
                            onChange={(e) => setEditingAiToolVal(e.target.value)}
                            className="bg-transparent border-none text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden w-28"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEditAiTool(tool);
                              if (e.key === 'Escape') setEditingAiTool(null);
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEditAiTool(tool)}
                            className="text-emerald-600 hover:text-emerald-700 cursor-pointer p-0.5"
                            title="Simpan"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingAiTool(null)}
                            className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                            title="Batal"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200 group">
                          <span>{tool}</span>
                          {tool !== 'Lainnya' && (isSuperAdmin || isAdmin) && (
                            <div className="flex items-center gap-1 text-slate-400">
                              <button
                                type="button"
                                onClick={() => handleStartEditAiTool(tool)}
                                className="hover:text-teal-700 dark:hover:text-teal-400 transition cursor-pointer p-0.5"
                                title={`Edit ${tool}`}
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveAiTool(tool)}
                                className="hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer p-0.5"
                                title={`Hapus ${tool}`}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
