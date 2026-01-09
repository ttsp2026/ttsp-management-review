import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Upload, CheckCircle, AlertTriangle, X, FileSpreadsheet } from 'lucide-react';
import { PDRRecord } from '../../types';

interface PDRUploadProps {
  onUpload: (data: PDRRecord[]) => void;
  onCancel: () => void;
}

const PDRUpload: React.FC<PDRUploadProps> = ({ onUpload, onCancel }) => {
  const [dragActive, setDragActive] = useState(false);
  const [parsedData, setParsedData] = useState<PDRRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Helper to convert Excel Date Serial or Strings to MM/DD/YYYY
  const excelDateToJSDate = (serial: any) => {
    if (!serial) return '';
    // If it's already a string with slashes, assume it's roughly correct, but ensure MM/DD/YYYY
    if (typeof serial === 'string') {
        if (serial.includes('/')) return serial; // Already formatted
        // Handle YYYY-MM-DD string
        if (serial.includes('-')) {
             const parts = serial.split('-');
             if (parts.length === 3) return `${parts[1]}/${parts[2]}/${parts[0]}`;
        }
        return serial;
    }
    
    // If it's a number (Excel Serial Date)
    if (typeof serial === 'number') {
        // Excel base date adjustment (approximate for simplicity)
        const date = new Date((serial - (25567 + 2)) * 86400 * 1000); 
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    }
    return String(serial);
  };

  const mapRowToRecord = (row: any): PDRRecord => {
    return {
        id: row['No'] ? parseInt(row['No']) : undefined,
        department: row['Department'] || row['department'] || '',
        group_name: row['Group'] || row['group_name'] || '',
        team: row['Team'] || row['team'] || '',
        year: row['Year'] ? parseInt(row['Year']) : new Date().getFullYear(),
        billing_month: row['Billing Month'] || row['billing_month'] || '',
        ship_number: row['Ship Number'] || row['Ship No'] || row['ship_number'] || '',
        revision_series_number: row['Revision Series Number'] || row['Series'] || '',
        revision_number: row['Revision Number'] || row['Rev'] || '',
        industry_number: row['Industry Number'] || row['Ind No'] || '',
        block_name_or_drawing_name: row['Block Name or Drawing Name'] || row['Block Name'] || '',
        drawing_number: row['Drawing Number'] || row['Drawing No'] || '',
        
        // Apply Date Formatting
        issuance_date: excelDateToJSDate(row['Issuance Date'] || row['issuance_date']),
        original_t_dreams_delivery: excelDateToJSDate(row['Original T-Dreams Delivery'] || row['Orig T-Dreams Del'] || ''),

        manhour_spent: row['Manhour Spent'] || row['M/H'] ? parseFloat(row['Manhour Spent'] || row['M/H']) : 0,
        responsible_team: row['Responsible Team'] || '',
        origin: row['Origin'] || '',
        designer: row['Designer'] || '',
        checker: row['Checker'] || '',
        revised_by: row['Revised by'] || row['Revised By'] || '',
        reason_of_revision: row['Reason of Revision'] || row['Reason'] || '',
        design_update_code: row['Design Update Code'] || row['Code'] || '',
        from_d_number: row['From D Number'] || row['From D#'] || '',
        type_of_error: row['Type of Error'] || row['Error Type'] || '',
        detail_cause_of_error: row['Detail Cause of Error'] || row['Detail Cause'] || '',
        general_cause_of_error: row['General Cause of Error'] || row['General Cause'] || '',
        damage: row['Damage'] || 'N',
        number_of_piece_with_damage: (row['Number of Piece With Damage'] || row['Pcs Damage']) ? parseInt(row['Number of Piece With Damage'] || row['Pcs Damage']) : 0,
        number_of_piece_without_damage: (row['Number of Piece Without Damage'] || row['Pcs No Damage']) ? parseInt(row['Number of Piece Without Damage'] || row['Pcs No Damage']) : 0,
        cost_of_damage: (row['Cost of Damage ¥'] || row['Cost']) ? parseFloat(row['Cost of Damage ¥'] || row['Cost']) : 0,
        remarks: row['Remarks'] || '',
        revision_family_number: row['Revision Family Number'] || row['Family'] || '',
        add_info: row['Add Info'] || '',
        update_info: row['Update Info'] || '',
    } as PDRRecord;
  };

  const processFile = (file: File) => {
    setError(null);
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet);
            
            const transformed = jsonData.map(mapRowToRecord);
            setParsedData(transformed);
        } catch (err: any) {
            setError("Failed to parse Excel file: " + err.message);
        }
      };
      reader.onerror = () => setError("Failed to read file.");
      reader.readAsArrayBuffer(file);
    } else {
      // CSV Handling
      Papa.parse(file, {
        header: true,
        skipEmptyLines: 'greedy',
        complete: (results) => {
          if (results.errors.length > 0) {
            console.warn("CSV Parse Warnings:", results.errors);
            if (results.data.length === 0) {
                setError(`Failed to parse CSV. First error: ${results.errors[0].message}`);
                return;
            }
          }
          const transformed = results.data.map(mapRowToRecord);
          setParsedData(transformed);
        },
        error: (err: any) => {
          setError("Failed to read file: " + err.message);
        }
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="glass-panel p-8 rounded-2xl max-w-4xl mx-auto animate-fade-in relative border border-slate-200 dark:border-white/20 shadow-2xl">
      <button onClick={onCancel} className="absolute top-4 right-4 opacity-50 hover:opacity-100 hover:bg-slate-200 dark:hover:bg-white/10 p-2 rounded-full transition-all text-slate-800 dark:text-white">
        <X size={20} />
      </button>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-blue-600 dark:from-white dark:to-blue-200">Bulk Data Import</h2>
        <p className="opacity-80 mt-2 max-w-lg mx-auto text-slate-600 dark:text-slate-300">Upload CSV or Excel files.</p>
      </div>

      {!parsedData.length ? (
        <div 
            className={`border-2 border-dashed rounded-2xl p-16 flex flex-col items-center justify-center transition-all duration-300 ${
                dragActive 
                ? 'border-blue-500 bg-blue-500/10 scale-105' 
                : 'border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/30 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
        >
            <div className={`p-6 rounded-full bg-slate-200 dark:bg-white/5 mb-6 ${dragActive ? 'animate-bounce' : ''}`}>
                <Upload size={48} className="opacity-70 text-slate-600 dark:text-white" />
            </div>
            <p className="text-xl font-medium mb-2 text-slate-800 dark:text-white">Drag & Drop your file here</p>
            <p className="text-sm opacity-60 mb-8 text-slate-500 dark:text-slate-400">Supports .csv, .xlsx, .xls</p>
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:shadow-lg transition-all active:scale-95"
            >
                Browse Files
            </button>
            <input 
                ref={fileInputRef} 
                type="file" 
                className="hidden" 
                accept=".csv,.xlsx,.xls" 
                onChange={handleChange}
            />
            {error && (
                <div className="mt-8 text-red-700 dark:text-red-200 bg-red-100 dark:bg-red-500/20 border border-red-200 dark:border-red-500/30 px-6 py-4 rounded-xl flex items-center gap-3 w-full max-w-md">
                    <AlertTriangle size={20} />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}
        </div>
      ) : (
        <div className="space-y-6 animate-slide-in">
            <div className="flex items-center gap-3 text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-500/20 border border-green-200 dark:border-green-500/30 px-6 py-4 rounded-xl">
                <CheckCircle size={24} />
                <div className="flex-1">
                    <h4 className="font-bold">Ready to Import</h4>
                    <p className="text-sm opacity-90">Successfully parsed {parsedData.length} records.</p>
                </div>
            </div>
            
            <div className="glass-panel rounded-xl overflow-hidden max-h-[400px] overflow-y-auto border border-slate-200 dark:border-white/10">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100 dark:bg-white/10 sticky top-0 z-10 backdrop-blur-md text-slate-800 dark:text-white">
                        <tr>
                            <th className="p-4 font-semibold">Ship No</th>
                            <th className="p-4 font-semibold">Drawing</th>
                            <th className="p-4 font-semibold">Issuance</th>
                            <th className="p-4 font-semibold text-right">Cost (¥)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-slate-700 dark:text-slate-200">
                        {parsedData.slice(0, 10).map((row, i) => (
                            <tr key={i} className="hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                                <td className="p-4 font-mono opacity-90">{row.ship_number}</td>
                                <td className="p-4 opacity-90">{row.drawing_number}</td>
                                <td className="p-4 opacity-90 font-mono text-xs">{row.issuance_date}</td>
                                <td className="p-4 opacity-90 text-right font-mono">¥{row.cost_of_damage.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {parsedData.length > 10 && (
                    <div className="p-3 text-center text-xs opacity-60 bg-slate-50 dark:bg-white/5 border-t border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">
                        ...and {parsedData.length - 10} more rows
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-slate-200 dark:border-white/10">
                <button 
                    onClick={() => setParsedData([])}
                    className="px-6 py-3 rounded-xl border border-slate-300 dark:border-white/20 hover:bg-slate-100 dark:hover:bg-white/10 font-medium transition-colors text-slate-700 dark:text-white"
                >
                    Discard
                </button>
                <button 
                    onClick={() => onUpload(parsedData)}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95 flex items-center gap-2"
                >
                    <FileSpreadsheet size={18} />
                    Confirm Import
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default PDRUpload;