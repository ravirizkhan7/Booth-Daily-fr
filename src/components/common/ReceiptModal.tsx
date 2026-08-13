import React from 'react';
import { usePOS } from '../../hooks/usePOS';
import { formatRupiah, formatDate } from '../../utils/formatters';
import { X, Printer, Share2, CheckCircle2, Coffee } from 'lucide-react';
import { printReceipt } from '../../services/receiptPrint';

export const ReceiptModal: React.FC = () => {
  const { isReceiptModalOpen, closeReceiptModal, currentReceiptOrder, settings, showToast } = usePOS();

  if (!isReceiptModalOpen || !currentReceiptOrder) return null;

  const handlePrint = () => {
    printReceipt(currentReceiptOrder, settings);
    showToast('Struk sedang dicetak...', 'success');
  };

  const handleCopyText = () => {
    const text = `
*${settings.store_name}*
${settings.address}
--------------------------------
No. Pesanan: ${currentReceiptOrder.order_number}
Tanggal    : ${formatDate(currentReceiptOrder.created_at)}
Kasir      : ${currentReceiptOrder.created_by_name}
Tipe       : ${currentReceiptOrder.order_type === 'dine_in' ? 'DINE IN' : 'TAKE AWAY'}
--------------------------------
${currentReceiptOrder.items
  .map(item => `${item.qty}x ${item.product_name} @ ${formatRupiah(item.price)}\n   Subtotal: ${formatRupiah(item.subtotal)}${item.notes ? `\n   Catatan: ${item.notes}` : ''}`)
  .join('\n')}
--------------------------------
Total     : ${formatRupiah(currentReceiptOrder.total_amount)}
Pembayaran: ${currentReceiptOrder.payment.method.toUpperCase()}
Diterima  : ${formatRupiah(currentReceiptOrder.payment.amount_paid)}
Kembali   : ${formatRupiah(currentReceiptOrder.payment.change)}
--------------------------------
${settings.receipt_footer}
    `.trim();

    navigator.clipboard.writeText(text);
    showToast('Struk berhasil disalin ke clipboard!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#F7F5F2] dark:bg-[#1A1816] rounded-3xl shadow-2xl border border-stone-300 dark:border-stone-800 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#10B981] text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-white" />
            <div>
              <h3 className="font-bold text-base leading-tight">Transaksi Sukses!</h3>
              <p className="text-xs text-emerald-100">{currentReceiptOrder.order_number}</p>
            </div>
          </div>
          <button
            onClick={closeReceiptModal}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div
            id="printable-receipt"
            className="bg-white text-stone-900 p-6 rounded-2xl border border-stone-200 shadow-inner font-mono text-xs space-y-3"
          >
            {/* Store Header */}
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-stone-300">
              <div className="flex justify-center items-center gap-1 font-bold text-base tracking-widest text-[#3B2A1F]">
                <Coffee className="w-4 h-4 text-[#C68B59]" />
                {settings.store_name}
              </div>
              <p className="text-[10px] text-stone-500 uppercase tracking-wider">{settings.tagline}</p>
              <p className="text-[10px] text-stone-600">{settings.address}</p>
              <p className="text-[10px] text-stone-600">Telp: {settings.phone}</p>
            </div>

            {/* Order Info */}
            <div className="text-[11px] space-y-1 border-b border-dashed border-stone-300 pb-3">
              <div className="flex justify-between">
                <span className="text-stone-500">No:</span>
                <span className="font-bold">{currentReceiptOrder.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Waktu:</span>
                <span>{formatDate(currentReceiptOrder.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Kasir:</span>
                <span>{currentReceiptOrder.created_by_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Tipe Pesanan:</span>
                <span className="font-bold uppercase text-[#C68B59]">
                  {currentReceiptOrder.order_type === 'dine_in' ? 'DINE IN' : 'TAKE AWAY'}
                  {currentReceiptOrder.customer_name ? ` (${currentReceiptOrder.customer_name})` : ''}
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2 border-b border-dashed border-stone-300 pb-3">
              {currentReceiptOrder.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between font-bold">
                    <span>
                      {item.qty}x {item.product_name}
                    </span>
                    <span>{formatRupiah(item.subtotal)}</span>
                  </div>
                  {item.notes && (
                    <div className="text-[10px] text-stone-500 italic pl-3">
                      Catatan: {item.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Total & Payment */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-sm font-black text-stone-900 pt-1">
                <span>TOTAL:</span>
                <span>{formatRupiah(currentReceiptOrder.total_amount)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Metode Bayar:</span>
                <span className="font-bold uppercase">{currentReceiptOrder.payment.method}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Diterima:</span>
                <span>{formatRupiah(currentReceiptOrder.payment.amount_paid)}</span>
              </div>
              <div className="flex justify-between text-stone-600 font-bold">
                <span>Kembalian:</span>
                <span>{formatRupiah(currentReceiptOrder.payment.change)}</span>
              </div>
            </div>

            {/* Receipt Footer */}
            <div className="text-center pt-3 border-t border-dashed border-stone-300 text-[10px] text-stone-500 space-y-1">
              <p>{settings.receipt_header}</p>
              <p className="font-semibold text-stone-700">{settings.receipt_footer}</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white dark:bg-[#161413] border-t border-stone-200 dark:border-stone-800 flex flex-wrap gap-2.5 shrink-0">
          <button
            onClick={handleCopyText}
            className="flex-1 px-4 py-3 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Share2 className="w-4 h-4 text-[#C68B59]" />
            Salin Struk
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 px-4 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
          >
            <Printer className="w-4 h-4 text-white" />
            Cetak Struk
          </button>

          <button
            onClick={closeReceiptModal}
            className="w-full py-3 rounded-2xl bg-[#3B2A1F] hover:bg-[#2A1E16] text-[#F7F5F2] font-extrabold text-sm transition-all"
          >
            Selesai & Kembali ke Kasir
          </button>
        </div>
      </div>
    </div>
  );
};
