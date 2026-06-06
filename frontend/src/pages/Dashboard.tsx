import { useEffect, useState } from 'react';
import { getDashboardStats, getDashboardInsight, getHRPayroll, getLeads } from '../api';
import {
  Building2, TrendingUp, Wallet, AlertTriangle,
  Sparkles, Loader2, Zap, Coins
} from 'lucide-react';

interface CardProps {
  title: string;
  value: string | number;
  icon: any;
  subValue?: string;
  accent?: string;
}

const Card = ({ title, value, icon: Icon, subValue, accent = 'text-blue-400' }: CardProps) => (
  <div className="bg-[#0f0f0f] border border-white/[0.07] p-6 rounded-xl hover:border-white/[0.12] transition-all duration-200 group">
    <div className="flex justify-between items-start mb-5">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
      <div className={`${accent} opacity-60 group-hover:opacity-100 transition-opacity`}>
        <Icon size={16} />
      </div>
    </div>
    <p className={`text-[2rem] font-bold tracking-tight leading-none num ${accent}`}>{value ?? 0}</p>
    {subValue && <p className="text-xs text-gray-600 mt-2.5">{subValue}</p>}
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState<any>({
    companies: 0, employees: 0, revenue: 0,
    net_income: 0, low_stock: 0, pending_leaves: 0
  });
  const [payroll, setPayroll] = useState<any>({ total_monthly_payroll: 0, employee_count: 0 });
  const [leadCount, setLeadCount] = useState(0);
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, insightRes, payrollRes, leadsRes] = await Promise.allSettled([
          getDashboardStats(),
          getDashboardInsight(),
          getHRPayroll(),
          getLeads()
        ]);
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        if (insightRes.status === 'fulfilled') setInsight(insightRes.value.data.insight);
        if (payrollRes.status === 'fulfilled') setPayroll(payrollRes.value.data);
        if (leadsRes.status === 'fulfilled') setLeadCount(leadsRes.value.data.length);
      } catch (error) {
        console.error('Critical dashboard error', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-3">
        <Loader2 className="animate-spin text-blue-600" size={28} />
        <p className="text-xs text-gray-600 tracking-wider uppercase">Loading metrics…</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Business Overview</h1>
        <p className="text-gray-600 text-xs mt-1 uppercase tracking-widest font-medium">ERP v3.0 · Live Metrics</p>
      </header>

      {/* AI Insight */}
      <div className="mb-8 flex items-start gap-4 p-5 rounded-xl border-l-2 border-blue-500/50 bg-blue-600/[0.04] border border-blue-500/10 border-l-blue-500/50">
        <div className="w-8 h-8 bg-blue-600/90 rounded-lg flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(37,99,235,0.3)]">
          <Sparkles size={15} className="text-white" />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-blue-400/70 uppercase tracking-widest mb-1">AI Insight</p>
          <p className="text-sm text-gray-300 leading-relaxed italic">
            "{insight || 'Analyzing business data…'}"
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card
          title="Revenue"
          value={`$${(stats.revenue || 0).toLocaleString()}`}
          icon={TrendingUp}
          subValue="Total volume"
          accent="text-emerald-400"
        />
        <Card
          title="Net Income"
          value={`$${(stats.net_income || 0).toLocaleString()}`}
          icon={Wallet}
          subValue="Cash flow"
          accent="text-blue-400"
        />
        <Card
          title="Monthly Payroll"
          value={`$${(payroll.total_monthly_payroll || 0).toLocaleString()}`}
          icon={Coins}
          subValue={`${payroll.employee_count || 0} employees`}
          accent="text-violet-400"
        />
        <Card
          title="Marketing Pipeline"
          value={leadCount}
          icon={Zap}
          subValue="Active leads"
          accent="text-pink-400"
        />
        <Card
          title="Low Stock Alerts"
          value={stats.low_stock}
          icon={AlertTriangle}
          subValue="Items need restocking"
          accent="text-amber-400"
        />
        <Card
          title="Companies"
          value={stats.companies}
          icon={Building2}
          subValue="Active accounts"
          accent="text-indigo-400"
        />
      </div>
    </div>
  );
};

export default Dashboard;
