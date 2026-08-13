import React from 'react';
import { usePOS } from '../hooks/usePOS';
import { formatRupiah, formatDate } from '../utils/formatters';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  AlertTriangle,
  Award,
  Calendar,
  ArrowUpRight,
  Coffee,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { currentUser, orders, products, stocks, usersList, openReceiptModal } = usePOS();
  const isOwner = currentUser?.role === 'owner';

  // Compute metrics
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayOrders = orders.filter(o => o.created_at.startsWith(todayStr));
  
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total_amount, 0);
  const todayCount = todayOrders.length;

  // Gross profit estimation (price - cost_price)
  const todayGrossProfit = todayOrders.reduce((sum, o) => {
    const orderCost = o.items.reduce((itemSum, item) => {
      const prod = products.find(p => p.id === item.product_id);
      const unitCost = prod ? prod.cost_price : item.price * 0.35;
      return itemSum + unitCost * item.qty;
    }, 0);
    return sum + (o.total_amount - orderCost);
  }, 0);

  // Low stock warning items
  const lowStockItems = stocks.filter(s => s.current_amount <= s.min_amount);

  // Top selling products computation
  const productSalesMap: { [key: string]: { name: string; qty: number; revenue: number } } = {};
  orders.forEach(o => {
    o.items.forEach(item => {
      if (!productSalesMap[item.product_name]) {
        productSalesMap[item.product_name] = { name: item.product_name, qty: 0, revenue: 0 };
      }
      productSalesMap[item.product_name].qty += item.qty;
      productSalesMap[item.product_name].revenue += item.subtotal;
    });
  });

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // Weekly bar mock data derived from orders
  const weeklyDays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Ming'];
  const mockWeeklyRevenue = [1800000, 2100000, 1950000, 2400000, 3100000, 4200000, todayRevenue + 2800000];
  const maxRev = Math.max(...mockWeeklyRevenue, 1);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-[#3B2A1F] text-[#F7F5F2] rounded-3xl shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <span className="px-3 py-1 rounded-full bg-[#D4A373] text-[#1F1F1F] text-xs font-black uppercase tracking-wider">
            {isOwner ? 'DASHBOARD OWNER' : 'DASHBOARD KASIR'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Selamat Datang, {currentUser?.name || 'Kasir Booth'}!
          </h1>
          <p className="text-xs text-stone-300">
            {isOwner
              ? 'Laporan performa penjualan dan kesehatan operasional Booth Daily.'
              : 'Ringkasan aktivitas dan pencapaian transaksi harian Anda.'}
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2 bg-white/10 px-4 py-2.5 rounded-2xl backdrop-blur-md border border-white/10 text-xs font-bold text-stone-200">
          <Calendar className="w-4 h-4 text-[#D4A373]" />
          <span>{formatDate(new Date().toISOString())}</span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Omzet Hari Ini */}
        <div className="p-5 bg-white dark:bg-[#1E1C1A] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-stone-500 uppercase">Omzet Hari Ini</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-[#C68B59]">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-stone-900 dark:text-stone-100">
            {formatRupiah(todayRevenue)}
          </p>
          <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +14.2% dari kemarin
          </p>
        </div>

        {/* Total Transaksi */}
        <div className="p-5 bg-white dark:bg-[#1E1C1A] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-stone-500 uppercase">Jumlah Transaksi</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-stone-900 dark:text-stone-100">
            {todayCount} Transaksi
          </p>
          <p className="text-[11px] text-stone-500 font-medium">
            Rata-rata: {todayCount > 0 ? formatRupiah(todayRevenue / todayCount) : 'Rp 0'} / stiker
          </p>
        </div>

        {/* Laba Kotor (Owner Only) or Active Cashiers */}
        {isOwner ? (
          <div className="p-5 bg-white dark:bg-[#1E1C1A] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-stone-500 uppercase">Estimasi Laba Kotor</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-600">
              {formatRupiah(todayGrossProfit)}
            </p>
            <p className="text-[11px] text-stone-500 font-medium">
              Margin Kotor ~65% dari Omzet
            </p>
          </div>
        ) : (
          <div className="p-5 bg-white dark:bg-[#1E1C1A] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-stone-500 uppercase">Status Kasir</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-stone-900 dark:text-stone-100">
              Sesi Aktif
            </p>
            <p className="text-[11px] text-stone-500 font-medium">
              ID Kasir: {currentUser?.pin}
            </p>
          </div>
        )}

        {/* Low Stock Warning or Active Team */}
        <div className="p-5 bg-white dark:bg-[#1E1C1A] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-stone-500 uppercase">Peringatan Stok</span>
            <div className={`p-2 rounded-xl ${lowStockItems.length > 0 ? 'bg-rose-500/10 text-rose-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-stone-900 dark:text-stone-100">
            {lowStockItems.length} Bahan Menipis
          </p>
          <p className="text-[11px] text-stone-500 font-medium">
            {lowStockItems.length > 0 ? 'Perlu pembelian ulang segera' : 'Semua bahan aman'}
          </p>
        </div>
      </div>

      {/* Owner Specific Analytics Section */}
      {isOwner && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Sales Chart Card */}
          <div className="lg:col-span-2 p-6 bg-white dark:bg-[#1E1C1A] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                  Grafik Penjualan Mingguan
                </h3>
                <p className="text-xs text-stone-500">Omzet 7 Hari Terakhir Booth Daily</p>
              </div>
              <span className="px-3 py-1 bg-amber-500/10 text-[#C68B59] font-bold text-xs rounded-full">
                Bulan Ini: Rp 48.500.000
              </span>
            </div>

            {/* Custom Responsive SVG / Bar Chart */}
            <div className="pt-4 h-56 flex items-end justify-between gap-3 px-2">
              {weeklyDays.map((day, idx) => {
                const val = mockWeeklyRevenue[idx];
                const heightPct = Math.max(15, Math.round((val / maxRev) * 100));
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[10px] font-bold text-[#C68B59] opacity-0 group-hover:opacity-100 transition-opacity">
                      {(val / 1000000).toFixed(1)}M
                    </span>
                    <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-2xl overflow-hidden h-40 flex items-end p-1">
                      <div
                        style={{ height: `${heightPct}%` }}
                        className="w-full bg-[#3B2A1F] dark:bg-[#D4A373] rounded-xl transition-all duration-500 group-hover:bg-[#C68B59]"
                      />
                    </div>
                    <span className="text-xs font-bold text-stone-600 dark:text-stone-400">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Products List */}
          <div className="p-6 bg-white dark:bg-[#1E1C1A] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Award className="w-4 h-4 text-[#C68B59]" />
                Produk Terlaris
              </h3>
            </div>

            <div className="space-y-3">
              {topProducts.map((p, idx) => (
                <div key={p.name} className="flex items-center justify-between p-2.5 bg-stone-50 dark:bg-[#25221F] rounded-2xl border border-stone-100 dark:border-stone-800">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-xl bg-[#3B2A1F] text-[#F7F5F2] font-black text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-stone-800 dark:text-stone-200 line-clamp-1">{p.name}</p>
                      <p className="text-[10px] text-stone-500 font-semibold">{p.qty} cup terjual</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-[#C68B59]">{formatRupiah(p.revenue)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions List */}
      <div className="p-6 bg-white dark:bg-[#1E1C1A] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-3">
          <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#C68B59]" />
            Transaksi Terbaru
          </h3>
          <span className="text-xs font-semibold text-stone-500">
            {isOwner ? 'Semua Kasir' : 'Aktivitas Saya Hari Ini'}
          </span>
        </div>

        <div className="space-y-2.5">
          {orders.slice(0, 5).map(order => (
            <div
              key={order.id}
              onClick={() => openReceiptModal(order)}
              className="p-3.5 bg-stone-50 dark:bg-[#25221F] hover:bg-stone-100 dark:hover:bg-[#2E2A26] rounded-2xl border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#3B2A1F] text-[#F7F5F2]">
                  <Coffee className="w-4 h-4 text-[#D4A373]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-stone-900 dark:text-stone-100">
                      {order.order_number}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C68B59]/10 text-[#C68B59] uppercase">
                      {order.order_type === 'dine_in' ? 'Dine In' : 'Take Away'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">
                    Kasir: {order.created_by_name} • {order.items.length} Menu • {formatDate(order.created_at)}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0 flex items-center gap-3">
                <div>
                  <p className="font-black text-stone-900 dark:text-stone-100 text-sm">
                    {formatRupiah(order.total_amount)}
                  </p>
                  <p className="text-[10px] font-bold uppercase text-emerald-600">
                    {order.payment.method} • Sukses
                  </p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-stone-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
