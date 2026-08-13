import { formatRupiah, formatDate } from '../utils/formatters';

const getReceiptCSS = () => `
@page { margin: 0;}

body {
  margin: 0;
  padding: 10px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
  line-height: 1.4;
  color: #000;
  background: #fff;
  width: 80mm;
  max-width: 100%;
}

* { box-sizing: border-box; }
.receipt-copy { width: 80mm; box-sizing: border-box; }
.staff-copy { page-break-before: always; break-before: page; }
.text-center { text-align: center; }
.text-right { text-align: right; }
.text-left { text-align: left; }
.font-bold { font-weight: bold; }
.border-top { border-top: 1px dashed #000; }
.border-bottom { border-bottom: 1px dashed #000; }
.mb-1 { margin-bottom: 5px; }
.mb-2 { margin-bottom: 10px; }
.py-1 { padding-top: 5px; padding-bottom: 5px; }
.pt-1 { padding-top: 5px; }
.flex { display: flex; justify-content: space-between; }
.title { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
.subtitle { font-size: 10px; margin-bottom: 3px; }
.header-section { text-align: center; margin-bottom: 10px; }
.item-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
.item-name { flex-grow: 1; padding-right: 5px; }
.item-price { white-space: nowrap; }
.notes { font-size: 10px; font-style: italic; padding-left: 10px; }
.footer { text-align: center; margin-top: 15px; font-size: 10px; }
`;

