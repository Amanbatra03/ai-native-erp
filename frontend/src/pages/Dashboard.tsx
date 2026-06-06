import { useEffect, useState } from 'react';
import { getDashboardStats, getDashboardInsight, getHRPayroll, getLeads } from '../api';
import {
  Building2, TrendingUp, Wallet, AlertTriangle,
  Sparkles, Zap, Coins
} from 'lucide-react';

interface CardProps {
  title: string;
  value: string | number;
  icon: any;
  subValue?: string;
  accent?: string;
}

const Card = ({ title, value, icon: Icon, subValue, accent = 'text-blue-400' }: CardProps) => (
  <div className="bg-[var(--bg-surface)] border border-[var(--border)] p-6 rounded-xl hover:border-white/[0.12] transition-all duration-200 group">
    <div className="flex justify-between items-start mb-5">
      <p className="text-xs font-semibold text-[var(--text-3)] uppercase tracking-wider">{title}</p>
      <div className={`${accent} opacity-60 group-hover:opacity-100 transition-opacity`}>
        <Icon size={16} />
      </div>
    </div>
    <p className={`text-[2rem] font-bold tracking-tight leading-none num ${accent}`}>{value ?? 0}</p>
    {subValue && <p className="text-xs text-[var(--text-3)] mt-2.5">{subValue}</p>}
  </div>
);

const SkeletonCard = () => (
  <div className="bg-[var(--bg-surface)] border border-[var(--border)] p-6 rounded-xl">
    <div className="flex justify-between items-start mb-5">
      <div className="skeleton h-2.5 w-24 rounded" />
      <div className="skeleton w-4 h-4 rounded" />
    </div>
    <div className="skeleton h-9 w-32 rounded mb-2.5" />
    <div className="skeleton h-2 w-20 rounded" />
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [payroll, setPayroll] = useState<any>(null);
  const [leadCount, setLeadCount] = useState<number | null>(null);
  const [insight, setInsight] = useState('');
  const [insightLoading, setInsightLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    // Stats load fast (cached on backend)
    Promise.allSettled([getDashboardStats(), getHRPayroll(), getLeads()]).then(
      ([statsRes, payrollRes, leadsRes]) => {
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        if (payrollRes.status === 'fulfilled') setPayroll(payrollRes.value.data);
        if (leadsRes.status === 'fulfilled') setLeadCount(leadsRes.value.data.length);
        setStatsLoading(false);
      }
    );

    // Insight is slow (LLM call) — load independently
    getDashboardInsight()
      .then((res) => setInsight(res.data.insight))
      .catch(() => setInsight('Unable to load AI insight at this time.'))
      .finally(() => setInsightLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-1)]">Business Overview</h1>
        <p className="text-[var(--text-3)] text-xs mt-1 uppercase tracking-widest font-medium">ERP v4.0 · Live Metrics</p>
      </header>

      {/* AI Insight */}
      <div className="mb-8 flex items-start gap-4 p-5 rounded-xl border-l-2 border-blue-500/50 bg-blue-600/[0.04] border border-blue-500/10">
        <div className="w-8 h-8 bg-blue-600/90 rounded-lg flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(37,99,235,0.3)]">
          <Sparkles size={15} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-blue-400/70 uppercase tracking-widest mb-1">AI Insight</p>
          {insightLoading ? (
            <div className="flex items-center gap-1.5 pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 thinking-dot" />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 thinking-dot" />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 thinking-dot" />
            </div>
          ) : (
            <p className="text-sm text-[var(--text-2)] leading-relaxed italic">"{insight}"</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statsLoading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <Card
              title="Revenue"
              value={`$${(stats?.revenue || 0).toLocaleString()}`}
              icon={TrendingUp}
              subValue="Total volume"
              accent="text-emerald-400"
            />
            <Card
              title="Net Income"
              value={`$${(stats?.net_income || 0).toLocaleString()}`}
              icon={Wallet}
              subValue="Cash flow"
              accent="text-blue-400"
            />
            <Card
              title="Monthly Payroll"
              value={`$${(payroll?.total_monthly_payroll || 0).toLocaleString()}`}
              icon={Coins}
              subValue={`${payroll?.employee_count || 0} employees`}
              accent="text-violet-400"
            />
            <Card
              title="Marketing Pipeline"
              value={leadCount ?? 0}
              icon={Zap}
              subValue="Active leads"
              accent="text-pink-400"
            />
            <Card
              title="Low Stock Alerts"
              value={stats?.low_stock ?? 0}
              icon={AlertTriangle}
              subValue="Items need restocking"
              accent="text-amber-400"
            />
            <Card
              title="Companies"
              value={stats?.companies ?? 0}
              icon={Building2}
              subValue="Active accounts"
              accent="text-indigo-400"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
