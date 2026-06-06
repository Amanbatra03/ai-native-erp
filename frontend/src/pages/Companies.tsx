import { useState } from 'react';
import { getCompanies, createCompany } from '../api';
import { useLiveData } from '../hooks/useLiveData';
import { Building2, Plus, Globe, Tag, X, Radio } from 'lucide-react';

const inputCls = "w-full bg-[var(--bg-input)] border border-[var(--border)] focus:border-blue-500/60 rounded-lg px-4 py-2.5 text-sm text-[var(--text-1)] placeholder-[var(--text-3)] outline-none transition-all duration-150";
const labelCls = "block text-xs font-medium text-[var(--text-3)] mb-1.5 uppercase tracking-wider";

const Companies = () => {
  const { data: companies, loading, lastUpdated, } = useLiveData<any[]>(getCompanies);
  const list = companies ?? [];

  const [showModal, setShowModal] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: '', industry: '', website: '', description: '' });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCompany(newCompany);
      setShowModal(false);
      setNewCompany({ name: '', industry: '', website: '', description: '' });
    } catch (error) {
      console.error('Error creating company', error);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-1)]">Companies</h1>
            {!loading && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <Radio size={9} className="animate-pulse" />
                Live
              </span>
            )}
          </div>
          <p className="text-[var(--text-3)] text-xs mt-1">
            {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` : 'Manage your business accounts'}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all duration-150 shadow-[0_1px_4px_rgba(37,99,235,0.3)]"
        >
          <Plus size={16} />
          Add Company
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-[var(--bg-surface)] border border-[var(--border)] p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="skeleton w-10 h-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-3 w-32 rounded" />
                    <div className="skeleton h-2.5 w-20 rounded" />
                  </div>
                </div>
                <div className="skeleton h-2.5 w-full rounded mb-2" />
                <div className="skeleton h-2.5 w-3/4 rounded" />
              </div>
            ))
          : list.map((company: any) => (
              <div key={company.id} className="bg-[var(--bg-surface)] border border-[var(--border)] hover:border-white/[0.14] p-6 rounded-xl transition-all duration-150 group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white/[0.04] rounded-lg flex items-center justify-center text-blue-400 group-hover:bg-blue-600/20 transition-colors duration-150">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold tracking-tight text-[var(--text-1)]">{company.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-3)] mt-0.5">
                      <Tag size={11} />
                      <span>{company.industry}</span>
                    </div>
                  </div>
                </div>
                <p className="text-[var(--text-3)] text-xs mb-4 line-clamp-2 leading-relaxed">
                  {company.description || 'No description provided.'}
                </p>
                <div className="flex items-center gap-1.5 text-blue-400 text-xs">
                  <Globe size={12} />
                  <a
                    href={company.website?.startsWith('http') ? company.website : `https://${company.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-blue-300 transition-colors duration-150"
                  >
                    {company.website}
                  </a>
                </div>
              </div>
            ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] p-7 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold tracking-tight text-[var(--text-1)]">Add Company</h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className={labelCls}>Company Name</label>
                <input type="text" required placeholder="Acme Corp" value={newCompany.name}
                  onChange={e => setNewCompany({ ...newCompany, name: e.target.value })}
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Industry</label>
                <input type="text" placeholder="Technology" value={newCompany.industry}
                  onChange={e => setNewCompany({ ...newCompany, industry: e.target.value })}
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Website</label>
                <input type="text" placeholder="acmecorp.com" value={newCompany.website}
                  onChange={e => setNewCompany({ ...newCompany, website: e.target.value })}
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <textarea value={newCompany.description} placeholder="Brief description…"
                  onChange={e => setNewCompany({ ...newCompany, description: e.target.value })}
                  className={`${inputCls} h-20 resize-none`} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 bg-white/[0.05] hover:bg-white/[0.09] text-[var(--text-2)] text-sm py-2.5 rounded-lg transition-all duration-150 font-medium">
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

export default Companies;
