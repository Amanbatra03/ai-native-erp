import React, { useEffect, useState } from 'react';
import { getDashboardStats, getDashboardInsight, getHRPayroll, getLeads } from '../api';
import { 
  Building2, TrendingUp, Wallet, AlertTriangle, 
  Sparkles, Loader2, Zap, Coins
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState<any>({ 
    companies: 0, employees: 0, revenue: 0, 
    net_income: 0, low_stock: 0, pending_leaves: 0 
  });
  const [payroll, setPayroll] = useState<any>({ total_monthly_payroll: 0, employee_count: 0 });
  const [leadCount, setLeadCount] = useState(0);
  const [insight, setInsight] = useState("");
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
        console.error("Critical dashboard error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const Card = ({ title, value, icon: Icon, color, subValue }: any) => (
    <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl text-white">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          {Icon && <Icon size={24} className="text-white" />}
        </div>
      </div>
      <h3 className="text-gray-400 font-medium">{title}</h3>
      <p className="text-3xl font-bold mt-1">{value ?? 0}</p>
      {subValue && <p className="text-sm text-gray-500 mt-2">{subValue}</p>}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8">
          <h1 className="text-3xl font-bold">Business Overview</h1>
          <p className="text-gray-400 text-sm">ERP v3.0 Live Metrics</p>
      </header>

      {/* AI Insight */}
      <div className="mb-10 bg-blue-900/10 border border-blue-500/20 p-6 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
              <Sparkles size={20} className="text-white" />
          </div>
          <p className="text-gray-200 italic">"{insight || "Analyzing data..."}"</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card 
            title="Revenue" 
            value={`$${(stats.revenue || 0).toLocaleString()}`} 
            icon={TrendingUp} 
            color="bg-green-600" 
            subValue="Total volume"
        />
        <Card 
            title="Net Income" 
            value={`$${(stats.net_income || 0).toLocaleString()}`} 
            icon={Wallet} 
            color="bg-blue-600" 
            subValue="Cash Flow"
        />
        <Card 
            title="Monthly Payroll" 
            value={`$${(payroll.total_monthly_payroll || 0).toLocaleString()}`} 
            icon={Coins} 
            color="bg-purple-600" 
            subValue={`${payroll.employee_count || 0} Employees`}
        />
        <Card 
            title="Marketing Pipeline" 
            value={leadCount} 
            icon={Zap} 
            color="bg-pink-600" 
            subValue="Active Leads"
        />
        <Card 
            title="Low Stock" 
            value={stats.low_stock} 
            icon={AlertTriangle} 
            color="bg-orange-600" 
        />
        <Card title="Companies" value={stats.companies} icon={Building2} color="bg-indigo-600" />
      </div>
    </div>
  );
};

export default Dashboard;
