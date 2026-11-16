import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, CheckCircle2, AlertCircle, Plus, X } from 'lucide-react';
import { AILearningEntry, AppUser } from '../types';
import { EMPLOYEES } from '../data/employees';
import { formatTimeSaved } from '../utils/timeFormat';

interface SubmissionFormProps {
  onSubmit: (entry: Omit<AILearningEntry, 'id'> & { id?: string }) => void;
  onCancel?: () => void;
  editEntry?: AILearningEntry | null;
  currentUser?: AppUser | null;
  divisionOptions?: string[];
  aiOptions?: string[];
}

const DIVISION_OPTIONS = [
  'IT SOLUTION',
  'ISS',
  'MARKETING',
  'FINANCE',
  'HCM',
  'PRODUCT & UI/UX',
  'DATA & ANALYTICS'
];

const AI_OPTIONS = [
  'Gemini',
  'ChatGPT',
  'Claude',
  'v0 by Vercel',
  'Cursor',
  'GitHub Copilot',
  'Canva AI',
  'Midjourney',
  'DeepSeek',
  'Perplexity',
  'Lainnya'
];

const FREQUENCY_OPTIONS = [
  'Belum rutin',
  'Harian',
  'Beberapa kali seminggu',
  'Mingguan',
  'Bulanan'
];

const parsePoinPenting = (str: string): string[] => {
  if (!str) return [''];
  const lines = str.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  if (lines.length === 0) return [''];

  return lines.map(line =>
    line.replace(/^(?:\d+\.\s*|[-\*\u2022]\s*)/, '').trim()
  );
};

const serializePoinPenting = (points: string[]): string => {
  return points
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .map((p, idx) => `${idx + 1}. ${p}`)
    .join('\n');
};

