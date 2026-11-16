import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Edit2,
  Trash2,
  Shield,
  User,
  Power,
  Check,
  X,
  KeyRound,
  Plus,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { AppUser } from '../types';
import { motion } from 'motion/react';

interface UserManagementViewProps {
  currentUser: AppUser | null;
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

export default function UserManagementView({ currentUser }: UserManagementViewProps) {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [divisionFilter, setDivisionFilter] = useState<string>('all');
  const [divisions, setDivisions] = useState<string[]>(DEFAULT_DIVISIONS);

  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [editDivision, setEditDivision] = useState('');
  const [editPosition, setEditPosition] = useState('');

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDivision, setNewDivision] = useState('IT SOLUTION');
  const [newPosition, setNewPosition] = useState('');
  const [newRole, setNewRole] = useState<'karyawan' | 'admin'>('karyawan');

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showQuickCreds, setShowQuickCreds] = useState(false);

  const [userToPromote, setUserToPromote] = useState<AppUser | null>(null);
  const [userToDemote, setUserToDemote] = useState<AppUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.divisions) && data.divisions.length > 0) {
          setDivisions(data.divisions);
        }
      }
    } catch {
      // Keep default divisions
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchSettings();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        showNotification('error', 'Gagal memuat daftar karyawan.');
      }
    } catch {
      showNotification('error', 'Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const handleToggleStatus = async (user: AppUser) => {
    if (user.role === 'superadmin') {
      showNotification('error', 'Akun Super Admin tidak dapat dinonaktifkan atau dimodifikasi.');
      return;
    }
    const newStatus = user.status === 'inactive' ? 'active' : 'inactive';
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showNotification(
          'success',
          `${user.name} berhasil ${newStatus === 'active' ? 'diaktifkan' : 'dinonaktifkan'}.`
        );
        setUsers(prev => prev.map(u => (u.id === user.id ? { ...u, status: newStatus } : u)));
      } else {
        const errData = await res.json();
        showNotification('error', errData.error || 'Gagal mengubah status akun.');
      }
    } catch {
      showNotification('error', 'Gagal menghubungi server.');
    }
  };

  const handlePromoteToAdminClick = (user: AppUser) => {
    if (currentUser?.role !== 'superadmin' && currentUser?.username !== 'admin') {
      showNotification('error', 'Hanya Super Admin yang dapat mempromosikan akun ke Admin.');
      return;
    }
    if (user.role === 'admin' || user.role === 'superadmin') {
      showNotification('error', 'Pengguna ini sudah menjadi Admin.');
      return;
    }
    setUserToPromote(user);
  };

  const executePromoteToAdmin = async () => {
    if (!userToPromote) return;
    try {
      const res = await fetch(`/api/users/${userToPromote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'admin' })
      });
      if (res.ok) {
        showNotification('success', `${userToPromote.name} sekarang memiliki akses Administrator.`);
        setUsers(prev => prev.map(u => (u.id === userToPromote.id ? { ...u, role: 'admin' } : u)));
      } else {
        const errData = await res.json();
        showNotification('error', errData.error || 'Gagal mempromosikan pengguna.');
      }
    } catch {
      showNotification('error', 'Gagal menghubungi server.');
    } finally {
      setUserToPromote(null);
    }
  };

  const handleDemoteToUserClick = (user: AppUser) => {
    if (currentUser?.role !== 'superadmin' && currentUser?.username !== 'admin') {
      showNotification('error', 'Hanya Super Admin yang dapat mengubah peran Admin.');
      return;
    }
    if (user.role !== 'admin') return;
    setUserToDemote(user);
  };

  const executeDemoteToUser = async () => {
    if (!userToDemote) return;
    try {
      const res = await fetch(`/api/users/${userToDemote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'karyawan' })
      });
      if (res.ok) {
        showNotification('success', `Peran ${userToDemote.name} diubah kembali menjadi Karyawan.`);
        setUsers(prev => prev.map(u => (u.id === userToDemote.id ? { ...u, role: 'karyawan' } : u)));
      } else {
        const errData = await res.json();
        showNotification('error', errData.error || 'Gagal mengubah peran pengguna.');
      }
    } catch {
      showNotification('error', 'Gagal menghubungi server.');
    } finally {
      setUserToDemote(null);
    }
  };

  const handleApproveReset = async (user: AppUser) => {
    try {
      const res = await fetch('/api/users/approve-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      if (res.ok) {
        showNotification(
          'success',
          `Izin reset kata sandi untuk ${user.name} disetujui.`
        );
        setUsers(prev =>
          prev.map(u => (u.id === user.id ? { ...u, passwordResetRequest: 'approved' } : u))
        );
      } else {
        showNotification('error', 'Gagal menyetujui permintaan reset kata sandi.');
      }
    } catch {
      showNotification('error', 'Gagal menghubungi server.');
    }
  };

  const handleDeleteClick = (user: AppUser) => {
    if (user.role === 'superadmin') {
      showNotification('error', 'Akun Super Admin tidak dapat dihapus.');
      return;
    }
    if (user.role === 'admin' && currentUser?.role !== 'superadmin' && currentUser?.username !== 'admin') {
      showNotification('error', 'Hanya Super Admin yang dapat menghapus Admin lain.');
      return;
    }
    setUserToDelete(user);
  };

  const executeDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      const res = await fetch(`/api/users/${userToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        showNotification('success', `Akun ${userToDelete.name} berhasil dihapus.`);
        setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      } else {
        const errData = await res.json();
        showNotification('error', errData.error || 'Gagal menghapus akun.');
      }
    } catch {
      showNotification('error', 'Gagal menghubungi server.');
    } finally {
      setUserToDelete(null);
    }
  };

  const handleStartEdit = (user: AppUser) => {
    if (user.role === 'superadmin') {
      showNotification('error', 'Akun Super Admin tidak dapat dimodifikasi.');
      return;
    }
    setEditingUser(user);
    setEditDivision(user.division || divisions[0] || 'IT SOLUTION');
    setEditPosition(user.position || 'Karyawan');
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ division: editDivision, position: editPosition })
      });
      if (res.ok) {
        showNotification('success', `Profil kerja ${editingUser.name} berhasil diperbarui.`);
        setUsers(prev =>
          prev.map(u =>
            u.id === editingUser.id ? { ...u, division: editDivision, position: editPosition } : u
          )
        );
        setEditingUser(null);
      } else {
        showNotification('error', 'Gagal memperbarui profil pengguna.');
      }
    } catch {
      showNotification('error', 'Gagal menghubungi server.');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const derivedUsername = (newUsername || newEmail.split('@')[0] || '').trim().toLowerCase();
    if (!newName.trim() || !derivedUsername || !newPassword.trim()) {
      showNotification('error', 'Kolom Nama, Email/Username, dan Kata Sandi wajib diisi.');
      return;
    }

    const payload = {
      id: `usr-${Date.now()}`,
      username: derivedUsername,
      name: newName.trim(),
      password: newPassword,
      role: newRole,
      division: newDivision,
      position: newPosition,
      email: newEmail.trim() || `${derivedUsername}@degree.co.id`,
      joinDate: new Date().toISOString().split('T')[0],
      status: 'active',
      passwordResetRequest: 'none'
    };

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showNotification('success', `Akun ${newName} berhasil ditambahkan.`);
        setIsAdding(false);
        setNewName('');
        setNewUsername('');
        setNewPassword('');
        setNewEmail('');
        setNewPosition('');
        fetchUsers();
      } else {
        const data = await res.json();
        showNotification('error', data.error || 'Gagal menambahkan akun baru.');
      }
    } catch {
      showNotification('error', 'Gagal menghubungi server.');
    }
  };

  const filteredUsers = useMemo(() => {
    let result = users.map(user => ({ ...user, _score: 0 }));

    const activeSearch = searchQuery.trim() !== '';
    if (activeSearch) {
      const q = searchQuery.toLowerCase().trim();
      const terms = q.split(/\s+/).filter(Boolean);

      if (terms.length > 0) {
        result = result.filter(user => {
          const nameLower = user.name.toLowerCase();
          const emailLower = (user.email || '').toLowerCase();
          const divisionLower = (user.division || '').toLowerCase();
          const positionLower = (user.position || '').toLowerCase();

          const allTermsMatch = terms.every(
            term =>
              nameLower.includes(term) ||
              emailLower.includes(term) ||
              divisionLower.includes(term) ||
              positionLower.includes(term)
          );

          if (!allTermsMatch) return false;

          let score = 0;
          if (nameLower === q) score += 1000;
          else if (nameLower.includes(q)) score += 500;
          if (emailLower === q) score += 300;
          else if (emailLower.includes(q)) score += 150;

          terms.forEach(term => {
            if (nameLower.startsWith(term)) score += 80;
            else if (nameLower.includes(term)) score += 40;
            if (emailLower.startsWith(term)) score += 40;
            if (emailLower.includes(term)) score += 20;
            if (divisionLower.includes(term)) score += 10;
            if (positionLower.includes(term)) score += 10;
          });

          user._score = score;
          return true;
        });
      }
    }

    if (divisionFilter !== 'all') {
      result = result.filter(u => (u.division || '').toLowerCase() === divisionFilter.toLowerCase());
    }
    if (roleFilter !== 'all') {
      result = result.filter(u => u.role === roleFilter);
    }
    if (statusFilter !== 'all') {
      result = result.filter(u => u.status === statusFilter);
    }

    if (activeSearch) {
      result.sort((a, b) => b._score - a._score);
    }

    return result.map(({ _score, ...rest }) => rest as AppUser);
  }, [users, searchQuery, roleFilter, statusFilter, divisionFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, statusFilter, divisionFilter]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  return (
    <div className="space-y-6" id="user-management-panel">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Manajemen Karyawan
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
            {users.length} akun terdaftar · Kelola divisi, status aktif, dan persetujuan reset sandi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowQuickCreds(!showQuickCreds)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 border rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              showQuickCreds
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                : 'bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
            }`}
          >
            <KeyRound size={14} />
            {showQuickCreds ? 'Tutup Daftar Sandi' : 'Daftar Akun & Sandi'}
          </button>

          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0F766E] hover:bg-[#0D655E] text-white font-semibold rounded-lg text-xs transition cursor-pointer whitespace-nowrap"
          >
            <Plus size={14} />
            Tambah Karyawan
          </button>

          <button
            onClick={fetchUsers}
            className="p-2 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition cursor-pointer"
            title="Muat Ulang"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Credentials Drawer */}
      {showQuickCreds && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#111827] p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Daftar Akun &amp; Kata Sandi ({filteredUsers.length} dari {users.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Gunakan kolom filter di bawah untuk menyaring daftar akun. Klik teks username atau sandi untuk menyalin.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
            {filteredUsers.map(u => (
              <div
                key={`quick-cred-${u.id}`}
                className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[140px]">
                      {u.name}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <span className="text-[11px] font-medium text-teal-700 dark:text-teal-400">
                      {u.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 truncate">
                    <span className="select-all text-slate-700 dark:text-slate-300">{u.username}</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-md select-all shrink-0">
                  {u.password || 'Degree@2026'}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Notification */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-medium flex items-start gap-2.5 ${
            notification.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
          }`}
        >
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Filter Bar + Table */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Cari nama, email, divisi, jabatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 pl-9 pr-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-teal-600"
            />
          </div>

          <select
            value={divisionFilter}
            onChange={(e) => setDivisionFilter(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-teal-600 cursor-pointer"
          >
            <option value="all">Semua Divisi</option>
            {divisions.map(div => (
              <option key={div} value={div}>
                {div}
              </option>
            ))}
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-teal-600 cursor-pointer"
          >
            <option value="all">Semua Role</option>
            <option value="karyawan">Karyawan</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Super Admin</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-teal-600 cursor-pointer"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500 dark:text-slate-400">
            Memuat data karyawan...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500 dark:text-slate-400">
            Tidak ada karyawan yang cocok dengan kriteria pencarian.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4 pl-5">Karyawan</th>
                  <th className="py-3 px-4">Divisi &amp; Jabatan</th>
                  <th className="py-3 px-4">Tanggal Bergabung</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Reset Sandi</th>
                  <th className="py-3 px-4 pr-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                {paginatedUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 pl-5">
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{user.name}</span>
                        {user.role === 'superadmin' && (
                          <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-400">
                            · Super Admin
                          </span>
                        )}
                        {user.role === 'admin' && (
                          <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                            · Admin
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        {user.email || `${user.username}@degree.co.id`}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {user.division || 'Belum diatur'}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {user.position || 'Belum diatur'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums whitespace-nowrap">
                      {user.joinDate || '2026-01-01'}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition ${
                          user.status !== 'inactive'
                            ? 'text-emerald-700 dark:text-emerald-400 hover:opacity-75'
                            : 'text-rose-600 dark:text-rose-400 hover:opacity-75'
                        }`}
                        title={user.status !== 'inactive' ? 'Klik untuk menonaktifkan' : 'Klik untuk mengaktifkan'}
                      >
                        <Power size={12} />
                        {user.status !== 'inactive' ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {user.passwordResetRequest === 'pending_approval' ? (
                        <button
                          onClick={() => handleApproveReset(user)}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-semibold inline-flex items-center gap-1 transition cursor-pointer"
                        >
                          <KeyRound size={11} />
                          Setujui
                        </button>
                      ) : user.passwordResetRequest === 'approved' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 dark:text-teal-400">
                          <Check size={12} />
                          Disetujui
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 pr-5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {(currentUser?.role === 'superadmin' || currentUser?.username === 'admin') &&
                          user.role === 'karyawan' && (
                            <button
                              onClick={() => handlePromoteToAdminClick(user)}
                              className="px-2.5 py-1 border border-slate-200 dark:border-slate-700 hover:border-amber-500 text-slate-600 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-400 rounded-md text-xs font-medium transition cursor-pointer whitespace-nowrap"
                            >
                              Jadikan Admin
                            </button>
                          )}
                        {(currentUser?.role === 'superadmin' || currentUser?.username === 'admin') &&
                          user.role === 'admin' && (
                            <button
                              onClick={() => handleDemoteToUserClick(user)}
                              className="px-2.5 py-1 border border-slate-200 dark:border-slate-700 hover:border-rose-500 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 rounded-md text-xs font-medium transition cursor-pointer whitespace-nowrap"
                            >
                              Turunkan Role
                            </button>
                          )}
                        <button
                          onClick={() => handleStartEdit(user)}
                          className="p-1.5 text-slate-500 hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                          title="Edit Divisi & Jabatan"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition cursor-pointer"
                          title="Hapus Karyawan"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/30">
            <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              Menampilkan <strong className="font-semibold text-slate-900 dark:text-white">{paginatedUsers.length}</strong> dari{' '}
              <strong className="font-semibold text-slate-900 dark:text-white">{filteredUsers.length}</strong> akun
            </span>

            <div className="flex items-center gap-1 flex-wrap">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
                    <span key={`ellipsis-${idx}`} className="px-1.5 text-xs text-slate-400">
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
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
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 transition cursor-pointer"
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Edit Profil Karyawan
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{editingUser.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {editingUser.email || `${editingUser.username}@degree.co.id`}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Divisi Kerja
                </label>
                <select
                  value={editDivision}
                  onChange={(e) => setEditDivision(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-600 cursor-pointer"
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
                  Jabatan / Posisi
                </label>
                <input
                  type="text"
                  value={editPosition}
                  onChange={(e) => setEditPosition(e.target.value)}
                  placeholder="Misal: Lead Officer"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-600"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 font-semibold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-[#0F766E] hover:bg-[#0D655E] text-white font-semibold rounded-lg text-xs transition cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW USER MODAL */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Tambah Karyawan Baru
              </h3>
              <button
                onClick={() => setIsAdding(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nama lengkap karyawan"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Email Kerja
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => {
                    setNewEmail(e.target.value);
                    if (!newUsername) {
                      setNewUsername(e.target.value.split('@')[0]);
                    }
                  }}
                  placeholder="nama@degree.co.id"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Kata Sandi
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 4 karakter"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Divisi
                  </label>
                  <select
                    value={newDivision}
                    onChange={(e) => setNewDivision(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-600 cursor-pointer"
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
                    value={newPosition}
                    onChange={(e) => setNewPosition(e.target.value)}
                    placeholder="Contoh: QA Engineer"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-teal-600"
                  />
                </div>
              </div>

              {(currentUser?.role === 'superadmin' || currentUser?.username === 'admin') && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Role Akses
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setNewRole('karyawan')}
                      className={`py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                        newRole === 'karyawan'
                          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Karyawan
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewRole('admin')}
                      className={`py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                        newRole === 'admin'
                          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Admin
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 font-semibold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0F766E] hover:bg-[#0D655E] text-white font-semibold rounded-lg text-xs transition cursor-pointer"
                >
                  Tambah Karyawan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROMOTE CONFIRM MODAL */}
      {userToPromote && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4" id="promote-confirm-modal">
          <div className="w-full max-w-md bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <Shield size={18} className="text-amber-600 dark:text-amber-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Konfirmasi Jadikan Admin
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Jadikan <strong className="text-slate-900 dark:text-white">{userToPromote.name}</strong> sebagai Administrator? Hak akses ini dapat dikembalikan ke Karyawan kapan saja.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setUserToPromote(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 font-semibold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executePromoteToAdmin}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-xs transition cursor-pointer"
              >
                Ya, Jadikan Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEMOTE CONFIRM MODAL */}
      {userToDemote && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4" id="demote-confirm-modal">
          <div className="w-full max-w-md bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <User size={18} className="text-rose-600 dark:text-rose-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Turunkan Role ke Karyawan
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Cabut hak akses Administrator milik <strong className="text-slate-900 dark:text-white">{userToDemote.name}</strong>? Pengguna hanya akan dapat mengakses Portal Karyawan.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setUserToDemote(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 font-semibold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeDemoteToUser}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg text-xs transition cursor-pointer"
              >
                Ya, Turunkan Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4" id="delete-confirm-modal">
          <div className="w-full max-w-md bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <AlertCircle size={18} className="text-rose-600 dark:text-rose-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Hapus Akun Karyawan
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Yakin ingin menghapus akun <strong className="text-slate-900 dark:text-white">{userToDelete.name}</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 font-semibold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeDeleteUser}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg text-xs transition cursor-pointer"
              >
                Hapus Akun
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
