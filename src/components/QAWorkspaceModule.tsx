import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileSpreadsheet, ExternalLink, RefreshCw, LogIn, LogOut, CheckCircle2, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
import { googleSignIn, initGoogleAuth, logoutGoogle } from '../lib/googleAuth';
import { User } from 'firebase/auth';

export default function QAWorkspaceModule() {
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sheetUrl, setSheetUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (user, token) => {
        setGoogleUser(user);
        setAccessToken(token);
      },
      () => {
        setGoogleUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setAccessToken(result.accessToken);
      }
    } catch (err: any) {
      console.error(err);
      setError('Gagal menghubungkan Google Drive & Sheets. Silakan izinkan popup jendela browser.');
    }
  };

  const handleGenerateSheet = async () => {
    if (!accessToken) {
      setError('Silakan masuk dengan akun Google terlebih dahulu.');
      return;
    }
    setLoading(true);
    setError(null);
    setSheetUrl(null);

    try {
      const res = await fetch('/api/qa-sheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setSheetUrl(data.url);
      } else {
        throw new Error(data.error || 'Terjadi kesalahan saat memproses pembuatan file Google Sheets.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal menghubungi server untuk memproses Spreadsheet.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutGoogle();
    setGoogleUser(null);
    setAccessToken(null);
    setSheetUrl(null);
    setError(null);
  };

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/80 via-slate-950 to-teal-950/20 border border-slate-800 shadow-xl space-y-5" id="qa-sheets-module">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-teal-950/80 border border-teal-800 text-[9px] font-black uppercase tracking-wider text-teal-400">
              Integrasi Google Workspace
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
          </div>
          <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet size={18} className="text-teal-400" />
            Pembuat Modul Pengujian QA (Google Sheets)
          </h3>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Buat spreadsheet terstruktur secara otomatis di Google Drive Anda. Berisi skenario pengujian lengkap, langkah-langkah presisi, hasil yang diharapkan, serta pelacakan status QA untuk peran Admin & Karyawan.
          </p>
        </div>

        {googleUser ? (
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <p className="text-[11px] font-bold text-white">{googleUser.displayName}</p>
              <p className="text-[10px] text-slate-500">{googleUser.email}</p>
            </div>
            {googleUser.photoURL && (
              <img 
                src={googleUser.photoURL} 
                alt="Google Avatar" 
                className="w-8 h-8 rounded-full border border-slate-800"
                referrerPolicy="no-referrer"
              />
            )}
            <button
              onClick={handleLogout}
              className="p-2 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-rose-400 rounded-xl border border-slate-800 transition cursor-pointer"
              title="Putuskan sambungan Google"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleGoogleLogin}
            className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-950 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-white/5 shrink-0 cursor-pointer"
          >
            <LogIn size={14} />
            Hubungkan Akun Google
          </button>
        )}
      </div>

      <hr className="border-slate-900" />

      {error && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-950/20 border border-rose-900/30 text-rose-300 text-xs">
          <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={handleGenerateSheet}
          disabled={loading || !accessToken}
          className={`w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer ${
            !accessToken 
              ? 'bg-slate-800/40 text-slate-500 border border-slate-850 cursor-not-allowed'
              : 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-md shadow-teal-500/10'
          }`}
        >
          {loading ? (
            <>
              <RefreshCw size={14} className="animate-spin" />
              Sedang Membuat Google Sheets...
            </>
          ) : (
            <>
              <Sparkles size={14} />
              Buat Spreadsheet Skenario QA
            </>
          )}
        </button>

        {!accessToken && (
          <p className="text-[10px] text-slate-500 italic">
            * Silakan klik tombol "Hubungkan Akun Google" di kanan atas terlebih dahulu untuk mengizinkan akses Google Sheets.
          </p>
        )}
      </div>

      <AnimatePresence>
        {sheetUrl && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-4 rounded-xl bg-teal-950/30 border border-teal-900/40 text-teal-300 space-y-2.5"
          >
            <div className="flex items-center gap-2 text-xs font-bold">
              <CheckCircle2 size={16} className="text-emerald-400" />
              Berhasil Membuat Spreadsheet!
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              File spreadsheet bernama <strong className="text-slate-200">"Modul Skenario QA - Dashboard Pembelajaran AI Karyawan"</strong> berhasil di-generate langsung di Google Drive Anda dengan formatting, pewarnaan header, auto-fit kolom, dan daftar modul yang rapi.
            </p>
            <div className="pt-1">
              <a
                href={sheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-extrabold transition shadow-xs cursor-pointer"
              >
                Buka Google Sheets
                <ExternalLink size={12} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
