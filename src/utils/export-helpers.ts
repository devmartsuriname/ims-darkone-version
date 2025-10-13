import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
}

export interface ExportData {
  [key: string]: any;
}

/**
 * Export data to CSV format
 */
export const exportToCSV = (
  data: ExportData[],
  columns: ExportColumn[],
  filename: string
) => {
  const headers = columns.map(col => col.header);
  const rows = data.map(item => 
    columns.map(col => {
      const value = item[col.key];
      // Handle nested objects and arrays
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
      }
      // Escape commas and quotes in CSV
      return `"${String(value || '').replace(/"/g, '""')}"`;
    })
  );

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  downloadFile(csvContent, `${filename}.csv`, 'text/csv');
};

/**
 * Export data to Excel-compatible CSV format
 */
export const exportToExcel = (
  data: ExportData[],
  columns: ExportColumn[],
  filename: string
) => {
  // Add BOM for Excel UTF-8 recognition
  const BOM = '\uFEFF';
  const headers = columns.map(col => col.header);
  const rows = data.map(item => 
    columns.map(col => {
      const value = item[col.key];
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
      }
      return `"${String(value || '').replace(/"/g, '""')}"`;
    })
  );

  const csvContent = BOM + [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8');
};

/**
 * Export data to PDF format with table
 */
export const exportToPDF = (
  data: ExportData[],
  columns: ExportColumn[],
  filename: string,
  title?: string
) => {
  const doc = new jsPDF('l', 'mm', 'a4');

  // Add title
  if (title) {
    doc.setFontSize(16);
    doc.text(title, 14, 15);
  }

  // Prepare table data
  const headers = columns.map(col => col.header);
  const rows = data.map(item => 
    columns.map(col => {
      const value = item[col.key];
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
      }
      return String(value || '');
    })
  );

  // Add table
  doc.autoTable({
    head: [headers],
    body: rows,
    startY: title ? 25 : 15,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] },
    columnStyles: columns.reduce((acc, col, index) => {
      if (col.width) {
        acc[index] = { cellWidth: col.width };
      }
      return acc;
    }, {} as any)
  });

  doc.save(`${filename}.pdf`);
};

/**
 * Export data to JSON format
 */
export const exportToJSON = (
  data: ExportData[],
  filename: string
) => {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, `${filename}.json`, 'application/json');
};

/**
 * Helper function to trigger file download
 */
const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};

/**
 * Format date for export
 */
export const formatDateForExport = (date: string | Date | null): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('nl-NL');
};

/**
 * Format currency for export
 */
export const formatCurrencyForExport = (amount: number | null): string => {
  if (!amount) return '0.00';
  return amount.toFixed(2);
};
