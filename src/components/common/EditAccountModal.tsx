import React, { useState, useEffect } from 'react';
import { usePOS } from '../../hooks/usePOS';
import { X, User, Mail, Key, ShieldCheck, Save, Sparkles } from 'lucide-react';

export const EditAccountModal: React.FC = () => {
  const { isEditAccountModalOpen, closeEditAccountModal, currentUser, updateCurrentUserAccount } = usePOS();
  
  const [name, setName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (currentUser && isEditAccountModalOpen) {
      setName(currentUser.name || '');
      setUsername(currentUser.username || currentUser.email.split('@')[0] || '');
      setEmail(currentUser.email || '');
      setPassword(currentUser.password || '');
      setPin(currentUser.pin || '');
      setError('');
    }
  }, [currentUser, isEditAccountModalOpen]);

  if (!isEditAccountModalOpen || !currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama tidak boleh kosong');
      return;
    }
    if (!email.trim()) {
      setError('Email tidak boleh kosong');
      return;
    }
    if (!pin.trim() || pin.length < 4) {
      setError('PIN harus 4 digit angka');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const res = await updateCurrentUserAccount({
      name,
      username: username.trim() || email.split('@')[0],
      email,
      password: password || currentUser.password,
      pin
    });

    setIsSubmitting(false);

    if (!res.success) {
      setError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-[#1E1C1A] rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden transform transition-all duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-[#3B2A1F] text-[#F7F5F2] flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4A373]/20 flex items-center justify-center border border-[#D4A373]/30">
              <User className="w-5 h-5 text-[#D4A373]" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-wide">Edit Akun Saya</h2>
              <p className="text-xs text-[#D4A373]/80 font-medium">Ubah Profil & Kredensial</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={closeEditAccountModal}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#3B2A1F] dark:text-[#D4A373]" />
                Nama Lengkap
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Masukkan Nama Lengkap"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 dark:bg-[#151312] border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3B2A1F] dark:focus:ring-[#D4A373]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#3B2A1F] dark:text-[#D4A373]" />
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Masukkan Username"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 dark:bg-[#151312] border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3B2A1F] dark:focus:ring-[#D4A373]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#3B2A1F] dark:text-[#D4A373]" />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Masukkan Alamat Email"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 dark:bg-[#151312] border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3B2A1F] dark:focus:ring-[#D4A373]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#3B2A1F] dark:text-[#D4A373]" />
                Password (Opsional)
              </label>
              <input
                type="text"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Kosongkan jika tidak diubah"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 dark:bg-[#151312] border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3B2A1F] dark:focus:ring-[#D4A373]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#3B2A1F] dark:text-[#D4A373]" />
                PIN Transaksi (4 Digit)
              </label>
              <input
                type="text"
                maxLength={4}
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Contoh: 1234"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 dark:bg-[#151312] border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3B2A1F] dark:focus:ring-[#D4A373] font-mono tracking-widest text-center"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={closeEditAccountModal}
              className="flex-1 py-3 rounded-2xl border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-2xl bg-[#3B2A1F] hover:bg-[#2A1E16] text-[#F7F5F2] text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <Save className="w-4 h-4 text-[#D4A373]" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
