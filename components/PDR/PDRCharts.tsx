import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { PDRRecord } from '../../types';
import { DollarSign, AlertTriangle, TrendingUp, Activity, Calendar } from 'lucide-react';

interface PDRChartsProps {
  data: PDRRecord[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

const TOOLTIP_STYLE = {
  backgroundColor: 'rgba(15, 23, 42, 0.95)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  color: '#f8fafc',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  padding: '12px'
};

const SummaryCard = ({ title, value, sub, icon, colorClass }: any) => (
    <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center justify-between hover:scale-[1.02] transition-transform duration-300">
        <div>
            <p className="text-sm font-medium opacity-60 text-slate-600 dark:text-slate-300">{title}</p>
            <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{value}</h3>
            {sub && <p className="text-xs mt-1 opacity-70 text-slate-500 dark:text-slate-400">{sub}</p>}
        </div>
        <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 dark:bg-opacity-20 shadow-inner`}>
            {icon}
        </div>
    </div>
);

const PDRCharts: React.FC<PDRChartsProps> = ({ data }) => {
  // --- 1. Aggregation: Cost by Department ---
  const costByDept = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach(d => {
      const current = map.get(d.department) || 0;
      map.set(d.department, current + d.cost_of_damage);
    });
    return Array.from(map.entries())
      .map(([name, cost]) => ({ name, cost }))
      .sort((a, b) => b.cost - a.cost);
  }, [data]);

  // --- 2. Aggregation: Error Causes ---
  const errorCauses = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach(d => {
        // Handle empty or N/A
        const cause = d.general_cause_of_error || 'Unspecified';
        const current = map.get(cause) || 0;
        map.set(cause, current + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 5);
  }, [data]);

  // --- 3. Aggregation: Damage Ratio ---
  const damageRatio = useMemo(() => {
    let y = 0;
    let n = 0;
    data.forEach(d => {
        if (d.damage && d.damage.includes('Y')) y++;
        else n++;
    });
    return [
        { name: 'With Damage', value: y },
        { name: 'No Damage', value: n }
    ];
  }, [data]);

  // --- 4. Aggregation: Trend Analysis (Cost over Months) ---
  const trendData = useMemo(() => {
     const map = new Map<string, { cost: number, count: number }>();
     
     data.forEach(d => {
        // Create a sortable key, simpler for now assuming same year or just month names
        // Ideally we parse issuance_date or billing_month. Let's use billing_month string for display
        const key = d.billing_month || 'Unknown'; 
        const current = map.get(key) || { cost: 0, count: 0 };
        map.set(key, { 
            cost: current.cost + d.cost_of_damage,
            count: current.count + 1 
        });
     });

     // Simple month sorter helper
     const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
     
     return Array.from(map.entries())
        .map(([name, val]) => ({ name, ...val }))
        .sort((a, b) => {
            return months.indexOf(a.name) - months.indexOf(b.name);
        });
  }, [data]);

  // --- 5. Totals for Cards ---
  const totalCost = data.reduce((acc, curr) => acc + curr.cost_of_damage, 0);
  const totalManhours = data.reduce((acc, curr) => acc + curr.manhour_spent, 0);
  const totalRevisions = data.length;

  if (data.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-64 opacity-50">
              <Activity size={48} className="mb-4" />
              <p>No data available for analysis. Try adjusting your filters.</p>
          </div>
      );
  }

  return (
    <div className="space-y-6 animate-fade-in">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard 
                title="Visible Cost Impact" 
                value={`¥${totalCost.toLocaleString()}`} 
                sub="Based on filtered selection"
                icon={<DollarSign size={24} className="text-red-500" />}
                colorClass="bg-red-500"
            />
            <SummaryCard 
                title="Total Manhours" 
                value={`${totalManhours} hrs`} 
                sub={`Avg: ${(totalManhours/totalRevisions || 0).toFixed(1)} hrs/rev`}
                icon={<Activity size={24} className="text-blue-500" />}
                colorClass="bg-blue-500"
            />
            <SummaryCard 
                title="Revision Count" 
                value={totalRevisions} 
                sub="Records found"
                icon={<TrendingUp size={24} className="text-emerald-500" />}
                colorClass="bg-emerald-500"
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Cost by Dept (Enhanced Bar) */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg">
                <h3 className="text-lg font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-2">
                    <DollarSign size={18} className="text-blue-500" /> Cost of Damage by Dept
                </h3>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={costByDept}>
                            <defs>
                                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} stroke="currentColor" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="currentColor" opacity={0.5} fontSize={12} />
                            <YAxis axisLine={false} tickLine={false} stroke="currentColor" opacity={0.5} fontSize={12} tickFormatter={(val) => `¥${val/1000}k`} />
                            <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{color: '#fff'}} cursor={{fill: 'rgba(255,255,255,0.05)'}} formatter={(val: number) => `¥${val.toLocaleString()}`} />
                            <Bar dataKey="cost" fill="url(#colorCost)" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Chart 2: Cause Distribution (Enhanced Donut) */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg">
                <h3 className="text-lg font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-2">
                    <AlertTriangle size={18} className="text-amber-500" /> Top Error Causes
                </h3>
                <div className="h-72 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={errorCauses}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {errorCauses.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{color: '#fff'}} />
                            <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-slate-700 dark:fill-white font-bold text-xl">
                                {data.length}
                            </text>
                             <text x="50%" y="56%" textAnchor="middle" dominantBaseline="middle" className="fill-slate-500 dark:fill-slate-400 text-xs">
                                Total
                            </text>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Chart 3: Cost Trend (New Area Chart) */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg lg:col-span-2">
                <h3 className="text-lg font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-2">
                    <Calendar size={18} className="text-purple-500" /> Cost Trend Analysis (Filtered)
                </h3>
                <div className="h-72 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} stroke="currentColor" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="currentColor" opacity={0.5} fontSize={12} />
                            <YAxis axisLine={false} tickLine={false} stroke="currentColor" opacity={0.5} fontSize={12} tickFormatter={(val) => `¥${val/1000}k`} />
                            <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{color: '#fff'}} formatter={(val: number) => `¥${val.toLocaleString()}`} />
                            <Area type="monotone" dataKey="cost" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorTrend)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

             {/* Chart 4: Damage Context (Small Pie) */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10 flex flex-col justify-between shadow-lg">
                 <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">Damage Ratio</h3>
                 <div className="flex-1 flex items-center justify-center relative">
                     <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={damageRatio}
                                cx="50%"
                                cy="50%"
                                startAngle={180}
                                endAngle={0}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                <Cell fill="#ef4444" /> {/* With Damage */}
                                <Cell fill="#10b981" /> {/* No Damage */}
                            </Pie>
                            <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{color: '#fff'}} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pt-8 pointer-events-none">
                        <div className="text-3xl font-bold text-slate-800 dark:text-white">
                            {((damageRatio[0].value / (data.length || 1)) * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs opacity-60 text-slate-600 dark:text-slate-300">Damage Rate</div>
                    </div>
                 </div>
                 <div className="flex justify-center gap-6 mt-2">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="w-3 h-3 rounded-full bg-red-500"></span> With Damage
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="w-3 h-3 rounded-full bg-emerald-500"></span> No Damage
                    </div>
                 </div>
            </div>

             {/* Context Card */}
             <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10 flex flex-col justify-center items-center text-center shadow-lg">
                <div className="p-4 rounded-full bg-blue-500/10 mb-4 animate-pulse">
                    <Activity size={32} className="text-blue-500" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-slate-800 dark:text-white">Real-time Analytics</h3>
                <p className="text-sm opacity-70 text-slate-600 dark:text-slate-300 mb-4">
                    Visualizations reflect the currently filtered dataset. Use the filters above to narrow down by ship, department, or revision type.
                </p>
                <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-xl w-full">
                    <div className="text-xs opacity-60 mb-1 text-slate-600 dark:text-slate-400">Current Dataset</div>
                    <div className="font-mono font-bold text-lg text-slate-800 dark:text-white">
                        {data.length} Records
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default PDRCharts;