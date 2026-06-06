import React, { useEffect, useState } from 'react';
import { getDeals, createDeal, getCompanies } from '../api';
import { Briefcase, Plus, DollarSign, Building2, X } from 'lucide-react';

const inputCls = "w-full bg-[#111] border border-white/[0.08] focus:border-blue-500/60 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-700 outline-none transition-all duration-150";
const labelCls = "block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider";

const statusStyles: Record<string, string> = {
  'Closed Won': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Closed Lost': 'bg-red-500/10 text-red-400 border-red-500/20',
  'Negotiation': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Proposal': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Lead': 'bg-white/[0.05] text-gray-500 border-white/[0.08]',
};

const Deals = () => {
  const [deals, setDeals] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newDeal, setNewDeal] = useState({ title: '', amount: '', status: 'Lead', company_id: '' });

  const fetchData = async () => {
    try {
      const [dealsRes, companiesRes] = await Promise.all([getDeals(), getCompanies()]);
      setDeals(dealsRes.data);
      setCompanies(companiesRes.data);
    } catch (error) {
      console.error('Error fetching deals', error);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDeal({ ...newDeal, amount: parseFloat(newDeal.amount), company_id: parseInt(newDeal.company_id) });
      setShowModal(false);
      setNewDeal({ title: '', amount: '', status: 'Lead', company_id: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating deal', error);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Deals</h1>
          <p className="text-gray-600 text-xs mt-1">Track your sales opportunities and revenue</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all duration-150 shadow-[0_1px_4px_rgba(37,99,235,0.3)]"
        >
          <Plus size={16} />
          Add Deal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {deals.map((deal: any) => (
          <div key={deal.id} className="bg-[#0f0f0f] border border-white/[0.07] hover:border-white/[0.14] p-6 rounded-xl transition-all duration-150">
            <div className="flex justify-between items-start mb-5">
              <div className="p-2 bg-white/[0.04] rounded-lg text-blue-400">
                <Briefcase size={16} />
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${statusStyles[deal.status] || statusStyles['Lead']}`}>
                {deal.status}
              </span>
            </div>
            <h3 className="font-semibold tracking-tight text-white mb-1.5">{deal.title}</h3>
            <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-5">
              <Building2 size={12} />
              <span>{companies.find((c: any) => c.id === deal.company_id)?.name}</span>
            </div>
            <div className="border-t border-white/[0.05] pt-4">
              <p className="text-[10px] text-gray-700 uppercase tracking-wider mb-1">Amount</p>
              <div className="flex items-center text-lg font-bold text-emerald-400 num">
                <DollarSign size={16} />
                {deal.amount.toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f0f0f] border border-white/[0.09] p-7 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold tracking-tight">Add Deal</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-600 hover:text-gray-300 transition-colors p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className={labelCls}>Deal Title</label>
                <input type="text" required placeholder="Enterprise License Deal" value={newDeal.title}
                  onChange={e => setNewDeal({ ...newDeal, title: e.target.value })}
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Amount ($)</label>
                <input type="number" required placeholder="0.00" value={newDeal.amount}
                  onChange={e => setNewDeal({ ...newDeal, amount: e.target.value })}
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select value={newDeal.status}
                  onChange={e => setNewDeal({ ...newDeal, status: e.target.value })}
                  className={inputCls}>
                  <option>Lead</option>
                  <option>Proposal</option>
                  <option>Negotiation</option>
                  <option>Closed Won</option>
                  <option>Closed Lost</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Company</label>
                <select required value={newDeal.company_id}
                  onChange={e => setNewDeal({ ...newDeal, company_id: e.target.value })}
                  className={inputCls}>
                  <option value="">Select a company</option>
                  {companies.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 bg-white/[0.05] hover:bg-white/[0.09] text-gray-300 text-sm py-2.5 rounded-lg transition-all duration-150 font-medium">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm py-2.5 rounded-lg transition-all duration-150 font-medium shadow-[0_1px_4px_rgba(37,99,235,0.3)]">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deals;
