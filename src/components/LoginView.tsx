import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Lock,
  Key,
  UserCheck,
  AlertCircle,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  KeyRound,
  Copy,
  Check,
  Building2
} from 'lucide-react';
import { AppUser } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: AppUser) => void;
}

const DEFAULT_DIVISIONS = [
  'IT SOLUTION',
  'ISS',
  'MARKETING',
  'FINANCE',
  'HCM',
  'PRODUCT & UI/UX',
  'DATA & ANALYTICS'
];

const DEMO_ROLES = [
  {
    id: 'demo-superadmin',
    label: 'Super Admin',
    roleDesc: 'Dashboard, Kepatuhan & Pengaturan',
    username: 'admin',
    password: 'Superadmin@11'
  },
  {
    id: 'demo-karyawan',
    label: 'Karyawan',
    roleDesc: 'Input Laporan & Artikel AI',
    username: 'ian.pramana',
    password: 'Vascomm@2026'
  }
];

const FALLBACK_DEMO_USERS: Array<AppUser & { password?: string }> = [
  {
    id: 'usr-admin',
    username: 'admin',
    name: 'Super Admin',
    role: 'superadmin',
    password: 'Superadmin@11',
    division: 'IT SOLUTION',
    position: 'Lead Admin',
    email: 'admin@vascomm.co.id',
    joinDate: '2026-01-01',
    status: 'active',
    passwordResetRequest: 'none'
  },
  {
    id: 'usr-002',
    username: 'ian.pramana',
    name: 'Ian Ahmad Pramana',
    role: 'karyawan',
    password: 'Vascomm@2026',
    division: 'IT SOLUTION',
    position: 'Lead FE (Frontend)',
    email: 'ian.pramana@vascomm.co.id',
    joinDate: '2025-02-04',
    status: 'active',
    passwordResetRequest: 'none'
  }
];

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [division, setDivision] = useState('IT SOLUTION');
  const [position, setPosition] = useState('');
  const [email, setEmail] = useState('');

  const [isForgot, setIsForgot] = useState(false);
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotPassword, setForgotPassword] = useState('');
  const [forgotPasswordConfirm, setForgotPasswordConfirm] = useState('');
  const [forgotStatusMessage, setForgotStatusMessage] = useState('');
  const [isResetApproved, setIsResetApproved] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [divisions, setDivisions] = useState<string[]>(DEFAULT_DIVISIONS);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data && Array.isArray(data.divisions) && data.divisions.length > 0) {
          setDivisions(data.divisions);
        }
      })
      .catch(() => {});
  }, []);

  const authenticateUser = async (loginIdentifier: string, loginPass: string) => {
    setError('');
    setSuccess('');

    if (!loginIdentifier.trim() || !loginPass.trim()) {
      setError('Username / Email dan Kata Sandi wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/users');
      let users = [];
      if (res.ok) {
        users = await res.json();
      } else {
        throw new Error('Server responded with error');
      }

      const matchedUser = users.find(
        (u: any) =>
          ((u.email && u.email.toLowerCase() === loginIdentifier.trim().toLowerCase()) ||
            u.username.toLowerCase() === loginIdentifier.trim().toLowerCase()) &&
          u.password === loginPass
      );

      if (matchedUser) {
        if (matchedUser.status === 'inactive') {
          setError('Akun Anda dinonaktifkan oleh Administrator. Hubungi admin untuk mengaktifkan kembali.');
          return;
        }

        const userPayload: AppUser = {
          id: matchedUser.id,
          username: matchedUser.username,
          name: matchedUser.name,
          role: matchedUser.role,
          division: matchedUser.division,
          position: matchedUser.position,
          email: matchedUser.email,
          joinDate: matchedUser.joinDate,
          status: matchedUser.status
        };
        localStorage.setItem('vascomm_tracker_current_user', JSON.stringify(userPayload));
        onLoginSuccess(userPayload);
      } else {
        setError('Username / Email atau Kata Sandi salah.');
      }
    } catch {
      const stored = localStorage.getItem('vascomm_tracker_users');
      let users = [];
      if (stored) {
        try {
          users = JSON.parse(stored);
        } catch {
          users = FALLBACK_DEMO_USERS;
        }
      } else {
        users = FALLBACK_DEMO_USERS;
      }

      const matchedUser = users.find(
        (u: any) =>
          ((u.email && u.email.toLowerCase() === loginIdentifier.trim().toLowerCase()) ||
            u.username.toLowerCase() === loginIdentifier.trim().toLowerCase()) &&
          u.password === loginPass
      );

      if (matchedUser) {
        if (matchedUser.status === 'inactive') {
          setError('Akun Anda dinonaktifkan oleh Administrator.');
          return;
        }

        const userPayload: AppUser = {
          id: matchedUser.id,
          username: matchedUser.username,
          name: matchedUser.name,
          role: matchedUser.role,
          division: matchedUser.division,
          position: matchedUser.position,
          email: matchedUser.email,
          joinDate: matchedUser.joinDate,
          status: matchedUser.status
        };
        localStorage.setItem('vascomm_tracker_current_user', JSON.stringify(userPayload));
        onLoginSuccess(userPayload);
      } else {
        setError('Username / Email atau Kata Sandi salah.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await authenticateUser(username, password);
  };

  const handleDemoQuickLogin = async (demo: (typeof DEMO_ROLES)[number]) => {
    setIsForgot(false);
    setIsRegister(false);
    setUsername(demo.username);
    setPassword(demo.password);
    await authenticateUser(demo.username, demo.password);
  };

  const handleCopyCredentials = async (e: React.MouseEvent, demo: (typeof DEMO_ROLES)[number]) => {
    e.stopPropagation();
    const text = `${demo.username} / ${demo.password}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopiedId(demo.id);
    setTimeout(() => {
      setCopiedId(prev => (prev === demo.id ? null : prev));
    }, 1500);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Semua kolom pendaftaran wajib diisi.');
      return;
    }

    const derivedUsername = email.trim().toLowerCase().split('@')[0];

    const newUser = {
      id: `usr-${Date.now()}`,
      username: derivedUsername,
      name: name.trim(),
      role: 'karyawan' as const,
      password: password,
      division: division,
      position: position,
      email: email.trim().toLowerCase(),
      joinDate: new Date().toISOString().split('T')[0],
      status: 'active' as const,
      passwordResetRequest: 'none' as const
    };

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Pendaftaran gagal');
      }

      setSuccess('Pendaftaran berhasil! Silakan masuk dengan akun Anda.');
      setIsRegister(false);
      setUsername(newUser.username);
      setPassword('');
    } catch (err: any) {
      const stored = localStorage.getItem('vascomm_tracker_users');
      let users = [];
      if (stored) {
        try {
          users = JSON.parse(stored);
        } catch {
          users = FALLBACK_DEMO_USERS;
        }
      } else {
        users = FALLBACK_DEMO_USERS;
      }

      const userExists = users.some(
        (u: any) => u.email && u.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (userExists) {
        setError('Email sudah terdaftar. Silakan gunakan email lain.');
        return;
      }

      const updatedUsers = [...users, newUser];
      localStorage.setItem('vascomm_tracker_users', JSON.stringify(updatedUsers));

      setSuccess('Pendaftaran berhasil! Silakan login.');
      setIsRegister(false);
      setUsername(newUser.username);
      setPassword('');
    }
  };

  const handleCheckResetStatus = async () => {
    setError('');
    setForgotStatusMessage('');
    if (!forgotUsername.trim()) {
      setError('Masukkan username atau email Anda terlebih dahulu.');
      return;
    }

    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const users = await res.json();
        const user = users.find(
          (u: any) =>
            (u.email && u.email.toLowerCase() === forgotUsername.trim().toLowerCase()) ||
            u.username.toLowerCase() === forgotUsername.trim().toLowerCase()
        );

        if (!user) {
          setError('Username atau email tidak ditemukan.');
          return;
        }

        if (user.passwordResetRequest === 'approved') {
          setIsResetApproved(true);
          setForgotStatusMessage(
            'Permintaan disetujui oleh Administrator. Silakan atur kata sandi baru Anda di bawah ini.'
          );
        } else if (user.passwordResetRequest === 'pending_approval') {
          setIsResetApproved(false);
          setForgotStatusMessage(
            'Permintaan reset kata sandi Anda sedang menunggu persetujuan Administrator.'
          );
        } else {
          const reqRes = await fetch('/api/users/request-reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email || `${user.username}@vascomm.co.id` })
          });
          if (reqRes.ok) {
            setForgotStatusMessage(
              'Permintaan berhasil diajukan. Status saat ini menunggu persetujuan Administrator.'
            );
          } else {
            const errData = await reqRes.json();
            setError(errData.error || 'Gagal mengajukan permintaan reset.');
          }
        }
      }
    } catch {
      setError('Gagal terhubung ke server.');
    }
  };

  const handleExecuteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!forgotPassword || !forgotPasswordConfirm) {
      setError('Isi semua kolom kata sandi.');
      return;
    }

    if (forgotPassword !== forgotPasswordConfirm) {
      setError('Kata sandi baru dan konfirmasi tidak cocok.');
      return;
    }

    try {
      const usersRes = await fetch('/api/users');
      let userEmail = forgotUsername.trim();
      if (usersRes.ok) {
        const users = await usersRes.json();
        const user = users.find(
          (u: any) =>
            (u.email && u.email.toLowerCase() === forgotUsername.trim().toLowerCase()) ||
            u.username.toLowerCase() === forgotUsername.trim().toLowerCase()
        );
        if (user) {
          userEmail = user.email || `${user.username}@vascomm.co.id`;
        }
      }

      const res = await fetch('/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, newPassword: forgotPassword })
      });

      if (res.ok) {
        setSuccess('Kata sandi baru berhasil disimpan. Silakan masuk kembali.');
        setIsForgot(false);
        setForgotUsername('');
        setForgotPassword('');
        setForgotPasswordConfirm('');
        setForgotStatusMessage('');
        setIsResetApproved(false);
        setUsername(forgotUsername);
      } else {
        const errData = await res.json();
        setError(errData.error || 'Gagal mereset kata sandi.');
      }
    } catch {
      setError('Gagal menghubungi server untuk mereset kata sandi.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-100 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        id="login-container"
        className="w-full max-w-5xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg shadow-slate-200/70 dark:shadow-none overflow-hidden grid grid-cols-1 lg:grid-cols-12"
      >
        {/* Left Corporate Brand Panel */}
        <div className="lg:col-span-5 bg-[#0F3D39] text-white p-8 sm:p-10 flex flex-col justify-between gap-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-200">
              <Building2 size={15} />
              <span>Vascomm Workspace</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight font-display">
                Vascomm AI Learning Tracker
              </h1>
              <p className="text-sm text-teal-100/85 leading-relaxed">
                Platform pencatatan aktivitas AI pasca pelatihan, pemantauan penghematan jam kerja, dan berbagi panduan lintas divisi.
              </p>
            </div>

            <ul className="space-y-3.5 pt-2">
              <li className="flex items-start gap-3 text-sm text-teal-50/95 leading-snug">
                <CheckCircle2 size={16} className="text-teal-300 shrink-0 mt-0.5" />
                <span>Akses terpisah untuk Super Admin dan Karyawan</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-teal-50/95 leading-snug">
                <CheckCircle2 size={16} className="text-teal-300 shrink-0 mt-0.5" />
                <span>Rekapitulasi 100 karyawan di 7 divisi operasional</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-teal-50/95 leading-snug">
                <CheckCircle2 size={16} className="text-teal-300 shrink-0 mt-0.5" />
                <span>Basis pengetahuan Markdown dan ekspor CSV siap pakai</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 border-t border-white/15 text-xs text-teal-100/75 space-y-1">
            <p className="font-semibold text-white">Sitamoto &amp; Vascomm Division</p>
            <p>Portal Pelaporan Pembelajaran AI Internal</p>
          </div>
        </div>

        {/* Right Form & Demo Role Panel */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between bg-white dark:bg-[#111827]">
          {!isForgot ? (
            <div className="space-y-6">
              {/* Top Heading + Mode Switch */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight font-display">
                    {isRegister ? 'Daftar Akun Karyawan' : 'Masuk ke Portal'}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    {isRegister
                      ? 'Lengkapi profil kerja Anda untuk mulai mencatat laporan.'
                      : 'Gunakan username atau email perusahaan Anda.'}
                  </p>
                </div>

                <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegister(false);
                      setError('');
                      setSuccess('');
                    }}
                    className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                      !isRegister
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Masuk
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegister(true);
                      setError('');
                      setSuccess('');
                    }}
                    className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                      isRegister
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Daftar Baru
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {!isRegister ? (
                  <motion.form
                    key="login-form"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 6 }}
                    transition={{ duration: 0.16 }}
                    onSubmit={handleLogin}
                    className="space-y-4"
                  >
                    {error && (
                      <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-start gap-2.5">
                        <AlertCircle size={15} className="shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    )}
                    {success && (
                      <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-start gap-2.5">
                        <UserCheck size={15} className="shrink-0 mt-0.5" />
                        <span>{success}</span>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                        Username atau Email
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                          <User size={15} />
                        </span>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Contoh: admin atau ian.pramana"
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Kata Sandi
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsForgot(true);
                            setError('');
                            setSuccess('');
                            setForgotUsername(username);
                            setForgotStatusMessage('');
                            setIsResetApproved(false);
                          }}
                          className="text-xs text-teal-700 dark:text-teal-400 hover:underline font-medium cursor-pointer"
                        >
                          Lupa password?
                        </button>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                          <Lock size={15} />
                        </span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Masukkan kata sandi"
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-2.5 pl-10 pr-10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(prev => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
                          title={showPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
                        >
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 px-4 bg-[#0F766E] hover:bg-[#0D655E] disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition cursor-pointer flex items-center justify-center gap-2 mt-2"
                    >
                      <span>{isSubmitting ? 'Memproses...' : 'Masuk ke Portal'}</span>
                      <ArrowRight size={15} />
                    </button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="register-form"
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.16 }}
                    onSubmit={handleRegister}
                    className="space-y-4"
                  >
                    {error && (
                      <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-start gap-2.5">
                        <AlertCircle size={15} className="shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                          Nama Lengkap
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Nama lengkap"
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                          Email Kerja
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="nama@vascomm.co.id"
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                          Divisi
                        </label>
                        <select
                          value={division}
                          onChange={(e) => setDivision(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 cursor-pointer"
                        >
                          {divisions.map(div => (
                            <option key={div} value={div}>
                              {div}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                          Jabatan
                        </label>
                        <input
                          type="text"
                          value={position}
                          onChange={(e) => setPosition(e.target.value)}
                          placeholder="Contoh: Backend Developer"
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                          Kata Sandi
                        </label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Minimal 4 karakter"
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 bg-[#0F766E] hover:bg-[#0D655E] text-white font-semibold rounded-xl text-sm transition cursor-pointer"
                    >
                      Daftar Sekarang
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Demo Accounts: 2 Roles Only (Super Admin & Karyawan) */}
              {!isRegister && (
                <div className="pt-5 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <KeyRound size={14} className="text-teal-700 dark:text-teal-400" />
                      Akun Demo (Klik untuk Langsung Masuk)
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                      2 Role
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {DEMO_ROLES.map((demo) => (
                      <div
                        key={demo.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleDemoQuickLogin(demo)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleDemoQuickLogin(demo);
                          }
                        }}
                        className="group p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 hover:border-teal-600 dark:hover:border-teal-500 hover:bg-teal-50/40 dark:hover:bg-teal-950/20 transition cursor-pointer flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-teal-800 dark:group-hover:text-teal-300 transition-colors">
                            {demo.label}
                          </div>
                          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                            <span className="select-all text-slate-700 dark:text-slate-300">{demo.username}</span>
                            <span className="mx-1.5 text-slate-400">·</span>
                            <span className="select-all text-slate-700 dark:text-slate-300">{demo.password}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => handleCopyCredentials(e, demo)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-white dark:hover:bg-slate-800 transition cursor-pointer"
                            title="Salin username & password"
                          >
                            {copiedId === demo.id ? (
                              <Check size={13} className="text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Copy size={13} />
                            )}
                          </button>
                          <ArrowRight
                            size={14}
                            className="text-slate-400 group-hover:text-teal-700 dark:group-hover:text-teal-300 group-hover:translate-x-0.5 transition-all"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 my-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Key size={15} className="text-teal-700 dark:text-teal-400" />
                  Reset Kata Sandi
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgot(false);
                    setError('');
                    setSuccess('');
                  }}
                  className="text-xs text-teal-700 dark:text-teal-400 hover:underline font-semibold cursor-pointer"
                >
                  Kembali ke Login
                </button>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2">
                  <UserCheck size={14} className="shrink-0 mt-0.5" />
                  <span>{success}</span>
                </div>
              )}

              {forgotStatusMessage && (
                <div
                  className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                    isResetApproved
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300'
                  }`}
                >
                  <p className="font-medium">{forgotStatusMessage}</p>
                </div>
              )}

              {!isResetApproved ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      Username atau Email Anda
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <Mail size={15} />
                      </span>
                      <input
                        type="text"
                        value={forgotUsername}
                        onChange={(e) => setForgotUsername(e.target.value)}
                        placeholder="Username atau email yang ingin di-reset"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCheckResetStatus}
                    className="w-full py-2.5 bg-[#0F766E] hover:bg-[#0D655E] text-white font-semibold rounded-xl text-sm transition cursor-pointer"
                  >
                    Minta Izin &amp; Cek Status Reset
                  </button>
                </div>
              ) : (
                <form onSubmit={handleExecuteReset} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      Kata Sandi Baru
                    </label>
                    <input
                      type="password"
                      value={forgotPassword}
                      onChange={(e) => setForgotPassword(e.target.value)}
                      placeholder="Masukkan kata sandi baru"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      Konfirmasi Kata Sandi Baru
                    </label>
                    <input
                      type="password"
                      value={forgotPasswordConfirm}
                      onChange={(e) => setForgotPasswordConfirm(e.target.value)}
                      placeholder="Ulangi kata sandi baru"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#0F766E] hover:bg-[#0D655E] text-white font-semibold rounded-xl text-sm transition cursor-pointer"
                  >
                    Simpan Kata Sandi Baru
                  </button>
                </form>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
