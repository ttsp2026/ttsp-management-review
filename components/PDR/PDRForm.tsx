import React, { useState, useEffect } from 'react';
import { PDRRecord } from '../../types';
import { X, Save, ArrowRight, ArrowLeft } from 'lucide-react';

interface PDRFormProps {
  initialData?: Partial<PDRRecord>;
  onSave: (data: Partial<PDRRecord>) => void;
  onCancel: () => void;
}

const TABS = ['Project Details', 'Design Info', 'Error Analysis', 'Impact & Tracing'];

const PDRForm: React.FC<PDRFormProps> = ({ initialData, onSave, onCancel }) => {
  const activeTabClass = "bg-blue-600 text-white shadow-md dark:bg-blue-500/20 dark:text-white";
  const inactiveTabClass = "hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400";
  
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState<Partial<PDRRecord>>({});

  useEffect(() => {
    if (initialData) {
        setFormData(initialData);
    } else {
        setFormData({});
    }
  }, [initialData]);

  const handleInput = (key: keyof PDRRecord, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // --- Date Helpers ---
  // Convert "MM/DD/YYYY" (stored) -> "YYYY-MM-DD" (for input type="date")
  const formatDateForInput = (dateStr: string | undefined | null) => {
    if (!dateStr) return '';
    const parts = dateStr.split('/');
    if (parts.length === 3) {
        return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
    }
    return ''; 
  };

  // Convert "YYYY-MM-DD" (from input) -> "MM/DD/YYYY" (for storage)
  const handleDateChange = (key: keyof PDRRecord, value: string) => {
    if (!value) {
        handleInput(key, '');
        return;
    }
    const [year, month, day] = value.split('-');
    const formatted = `${month}/${day}/${year}`;
    handleInput(key, formatted);
  };

  const renderInput = (label: string, key: keyof PDRRecord, type: string = 'text', half: boolean = false) => (
    <div className={`flex flex-col gap-1 ${half ? 'col-span-1' : 'col-span-2'}`}>
      <label className="text-xs font-semibold uppercase tracking-wider opacity-90 text-slate-700 dark:text-slate-300 mb-1">{label}</label>
      <input
        type={type}
        value={String(formData[key] || '')}
        onChange={(e) => handleInput(key, e.target.value)}
        className="w-full rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/30"
      />
    </div>
  );

  const renderDateInput = (label: string, key: keyof PDRRecord) => (
    <div className="flex flex-col gap-1 col-span-1">
      <label className="text-xs font-semibold uppercase tracking-wider opacity-90 text-slate-700 dark:text-slate-300 mb-1">{label}</label>
      <input
        type="date"
        value={formatDateForInput(String(formData[key] || ''))}
        onChange={(e) => handleDateChange(key, e.target.value)}
        className="w-full rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white border border-slate-300 text-slate-900 dark:bg-white/5 dark:border-white/10 dark:text-white"
      />
    </div>
  );

  return (
    <div className="glass-panel rounded-2xl p-6 animate-fade-in max-w-4xl mx-auto border border-slate-200 dark:border-white/10 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{initialData ? 'Edit Revision' : 'New Revision Entry'}</h2>
        <button onClick={onCancel} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full text-slate-500 dark:text-slate-300 transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl mb-6 overflow-x-auto border border-slate-200 dark:border-white/5">
        {TABS.map((tab, idx) => (
          <button
            key={tab}
            onClick={() => setActiveTab(idx)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === idx ? activeTabClass : inactiveTabClass
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {activeTab === 0 && (
          <div className="grid grid-cols-2 gap-4 animate-slide-in">
            {renderInput('Year', 'year', 'number', true)}
            {renderInput('Billing Month', 'billing_month', 'text', true)}
            {renderInput('Department', 'department', 'text', true)}
            {renderInput('Group', 'group_name', 'text', true)}
            {renderInput('Team', 'team', 'text', true)}
            {renderInput('Responsible Team', 'responsible_team', 'text', true)}
            {renderInput('Ship Number', 'ship_number', 'text', true)}
            {renderInput('Industry Number', 'industry_number', 'text', true)}
            {renderInput('Origin', 'origin', 'text', true)}
          </div>
        )}

        {activeTab === 1 && (
          <div className="grid grid-cols-2 gap-4 animate-slide-in">
             {renderInput('Revision Series', 'revision_series_number', 'text', true)}
             {renderInput('Revision No', 'revision_number', 'text', true)}
             {renderInput('Block / Drawing Name', 'block_name_or_drawing_name')}
             {renderInput('Drawing No', 'drawing_number', 'text', true)}
             {renderInput('Manhour Spent', 'manhour_spent', 'number', true)}
             
             {/* Use Specific Date Input Renderers here */}
             {renderDateInput('Issuance Date', 'issuance_date')}
             {renderDateInput('Original Delivery', 'original_t_dreams_delivery')}
             
             {renderInput('Designer', 'designer', 'text', true)}
             {renderInput('Checker', 'checker', 'text', true)}
             {renderInput('Revised By', 'revised_by', 'text', true)}
          </div>
        )}

        {activeTab === 2 && (
            <div className="grid grid-cols-2 gap-4 animate-slide-in">
                {renderInput('Reason of Revision', 'reason_of_revision')}
                {renderInput('Design Update Code', 'design_update_code', 'text', true)}
                {renderInput('From D Number', 'from_d_number', 'text', true)}
                
                <div className="col-span-2">
                    <label className="text-xs font-semibold uppercase tracking-wider opacity-90 mb-1 block text-slate-700 dark:text-slate-300">General Cause</label>
                    <input 
                        className="w-full rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/30"
                        value={formData.general_cause_of_error || ''}
                        onChange={(e) => handleInput('general_cause_of_error', e.target.value)}
                        placeholder="e.g. Design Miss, Drawing Error"
                    />
                </div>
                {renderInput('Type of Error', 'type_of_error', 'text', true)}
                {renderInput('Detail Cause', 'detail_cause_of_error', 'text', true)}
            </div>
        )}

        {activeTab === 3 && (
            <div className="grid grid-cols-2 gap-4 animate-slide-in">
                <div className="col-span-2">
                    <label className="text-xs font-semibold uppercase tracking-wider opacity-90 mb-1 block text-slate-700 dark:text-slate-300">Damage Type</label>
                    <select 
                        className="w-full rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white border border-slate-300 text-slate-900 dark:bg-white/5 dark:border-white/10 dark:text-white"
                        value={formData.damage || 'N'}
                        onChange={(e) => handleInput('damage', e.target.value)}
                    >
                        <option value="N">N (No Damage)</option>
                        <option value="Y">Y (Damage)</option>
                        <option value="Y and N">Y and N</option>
                    </select>
                </div>
                {renderInput('# Pcs With Damage', 'number_of_piece_with_damage', 'number', true)}
                {renderInput('# Pcs Without Damage', 'number_of_piece_without_damage', 'number', true)}
                {renderInput('Cost of Damage (¥)', 'cost_of_damage', 'number')}
                {renderInput('Revision Family No', 'revision_family_number', 'text', true)}
                {renderInput('Remarks', 'remarks')}
                {renderInput('Add Info', 'add_info')}
                {renderInput('Update Info', 'update_info')}
            </div>
        )}
      </div>

      <div className="flex justify-between mt-8 pt-6 border-t border-slate-200 dark:border-white/10">
        <button 
            disabled={activeTab === 0}
            onClick={() => setActiveTab(prev => prev - 1)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 font-medium"
        >
            <ArrowLeft size={16} /> Previous
        </button>

        {activeTab === TABS.length - 1 ? (
             <button 
                onClick={() => onSave(formData)}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg shadow-green-600/20 active:scale-95 transition-all"
             >
                <Save size={16} /> Save Record
             </button>
        ) : (
            <button 
                onClick={() => setActiveTab(prev => prev + 1)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 rounded-lg text-slate-900 dark:text-white font-medium"
            >
                Next <ArrowRight size={16} />
            </button>
        )}
      </div>
    </div>
  );
};

export default PDRForm;