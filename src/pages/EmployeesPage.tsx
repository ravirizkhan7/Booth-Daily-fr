import React, { useState } from 'react';
import { usePOS } from '../hooks/usePOS';
import { User } from '../types';
import { userService } from '../services/userService';
import { Users, Plus, KeyRound, Edit2, Trash2, X, ShieldCheck, UserCheck } from 'lucide-react';

export const EmployeesPage: React.FC = () => {
  const { usersList, refreshData, showToast } = usePOS();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'owner' | 'karyawan'>('karyawan');
  const [pin, setPin] = useState('');
  const [phone, setPhone] = useState('');

  const handleOpenAdd = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setRole('karyawan');
    setPin('9988');
    setPhone('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role);
    setPin(u.pin);
    setPhone(u.phone || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, uName: string) => {
    if (window.confirm(`Hapus karyawan "${uName}"?`)) {
      await userService.deleteUser(id);
      await refreshData();
      showToast(`Karyawan "${uName}" telah dihapus`, 'info');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || pin.length !== 4) return;

    if (editingUser) {
      await userService.updateUser(editingUser.id, {
        name,
        email,
        role,
        pin,
        phone
      });
      showToast('Data karyawan berhasil diperbarui', 'success');
    } else {
      await userService.createUser({
        name,
        email: email || `${name.toLowerCase().replace(/\s+/g, '')}@boothdaily.com`,
        role,
        pin,
        phone,
        is_active: true,
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`
      });
      showToast('Karyawan baru berhasil ditambahkan', 'success');
    }

    await refreshData();
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-[#C68B59]" />
            Kelola Tim & Karyawan
          </h1>
          <p className="text-xs text-stone-500">
            Atur PIN otorisasi transaksi dan hak akses staf Booth Daily.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#3B2A1F] hover:bg-[#2A1E16] text-[#F7F5F2] text-sm font-bold shadow-md transition-all"
        >
          <Plus className="w-4 h-4 text-[#D4A373]" />
          Tambah Staf Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {usersList.map(u => (
          <div
            key={u.id}
            className="p-5 bg-white dark:bg-[#1E1C1A] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                  alt={u.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-stone-200 dark:border-stone-700"
                />
                <div>
                  <h3 className="font-extrabold text-base text-stone-900 dark:text-stone-100">{u.name}</h3>
                  <p className="text-xs text-stone-500">{u.email}</p>
                </div>
              </div>

              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${u.role === 'owner' ? 'bg-[#3B2A1F] text-[#D4A373]' : 'bg-emerald-500/10 text-emerald-600'}`}>
                {u.role === 'owner' ? 'Owner' : 'Karyawan'}
              </span>
            </div>

            <div className="p-3 bg-stone-50 dark:bg-[#23201D] rounded-2xl border border-stone-100 dark:border-stone-800 flex justify-between items-center text-xs">
              <span className="text-stone-500 font-semibold flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-[#C68B59]" /> PIN Kasir:
              </span>
              <span className="font-mono font-black text-sm tracking-widest text-stone-900 dark:text-stone-100">
                {u.pin}
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
              <button
                onClick={() => handleOpenEdit(u)}
                className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200"
                title="Edit Staf"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              {usersList.length > 1 && (
                <button
                  onClick={() => handleDelete(u.id, u.name)}
                  className="p-2 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500/20"
                  title="Hapus Staf"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1E1C1A] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-stone-200 dark:border-stone-800">
            <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                {editingUser ? 'Edit Data Staf' : 'Tambah Staf Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Nama Kasir / Staf"
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-[#171514] border border-stone-300 dark:border-stone-700 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="staf@boothdaily.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-[#171514] border border-stone-300 dark:border-stone-700 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Role Jabatan</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-[#171514] border border-stone-300 dark:border-stone-700 font-bold"
                  >
                    <option value="karyawan">Karyawan</option>
                    <option value="owner">Owner</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">PIN 4 Digit</label>
                  <input
                    type="text"
                    maxLength={4}
                    required
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                    placeholder="1234"
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-[#171514] border border-stone-300 dark:border-stone-700 font-mono font-black text-center text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold border border-stone-300 dark:border-stone-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#3B2A1F] text-[#F7F5F2] font-bold shadow-md"
                >
                  Simpan Staf
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