export const printTestReceipt = (settings: any) => {
  const date = new Date();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Test Print</title>
      <style>
        ${getReceiptCSS()}
      </style>
    </head>

    <body>

      <div class="receipt-copy">

        <div class="header-section">
          <div class="title">
            ${settings.store_name || 'BOOTH DAILY'}
          </div>

          <div class="font-bold">
            PRINTER TEST
          </div>
        </div>

        <div class="mb-2">
          <div class="flex">
            <span>Tanggal:</span>
            <span>${date.toLocaleDateString('id-ID')}</span>
          </div>

          <div class="flex">
            <span>Waktu:</span>
            <span>${date.toLocaleTimeString('id-ID')}</span>
          </div>
        </div>

        <div class="py-1 mb-2">
          Test print berhasil.
        </div>

        <div class="footer border-top py-1">
          <div>${settings.store_name || 'Booth Daily'}</div>
          <div>Printer Test</div>
        </div>

      </div>

    </body>
    </html>
  `;

  executePrint(html);
};

export const printReceipt = (order: any, settings: any) => {
  const storeName = settings.store_name || 'BOOTH DAILY';

  const tagline = settings.tagline
    ? `<div class="subtitle">${settings.tagline}</div>`
    : '';

  const address = settings.address
    ? `<div class="subtitle">${settings.address}</div>`
    : '';

  const phone = settings.phone
    ? `<div class="subtitle">Telp: ${settings.phone}</div>`
    : '';

  const orderType =
    order.order_type === 'dine_in'
      ? 'DINE IN'
      : 'TAKE AWAY';

  const custName = order.customer_name
    ? ` (${order.customer_name})`
    : '';

  const customerItemsHtml = order.items
    .map(
      (item: any) => `
        <div class="mb-1">

          <div class="item-row font-bold">

            <div class="item-name">
              ${item.qty}x ${item.product_name}
            </div>

            <div class="item-price">
              ${formatRupiah(item.subtotal)}
            </div>

          </div>

          ${
            item.notes
              ? `<div class="notes">Catatan: ${item.notes}</div>`
              : ''
          }

        </div>
      `
    )
    .join('');

  const staffItemsHtml = order.items
    .map(
      (item: any) => `
        <div class="mb-2">

          <div class="item-row font-bold">

            <div class="item-name">
              ${item.qty}x ${item.product_name}
            </div>

          </div>

          ${
            item.notes
              ? `<div class="notes">Catatan: ${item.notes}</div>`
              : ''
          }

        </div>
      `
    )
    .join('');

  const customerReceipt = `
    <div class="receipt-copy">

      <div class="header-section">

        <div class="title">
          ${storeName}
        </div>

        ${tagline}
        ${address}
        ${phone}

      </div>

      <div class="mb-2" style="font-size: 10px;">

        <div class="flex">
          <span>No:</span>
          <span class="font-bold">
            ${order.order_number}
          </span>
        </div>

        <div class="flex">
          <span>Waktu:</span>
          <span>
            ${formatDate(order.created_at)}
          </span>
        </div>

        <div class="flex">
          <span>Kasir:</span>
          <span>
            ${order.created_by_name}
          </span>
        </div>

        <div class="flex">
          <span>Tipe:</span>
          <span class="font-bold">
            ${orderType}${custName}
          </span>
        </div>

      </div>

      <div class="border-top py-1 mb-2">

        ${customerItemsHtml}

      </div>

      <div class="border-top pt-1 mb-2">

        <div class="flex font-bold title">

          <span>TOTAL:</span>

          <span>
            ${formatRupiah(order.total_amount)}
          </span>

        </div>

      </div>

      <div class="mb-2" style="font-size: 10px;">

        <div class="flex">

          <span>Metode Bayar:</span>

          <span class="font-bold">
            ${order.payment.method.toUpperCase()}
          </span>

        </div>

        <div class="flex">

          <span>Diterima:</span>

          <span>
            ${formatRupiah(order.payment.amount_paid)}
          </span>

        </div>

        <div class="flex font-bold">

          <span>Kembalian:</span>

          <span>
            ${formatRupiah(order.payment.change)}
          </span>

        </div>

      </div>

      <div class="footer border-top py-1">

        ${
          settings.receipt_header
            ? `<div>${settings.receipt_header}</div>`
            : ''
        }

        ${
          settings.receipt_footer
            ? `<div class="font-bold">${settings.receipt_footer}</div>`
            : ''
        }

      </div>

    </div>
  `;

  const staffReceipt = `
    <div class="receipt-copy staff-copy">

      <div class="header-section">

        <div class="title">
          ${storeName}
        </div>

        <div class="font-bold">
          STAFF COPY
        </div>

        <div class="subtitle">
          DETAIL PESANAN
        </div>

      </div>

      <div class="border-top border-bottom py-1 mb-2" style="font-size: 10px;">

        <div class="flex">

          <span>No:</span>

          <span class="font-bold">
            ${order.order_number}
          </span>

        </div>

        <div class="flex">

          <span>Waktu:</span>

          <span>
            ${formatDate(order.created_at)}
          </span>

        </div>

        <div class="flex">

          <span>Tipe:</span>

          <span class="font-bold">
            ${orderType}
          </span>

        </div>

        ${
          order.customer_name
            ? `
              <div class="flex">
                <span>Pelanggan:</span>
                <span class="font-bold">
                  ${order.customer_name}
                </span>
              </div>
            `
            : ''
        }

      </div>

      <div class="py-1 mb-2">

        ${staffItemsHtml}

      </div>

      <div class="footer border-top py-1">

        <div class="font-bold">
          STAFF COPY
        </div>

        <div>
          Untuk Persiapan Pesanan
        </div>

      </div>

    </div>
  `;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>

      <meta charset="UTF-8">

      <title>
        Receipt_${order.order_number}
      </title>

      <style>
        ${getReceiptCSS()}
      </style>

    </head>

    <body>

      ${customerReceipt}

      ${staffReceipt}

    </body>

    </html>
  `;

  executePrint(html);
};

const executePrint = (html: string) => {
  const iframe = document.createElement('iframe');

  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';

  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;

  if (!doc) {
    document.body.removeChild(iframe);
    return;
  }

  doc.open();
  doc.write(html);
  doc.close();

  let cleanedUp = false;

  const cleanup = () => {
    if (cleanedUp) return;

    cleanedUp = true;

    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
  };

  iframe.onload = () => {
    const printWindow = iframe.contentWindow;

    if (!printWindow) {
      cleanup();
      return;
    }

    printWindow.focus();
    printWindow.addEventListener('afterprint', cleanup);
    printWindow.print();
    setTimeout(cleanup, 10000);
  };
};