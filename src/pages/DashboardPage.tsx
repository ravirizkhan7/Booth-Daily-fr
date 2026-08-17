import React, { useEffect, useMemo, useState } from 'react';
import { usePOS } from '../hooks/usePOS';
import { formatRupiah, formatDate } from '../utils/formatters';
import {
  TrendingUp, DollarSign, ShoppingBag, AlertTriangle, Award,
  Calendar, ArrowUpRight, Coffee, CheckCircle2, Clock,
} from 'lucide-react';

type ChartFilter = 'weekly' | 'monthly' | 'yearly';

export const DashboardPage: React.FC = () => {
  const {
    currentUser,
    orders,
    products,
    stocks,
    openReceiptModal,
  } = usePOS();

  const isOwner = currentUser?.role === 'owner';

  const [currentTime, setCurrentTime] = useState(new Date());
  const [chartFilter, setChartFilter] = useState<ChartFilter>('weekly');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getLocalDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const parseOrderDate = (dateString: string) => {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date;
  };

  const todayKey = getLocalDateKey(currentTime);

  const todayOrders = useMemo(() => {
    return orders.filter(order => {
      const orderDate = parseOrderDate(order.created_at);
      return orderDate ? getLocalDateKey(orderDate) === todayKey : false;
    });
  }, [orders, todayKey]);

  const todayRevenue = useMemo(() => {
    return todayOrders.reduce(
      (sum, order) => sum + Number(order.total_amount || 0),
      0
    );
  }, [todayOrders]);

  const todayCount = todayOrders.length;

  const todayGrossProfit = useMemo(() => {
    return todayOrders.reduce((sum, order) => {
      const orderCost = order.items.reduce((itemSum, item) => {
        const prod = products.find(p => p.id === item.product_id);
        const unitCost = prod
          ? Number(prod.cost_price || 0)
          : Number(item.price || 0) * 0.35;

        return itemSum + unitCost * item.qty;
      }, 0);

      return sum + (Number(order.total_amount || 0) - orderCost);
    }, 0);
  }, [todayOrders, products]);

  const lowStockItems = stocks.filter(
    stock => stock.current_amount <= stock.min_amount
  );

  const productSalesMap = useMemo(() => {
    const map: {
      [key: string]: {
        name: string;
        qty: number;
        revenue: number;
      };
    } = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        if (!map[item.product_name]) {
          map[item.product_name] = {
            name: item.product_name,
            qty: 0,
            revenue: 0,
          };
        }

        map[item.product_name].qty += item.qty;
        map[item.product_name].revenue += Number(item.subtotal || 0);
      });
    });

    return map;
  }, [orders]);

  const topProducts = useMemo(() => {
    return Object.values(productSalesMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [productSalesMap]);

  const chartData = useMemo(() => {
    const now = currentTime;

    if (chartFilter === 'weekly') {
      const data = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setHours(0, 0, 0, 0);
        date.setDate(now.getDate() - i);

        const dateKey = getLocalDateKey(date);

        const revenue = orders.reduce((sum, order) => {
          const orderDate = parseOrderDate(order.created_at);

          if (
            orderDate &&
            getLocalDateKey(orderDate) === dateKey
          ) {
            return sum + Number(order.total_amount || 0);
          }

          return sum;
        }, 0);

        const dayName = date.toLocaleDateString('id-ID', {
          weekday: 'short',
        });

        data.push({
          label:
            i === 0
              ? 'Hari Ini'
              : dayName.charAt(0).toUpperCase() + dayName.slice(1),
          shortLabel:
            dayName.charAt(0).toUpperCase() + dayName.slice(1),
          revenue,
        });
      }

      return data;
    }

    if (chartFilter === 'monthly') {
      const year = now.getFullYear();
      const month = now.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const data = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateKey = getLocalDateKey(date);

        const revenue = orders.reduce((sum, order) => {
          const orderDate = parseOrderDate(order.created_at);

          if (
            orderDate &&
            getLocalDateKey(orderDate) === dateKey
          ) {
            return sum + Number(order.total_amount || 0);
          }

          return sum;
        }, 0);

        data.push({
          label: String(day),
          shortLabel: String(day),
          revenue,
        });
      }

      return data;
    }

    const year = now.getFullYear();

    const data = [];

    for (let month = 0; month < 12; month++) {
      const revenue = orders.reduce((sum, order) => {
        const orderDate = parseOrderDate(order.created_at);

        if (
          orderDate &&
          orderDate.getFullYear() === year &&
          orderDate.getMonth() === month
        ) {
          return sum + Number(order.total_amount || 0);
        }

        return sum;
      }, 0);

      const monthName = new Date(year, month, 1).toLocaleDateString(
        'id-ID',
        {
          month: 'short',
        }
      );

      data.push({
        label:
          monthName.charAt(0).toUpperCase() + monthName.slice(1),
        shortLabel:
          monthName.charAt(0).toUpperCase() + monthName.slice(1),
        revenue,
      });
    }

    return data;
  }, [orders, currentTime, chartFilter]);

  const chartTotalRevenue = useMemo(() => {
    return chartData.reduce(
      (sum, item) => sum + item.revenue,
      0
    );
  }, [chartData]);

  const maxChartRevenue = useMemo(() => {
    return Math.max(
      ...chartData.map(item => item.revenue),
      1
    );
  }, [chartData]);

  const chartTitle = useMemo(() => {
    switch (chartFilter) {
      case 'monthly':
        return 'Grafik Penjualan Bulanan';
      case 'yearly':
        return 'Grafik Penjualan Tahunan';
      default:
        return 'Grafik Penjualan Mingguan';
    }
  }, [chartFilter]);

  const chartDescription = useMemo(() => {
    switch (chartFilter) {
      case 'monthly':
        return 'Omzet per hari pada bulan berjalan';
      case 'yearly':
        return `Omzet per bulan tahun ${currentTime.getFullYear()}`;
      default:
        return 'Omzet 7 hari terakhir Booth Daily';
    }
  }, [chartFilter, currentTime]);

  const chartPeriodLabel = useMemo(() => {
    switch (chartFilter) {
      case 'monthly':
        return currentTime.toLocaleDateString('id-ID', {
          month: 'long',
          year: 'numeric',
        });

      case 'yearly':
        return String(currentTime.getFullYear());

      default:
        return '7 Hari Terakhir';
    }
  }, [chartFilter, currentTime]);

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

        <div className="relative z-10 flex items-center gap-3 bg-white/10 px-4 py-2.5 rounded-2xl backdrop-blur-md border border-white/10">
          <Calendar className="w-4 h-4 text-[#D4A373]" />

          <div className="flex flex-col">
            <span className="text-xs font-bold text-white">
              {currentTime.toLocaleDateString('id-ID', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </span>

            <span className="text-sm text-stone-200 font-black tabular-nums tracking-wide">
              {currentTime.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Omzet Hari Ini */}
        <div className="p-5 bg-white dark:bg-[#1E1C1A] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-stone-500 uppercase">
              Omzet Hari Ini
            </span>

            <div className="p-2 rounded-xl bg-amber-500/10 text-[#C68B59]">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <p className="text-2xl font-black text-stone-900 dark:text-stone-100">
            {formatRupiah(todayRevenue)}
          </p>

          <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Real dari transaksi hari ini
          </p>
        </div>

        {/* Total Transaksi */}
        <div className="p-5 bg-white dark:bg-[#1E1C1A] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-stone-500 uppercase">
              Jumlah Transaksi
            </span>

            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>

          <p className="text-2xl font-black text-stone-900 dark:text-stone-100">
            {todayCount} Transaksi
          </p>

          <p className="text-[11px] text-stone-500 font-medium">
            Rata-rata:{' '}
            {todayCount > 0
              ? formatRupiah(todayRevenue / todayCount)
              : 'Rp 0'}{' '}
            / transaksi
          </p>
        </div>

        {/* Laba Kotor */}
        {isOwner ? (
          <div className="p-5 bg-white dark:bg-[#1E1C1A] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-stone-500 uppercase">
                Estimasi Laba Kotor
              </span>

              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <p className="text-2xl font-black text-emerald-600">
              {formatRupiah(todayGrossProfit)}
            </p>

            <p className="text-[11px] text-stone-500 font-medium">
              Berdasarkan harga modal produk
            </p>
          </div>
        ) : (
          <div className="p-5 bg-white dark:bg-[#1E1C1A] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-stone-500 uppercase">
                Status Kasir
              </span>

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

        {/* Low Stock */}
        <div className="p-5 bg-white dark:bg-[#1E1C1A] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-stone-500 uppercase">
              Peringatan Stok
            </span>

            <div
              className={`p-2 rounded-xl ${lowStockItems.length > 0
                ? 'bg-rose-500/10 text-rose-600'
                : 'bg-emerald-500/10 text-emerald-600'
                }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <p className="text-2xl font-black text-stone-900 dark:text-stone-100">
            {lowStockItems.length} Bahan Menipis
          </p>

          <p className="text-[11px] text-stone-500 font-medium">
            {lowStockItems.length > 0
              ? 'Perlu pembelian ulang segera'
              : 'Semua bahan aman'}
          </p>
        </div>
      </div>

      {/* Owner Specific Analytics Section */}
      {isOwner && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Chart */}
          <div className="lg:col-span-2 p-6 bg-white dark:bg-[#1E1C1A] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                  {chartTitle}
                </h3>

                <p className="text-xs text-stone-500">
                  {chartDescription}
                </p>
              </div>

              <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl">
                <button
                  onClick={() => setChartFilter('weekly')}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${chartFilter === 'weekly'
                    ? 'bg-[#3B2A1F] text-white shadow-sm'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                    }`}
                >
                  Mingguan
                </button>

                <button
                  onClick={() => setChartFilter('monthly')}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${chartFilter === 'monthly'
                    ? 'bg-[#3B2A1F] text-white shadow-sm'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                    }`}
                >
                  Bulanan
                </button>

                <button
                  onClick={() => setChartFilter('yearly')}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${chartFilter === 'yearly'
                    ? 'bg-[#3B2A1F] text-white shadow-sm'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                    }`}
                >
                  Tahunan
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] text-stone-500 font-semibold uppercase">
                  Periode
                </p>

                <p className="text-sm font-black text-stone-800 dark:text-stone-200">
                  {chartPeriodLabel}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[10px] text-stone-500 font-semibold uppercase">
                  Total Omzet
                </p>

                <p className="text-sm font-black text-[#C68B59]">
                  {formatRupiah(chartTotalRevenue)}
                </p>
              </div>
            </div>

            {/* Dynamic Bar Chart */}
            <div className="pt-2 h-64 flex items-end justify-between gap-1 sm:gap-2 px-1 overflow-hidden">
              {chartData.map((item, idx) => {
                const heightPct =
                  item.revenue > 0
                    ? Math.max(
                      5,
                      Math.round(
                        (item.revenue / maxChartRevenue) * 100
                      )
                    )
                    : 2;

                const shouldShowLabel =
                  chartFilter === 'weekly' ||
                  chartFilter === 'yearly' ||
                  chartData.length <= 15 ||
                  idx % Math.ceil(chartData.length / 10) === 0;

                return (
                  <div
                    key={`${item.label}-${idx}`}
                    className="flex-1 min-w-0 flex flex-col items-center gap-2 group h-full justify-end"
                  >
                    <div className="relative w-full h-40 flex items-end justify-center">
                      <span className="absolute -top-5 text-[9px] sm:text-[10px] font-bold text-[#C68B59] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {formatRupiah(item.revenue)}
                      </span>

                      <div className="w-full h-full bg-stone-100 dark:bg-stone-800 rounded-xl overflow-hidden flex items-end p-0.5 sm:p-1">
                        <div
                          style={{
                            height: `${heightPct}%`,
                          }}
                          className="w-full bg-[#3B2A1F] dark:bg-[#D4A373] rounded-lg transition-all duration-500 group-hover:bg-[#C68B59]"
                        />
                      </div>
                    </div>

                    <span
                      className={`text-[9px] sm:text-[10px] font-bold text-stone-500 dark:text-stone-400 truncate max-w-full ${shouldShowLabel ? 'opacity-100' : 'opacity-0'
                        }`}
                    >
                      {item.shortLabel}
                    </span>
                  </div>
                );
              })}
            </div>

            {chartTotalRevenue === 0 && (
              <div className="text-center text-xs text-stone-400">
                Belum ada transaksi pada periode ini.
              </div>
            )}
          </div>

          {/* Top Products */}
          <div className="p-6 bg-white dark:bg-[#1E1C1A] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Award className="w-4 h-4 text-[#C68B59]" />
                Produk Terlaris
              </h3>
            </div>

            <div className="space-y-3">
              {topProducts.length > 0 ? (
                topProducts.map((p, idx) => (
                  <div
                    key={p.name}
                    className="flex items-center justify-between p-2.5 bg-stone-50 dark:bg-[#25221F] rounded-2xl border border-stone-100 dark:border-stone-800"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-xl bg-[#3B2A1F] text-[#F7F5F2] font-black text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>

                      <div>
                        <p className="text-xs font-bold text-stone-800 dark:text-stone-200 line-clamp-1">
                          {p.name}
                        </p>

                        <p className="text-[10px] text-stone-500 font-semibold">
                          {p.qty} cup terjual
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-extrabold text-[#C68B59]">
                      {formatRupiah(p.revenue)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-stone-400">
                  Belum ada data penjualan.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="p-6 bg-white dark:bg-[#1E1C1A] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-3">
          <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#C68B59]" />
            Transaksi Terbaru
          </h3>

          <span className="text-xs font-semibold text-stone-500">
            {isOwner
              ? 'Semua Kasir'
              : 'Aktivitas Saya Hari Ini'}
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
                      {order.order_type === 'dine_in'
                        ? 'Dine In'
                        : 'Take Away'}
                    </span>
                  </div>

                  <p className="text-xs text-stone-500">
                    Kasir: {order.created_by_name} •{' '}
                    {order.items.length} Menu •{' '}
                    {formatDate(order.created_at)}
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