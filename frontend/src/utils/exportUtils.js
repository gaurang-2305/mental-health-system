// PDF/Excel export – Module 29
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export function exportToPDF(data, filename) {
  const doc = new jsPDF();
  doc.text(JSON.stringify(data), 10, 10);
  doc.save(filename);
}

export function exportToExcel(data, filename) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, filename);
}
