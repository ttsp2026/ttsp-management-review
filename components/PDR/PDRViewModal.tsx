import React from 'react';
import { 
  X, Users, Calendar, Clock, FileText, 
  AlertTriangle, Layers, DollarSign, Info, Activity 
} from 'lucide-react';
import { PDRRecord } from '../../types';

interface PDRViewModalProps {
  record: PDRRecord | null;
  onClose: () => void;
}

const PDRViewModal: React.FC<PDRViewModalProps> = ({ record, onClose }) => {
  if (!record) return null;

  // Helper to safely format text
  const display = (val: any) => (val === null || val === undefined || val === '') ? '-' : val;

  // Helper to ensure Date is displayed as MM/DD/YYYY if it exists
  const displayDate = (val: any) => {
    if (!val) return '-';
    // If it's already a string, return it (assuming it's saved correctly), 
    // otherwise try to parse if it's in a different format
    return val; 
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-4xl h-[90vh] md:h-[85vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/20 flex flex-col overflow-hidden bg-white dark:bg-slate-900">
        
        {/* --- Header (Fixed) --- */}
        <div className="flex-none flex justify-between items-center p-5 border-b border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Record Details</h2>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                ID: {record.id}
              </span>
            </div>
            
            {/* UPDATED: Added Block/Drawing Name in the middle */}
            <div className="text-sm text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-500/20">
                Ship: <span className="font-bold text-blue-700 dark:text-blue-300">{record.ship_number}</span>
              </span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="font-medium text-slate-700 dark:text-slate-200 max-w-[200px] truncate" title={record.block_name_or_drawing_name}>
                {record.block_name_or_drawing_name}
              </span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                Dwng: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{record.drawing_number}</span>
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors text-slate-500 dark:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* --- Body (Scrollable) --- */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Section 1: Timeline & Billing */}
          <section>
            <h3 className="text-xs uppercase font-bold text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2">
                <Calendar size={14} /> Timeline & Billing
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoCard label="Year" value={display(record.year)} />
                <InfoCard label="Billing Month" value={display(record.billing_month)} />
                {/* UPDATED: Ensuring display of Date */}
                <InfoCard label="Issuance Date" value={displayDate(record.issuance_date)} />
                <InfoCard label="Orig. T-Dreams Del." value={displayDate(record.original_t_dreams_delivery)} />
            </div>
          </section>

          {/* Section 2: Organization & Personnel */}
          <section>
            <h3 className="text-xs uppercase font-bold text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2">
                <Users size={14} /> Organization & Personnel
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50/50 dark:bg-white/[0.02]">
                <div className="space-y-3">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Structure</div>
                    <div className="grid grid-cols-[80px_1fr] gap-y-1 text-sm">
                        <span className="text-slate-500">Dept:</span> <span className="font-medium dark:text-slate-200">{display(record.department)}</span>
                        <span className="text-slate-500">Group:</span> <span className="font-medium dark:text-slate-200">{display(record.group_name)}</span>
                        <span className="text-slate-500">Team:</span> <span className="font-medium dark:text-slate-200">{display(record.team)}</span>
                        <span className="text-slate-500">Resp:</span> <span className="font-medium dark:text-slate-200">{display(record.responsible_team)}</span>
                    </div>
                </div>
                
                <div className="space-y-3">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Personnel</div>
                    <div className="grid grid-cols-[80px_1fr] gap-y-1 text-sm">
                        <span className="text-slate-500">Designer:</span> <span className="font-medium dark:text-slate-200">{display(record.designer)}</span>
                        <span className="text-slate-500">Checker:</span> <span className="font-medium dark:text-slate-200">{display(record.checker)}</span>
                        <span className="text-slate-500">Revised:</span> <span className="font-medium dark:text-slate-200">{display(record.revised_by)}</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Effort</div>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-lg">
                            <Clock size={20} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-800 dark:text-white">{display(record.manhour_spent)}</div>
                            <div className="text-[10px] uppercase text-slate-500 font-semibold">Hours Spent</div>
                        </div>
                    </div>
                </div>
            </div>
          </section>

          {/* Section 3: Revision Details */}
          <section>
            <h3 className="text-xs uppercase font-bold text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2">
                <Layers size={14} /> Revision Details
            </h3>
            
            <div className="flex flex-wrap gap-2 mb-4">
                <Badge label="Rev No" value={display(record.revision_number)} />
                <Badge label="Series" value={display(record.revision_series_number)} />
                <Badge label="Family" value={display(record.revision_family_number)} />
                <Badge label="Ind. No" value={display(record.industry_number)} />
                <Badge label="Code" value={display(record.design_update_code)} />
                <Badge label="From D#" value={display(record.from_d_number)} />
            </div>

            <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                    <div className="text-[10px] uppercase text-slate-500 mb-2 font-bold">Reason of Revision</div>
                    <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                        {display(record.reason_of_revision)}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                        <div className="text-[10px] uppercase text-slate-500 mb-1 font-bold">Type of Error</div>
                        <div className="text-sm text-slate-800 dark:text-slate-200">{display(record.type_of_error)}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                        <div className="text-[10px] uppercase text-slate-500 mb-1 font-bold">General Cause</div>
                        <div className="text-sm text-slate-800 dark:text-slate-200">{display(record.general_cause_of_error)}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                        <div className="text-[10px] uppercase text-slate-500 mb-1 font-bold">Detail Cause</div>
                        <div className="text-sm text-slate-800 dark:text-slate-200">{display(record.detail_cause_of_error)}</div>
                    </div>
                </div>
            </div>
          </section>

          {/* Section 4: Damage & Remarks */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-2">
            
            <div className={`rounded-xl border p-5 flex flex-col justify-between ${
                  record.damage && record.damage.includes('Y') 
                  ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-500/30' 
                  : 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-500/30'
            }`}>
                <div>
                    <h3 className="text-xs uppercase font-bold opacity-70 mb-4 flex items-center gap-2">
                        <AlertTriangle size={14} /> Damage Report
                    </h3>
                    
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-sm font-medium dark:text-white">Damage Status</div>
                        {record.damage && record.damage.includes('Y') ? (
                            <span className="px-3 py-1 bg-red-200 dark:bg-red-500/40 text-red-800 dark:text-red-100 rounded-full text-xs font-bold shadow-sm">YES</span>
                        ) : (
                            <span className="px-3 py-1 bg-green-200 dark:bg-green-500/40 text-green-800 dark:text-green-100 rounded-full text-xs font-bold shadow-sm">NO</span>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-white/60 dark:bg-black/20 p-3 rounded-lg border border-transparent dark:border-white/5">
                            <div className="text-[10px] opacity-60 uppercase mb-1">With Damage</div>
                            <div className="font-mono font-bold text-lg dark:text-white">{display(record.number_of_piece_with_damage)}</div>
                        </div>
                        <div className="bg-white/60 dark:bg-black/20 p-3 rounded-lg border border-transparent dark:border-white/5">
                            <div className="text-[10px] opacity-60 uppercase mb-1">No Damage</div>
                            <div className="font-mono font-bold text-lg dark:text-white">{display(record.number_of_piece_without_damage)}</div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-black/5 dark:border-white/5 mt-auto">
                    <div className={`p-3 rounded-full ${
                        record.damage && record.damage.includes('Y') ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                    } dark:bg-white/10 dark:text-white`}>
                        <DollarSign size={20} />
                    </div>
                    <div>
                        <div className="text-[10px] opacity-60 uppercase font-semibold">Total Cost of Damage</div>
                        <div className={`text-2xl font-mono font-bold ${
                             record.damage && record.damage.includes('Y') ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'
                        }`}>
                            ¥{record.cost_of_damage ? record.cost_of_damage.toLocaleString() : '0'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex-1 p-5 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-500/20">
                    <h3 className="text-xs uppercase font-bold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-2">
                        <FileText size={14} /> Remarks
                    </h3>
                    <p className="text-sm italic text-slate-700 dark:text-slate-300 leading-relaxed">
                        {record.remarks ? record.remarks : "No additional remarks."}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5">
                         <div className="text-[10px] uppercase text-slate-500 mb-1 flex items-center gap-1 font-semibold"><Info size={10}/> Add Info</div>
                         <div className="text-xs font-medium truncate text-slate-700 dark:text-slate-300" title={record.add_info}>{display(record.add_info)}</div>
                     </div>
                     <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5">
                         <div className="text-[10px] uppercase text-slate-500 mb-1 flex items-center gap-1 font-semibold"><Activity size={10}/> Update Info</div>
                         <div className="text-xs font-medium truncate text-slate-700 dark:text-slate-300" title={record.update_info}>{display(record.update_info)}</div>
                     </div>
                </div>
            </div>

          </section>
        </div>

        {/* --- Footer (Fixed) --- */}
        <div className="flex-none p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-2.5 bg-slate-800 hover:bg-slate-700 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-xl font-bold text-sm transition-all shadow-lg shadow-slate-300/50 dark:shadow-none"
          >
            Close Details
          </button>
        </div>

      </div>
    </div>
  );
};

const InfoCard = ({ label, value }: { label: string, value: string | number }) => (
    <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5">
        <div className="text-[10px] uppercase text-slate-500 mb-1 font-semibold">{label}</div>
        <div className="font-semibold text-slate-800 dark:text-white text-sm">{value}</div>
    </div>
);

const Badge = ({ label, value }: { label: string, value: string | number }) => (
    <div className="flex items-center bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/10 overflow-hidden">
        <span className="px-2.5 py-1 text-[10px] font-bold text-slate-500 bg-slate-200 dark:bg-white/10 uppercase tracking-wider">{label}</span>
        <span className="px-2.5 py-1 text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">{value}</span>
    </div>
);

export default PDRViewModal;