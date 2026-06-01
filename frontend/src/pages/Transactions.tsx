import React, { useEffect, useState } from 'react';
import { getTransactions, createTransaction, getCompanies } from '../api';
import { DollarSign, Plus, ArrowUpRight, ArrowDownLeft, Tag, Calendar } from 'lucide-react';
import { clsx } from 'clsx';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newTransaction, setNewTransaction] = useState({ 
    description: '', 
    amount: 0, 
    type: 'Income', 
    category: '', 
    company_id: '' 
  });

  const fetchData = async () => {
    try {
      const [transRes, compRes] = await Promise.all([getTransactions(), getCompanies()]);
      setTransactions(transRes.data);
      setCompanies(compRes.data);
      if (compRes.data.length > 0) {
        setNewTransaction(prev => ({ ...prev, company_id: compRes.data[0].id }));
      }
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTransaction({
        ...newTransaction,
        amount: parseFloat(newTransaction.amount as any),
        company_id: parseInt(newTransaction.company_id as any)
      });
      setShowModal(false);
      setNewTransaction({ description: '', amount: 0, type: 'Income', category: '', company_id: companies[0]?.id || '' });
      fetchData();
    } catch (error) {
      console.error("Error creating transaction", error);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Finance</h1>
          <p className="text-gray-400">Track income and expenses</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          New Transaction
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-800/50">
              <th className="px-6 py-4 font-bold text-sm uppercase tracking-wider text-gray-400">Description</th>
              <th className="px-6 py-4 font-bold text-sm uppercase tracking-wider text-gray-400">Category</th>
              <th className="px-6 py-4 font-bold text-sm uppercase tracking-wider text-gray-400">Company</th>
              <th className="px-6 py-4 font-bold text-sm uppercase tracking-wider text-gray-400">Date</th>
              <th className="px-6 py-4 font-bold text-sm uppercase tracking-wider text-gray-400 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {transactions.map((transaction: any) => (
              <tr key={transaction.id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={clsx(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      transaction.type === 'Income' ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"
                    )}>
                      {transaction.type === 'Income' ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                    </div>
                    <span className="font-medium">{transaction.description}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-400">
                  <div className="flex items-center gap-2">
                    <Tag size={14} />
                    {transaction.category}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-400">
                   {companies.find(c => c.id === transaction.company_id)?.name || "Unknown"}
                </td>
                <td className="px-6 py-4 text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    {new Date(transaction.date).toLocaleDateString()}
                  </div>
                </td>
                <td className={clsx(
                  "px-6 py-4 font-bold text-right",
                  transaction.type === 'Income' ? "text-green-400" : "text-red-400"
                )}>
                  {transaction.type === 'Income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Record Transaction</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={newTransaction.description}
                  onChange={e => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Amount</label>
                  <input
                    type="number"
                    required
                    value={newTransaction.amount}
                    onChange={e => setNewTransaction({ ...newTransaction, amount: e.target.value as any })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
                  <select
                    value={newTransaction.type}
                    onChange={e => setNewTransaction({ ...newTransaction, type: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                <input
                  type="text"
                  required
                  value={newTransaction.category}
                  onChange={e => setNewTransaction({ ...newTransaction, category: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Company</label>
                <select
                  required
                  value={newTransaction.company_id}
                  onChange={e => setNewTransaction({ ...newTransaction, company_id: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  {companies.map((company: any) => (
                    <option key={company.id} value={company.id}>{company.name}</option>
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
                  Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
