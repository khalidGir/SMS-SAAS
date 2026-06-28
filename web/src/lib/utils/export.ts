export function downloadCsv(filename: string, headers: string[], rows: string[][]) {
  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.map(cell => {
      const s = String(cell ?? '');
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename.replace(/[^a-zA-Z0-9_-]/g, '_')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export const PRINT_STYLESHEET = `
@media print {
  @page { margin: 12mm; size: landscape; }
  body { font-family: 'Inter', system-ui, sans-serif; font-size: 10pt; color: #111; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #ccc; padding: 4px 6px; text-align: left; font-size: 8pt; }
  th { background: #f3f4f6 !important; font-weight: 600; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .no-print { display: none !important; }
  h1 { font-size: 14pt; margin-bottom: 4px; }
  .report-meta { font-size: 8pt; color: #666; margin-bottom: 12px; }
  .text-right { text-align: right; }
  .text-center { text-align: center; }
  .font-medium { font-weight: 500; }
  .text-green-600, .text-emerald-600 { color: #059669; }
  .text-red-600, .text-rose-600 { color: #dc2626; }
  .text-gray-900 { color: #111; }
  .text-gray-700 { color: #333; }
  .text-gray-500 { color: #666; }
  .bg-green-50, .bg-emerald-50 { background: #ecfdf5 !important; }
  .bg-red-50, .bg-rose-50 { background: #fef2f2 !important; }
  .bg-yellow-50, .bg-amber-50 { background: #fffbeb !important; }
  .truncate { white-space: normal; }
}
`;

export function printReport(title: string) {
  const style = document.createElement('style');
  style.textContent = PRINT_STYLESHEET;
  document.head.appendChild(style);
  window.print();
  document.head.removeChild(style);
}