export default function SubmissionForm({
  onSubmit,
  onCancel,
  editEntry,
  currentUser,
  divisionOptions = DIVISION_OPTIONS,
  aiOptions = AI_OPTIONS
}: SubmissionFormProps) {
  const [formData, setFormData] = useState<{
    tanggalIsi: string;
    nama: string;
    divisi: string;
    posisiJabatan: string;
    aiYangDipakai: string;
    namaFiturTopik: string;
    deskripsiSingkat: string;
    poinPenting: string;
    sudahDicoba: boolean;
    frekuensiPenggunaan: string;
    estimasiWaktuDihemat: number | '';
    catatanTambahan: string;
  }>(() => {
    const isAdminUser = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';
    return {
      tanggalIsi: new Date().toISOString().split('T')[0],
      nama: isAdminUser ? '' : (currentUser?.name || ''),
      divisi: isAdminUser ? (divisionOptions[0] || 'IT SOLUTION') : (currentUser?.division || (divisionOptions[0] || 'IT SOLUTION')),
      posisiJabatan: isAdminUser ? '' : (currentUser?.position || ''),
      aiYangDipakai: aiOptions[0] || 'Gemini',
      namaFiturTopik: '',
      deskripsiSingkat: '',
      poinPenting: '',
      sudahDicoba: true,
      frekuensiPenggunaan: 'Belum rutin',
      estimasiWaktuDihemat: 1,
      catatanTambahan: ''
    };
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedAI, setSelectedAI] = useState(aiOptions[0] || 'Gemini');
  const [customAI, setCustomAI] = useState('');

  const [points, setPoints] = useState<string[]>(['']);
  const inputRefs = React.useRef<(HTMLTextAreaElement | null)[]>([]);

  const adjustHeight = (el: HTMLTextAreaElement | null) => {
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  };

  useEffect(() => {
    inputRefs.current.forEach(adjustHeight);
  }, [points]);

  useEffect(() => {
    const serialized = serializePoinPenting(points);
    setFormData(prev => ({ ...prev, poinPenting: serialized }));
    if (serialized.trim()) {
      setErrors(prev => ({ ...prev, poinPenting: '' }));
    }
  }, [points]);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      aiYangDipakai: selectedAI === 'Lainnya' ? customAI : selectedAI
    }));
  }, [selectedAI, customAI]);

  useEffect(() => {
    if (editEntry) {
      setFormData({
        tanggalIsi: editEntry.tanggalIsi,
        nama: editEntry.nama,
        divisi: editEntry.divisi,
        posisiJabatan: editEntry.posisiJabatan,
        aiYangDipakai: editEntry.aiYangDipakai,
        namaFiturTopik: editEntry.namaFiturTopik,
        deskripsiSingkat: editEntry.deskripsiSingkat,
        poinPenting: editEntry.poinPenting,
        sudahDicoba: editEntry.sudahDicoba,
        frekuensiPenggunaan: editEntry.frekuensiPenggunaan,
        estimasiWaktuDihemat: editEntry.estimasiWaktuDihemat,
        catatanTambahan: editEntry.catatanTambahan || ''
      });

      const parsed = parsePoinPenting(editEntry.poinPenting);
      setPoints(parsed);

      const isKnownAI = aiOptions.slice(0, -1).includes(editEntry.aiYangDipakai);
      if (isKnownAI) {
        setSelectedAI(editEntry.aiYangDipakai);
        setCustomAI('');
      } else {
        setSelectedAI('Lainnya');
        setCustomAI(editEntry.aiYangDipakai);
      }
    } else {
      setPoints(['']);
      if (currentUser) {
        const isAdminUser = currentUser.role === 'admin' || currentUser.role === 'superadmin';
        setFormData(prev => ({
          ...prev,
          nama: isAdminUser ? '' : (currentUser.name || ''),
          divisi: isAdminUser ? (divisionOptions[0] || 'IT SOLUTION') : (currentUser.division || 'IT SOLUTION'),
          posisiJabatan: isAdminUser ? '' : (currentUser.position || '')
        }));
      }
    }
  }, [editEntry, currentUser]);

  const handlePointChange = (index: number, val: string) => {
    const newPoints = [...points];
    newPoints[index] = val;
    setPoints(newPoints);
  };

  const handlePointKeyDown = (index: number, e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const newPoints = [...points];
      newPoints.splice(index + 1, 0, '');
      setPoints(newPoints);

      setTimeout(() => {
        const nextRef = inputRefs.current[index + 1];
        if (nextRef) nextRef.focus();
      }, 0);
    } else if (e.key === 'Backspace' && points[index] === '' && points.length > 1) {
      e.preventDefault();
      const newPoints = points.filter((_, idx) => idx !== index);
      setPoints(newPoints);

      setTimeout(() => {
        const prevIdx = index > 0 ? index - 1 : 0;
        const prevRef = inputRefs.current[prevIdx];
        if (prevRef) {
          prevRef.focus();
          const len = prevRef.value.length;
          prevRef.setSelectionRange(len, len);
        }
      }, 0);
    }
  };

  const handleAddPoint = () => {
    setPoints([...points, '']);
    setTimeout(() => {
      const nextRef = inputRefs.current[points.length];
      if (nextRef) nextRef.focus();
    }, 0);
  };

  const handleRemovePoint = (index: number) => {
    if (points.length <= 1) return;
    const newPoints = points.filter((_, idx) => idx !== index);
    setPoints(newPoints);

    setTimeout(() => {
      const prevIdx = index > 0 ? index - 1 : 0;
      const prevRef = inputRefs.current[prevIdx];
      if (prevRef) prevRef.focus();
    }, 0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let finalValue: any = value;

    if (name === 'estimasiWaktuDihemat') {
      const parsed = parseFloat(value);
      finalValue = isNaN(parsed) ? '' : parsed;
    }

    setFormData(prev => {
      const nextData = { ...prev, [name]: finalValue };

      if (name === 'estimasiWaktuDihemat') {
        if (finalValue === '') {
          setErrors(prevErr => ({ ...prevErr, estimasiWaktuDihemat: 'Estimasi waktu dihemat tidak boleh kosong' }));
        } else if (finalValue < 0) {
          setErrors(prevErr => ({ ...prevErr, estimasiWaktuDihemat: 'Estimasi waktu dihemat tidak boleh negatif' }));
        } else if (prev.sudahDicoba && finalValue === 0) {
          setErrors(prevErr => ({ ...prevErr, estimasiWaktuDihemat: 'Waktu dihemat wajib lebih dari 0 jam untuk status Praktik' }));
        } else {
          setErrors(prevErr => ({ ...prevErr, estimasiWaktuDihemat: '' }));
        }
      } else {
        if (typeof finalValue === 'string' && !finalValue.trim()) {
          if (name === 'nama') setErrors(prevErr => ({ ...prevErr, nama: 'Nama wajib diisi' }));
          else if (name === 'posisiJabatan') setErrors(prevErr => ({ ...prevErr, posisiJabatan: 'Posisi / Jabatan wajib diisi' }));
          else if (name === 'namaFiturTopik') setErrors(prevErr => ({ ...prevErr, namaFiturTopik: 'Nama Fitur / Topik wajib diisi' }));
          else if (name === 'deskripsiSingkat') setErrors(prevErr => ({ ...prevErr, deskripsiSingkat: 'Deskripsi singkat wajib diisi' }));
          else if (name === 'poinPenting') setErrors(prevErr => ({ ...prevErr, poinPenting: 'Poin penting wajib diisi' }));
        } else if (errors[name]) {
          setErrors(prevErr => ({ ...prevErr, [name]: '' }));
        }
      }

      return nextData;
    });
  };

  const handleTimeStep = (amount: number) => {
    setFormData(prev => {
      const current = typeof prev.estimasiWaktuDihemat === 'number' ? prev.estimasiWaktuDihemat : 0;
      const nextVal = Math.max(0, parseFloat((current + amount).toFixed(2)));

      if (nextVal === 0) {
        setErrors(prevErr => ({ ...prevErr, estimasiWaktuDihemat: 'Waktu dihemat wajib lebih dari 0 jam untuk status Praktik' }));
      } else {
        setErrors(prevErr => ({ ...prevErr, estimasiWaktuDihemat: '' }));
      }

      return { ...prev, estimasiWaktuDihemat: nextVal };
    });
  };

  const handleToggleTry = (val: boolean) => {
    setFormData(prev => {
      const nextTime = val ? (prev.estimasiWaktuDihemat === 0 || (prev.estimasiWaktuDihemat as any) === '' ? 1 : prev.estimasiWaktuDihemat) : 0;

      if (!val) {
        setErrors(prevErr => ({ ...prevErr, estimasiWaktuDihemat: '' }));
      } else {
        if ((nextTime as any) === '') {
          setErrors(prevErr => ({ ...prevErr, estimasiWaktuDihemat: 'Estimasi waktu dihemat tidak boleh kosong' }));
        } else if (typeof nextTime === 'number' && nextTime < 0) {
          setErrors(prevErr => ({ ...prevErr, estimasiWaktuDihemat: 'Estimasi waktu dihemat tidak boleh negatif' }));
        } else if (nextTime === 0) {
          setErrors(prevErr => ({ ...prevErr, estimasiWaktuDihemat: 'Waktu dihemat wajib lebih dari 0 jam untuk status Praktik' }));
        } else {
          setErrors(prevErr => ({ ...prevErr, estimasiWaktuDihemat: '' }));
        }
      }

      return {
        ...prev,
        sudahDicoba: val,
        frekuensiPenggunaan: val ? prev.frekuensiPenggunaan : 'Belum rutin',
        estimasiWaktuDihemat: nextTime
      };
    });
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.nama.trim()) newErrors.nama = 'Nama wajib diisi';
    if (!formData.posisiJabatan.trim()) newErrors.posisiJabatan = 'Posisi / Jabatan wajib diisi';
    if (selectedAI === 'Lainnya' && !customAI.trim()) {
      newErrors.customAI = 'Nama AI khusus wajib diisi';
    }
    if (!formData.namaFiturTopik.trim()) newErrors.namaFiturTopik = 'Nama Fitur / Topik wajib diisi';
    if (!formData.deskripsiSingkat.trim()) newErrors.deskripsiSingkat = 'Deskripsi singkat wajib diisi';
    if (!formData.poinPenting.trim()) newErrors.poinPenting = 'Minimal satu poin penting wajib diisi';

    if (formData.sudahDicoba) {
      if (formData.estimasiWaktuDihemat === '' || formData.estimasiWaktuDihemat === undefined) {
        newErrors.estimasiWaktuDihemat = 'Estimasi waktu dihemat tidak boleh kosong';
      } else if (typeof formData.estimasiWaktuDihemat === 'number' && formData.estimasiWaktuDihemat < 0) {
        newErrors.estimasiWaktuDihemat = 'Estimasi waktu dihemat tidak boleh negatif';
      } else if (formData.estimasiWaktuDihemat === 0) {
        newErrors.estimasiWaktuDihemat = 'Waktu dihemat wajib lebih dari 0 jam untuk status Praktik';
      }
    } else if (formData.estimasiWaktuDihemat !== 0) {
      setFormData(prev => ({ ...prev, estimasiWaktuDihemat: 0 }));
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const isOwnReport =
      !!currentUser &&
      formData.nama.trim().toLowerCase() === currentUser.name.trim().toLowerCase();

    onSubmit({
      ...(editEntry ? { id: editEntry.id } : {}),
      ...formData,
      userId: editEntry?.userId ?? (isOwnReport ? currentUser?.id : undefined),
      estimasiWaktuDihemat: formData.estimasiWaktuDihemat === '' ? 0 : formData.estimasiWaktuDihemat
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      if (!editEntry) {
        setSelectedAI(aiOptions[0] || 'Gemini');
        setCustomAI('');
        setPoints(['']);
        setFormData(prev => ({
          ...prev,
          namaFiturTopik: '',
          deskripsiSingkat: '',
          poinPenting: '',
          sudahDicoba: true,
          frekuensiPenggunaan: 'Belum rutin',
          estimasiWaktuDihemat: 1,
          catatanTambahan: ''
        }));
      }
    }, 2000);
  };

  const inputBaseClass =
    'w-full text-sm px-3.5 py-2.5 bg-white dark:bg-slate-900 rounded-lg border text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition';

  return (
    <div
      className="relative bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden"
      id="submission-form"
    >
      {/* Confirmation Overlay */}
      {isSuccess && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-50 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center"
        >
          <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
            <CheckCircle2 size={28} />
          </div>
          <h4 className="text-lg font-bold text-slate-900 dark:text-white">
            Laporan Berhasil Tersimpan
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 max-w-sm leading-relaxed">
            Data pembelajaran AI Anda telah dicatat dan disinkronkan ke sistem Vascomm.
          </p>
        </motion.div>
      )}

      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          {editEntry ? 'Sunting Laporan Pembelajaran AI' : 'Form Laporan Pembelajaran AI'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Catat fitur atau metode AI yang dipelajari serta estimasi waktu kerja yang berhasil dihemat.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* Kolom Kiri: Identitas + Topik & Tool AI */}
          <div className="xl:col-span-5 space-y-6">
            {/* Identitas Pelapor */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-200 dark:border-slate-800">
                Identitas Pelapor
              </h4>

              {currentUser && currentUser.role !== 'admin' && currentUser.role !== 'superadmin' ? (
                <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-3">
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">Nama Lengkap</span>
                    <span className="font-semibold text-slate-900 dark:text-white text-sm">
                      {formData.nama || currentUser.name}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 block">Divisi</span>
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                        {formData.divisi || currentUser.division}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 block">Jabatan</span>
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                        {formData.posisiJabatan || currentUser.position}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Pilih Karyawan (Auto-fill)
                      </label>
                      <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                        {EMPLOYEES.length} terdaftar
                      </span>
                    </div>
                    <select
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'custom') {
                          setFormData(prev => ({
                            ...prev,
                            nama: '',
                            divisi: divisionOptions[0] || 'IT SOLUTION',
                            posisiJabatan: ''
                          }));
                        } else {
                          const emp = EMPLOYEES.find(x => x.nama === val);
                          if (emp) {
                            setFormData(prev => ({
                              ...prev,
                              nama: emp.nama,
                              divisi: emp.divisi,
                              posisiJabatan: emp.defaultPosisi
                            }));
                            setErrors(prev => ({ ...prev, nama: '', divisi: '', posisiJabatan: '' }));
                          }
                        }
                      }}
                      value={EMPLOYEES.some(x => x.nama === formData.nama) ? formData.nama : 'custom'}
                      className={`${inputBaseClass} border-slate-300 dark:border-slate-700 cursor-pointer`}
                    >
                      <option value="custom">-- Ketik Manual / Kustom --</option>
                      {EMPLOYEES.map(emp => (
                        <option key={emp.nama} value={emp.nama}>
                          {emp.nama} ({emp.divisi})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Nama Lengkap <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nama"
                      value={formData.nama}
                      onChange={handleChange}
                      className={`${inputBaseClass} ${
                        errors.nama ? 'border-rose-400' : 'border-slate-300 dark:border-slate-700'
                      }`}
                      placeholder="Contoh: Ahmad Fauzi"
                    />
                    {errors.nama && (
                      <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.nama}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Divisi <span className="text-rose-500">*</span>
                      </label>
                      <select
                        name="divisi"
                        value={formData.divisi}
                        onChange={handleChange}
                        className={`${inputBaseClass} border-slate-300 dark:border-slate-700 cursor-pointer`}
                      >
                        {divisionOptions.map(opt => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Jabatan <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="posisiJabatan"
                        value={formData.posisiJabatan}
                        onChange={handleChange}
                        className={`${inputBaseClass} ${
                          errors.posisiJabatan ? 'border-rose-400' : 'border-slate-300 dark:border-slate-700'
                        }`}
                        placeholder="Contoh: Backend Engineer"
                      />
                      {errors.posisiJabatan && (
                        <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
                          <AlertCircle size={12} /> {errors.posisiJabatan}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tanggal Input Laporan
                </label>
                <input
                  type="date"
                  name="tanggalIsi"
                  value={formData.tanggalIsi}
                  onChange={handleChange}
                  className={`${inputBaseClass} border-slate-300 dark:border-slate-700 tabular-nums`}
                />
              </div>
            </div>

            {/* Topik & Tool AI */}
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Topik &amp; Tool AI
              </h4>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Status Penerapan <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleToggleTry(true)}
                    className={`py-2 px-3 rounded-md text-xs font-semibold transition cursor-pointer ${
                      formData.sudahDicoba
                        ? 'bg-[#0F766E] text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Sudah Dipraktikkan
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleTry(false)}
                    className={`py-2 px-3 rounded-md text-xs font-semibold transition cursor-pointer ${
                      !formData.sudahDicoba
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Teori &amp; Eksplorasi
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    AI yang Digunakan <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="selectedAI"
                    value={selectedAI}
                    onChange={(e) => {
                      setSelectedAI(e.target.value);
                      if (errors.customAI) setErrors(prev => ({ ...prev, customAI: '' }));
                    }}
                    className={`${inputBaseClass} border-slate-300 dark:border-slate-700 cursor-pointer`}
                  >
                    {aiOptions.map(opt => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.sudahDicoba && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Frekuensi Rutin
                    </label>
                    <select
                      name="frekuensiPenggunaan"
                      value={formData.frekuensiPenggunaan}
                      onChange={handleChange}
                      className={`${inputBaseClass} border-slate-300 dark:border-slate-700 cursor-pointer`}
                    >
                      {FREQUENCY_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {selectedAI === 'Lainnya' && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Nama AI Khusus <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customAI}
                    onChange={(e) => {
                      setCustomAI(e.target.value);
                      if (errors.customAI) setErrors(prev => ({ ...prev, customAI: '' }));
                    }}
                    className={`${inputBaseClass} ${
                      errors.customAI ? 'border-rose-400' : 'border-slate-300 dark:border-slate-700'
                    }`}
                    placeholder="Contoh: Claude Sonnet, DeepSeek"
                  />
                  {errors.customAI && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.customAI}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nama Fitur / Topik yang Dipelajari <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="namaFiturTopik"
                  value={formData.namaFiturTopik}
                  onChange={handleChange}
                  className={`${inputBaseClass} ${
                    errors.namaFiturTopik ? 'border-rose-400' : 'border-slate-300 dark:border-slate-700'
                  }`}
                  placeholder="Contoh: Otomatisasi Dokumen PRD dengan Prompt Terstruktur"
                />
                {errors.namaFiturTopik && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.namaFiturTopik}
                  </p>
                )}
              </div>

              {formData.sudahDicoba ? (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Estimasi Waktu Dihemat <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => handleTimeStep(-0.25)}
                        className="w-9 h-9 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-base transition cursor-pointer select-none"
                        title="Kurangi 15 Menit"
                      >
                        -
                      </button>
                      <div className="px-4 font-semibold text-sm text-slate-900 dark:text-white min-w-[120px] text-center tabular-nums font-mono select-none">
                        {formatTimeSaved(formData.estimasiWaktuDihemat)}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleTimeStep(0.25)}
                        className="w-9 h-9 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-base transition cursor-pointer select-none"
                        title="Tambah 15 Menit"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Kelipatan 15 menit per klik
                    </span>
                  </div>
                  {errors.estimasiWaktuDihemat && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.estimasiWaktuDihemat}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  <strong>Waktu dihemat otomatis 0 jam</strong> untuk topik yang masih dalam tahap teori atau eksplorasi mandiri.
                </div>
              )}
            </div>
          </div>

          {/* Kolom Kanan: Deskripsi, Poin Penting & Catatan */}
          <div className="xl:col-span-7 space-y-5 xl:border-l xl:border-slate-200 dark:xl:border-slate-800 xl:pl-8">
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-200 dark:border-slate-800">
              Deskripsi &amp; Poin Pembelajaran
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Deskripsi Singkat Aktivitas <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="deskripsiSingkat"
                value={formData.deskripsiSingkat}
                onChange={handleChange}
                rows={4}
                className={`${inputBaseClass} ${
                  errors.deskripsiSingkat ? 'border-rose-400' : 'border-slate-300 dark:border-slate-700'
                }`}
                placeholder="Jelaskan secara ringkas pekerjaan apa yang dibantu atau dipercepat menggunakan AI ini..."
              />
              {errors.deskripsiSingkat && (
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.deskripsiSingkat}
                </p>
              )}
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Poin Penting yang Dipelajari <span className="text-rose-500">*</span>
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Tekan Enter untuk menambah poin baru, atau Backspace pada baris kosong untuk menghapus.
                </p>
              </div>

              <div className="space-y-2">
                {points.map((point, index) => (
                  <div key={index} className="flex items-start gap-2.5">
                    <span className="flex items-center justify-center w-6 h-6 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-xs font-semibold mt-2 shrink-0 tabular-nums select-none">
                      {index + 1}
                    </span>
                    <textarea
                      rows={1}
                      value={point}
                      onChange={(e) => handlePointChange(index, e.target.value)}
                      onKeyDown={(e) => handlePointKeyDown(index, e)}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                        adjustHeight(el);
                      }}
                      className={`flex-1 text-sm p-2.5 bg-white dark:bg-slate-900 rounded-lg border ${
                        errors.poinPenting ? 'border-rose-400' : 'border-slate-300 dark:border-slate-700'
                      } text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 resize-none min-h-[40px] overflow-hidden`}
                      placeholder={`Poin pembelajaran ke-${index + 1}`}
                    />
                    {points.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePoint(index)}
                        className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition mt-1 shrink-0 cursor-pointer"
                        title="Hapus poin"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddPoint}
                className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline inline-flex items-center gap-1.5 py-1 cursor-pointer"
              >
                <Plus size={13} /> Tambah poin baru
              </button>

              {errors.poinPenting && (
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.poinPenting}
                </p>
              )}
            </div>

            {!formData.sudahDicoba && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <strong className="text-slate-900 dark:text-white block mb-1">Catatan Status Eksplorasi</strong>
                Setelah fitur ini mulai rutin dipakai dalam alur kerja harian, Anda dapat memperbarui laporan atau mencatat laporan baru dengan estimasi jam dihemat.
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Catatan Tambahan (Opsional)
              </label>
              <textarea
                name="catatanTambahan"
                value={formData.catatanTambahan}
                onChange={handleChange}
                rows={3}
                className={`${inputBaseClass} border-slate-300 dark:border-slate-700`}
                placeholder="Feedback, kendala, atau rencana tindak lanjut..."
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium transition cursor-pointer"
            >
              Batal
            </button>
          )}
          <button
            type="submit"
            className="px-5 py-2 bg-[#0F766E] hover:bg-[#0D655E] text-white text-sm font-semibold rounded-lg transition inline-flex items-center gap-2 cursor-pointer"
          >
            <Send size={14} />
            {editEntry ? 'Simpan Perubahan' : 'Kirim Laporan'}
          </button>
        </div>
      </form>
    </div>
  );
}
