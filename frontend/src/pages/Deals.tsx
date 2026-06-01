import React, { useEffect, useState } from 'react';
import { getDeals, createDeal, getCompanies } from '../api';
import { Briefcase, Plus, DollarSign, BarChart3, Building2 } from 'lucide-react';

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newDeal, setNewDeal] = useState({ title: '', amount: '', status: 'Lead', company_id: '' });

  const fetchData = async () => {
    try {
      const [dealsRes, companiesRes] = await Promise.all([getDeals(), getCompanies()]);
      setDeals(dealsRes.data);
      setCompanies(companiesRes.data);
    } catch (error) {
      console.error("Error fetching deals", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDeal({
        ...newDeal,
        amount: parseFloat(newDeal.amount),
        company_id: parseInt(newDeal.company_id)
      });
      setShowModal(false);
      setNewDeal({ title: '', amount: '', status: 'Lead', company_id: '' });
      fetchData();
    } catch (error) {
      console.error("Error creating deal", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Closed Won': return 'bg-green-600/20 text-green-400';
      case 'Closed Lost': return 'bg-red-600/20 text-red-400';
      case 'Negotiation': return 'bg-orange-600/20 text-orange-400';
      case 'Proposal': return 'bg-blue-600/20 text-blue-400';
      default: return 'bg-gray-800 text-gray-400';
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Deals</h1>
          <p className="text-gray-400">Track your sales opportunities and revenue</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Add Deal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {deals.map((deal: any) => (
          <div key={deal.id} className="bg-gray-900 border border-gray-800 p-6 rounded-xl hover:border-blue-500 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-gray-800 rounded-lg text-blue-400">
                <Briefcase size={20} />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(deal.status)}`}>
                {deal.status}
              </span>
            </div>
            <h3 className="text-xl font-bold mb-1">{deal.title}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
              <Building2 size={14} />
              <span>{companies.find((c: any) => c.id === deal.company_id)?.name}</span>
            </div>
            <div className="flex justify-between items-end border-t border-gray-800 pt-4 mt-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Amount</p>
                <div className="flex items-center text-xl font-bold text-green-400">
                  <DollarSign size={18} />
                  {deal.amount.toLocaleString()}
                </div>
              </div>
              <BarChart3 size={24} className="text-gray-700" />
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Add New Deal</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Deal Title</label>
                <input
                  type="text"
                  required
                  value={newDeal.title}
                  onChange={e => setNewDeal({ ...newDeal, title: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Amount ($)</label>
                <input
                  type="number"
                  required
                  value={newDeal.amount}
                  onChange={e => setNewDeal({ ...newDeal, amount: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                <select
                  value={newDeal.status}
                  onChange={e => setNewDeal({ ...newDeal, status: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Lead">Lead</option>
                  <option value="Proposal">Proposal</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Closed Won">Closed Won</option>
                  <option value="Closed Lost">Closed Lost</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Company</label>
                <select
                  required
                  value={newDeal.company_id}
                  onChange={e => setNewDeal({ ...newDeal, company_id: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select a Company</option>
                  {companies.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
                >
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
