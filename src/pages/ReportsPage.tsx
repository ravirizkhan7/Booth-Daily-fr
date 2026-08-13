import { Banknote, QrCode } from 'lucide-react';
import React, { useState } from 'react';
import { usePOS } from '../hooks/usePOS';
import { formatRupiah, formatDate } from '../utils/formatters';
import { 
  BarChart3, Download, Calendar, TrendingUp, DollarSign, ShoppingBag, Coffee,
  Printer, ArrowUpRight, ArrowDownRight, Layers, CreditCard, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { exportToExcel } from '../services/excelExport';
import { exportReportToPDF } from '../services/pdfExport';

type DateFilterType = 'today' | 'week' | 'month' | 'custom';

export const ReportsPage: React.FC = () => {
  const { orders, products, stocks, purchases, showToast } = usePOS();

  const [dateFilter, setDateFilter] = useState<DateFilterType>('month');
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

  // Date Filtering Logic
  const getFilteredOrders = () => {
    const now = new Date();
    return orders.filter(o => {
      const orderDate = new Date(o.created_at);
      if (dateFilter === 'today') {
        return orderDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'week') {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return orderDate >= oneWeekAgo;
      } else if (dateFilter === 'month') {
        return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      } else if (dateFilter === 'custom') {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return orderDate >= start && orderDate <= end;
      }
      return true;
    });
  };

  const filteredOrders = getFilteredOrders();

  // Metrics Calculations
  const totalOmzet = filteredOrders.reduce((sum, o) => sum + o.total_amount, 0);
  const totalOrdersCount = filteredOrders.length;
  const avgOrderValue = totalOrdersCount > 0 ? totalOmzet / totalOrdersCount : 0;

  // Calculate HPP (Cost of Goods Sold)
  const totalHPP = filteredOrders.reduce((sum, order) => {
    return sum + order.items.reduce((itemSum, item) => {
      const prd = products.find(p => p.id === item.product_id);
      const itemCost = prd ? prd.cost_price : item.price * 0.4;
      return itemSum + (itemCost * item.qty);
    }, 0);
  }, 0);

  // Total Purchases in filter period
  const totalPurchasesAmount = purchases.reduce((sum, p) => sum + p.total_amount, 0);

  // Profit calculation
  const grossProfit = totalOmzet - totalHPP;

  // Breakdown by Order Type
  const dineInOrders = filteredOrders.filter(o => o.order_type === 'dine_in');
  const takeawayOrders = filteredOrders.filter(o => o.order_type === 'take_away');
  const dineInTotal = dineInOrders.reduce((sum, o) => sum + o.total_amount, 0);
  const takeawayTotal = takeawayOrders.reduce((sum, o) => sum + o.total_amount, 0);

  // Breakdown by Payment Method
  const paymentBreakdown = {
    cash: filteredOrders.filter(o => o.payment.method === 'cash').reduce((sum, o) => sum + o.total_amount, 0),
    qris: filteredOrders.filter(o => o.payment.method === 'qris').reduce((sum, o) => sum + o.total_amount, 0),
    debit: filteredOrders.filter(o => o.payment.method === 'debit' || o.payment.method === 'transfer').reduce((sum, o) => sum + o.total_amount, 0)
  };

  // Top Selling Products
  const productSalesMap: { [productId: string]: { name: string; qty: number; totalSales: number; category: string } } = {};

  filteredOrders.forEach(o => {
    o.items.forEach(item => {
      const prd = products.find(p => p.id === item.product_id);
      if (!productSalesMap[item.product_id]) {
        productSalesMap[item.product_id] = {
          name: item.product_name,
          qty: 0,
          totalSales: 0,
          category: prd ? prd.category_id : 'Umum'
        };
      }
      productSalesMap[item.product_id].qty += item.qty;
      productSalesMap[item.product_id].totalSales += (item.price * item.qty);
    });
  });

  const topProducts = Object.values(productSalesMap).sort((a, b) => b.qty - a.qty);

  // Low Stock Items
  const lowStocks = stocks.filter(s => s.current_amount <= s.min_amount);

  // Export CSV / Excel
  const handleExportCSV = () => {
    const data = filteredOrders.map(o => ({
      'No. Pesanan': o.order_number,
      'Tanggal & Waktu': formatDate(o.created_at),
      'Kasir': o.created_by_name,
      'Tipe Pesanan': o.order_type === 'dine_in' ? 'Dine In' : 'Takeaway',
      'Metode Pembayaran': o.payment.method.toUpperCase(),
      'Total Omzet (Rp)': o.total_amount
    }));

    exportToExcel(
      data,
      `Laporan_Penjualan_BoothDaily_${new Date().toISOString().slice(0, 10)}`,
      'Laporan Penjualan'
    );
    showToast('Laporan CSV/Excel berhasil diunduh', 'success');
  };

  // Export / Print PDF
  const handlePrintPDF = () => {
    const data = filteredOrders.map(o => [
      o.order_number,
      formatDate(o.created_at),
      o.created_by_name,
      o.order_type === 'dine_in' ? 'Dine In' : 'Takeaway',
      o.payment.method.toUpperCase(),
      formatRupiah(o.total_amount)
    ]);

    exportReportToPDF({
      title: 'Laporan Penjualan',
      data,
      headers: ['No. Pesanan', 'Tanggal & Waktu', 'Kasir', 'Tipe', 'Pembayaran', 'Total Omzet'],
      filename: `Laporan_Penjualan_BoothDaily_${new Date().toISOString().slice(0, 10)}`,
      storeName: 'Booth Daily'
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6  ">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ">
        <div>
          <h1 className="text-2xl font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#C68B59]" />
            Laporan Keuangan & Bisnis
          </h1>
          <p className="text-xs text-stone-500 font-medium">
            Analisis lengkap omzet penjualan, estimasi laba kotor, HPP, produk terlaris, dan pengeluaran restok.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrintPDF}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 text-stone-800 dark:text-stone-200 text-xs font-bold transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#C68B59]" />
            Cetak Laporan PDF
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#3B2A1F] hover:bg-[#2A1E16] text-[#F7F5F2] text-xs font-extrabold shadow-md transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#D4A373]" />
            Export Excel (CSV)
          </button>
        </div>
      </div>


      {/* Date Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#1E1C1A] p-4 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm ">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'today', label: 'Hari Ini' },
            { id: 'week', label: '7 Hari Terakhir' },
            { id: 'month', label: 'Bulan Ini' },
            { id: 'custom', label: 'Kustom Rentang' }
          ].map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setDateFilter(f.id as DateFilterType)}
              className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all border cursor-pointer whitespace-nowrap ${
                dateFilter === f.id
                  ? 'bg-[#3B2A1F] text-[#F7F5F2] border-[#3B2A1F] shadow-sm'
                  : 'bg-stone-50 dark:bg-[#171514] text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:border-stone-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {dateFilter === 'custom' && (
          <div className="flex items-center gap-2 text-xs font-bold w-full sm:w-auto">
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-[#171514] border border-stone-300 dark:border-stone-700"
            />
            <span className="text-stone-400">s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-[#171514] border border-stone-300 dark:border-stone-700"
            />
          </div>
        )}
      </div>

      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Omzet */}
        <div className="p-5 bg-white dark:bg-[#1E1C1A] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-extrabold text-stone-400 uppercase tracking-wider">TOTAL OMZET</span>
            <div className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#3B2A1F] dark:text-[#D4A373]">{formatRupiah(totalOmzet)}</p>
          <p className="text-[11px] text-stone-500 font-semibold">{totalOrdersCount} Transaksi Berhasil</p>
        </div>

        {/* Card 2: Laba Kotor */}
        <div className="p-5 bg-white dark:bg-[#1E1C1A] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-extrabold text-stone-400 uppercase tracking-wider">LABA KOTOR (PROFIT)</span>
            <div className="p-2 rounded-2xl bg-[#C68B59]/10 text-[#C68B59]">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatRupiah(grossProfit)}</p>
          <p className="text-[11px] text-stone-500 font-semibold">Omzet minus Estimasi HPP ({formatRupiah(totalHPP)})</p>
        </div>

        {/* Card 3: Belanja Restok */}
        <div className="p-5 bg-white dark:bg-[#1E1C1A] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-extrabold text-stone-400 uppercase tracking-wider">PENGELUARAN RESTOK</span>
            <div className="p-2 rounded-2xl bg-rose-500/10 text-rose-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400">{formatRupiah(totalPurchasesAmount)}</p>
          <p className="text-[11px] text-stone-500 font-semibold">{purchases.length} Nota Pembelian Bahan</p>
        </div>

        {/* Card 4: Basket Size */}
        <div className="p-5 bg-white dark:bg-[#1E1C1A] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-extrabold text-stone-400 uppercase tracking-wider">RATA-RATA STRUK</span>
            <div className="p-2 rounded-2xl bg-amber-500/10 text-amber-600">
              <Coffee className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-stone-900 dark:text-stone-100">{formatRupiah(avgOrderValue)}</p>
          <p className="text-[11px] text-stone-500 font-semibold">Per transaksi pelanggan</p>
        </div>
      </div>

      {/* SECTION 1 & 2: Order Type & Payment Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Order Type */}
        <div className="p-5 bg-white dark:bg-[#1E1C1A] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#C68B59]" />
            Penjualan Berdasarkan Tipe Pesanan
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-stone-50 dark:bg-[#171514] rounded-2xl border border-stone-200 dark:border-stone-800 flex justify-between items-center">
              <div>
                <p className="font-extrabold text-stone-800 dark:text-stone-200 text-sm">🪑 Dine In (Minum di Tempat)</p>
                <p className="text-stone-400 text-[11px] font-semibold">{dineInOrders.length} Pesanan</p>
              </div>
              <span className="font-black text-[#3B2A1F] dark:text-[#D4A373] text-sm">{formatRupiah(dineInTotal)}</span>
            </div>

            <div className="p-3 bg-stone-50 dark:bg-[#171514] rounded-2xl border border-stone-200 dark:border-stone-800 flex justify-between items-center">
              <div>
                <p className="font-extrabold text-stone-800 dark:text-stone-200 text-sm"><ShoppingBag className="w-4 h-4 mr-2 inline" /> Takeaway (Bawa Pulang)</p>
                <p className="text-stone-400 text-[11px] font-semibold">{takeawayOrders.length} Pesanan</p>
              </div>
              <span className="font-black text-[#3B2A1F] dark:text-[#D4A373] text-sm">{formatRupiah(takeawayTotal)}</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="p-5 bg-white dark:bg-[#1E1C1A] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#C68B59]" />
            Rincian Metode Pembayaran
          </h3>

          <div className="space-y-2 text-xs">
            <div className="p-3 bg-stone-50 dark:bg-[#171514] rounded-2xl border border-stone-200 dark:border-stone-800 flex justify-between items-center">
              <span className="font-extrabold text-stone-800 dark:text-stone-200"><Banknote className="w-4 h-4 mr-2 inline" /> Tunai (Cash)</span>
              <span className="font-black text-emerald-600">{formatRupiah(paymentBreakdown.cash)}</span>
            </div>

            <div className="p-3 bg-stone-50 dark:bg-[#171514] rounded-2xl border border-stone-200 dark:border-stone-800 flex justify-between items-center">
              <span className="font-extrabold text-stone-800 dark:text-stone-200"><QrCode className="w-4 h-4 mr-2 inline" /> QRIS / E-Wallet</span>
              <span className="font-black text-[#3B2A1F] dark:text-[#D4A373]">{formatRupiah(paymentBreakdown.qris)}</span>
            </div>

            <div className="p-3 bg-stone-50 dark:bg-[#171514] rounded-2xl border border-stone-200 dark:border-stone-800 flex justify-between items-center">
              <span className="font-extrabold text-stone-800 dark:text-stone-200"><CreditCard className="w-4 h-4 mr-2 inline" /> Debit / Transfer Bank</span>
              <span className="font-black text-stone-700 dark:text-stone-300">{formatRupiah(paymentBreakdown.debit)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: TOP SELLING PRODUCTS */}
      <div className="p-5 bg-white dark:bg-[#1E1C1A] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <h3 className="font-extrabold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <Coffee className="w-4 h-4 text-[#C68B59]" />
          Produk Terlaris (Top Selling Menu)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-[#23201D] border-b border-stone-200 dark:border-stone-800 text-stone-500 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="p-3">Peringkat</th>
                <th className="p-3">Nama Menu</th>
                <th className="p-3 text-center">Total Terjual</th>
                <th className="p-3 text-right">Total Pendapatan Omzet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800 font-medium">
              {topProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-stone-400 font-semibold">
                    Belum ada transaksi produk.
                  </td>
                </tr>
              ) : (
                topProducts.slice(0, 10).map((item, idx) => (
                  <tr key={idx} className="hover:bg-stone-50 dark:hover:bg-[#25221F]">
                    <td className="p-3 font-black text-stone-400 text-sm">#{idx + 1}</td>
                    <td className="p-3 font-extrabold text-stone-900 dark:text-stone-100 text-sm">{item.name}</td>
                    <td className="p-3 text-center font-black">
                      <span className="px-3 py-1 rounded-full bg-[#C68B59]/10 text-[#C68B59]">
                        {item.qty} Porsi
                      </span>
                    </td>
                    <td className="p-3 text-right font-black text-[#3B2A1F] dark:text-[#D4A373] text-sm">
                      {formatRupiah(item.totalSales)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 4: LOW STOCKS PERINGATAN */}
      {lowStocks.length > 0 && (
        <div className="p-5 bg-rose-500/10 rounded-3xl border border-rose-500/20 space-y-3">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-black text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Peringatan Stok Bahan Baku Menipis / Habis ({lowStocks.length})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            {lowStocks.map(s => (
              <div key={s.id} className="p-3 bg-white dark:bg-[#1E1C1A] rounded-2xl border border-rose-200 dark:border-rose-900/40 flex justify-between items-center">
                <span className="font-extrabold text-stone-900 dark:text-stone-100">{s.name}</span>
                <span className="font-black text-rose-600">
                  {s.current_amount} / {s.min_amount} {s.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
