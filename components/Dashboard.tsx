import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { TrendingUp, AlertCircle, DollarSign, Clock, BarChart2, Activity, GitCommit, Database, Loader2 } from 'lucide-react';
import { supabase } from '../supabase';
import { PDRRecord } from '../types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

const TOOLTIP_STYLE = {
  backgroundColor: 'rgba(15, 23, 42, 0.95)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  color: '#f8fafc',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  padding: '12px'
};

const StatCard = ({ title, value, icon, subValue, subLabel }: { title: string, value: string, icon: React.ReactNode, subValue?: string, subLabel?: string }) => (
  <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 border border-slate-200 dark:border-white/10 hover:shadow-lg transition-shadow duration-300">
    <div className="flex justify-between items-start">
      <div className="p-3 bg-slate-100 dark:bg-white/10 rounded-xl text-slate-700 dark:text-white border border-slate-200 dark:border-white/5">
        {icon}
      </div>
      {subValue && (
        <span className="text-xs font-bold px-2 py-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-500/30">
          {subValue}
        </span>
      )}
    </div>
    <div>
      <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</h3>
      <p className="text-sm font-medium opacity-60 mt-1 text-slate-600 dark:text-slate-300">{title}</p>
      {subLabel && <p className="text-xs opacity-40 mt-1">{subLabel}</p>}
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [data, setData] = useState<PDRRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('area');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Try Supabase first
        const { data: records, error } = await supabase
          .from('pdr_records')
          .select('*')
          .order('id', { ascending: false });
        
        if (error) throw error;
        
        if (records) {
           setData(records);
        }
      } catch (err) {
        console.warn("Using local storage fallback for dashboard");
        // Fallback to local storage
        const saved = localStorage.getItem('ttsp_pdr_data');
        if (saved) {
            setData(JSON.parse(saved));
        } else {
            setData([]); // No data
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Calculations ---

  const totalRevisions = data.length;
  const totalCost = data.reduce((sum, r) => sum + (r.cost_of_damage || 0), 0);
  const totalManhours = data.reduce((sum, r) => sum + (r.manhour_spent || 0), 0);
  const avgManhours = totalRevisions > 0 ? (totalManhours / totalRevisions).toFixed(1) : "0";
  const criticalErrors = data.filter(r => r.damage && r.damage.includes('Y')).length;

  // Chart 1: Cost by Dept
  const costByDept = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach(r => {
        const dept = r.department || 'Unknown';
        map.set(dept, (map.get(dept) || 0) + (r.cost_of_damage || 0));
    });
    return Array.from(map.entries())
        .map(([name, cost]) => ({ name, cost }))
        .sort((a, b) => b.cost - a.cost)
        .slice(0, 6); // Top 6
  }, [data]);

  // Chart 2: General Cause
  const generalCauseData = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach(r => {
        const cause = r.general_cause_of_error || 'Unspecified';
        map.set(cause, (map.get(cause) || 0) + 1);
    });
    return Array.from(map.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
  }, [data]);

  // Chart 3: Monthly Manhour Trend
  const workloadData = useMemo(() => {
    const map = new Map<string, number>();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    // Initialize months to 0 for smoother charts if empty
    // months.forEach(m => map.set(m, 0)); 

    data.forEach(r => {
        const month = r.billing_month || 'Unknown';
        if (month !== 'Unknown') {
            map.set(month, (map.get(month) || 0) + (r.manhour_spent || 0));
        }
    });

    return Array.from(map.entries())
        .map(([month, hours]) => ({ month, hours }))
        .sort((a, b) => months.indexOf(a.month) - months.indexOf(b.month));
  }, [data]);

  if (loading) {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center animate-fade-in">
            <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
            <p className="opacity-60 text-sm">Loading Dashboard Analytics...</p>
        </div>
    );
  }

  if (data.length === 0) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center animate-fade-in text-center p-8">
            <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                <Database className="text-slate-400" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Data Available</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
                The database is currently empty. Go to the <strong>PDR Review</strong> page to add entries or upload a CSV file.
            </p>
        </div>
      );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Manager Overview</h1>
        <p className="opacity-70 text-slate-600 dark:text-slate-300 font-medium">Real-time insights based on {totalRevisions} PDR records.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            title="Total Revisions" 
            value={totalRevisions.toLocaleString()} 
            icon={<TrendingUp size={24} />} 
            subValue="Active"
        />
        <StatCard 
            title="Total Cost Impact" 
            value={`¥${(totalCost / 1000000).toFixed(2)}M`} 
            icon={<DollarSign size={24} />} 
            subLabel={`¥${totalCost.toLocaleString()} Raw Total`}
        />
        <StatCard 
            title="Avg Manhours / Rev" 
            value={`${avgManhours}h`} 
            icon={<Clock size={24} />} 
            subValue="Efficiency"
        />
        <StatCard 
            title="Critical Damages" 
            value={criticalErrors.toString()} 
            icon={<AlertCircle size={24} />} 
            subValue={`${((criticalErrors/totalRevisions)*100).toFixed(1)}%`}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10">
          <h3 className="text-lg font-bold mb-6 text-slate-800 dark:text-white">Cost of Damage by Department</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costByDept}>
                <defs>
                   <linearGradient id="colorCostDash" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3}/>
                   </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} stroke="currentColor" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="currentColor" 
                  opacity={0.5} 
                  tick={{ fontSize: 12, fill: 'currentColor' }} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  stroke="currentColor" 
                  opacity={0.5} 
                  tick={{ fontSize: 12, fill: 'currentColor' }} 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `¥${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={TOOLTIP_STYLE}
                  itemStyle={{ color: '#fff' }}
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  formatter={(val: number) => `¥${val.toLocaleString()}`}
                />
                <Bar dataKey="cost" fill="url(#colorCostDash)" radius={[6, 6, 0, 0]}>
                  {costByDept.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10">
          <h3 className="text-lg font-bold mb-6 text-slate-800 dark:text-white">General Causes of Error</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={generalCauseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  stroke="none"
                >
                  {generalCauseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{color: '#fff'}} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2: Manhour Trends with Toggle */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Activity size={18} className="text-emerald-500" /> Monthly Manhour Trends
            </h3>
            
            <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-lg border border-slate-200 dark:border-white/10">
                <button 
                    onClick={() => setChartType('area')}
                    className={`p-2 rounded-md transition-all ${chartType === 'area' ? 'bg-white dark:bg-white/10 shadow text-emerald-600 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'}`}
                    title="Area Chart"
                >
                    <Activity size={16} />
                </button>
                <button 
                    onClick={() => setChartType('line')}
                    className={`p-2 rounded-md transition-all ${chartType === 'line' ? 'bg-white dark:bg-white/10 shadow text-emerald-600 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'}`}
                    title="Line Chart"
                >
                    <GitCommit size={16} className="rotate-90" />
                </button>
                <button 
                    onClick={() => setChartType('bar')}
                    className={`p-2 rounded-md transition-all ${chartType === 'bar' ? 'bg-white dark:bg-white/10 shadow text-emerald-600 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'}`}
                    title="Bar Chart"
                >
                    <BarChart2 size={16} />
                </button>
            </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
                <AreaChart data={workloadData}>
                    <defs>
                        <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} stroke="currentColor" vertical={false} />
                    <XAxis dataKey="month" stroke="currentColor" opacity={0.5} axisLine={false} tickLine={false} />
                    <YAxis stroke="currentColor" opacity={0.5} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{color: '#fff'}} />
                    <Area type="monotone" dataKey="hours" stroke="#10b981" strokeWidth={3} fill="url(#colorHours)" />
                </AreaChart>
            ) : chartType === 'line' ? (
                <LineChart data={workloadData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} stroke="currentColor" vertical={false} />
                    <XAxis dataKey="month" stroke="currentColor" opacity={0.5} axisLine={false} tickLine={false} />
                    <YAxis stroke="currentColor" opacity={0.5} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{color: '#fff'}} />
                    <Line type="monotone" dataKey="hours" stroke="#10b981" strokeWidth={4} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                </LineChart>
            ) : (
                <BarChart data={workloadData}>
                    <defs>
                        <linearGradient id="colorHoursBar" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} stroke="currentColor" vertical={false} />
                    <XAxis dataKey="month" stroke="currentColor" opacity={0.5} axisLine={false} tickLine={false} />
                    <YAxis stroke="currentColor" opacity={0.5} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{color: '#fff'}} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                    <Bar dataKey="hours" fill="url(#colorHoursBar)" radius={[6, 6, 0, 0]} />
                </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;