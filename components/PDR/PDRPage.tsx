import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Upload, Search, Filter, FileDown, ArrowUpDown, 
  Pencil, Trash2, AlertTriangle, Table, PieChart, Database, 
  RefreshCw, Loader2, Users, Eye 
} from 'lucide-react';
import { supabase } from '../../supabase';
import PDRForm from './PDRForm';
import PDRUpload from './PDRUpload';
import PDRCharts from './PDRCharts';
import PDRViewModal from './PDRViewModal';
import { PDRRecord } from '../../types';
import * as XLSX from 'xlsx';

const PDRPage: React.FC = () => {
  const [viewState, setViewState] = useState<'list' | 'analytics' | 'form' | 'upload'>('list');
  const [data, setData] = useState<PDRRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  
  // --- Action States ---
  const [editingRecord, setEditingRecord] = useState<Partial<PDRRecord> | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [viewingRecord, setViewingRecord] = useState<PDRRecord | null>(null);
  
  // --- Filters & View Options ---
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [teamFilter, setTeamFilter] = useState('All');
  const [damageFilter, setDamageFilter] = useState('All');
  const [showAllColumns, setShowAllColumns] = useState(false);

  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
        const { data: records, error } = await supabase
            .from('pdr_records')
            .select('*')
            .order('id', { ascending: false });

        if (error) throw error;

        if (records) {
            setData(records);
            setIsOfflineMode(false);
            localStorage.setItem('ttsp_pdr_data', JSON.stringify(records));
        }
    } catch (err) {
        console.warn("Supabase fetch failed, falling back to local storage:", err);
        setIsOfflineMode(true);
        const saved = localStorage.getItem('ttsp_pdr_data');
        setData(saved ? JSON.parse(saved) : []);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- CRUD Actions ---
  const handleUpload = async (newRecords: PDRRecord[]) => {
    setLoading(true);
    if (isOfflineMode) {
        const startId = data.length > 0 ? Math.max(...data.map(d => d.id || 0)) + 1 : 1;
        const processedRecords = newRecords.map((r, idx) => ({ ...r, id: r.id || startId + idx }));
        const updatedData = [...processedRecords, ...data];
        setData(updatedData);
        localStorage.setItem('ttsp_pdr_data', JSON.stringify(updatedData));
        setViewState('list');
        setLoading(false);
    } else {
        try {
            const cleanRecords = newRecords.map(({ id, ...rest }) => rest); 
            const { error } = await supabase.from('pdr_records').insert(cleanRecords);
            if (error) throw error;
            await fetchData();
            setViewState('list');
        } catch (err: any) {
            alert(`Upload failed: ${err.message}`);
            setLoading(false);
        }
    }
  };

  const handleCreateNew = () => {
    setEditingRecord(undefined);
    setViewState('form');
  };

  const handleEdit = (record: PDRRecord) => {
    setEditingRecord(record);
    setViewState('form');
  };

  const handleView = (record: PDRRecord) => {
    setViewingRecord(record);
  };

  const initiateDelete = (id: number) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (deleteId === null) return;

    if (isOfflineMode) {
        const updatedData = data.filter(d => d.id !== deleteId);
        setData(updatedData);
        localStorage.setItem('ttsp_pdr_data', JSON.stringify(updatedData));
    } else {
        try {
            const { error } = await supabase.from('pdr_records').delete().eq('id', deleteId);
            if (error) throw error;
            await fetchData();
        } catch (err: any) {
            alert(`Delete failed: ${err.message}`);
        }
    }
    setDeleteId(null);
  };

  const handleSave = async (recordData: Partial<PDRRecord>) => {
    setLoading(true);
    if (isOfflineMode) {
        if (recordData.id) {
            const updatedData = data.map(d => d.id === recordData.id ? { ...d, ...recordData } as PDRRecord : d);
            setData(updatedData);
            localStorage.setItem('ttsp_pdr_data', JSON.stringify(updatedData));
        } else {
            const newRecord = {
                ...recordData,
                id: (data.length > 0 ? Math.max(...data.map(d => d.id || 0)) : 0) + 1,
                year: recordData.year || new Date().getFullYear(),
                damage: recordData.damage || 'N',
            } as PDRRecord;
            const updatedData = [newRecord, ...data];
            setData(updatedData);
            localStorage.setItem('ttsp_pdr_data', JSON.stringify(updatedData));
        }
        setViewState('list');
        setLoading(false);
    } else {
        try {
            if (recordData.id) {
                const { error } = await supabase.from('pdr_records').update(recordData).eq('id', recordData.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('pdr_records').insert([recordData]);
                if (error) throw error;
            }
            await fetchData();
            setViewState('list');
        } catch (err: any) {
            alert(`Save failed: ${err.message}`);
            setLoading(false);
        }
    }
  };

  const handleExport = () => {
    const dataToExport = filteredData.map(item => {
        const { id, ...rest } = item;
        // Map all fields nicely for Excel and ensure MM/DD/YYYY format
        return { 
            No: id, 
            Year: item.year,
            Month: item.billing_month,
            Dept: item.department,
            Group: item.group_name,
            Team: item.team,
            'Resp Team': item.responsible_team,
            'Ship No': item.ship_number,
            'Drawing No': item.drawing_number,
            'Block/Drawing Name': item.block_name_or_drawing_name,
            'Issuance Date': item.issuance_date, // Already MM/DD/YYYY
            'Orig Delivery': item.original_t_dreams_delivery, // Already MM/DD/YYYY
            Rev: item.revision_number,
            Series: item.revision_series_number,
            Family: item.revision_family_number,
            'Ind No': item.industry_number,
            'M/H': item.manhour_spent,
            Designer: item.designer,
            Checker: item.checker,
            'Revised By': item.revised_by,
            Reason: item.reason_of_revision,
            Code: item.design_update_code,
            'From D#': item.from_d_number,
            'Error Type': item.type_of_error,
            'General Cause': item.general_cause_of_error,
            'Detail Cause': item.detail_cause_of_error,
            Damage: item.damage,
            'Pcs Damage': item.number_of_piece_with_damage,
            'Pcs No Damage': item.number_of_piece_without_damage,
            Cost: item.cost_of_damage,
            Remarks: item.remarks,
            Origin: item.origin,
            'Add Info': item.add_info,
            'Update Info': item.update_info
        };
    });
    
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wscols = Object.keys(dataToExport[0] || {}).map(() => ({ wch: 15 }));
    ws['!cols'] = wscols;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "PDR_Review_Log");
    
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `TTSP_PDR_Export_${dateStr}.xlsx`);
  };

  // --- Filtering & Derived Data ---

  const filteredData = data.filter(d => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
        (d.ship_number || '').toLowerCase().includes(term) || 
        (d.drawing_number || '').toLowerCase().includes(term) ||
        (d.reason_of_revision || '').toLowerCase().includes(term) ||
        (d.block_name_or_drawing_name || '').toLowerCase().includes(term);
    
    const matchesDept = departmentFilter === 'All' || d.department === departmentFilter;
    const matchesTeam = teamFilter === 'All' || d.team === teamFilter;
    
    const matchesDamage = damageFilter === 'All' 
        ? true 
        : damageFilter === 'Yes' 
            ? (d.damage && d.damage.includes('Y')) 
            : (!d.damage || !d.damage.includes('Y'));

    return matchesSearch && matchesDept && matchesTeam && matchesDamage;
  });

  const uniqueDepartments = Array.from(new Set(data.map(d => d.department))).filter(Boolean).sort();
  const uniqueTeams = Array.from(new Set(data.map(d => d.team))).filter(Boolean).sort();

  return (
    <div className="space-y-6">
      {/* Connectivity Status Bar */}
      {isOfflineMode ? (
          <div className="flex items-center justify-between px-4 py-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg text-xs text-amber-800 dark:text-amber-200 animate-fade-in">
             <div className="flex items-center gap-2">
                <Database size={14} />
                <span className="font-semibold">Offline Mode / Local Storage</span>
             </div>
             <div className="flex items-center gap-3">
                <span className="opacity-80">Database unreachable. Changes saved locally.</span>
                <button onClick={() => fetchData()} className="flex items-center gap-1 hover:underline">
                    <RefreshCw size={12} /> Retry
                </button>
             </div>
          </div>
      ) : (
          <div className="hidden md:flex items-center justify-end px-4 py-1 text-[10px] text-green-600 dark:text-green-400 opacity-60">
             <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Connected to Supabase</span>
          </div>
      )}

      {/* Header Actions */}
      {(viewState === 'list' || viewState === 'analytics') && (
        <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-blue-600 dark:from-white dark:to-blue-200">
                        Post-Delivery Revisions
                    </h1>
                    <p className="opacity-80 text-sm mt-1 text-slate-600 dark:text-slate-300">Master Log & Analytics / Total Records: {loading ? '...' : filteredData.length}</p>
                </div>
                
                <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
                     {/* View Switcher */}
                     <div className="bg-slate-200 dark:bg-white/10 p-1 rounded-xl flex border border-slate-300 dark:border-white/10">
                        <button 
                            onClick={() => setViewState('list')}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                                viewState === 'list' 
                                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-sm' 
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                            }`}
                        >
                            <Table size={16} /> List
                        </button>
                        <button 
                            onClick={() => setViewState('analytics')}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                                viewState === 'analytics' 
                                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-sm' 
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                            }`}
                        >
                            <PieChart size={16} /> Analytics
                        </button>
                     </div>

                     <div className="w-px h-8 bg-slate-300 dark:bg-white/20 mx-1 hidden md:block"></div>

                     <button 
                        onClick={() => setViewState('upload')}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-white text-sm font-semibold rounded-xl transition-colors border border-slate-200 dark:border-white/10"
                     >
                        <Upload size={18} />
                        <span className="hidden sm:inline">Bulk Import</span>
                     </button>
                     
                     <button 
                        onClick={handleExport}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-green-600/20"
                     >
                        <FileDown size={18} />
                        <span className="hidden sm:inline">Export</span>
                     </button>
                     <button 
                        onClick={handleCreateNew}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                     >
                        <Plus size={18} />
                        <span className="hidden sm:inline">New Entry</span>
                     </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="glass-panel p-4 rounded-xl flex flex-col lg:flex-row gap-4 items-center border border-slate-200 dark:border-white/10">
                <div className="relative w-full lg:flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50 text-slate-500 dark:text-white" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search Ship No, Drawing, Reason..." 
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 focus:bg-white dark:focus:bg-white/10 focus:outline-none focus:border-blue-400 transition-colors text-sm text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-white/40 font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 items-center">
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-black/20 rounded-lg border border-slate-200 dark:border-white/5 min-w-[150px]">
                        <Filter size={14} className="opacity-70 text-slate-700 dark:text-white" />
                        <select 
                            className="bg-transparent text-sm focus:outline-none w-full text-slate-800 dark:text-white font-medium [&>option]:text-black"
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                        >
                            <option value="All">All Departments</option>
                            {uniqueDepartments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-black/20 rounded-lg border border-slate-200 dark:border-white/5 min-w-[150px]">
                        <Users size={14} className="opacity-70 text-slate-700 dark:text-white" />
                        <select 
                            className="bg-transparent text-sm focus:outline-none w-full text-slate-800 dark:text-white font-medium [&>option]:text-black"
                            value={teamFilter}
                            onChange={(e) => setTeamFilter(e.target.value)}
                        >
                            <option value="All">All Teams</option>
                            {uniqueTeams.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-black/20 rounded-lg border border-slate-200 dark:border-white/5 min-w-[140px]">
                        <ArrowUpDown size={14} className="opacity-70 text-slate-700 dark:text-white" />
                        <select 
                            className="bg-transparent text-sm focus:outline-none w-full text-slate-800 dark:text-white font-medium [&>option]:text-black"
                            value={damageFilter}
                            onChange={(e) => setDamageFilter(e.target.value)}
                        >
                            <option value="All">Damage: All</option>
                            <option value="Yes">Damage: Yes</option>
                            <option value="No">Damage: No</option>
                        </select>
                    </div>

                    <div className="h-full flex items-center">
                         <label className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-black/20 rounded-lg border border-slate-200 dark:border-white/5 cursor-pointer hover:bg-slate-200 dark:hover:bg-white/10 transition-colors select-none">
                            <input 
                                type="checkbox" 
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                checked={showAllColumns}
                                onChange={(e) => setShowAllColumns(e.target.checked)}
                            />
                            <span className="text-sm font-medium text-slate-700 dark:text-white whitespace-nowrap">
                                {showAllColumns ? 'Full Table' : 'Compact'}
                            </span>
                         </label>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Main Content Switcher */}
      {viewState === 'upload' && (
        <PDRUpload onUpload={handleUpload} onCancel={() => setViewState('list')} />
      )}

      {viewState === 'form' && (
        <PDRForm initialData={editingRecord} onSave={handleSave} onCancel={() => setViewState('list')} />
      )}
      
      {/* Analytics View */}
      {viewState === 'analytics' && (
          <PDRCharts data={filteredData} />
      )}

      {/* List View */}
      {viewState === 'list' && (
        <div className="animate-fade-in relative">
            {loading && (
                <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm z-20 flex items-center justify-center rounded-2xl">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                </div>
            )}
            
            {/* Desktop Table View */}
            <div className="hidden md:block glass-panel rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="bg-slate-100 dark:bg-white/5 text-xs uppercase font-bold tracking-wider backdrop-blur-md sticky top-0 z-10 text-slate-700 dark:text-slate-200">
                            <tr>
                                <th className="p-4 border-b border-slate-200 dark:border-white/10">No</th>
                                <th className="p-4 border-b border-slate-200 dark:border-white/10">Ship No</th>
                                <th className="p-4 border-b border-slate-200 dark:border-white/10">Block/Drawing</th>
                                <th className="p-4 border-b border-slate-200 dark:border-white/10">Drawing No</th>
                                <th className="p-4 border-b border-slate-200 dark:border-white/10">Dept</th>
                                
                                {/* CONDITIONAL HEADER: Extended columns based on Schema */}
                                {showAllColumns ? (
                                    <>
                                        <th className="p-4 border-b border-slate-200 dark:border-white/10">Group</th>
                                        <th className="p-4 border-b border-slate-200 dark:border-white/10">Team</th>
                                        <th className="p-4 border-b border-slate-200 dark:border-white/10">Resp. Team</th>
                                        <th className="p-4 border-b border-slate-200 dark:border-white/10">Year</th>
                                        <th className="p-4 border-b border-slate-200 dark:border-white/10">Bill Month</th>
                                        <th className="p-4 border-b border-slate-200 dark:border-white/10">Rev</th>
                                        <th className="p-4 border-b border-slate-200 dark:border-white/10">Series</th>
                                        <th className="p-4 border-b border-slate-200 dark:border-white/10">Issuance</th>
                                        <th className="p-4 border-b border-slate-200 dark:border-white/10">M/H</th>
                                        <th className="p-4 border-b border-slate-200 dark:border-white/10">Designer</th>
                                        <th className="p-4 border-b border-slate-200 dark:border-white/10">Origin</th>
                                        <th className="p-4 border-b border-slate-200 dark:border-white/10 min-w-[200px]">Reason</th>
                                        <th className="p-4 border-b border-slate-200 dark:border-white/10">Error Type</th>
                                        <th className="p-4 border-b border-slate-200 dark:border-white/10 min-w-[150px]">Remarks</th>
                                    </>
                                ) : (
                                    <th className="p-4 border-b border-slate-200 dark:border-white/10">Reason</th>
                                )}

                                <th className="p-4 border-b border-slate-200 dark:border-white/10">Damage</th>
                                <th className="p-4 text-right border-b border-slate-200 dark:border-white/10">Cost (¥)</th>
                                <th className="p-4 text-center border-b border-slate-200 dark:border-white/10 sticky right-0 bg-slate-100 dark:bg-slate-900 z-20 shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.1)]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-slate-800 dark:text-slate-100">
                            {filteredData.length > 0 ? filteredData.map((row) => (
                                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                    <td className="p-4 opacity-50 group-hover:opacity-100">{row.id}</td>
                                    <td className="p-4 font-bold text-blue-700 dark:text-blue-300">{row.ship_number}</td>
                                    <td className="p-4 max-w-xs truncate" title={row.block_name_or_drawing_name}>{row.block_name_or_drawing_name}</td>
                                    <td className="p-4 font-mono text-xs opacity-90">{row.drawing_number}</td>
                                    <td className="p-4 opacity-80">{row.department}</td>

                                    {/* CONDITIONAL BODY: All fields */}
                                    {showAllColumns ? (
                                        <>
                                            <td className="p-4 opacity-80">{row.group_name}</td>
                                            <td className="p-4 opacity-80">{row.team}</td>
                                            <td className="p-4 opacity-80 text-xs">{row.responsible_team}</td>
                                            <td className="p-4 opacity-80">{row.year}</td>
                                            <td className="p-4 opacity-80">{row.billing_month}</td>
                                            <td className="p-4 opacity-80 text-center font-bold">{row.revision_number}</td>
                                            <td className="p-4 opacity-80 text-center">{row.revision_series_number}</td>
                                            <td className="p-4 opacity-80 text-xs font-mono">{row.issuance_date}</td>
                                            <td className="p-4 opacity-80 text-right">{row.manhour_spent}</td>
                                            <td className="p-4 opacity-80 text-xs truncate" title={row.designer}>{row.designer}</td>
                                            <td className="p-4 opacity-80 text-xs">{row.origin}</td>
                                            <td className="p-4 max-w-xs truncate opacity-90 text-xs" title={row.reason_of_revision}>{row.reason_of_revision}</td>
                                            <td className="p-4 opacity-80 text-xs truncate" title={row.type_of_error}>{row.type_of_error}</td>
                                            <td className="p-4 max-w-xs truncate opacity-60 italic text-xs" title={row.remarks}>{row.remarks || '-'}</td>
                                        </>
                                    ) : (
                                        <td className="p-4 max-w-xs truncate opacity-80" title={row.reason_of_revision}>
                                            {row.reason_of_revision}
                                        </td>
                                    )}

                                    <td className="p-4">
                                        {row.damage && row.damage.includes('Y') ? (
                                            <span className="text-red-700 dark:text-red-200 bg-red-100 dark:bg-red-500/20 border border-red-200 dark:border-red-500/30 px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase">{row.damage}</span>
                                        ) : (
                                            <span className="opacity-20 text-xs">N</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right font-mono font-medium opacity-90">
                                        {row.cost_of_damage > 0 ? row.cost_of_damage.toLocaleString() : '-'}
                                    </td>
                                    <td className="p-4 text-center flex items-center justify-center gap-1 sticky right-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm border-l border-slate-200 dark:border-white/5">
                                        <button 
                                            onClick={() => handleView(row)}
                                            className="p-1.5 hover:bg-cyan-100 dark:hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-200 rounded-lg transition-colors"
                                            title="View Details"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleEdit(row)}
                                            className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-200 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button 
                                            onClick={() => row.id && initiateDelete(row.id)}
                                            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-300 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={showAllColumns ? 23 : 9} className="p-12 text-center opacity-50">
                                        {!loading && "No records found matching your filters."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-3 border-t border-slate-200 dark:border-white/10 text-xs opacity-60 text-center text-slate-500 dark:text-slate-400">
                    End of list
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {filteredData.map((row) => (
                    <div key={row.id} className="glass-panel p-4 rounded-xl space-y-3 active:scale-[0.99] transition-transform border border-slate-200 dark:border-white/10">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 px-2 py-1 rounded">
                                    {row.ship_number}
                                </span>
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">{row.drawing_number}</span>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => handleView(row)} className="p-1 hover:bg-cyan-100 dark:hover:bg-cyan-500/20 rounded text-cyan-600 dark:text-cyan-300"><Eye size={14} /></button>
                                <button onClick={() => handleEdit(row)} className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded text-slate-600 dark:text-slate-300"><Pencil size={14} /></button>
                                <button onClick={() => row.id && initiateDelete(row.id)} className="p-1 hover:bg-red-100 dark:hover:bg-red-500/10 text-red-500 dark:text-red-300 rounded"><Trash2 size={14} /></button>
                            </div>
                        </div>
                        
                        <div className="text-xs opacity-90 mb-2 truncate text-slate-700 dark:text-slate-300 font-medium">
                            {row.block_name_or_drawing_name}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs opacity-80 text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-white/50"></span>
                                {row.department} / {row.team}
                            </div>
                            <div className="text-right">Rev: {row.revision_number}</div>
                            <div className="col-span-2 truncate py-1 border-t border-slate-200 dark:border-white/5 mt-1">{row.reason_of_revision}</div>
                        </div>

                        {row.damage && row.damage.includes('Y') && (
                            <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-white/10">
                                <span className="text-xs text-red-600 dark:text-red-300 font-bold flex items-center gap-1">
                                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                    {row.damage}
                                </span>
                                <span className="text-sm font-mono font-bold text-red-700 dark:text-red-100">¥{row.cost_of_damage.toLocaleString()}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* VIEW MODAL COMPONENT */}
      <PDRViewModal 
        record={viewingRecord} 
        onClose={() => setViewingRecord(null)} 
      />

      {/* Delete Confirmation Modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="glass-panel p-8 rounded-2xl max-w-sm w-full border border-slate-200 dark:border-white/20 shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500" />
                 <div className="absolute -top-10 -left-10 w-32 h-32 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />
                 <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
                 
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-red-100 to-orange-100 dark:from-red-500/20 dark:to-orange-500/20 flex items-center justify-center text-red-500 dark:text-red-200 mb-6 border border-red-200 dark:border-white/10 shadow-[0_0_30px_rgba(239,68,68,0.2)] animate-bounce-in">
                    <AlertTriangle size={36} strokeWidth={1.5} className="drop-shadow-lg" />
                </div>
                
                <h3 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-white/70">Confirm Deletion</h3>
                <p className="opacity-80 text-sm mb-8 leading-relaxed text-slate-600 dark:text-slate-300">
                    You are about to permanently remove record <span className="font-mono font-bold bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10">#{deleteId}</span>.
                    <br/>This process cannot be recovered.
                </p>
                
                <div className="grid grid-cols-2 gap-3 w-full">
                    <button 
                        onClick={() => setDeleteId(null)}
                        className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-sm font-semibold transition-colors opacity-90 hover:opacity-100 text-slate-800 dark:text-white"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmDelete}
                        className="py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white text-sm font-bold shadow-lg shadow-red-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <Trash2 size={18} />
                        Delete Record
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default PDRPage;