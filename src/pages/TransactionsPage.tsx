import React, { useState } from 'react';
import { usePOS } from '../hooks/usePOS';
import { formatRupiah, formatDate } from '../utils/formatters';
import { History, Search, Filter, Printer, Coffee, ArrowUpRight } from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const { orders, currentUser, openReceiptModal } = usePOS();
  const [search, setSearch] = useState('');
  const [filterMethod, setFilterMethod] = useState<string>('all');

  const isOwner = currentUser?.role === 'owner';

  // Filter orders
  const displayOrders = orders.filter(o => {
    // If karyawan, show my transactions or today's
    const matchesUser = isOwner ? true : o.created_by_user_id === currentUser?.id;
    const matchesSearch = o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.created_by_name.toLowerCase().includes(search.toLowerCase()) ||
      (o.customer_name && o.customer_name.toLowerCase().includes(search.toLowerCase()));
    const matchesMethod = filterMethod === 'all' || o.payment.method === filterMethod;

    return matchesUser && matchesSearch && matchesMethod;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <History className="w-6 h-6 text-[#C68B59]" />
            Riwayat Transaksi POS
          </h1>
          <p className="text-xs text-stone-500">
            {isOwner ? 'Daftar semua transaksi yang tercatat di Booth Daily.' : 'Daftar transaksi yang Anda proses hari ini.'}
          </p>
        </div>
      </div>

      {/* Filter controls */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-[#1E1C1A] p-4 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari no. transaksi, kasir, atau pelanggan..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-stone-50 dark:bg-[#171514] border border-stone-200 dark:border-stone-700 text-xs font-semibold focus:outline-none"
          />
        </div>

        <select
          value={filterMethod}
          onChange={e => setFilterMethod(e.target.value)}
          className="px-4 py-2 rounded-2xl bg-stone-50 dark:bg-[#171514] border border-stone-200 dark:border-stone-700 text-xs font-bold"
        >
          <option value="all">Semua Metode Bayar</option>
          <option value="qris">QRIS</option>
          <option value="cash">Cash</option>
          <option value="debit">Debit Card</option>
          <option value="transfer">Transfer Bank</option>
        </select>
      </div>

      {/* Transactions List */}
      <div className="bg-white dark:bg-[#1E1C1A] rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-[#23201D] border-b border-stone-200 dark:border-stone-800 text-stone-500 font-bold uppercase">
              <tr>
                <th className="p-4">No. Transaksi</th>
                <th className="p-4">Waktu</th>
                <th className="p-4">Kasir</th>
                <th className="p-4">Pelanggan / Tipe</th>
                <th className="p-4">Metode Bayar</th>
                <th className="p-4 text-right">Total</th>
                <th className="p-4 text-center">Struk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60 font-medium">
              {displayOrders.map(ord => (
                <tr
                  key={ord.id}
                  onClick={() => openReceiptModal(ord)}
                  className="hover:bg-stone-50/50 dark:hover:bg-[#25221F] transition-colors cursor-pointer"
                >
                  <td className="p-4 font-black text-stone-900 dark:text-stone-100 text-sm">
                    {ord.order_number}
                  </td>
                  <td className="p-4 text-stone-500">{formatDate(ord.created_at)}</td>
                  <td className="p-4 text-stone-800 dark:text-stone-200 font-semibold">{ord.created_by_name}</td>
                  <td className="p-4">
                    <span className="font-bold text-stone-900 dark:text-stone-100 block">
                      {ord.customer_name || '-'}
                    </span>
                    <span className="text-[10px] text-[#C68B59] uppercase font-bold">
                      {ord.order_type === 'dine_in' ? 'Dine In' : 'Take Away'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700">
                      {ord.payment.method}
                    </span>
                  </td>
                  <td className="p-4 text-right font-black text-[#3B2A1F] dark:text-[#D4A373] text-sm">
                    {formatRupiah(ord.total_amount)}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openReceiptModal(ord);
                      }}
                      className="p-2 rounded-xl bg-amber-500/10 text-[#C68B59] hover:bg-amber-500/20"
                      title="Cetak Struk"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
