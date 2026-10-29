/**
 * Utility functions for exporting data to CSV and JSON downloads.
 */

export function exportToCsv(filename: string, rows: Record<string, any>[]): void {
  if (!rows || rows.length === 0) {
    alert('No data available to export.');
    return;
  }

  // Extract all unique headers
  const headers = Array.from(
    new Set(
      rows.flatMap((r) => Object.keys(r))
    )
  );

  const csvRows: string[] = [];
  
  // Header row
  csvRows.push(headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','));

  // Data rows
  for (const row of rows) {
    const values = headers.map((header) => {
      const val = row[header];
      if (val === null || val === undefined) return '""';
      if (typeof val === 'object') {
        return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
      }
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToJson(filename: string, data: any): void {
  if (data === undefined || data === null) {
    alert('No data available to export.');
    return;
  }

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.json') ? filename : `${filename}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

