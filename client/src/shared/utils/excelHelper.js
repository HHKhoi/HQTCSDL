/**
 * Utility for exporting and importing Excel/CSV data using SheetJS (XLSX) loaded via CDN.
 */

// Helper to check if XLSX is loaded
const getXLSX = () => {
  if (typeof window !== 'undefined' && window.XLSX) {
    return window.XLSX;
  }
  throw new Error('Thư viện Excel (SheetJS) chưa được tải thành công. Vui lòng tải lại trang.');
};

/**
 * Export JSON data to Excel file
 * @param {Array<Object>} data - Array of objects to export
 * @param {string} fileName - Name of the output file (e.g. 'cars.xlsx')
 * @param {string} sheetName - Name of the worksheet (e.g. 'Danh sách xe')
 */
export const exportToExcel = (data, fileName = 'export.xlsx', sheetName = 'Sheet1') => {
  try {
    const XLSX = getXLSX();
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    
    // Auto-adjust column width for readability
    const maxCols = Object.keys(data[0] || {}).length;
    ws['!cols'] = Array(maxCols).fill({ wch: 18 });

    XLSX.writeFile(wb, fileName);
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
};

/**
 * Read Excel or CSV file and convert to JSON array
 * @param {File} file - The file uploaded by the user
 * @returns {Promise<Array<Object>>} - Resolves to an array of objects
 */
export const readExcelOrCsv = (file) => {
  return new Promise((resolve, reject) => {
    try {
      const XLSX = getXLSX();
      const isCSV = file.name.toLowerCase().endsWith('.csv');

      if (isCSV) {
        // For CSV files, read as text with UTF-8 to preserve Vietnamese characters
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const text = e.target.result;
            const workbook = XLSX.read(text, { type: 'string' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
            resolve(jsonData);
          } catch (err) {
            reject(new Error('Lỗi cấu trúc file CSV. Vui lòng kiểm tra lại.'));
          }
        };
        reader.onerror = () => reject(new Error('Lỗi khi đọc file CSV.'));
        reader.readAsText(file, 'UTF-8');
      } else {
        // For Excel files, read as array buffer
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
            resolve(jsonData);
          } catch (err) {
            reject(new Error('Lỗi cấu trúc file Excel. Vui lòng kiểm tra lại.'));
          }
        };
        reader.onerror = () => reject(new Error('Lỗi khi đọc file Excel.'));
        reader.readAsArrayBuffer(file);
      }
    } catch (error) {
      reject(error);
    }
  });
};
