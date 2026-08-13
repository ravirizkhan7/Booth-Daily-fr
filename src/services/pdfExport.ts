import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PrintReportOptions {
  title: string;
  data: any[];
  headers: string[];
  filename: string;
  storeName?: string;
}

export const exportReportToPDF = ({
  title,
  data,
  headers,
  filename,
  storeName = 'Booth Daily'
}: PrintReportOptions) => {
  const doc = new jsPDF();
  
  // Title & Header
  doc.setFontSize(20);
  doc.text(storeName, 14, 22);
  
  doc.setFontSize(14);
  doc.text(title, 14, 32);
  
  doc.setFontSize(10);
  const date = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(`Tanggal Cetak: ${date}`, 14, 40);

  // Table
  autoTable(doc, {
    startY: 45,
    head: [headers],
    body: data,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 42, 31], // #3B2A1F
      textColor: 255,
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 9,
      textColor: 50,
    },
    alternateRowStyles: {
      fillColor: [247, 245, 242], // #F7F5F2
    },
    margin: { top: 45 },
  });

  // Footer with Page Numbers
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Halaman ${i} dari ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  // Save PDF
  doc.save(`${filename}.pdf`);
};
