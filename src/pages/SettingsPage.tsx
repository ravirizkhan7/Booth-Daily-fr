import React, { useState } from 'react';
import { usePOS } from '../hooks/usePOS';
import { Settings, Save, RefreshCw, Store, Phone, MapPin, Receipt, CheckCircle2, Printer } from 'lucide-react';
import { printTestReceipt } from '../services/receiptPrint';
import api from '../utils/axios';

export const SettingsPage: React.FC = () => {
  const { settings, setSettings, refreshData, showToast, currentUser } = usePOS();

  const [formData, setFormData] = useState({ ...settings });
  const [isSaving, setIsSaving] = useState(false);

  // Sync formData when settings change from backend
  React.useEffect(() => {
    setFormData({ ...settings });
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.role !== 'owner') {
      showToast('Hanya Owner yang dapat mengubah pengaturan', 'error');
      return;
    }
    setIsSaving(true);
    try {
      const res = await api.put('/settings', formData);
      const saved = res.data?.data || res.data;
      if (saved && saved.store_name) {
        setSettings(saved);
        setFormData(saved);
      } else {
        setSettings(formData);
      }
      showToast('Pengaturan toko berhasil disimpan!', 'success');
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      showToast(err?.response?.data?.message || 'Gagal menyimpan pengaturan', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetData = async () => {
    if (window.confirm('Reset dan muat ulang data dari server?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('boothdaily_user_session');
      await refreshData();
      showToast('Data berhasil dimuat ulang dari server', 'info');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#C68B59]" />
            Pengaturan Aplikasi POS
          </h1>
          <p className="text-xs text-stone-500">
            Atur identitas booth, format cetak struk, dan opsi data.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-[#1E1C1A] rounded-3xl border border-stone-200 dark:border-stone-800 p-6 space-y-5 shadow-sm text-xs">
        <h3 className="font-extrabold text-sm text-[#3B2A1F] dark:text-[#D4A373] uppercase tracking-wider flex items-center gap-2">
          <Store className="w-4 h-4" /> Identitas Coffee Booth
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Nama Booth / Outlet</label>
            <input
              type="text"
              required
              value={formData.store_name}
              onChange={e => setFormData({ ...formData, store_name: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-[#171514] border border-stone-300 dark:border-stone-700 font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Slogan / Tagline</label>
            <input
              type="text"
              value={formData.tagline}
              onChange={e => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-[#171514] border border-stone-300 dark:border-stone-700 font-semibold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Alamat Booth</label>
            <input
              type="text"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-[#171514] border border-stone-300 dark:border-stone-700 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Nomor Telepon / WA</label>
            <input
              type="text"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-[#171514] border border-stone-300 dark:border-stone-700 font-medium"
            />
          </div>
        </div>

        <hr className="border-stone-100 dark:border-stone-800" />

        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-[#3B2A1F] dark:text-[#D4A373] uppercase tracking-wider flex items-center gap-2">
            <Receipt className="w-4 h-4" /> Pesan Cetak Struk
          </h3>
          <button
            type="button"
            onClick={() => {
              printTestReceipt(formData);
              showToast('Test print sedang diproses...', 'info');
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C68B59] hover:bg-[#B37845] text-white font-bold text-xs shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" /> Test Print Thermal
          </button>
        </div>

        <div>
          <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Pesan Atas (Receipt Header)</label>
          <input
            type="text"
            value={formData.receipt_header}
            onChange={e => setFormData({ ...formData, receipt_header: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-[#171514] border border-stone-300 dark:border-stone-700 font-medium"
          />
        </div>

        <div>
          <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Pesan Bawah (Receipt Footer)</label>
          <input
            type="text"
            value={formData.receipt_footer}
            onChange={e => setFormData({ ...formData, receipt_footer: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-[#171514] border border-stone-300 dark:border-stone-700 font-medium"
          />
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-stone-100 dark:border-stone-800">
          <button
            type="button"
            onClick={handleResetData}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 font-bold text-xs"
          >
            <RefreshCw className="w-4 h-4" /> Muat Ulang Data
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#3B2A1F] hover:bg-[#2A1E16] text-[#F7F5F2] font-bold text-sm shadow-md disabled:opacity-60"
          >
            <Save className="w-4 h-4 text-[#D4A373]" /> {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </div>
      </form>
    </div>
  );
};
