import { useEffect, useState } from 'react';
import { getTransactions, createTransaction, getCompanies } from '../api';
import { useLiveData } from '../hooks/useLiveData';
import { Plus, ArrowUpRight, ArrowDownLeft, Tag, Calendar, X, Radio } from 'lucide-react';
import { clsx } from 'clsx';

const inputCls = "w-full bg-[var(--bg-input)] border border-[var(--border)] focus:border-blue-500/60 rounded-lg px-4 py-2.5 text-sm text-[var(--text-1)] placeholder-[var(--text-3)] outline-none transition-all duration-150";
const labelCls = "block text-xs font-medium text-[var(--text-3)] mb-1.5 uppercase tracking-wider";

const Transactions = () => {
  const { data: transactions, loading, lastUpdated } = useLiveData<any[]>(getTransactions);
  const list = transactions ?? [];

  const [companies, setCompanies] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newTransaction, setNewTransaction] = useState({ description: '', amount: 0, type: 'Income', category: '', company_id: '' });

  useEffect(() => {
    getCompanies().then((res) => {
      setCompanies(res.data);
      if (res.data.length > 0) setNewTransaction(prev => ({ ...prev, company_id: res.data[0].id }));
    }).catch(() => {});
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTransaction({
        ...newTransaction,
        amount: parseFloat(newTransaction.amount as any),
        company_id: parseInt(newTransaction.company_id as any),
      });
      setShowModal(false);
      setNewTransaction({ description: '', amount: 0, type: 'Income', category: '', company_id: companies[0]?.id || '' });
    } catch (error) {
      console.error('Error creating transaction', error);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-1)]">Finance</h1>
            {!loading && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <Radio size={9} className="animate-pulse" />
                Live
              </span>
            )}
          </div>
          <p className="text-[var(--text-3)] text-xs mt-1">
            {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` : 'Track income and expenses'}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all duration-150 shadow-[0_1px_4px_rgba(37,99,235,0.3)]"
        >
          <Plus size={16} />
          New Transaction
        </button>
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--border)] bg-white/[0.02]">
              {['Description', 'Category', 'Company', 'Date', 'Amount'].map((h, i) => (
                <th key={h} className={`px-6 py-3.5 text-[10px] font-semibold text-[var(--text-3)] uppercase tracking-widest${i === 4 ? ' text-right' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {[200, 120, 140, 130, 80].map((w, j) => (
                      <td key={j} className="px-6 py-4"><div className="skeleton h-3 rounded" style={{ width: w }} /></td>
                    ))}
                  </tr>
                ))
              : list.map((t: any) => (
                  <tr key={t.id} className="hover:bg-white/[0.02] transition-colors duration-100">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={clsx(
                          'w-7 h-7 rounded-full flex items-center justify-center shrink-0',
                          t.type === 'Income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                        )}>
                          {t.type === 'Income' ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                        </div>
                        <span className="text-sm text-[var(--text-1)] font-medium">{t.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-3)] text-xs">
                      <div className="flex items-center gap-1.5"><Tag size={12} />{t.category}</div>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-3)] text-xs">
                      {companies.find(c => c.id === t.company_id)?.name || '—'}
                    </td>
                    <td className="px-6 py-4 text-[var(--text-3)] text-xs">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>
                    <td className={clsx(
                      'px-6 py-4 font-semibold text-right text-sm num',
                      t.type === 'Income' ? 'text-emerald-400' : 'text-red-400'
                    )}>
                      {t.type === 'Income' ? '+' : '−'}${t.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] p-7 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold tracking-tight text-[var(--text-1)]">Record Transaction</h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors p-1 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className={labelCls}>Description</label>
                <input type="text" required placeholder="e.g. SaaS subscription" value={newTransaction.description}
                  onChange={e => setNewTransaction({ ...newTransaction, description: e.target.value })} className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Amount</label>
                  <input type="number" required placeholder="0.00" value={newTransaction.amount}
                    onChange={e => setNewTransaction({ ...newTransaction, amount: e.target.value as any })} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Type</label>
                  <select value={newTransaction.type} onChange={e => setNewTransaction({ ...newTransaction, type: e.target.value })} className={inputCls}>
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>Category</label>
                <input type="text" required placeholder="e.g. Software" value={newTransaction.category}
                  onChange={e => setNewTransaction({ ...newTransaction, category: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Company</label>
                <select required value={newTransaction.company_id} onChange={e => setNewTransaction({ ...newTransaction, company_id: e.target.value })} className={inputCls}>
                  {companies.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white/[0.05] hover:bg-white/[0.09] text-[var(--text-2)] text-sm py-2.5 rounded-lg transition-all duration-150 font-medium">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm py-2.5 rounded-lg transition-all duration-150 font-medium shadow-[0_1px_4px_rgba(37,99,235,0.3)]">Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
