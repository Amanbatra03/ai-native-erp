import { useEffect, useState } from 'react';
import { getContacts, createContact, getCompanies } from '../api';
import { useLiveData } from '../hooks/useLiveData';
import { Plus, Mail, Phone, Building2, X, Radio } from 'lucide-react';

const inputCls = "w-full bg-[var(--bg-input)] border border-[var(--border)] focus:border-blue-500/60 rounded-lg px-4 py-2.5 text-sm text-[var(--text-1)] placeholder-[var(--text-3)] outline-none transition-all duration-150";
const labelCls = "block text-xs font-medium text-[var(--text-3)] mb-1.5 uppercase tracking-wider";

const Contacts = () => {
  const { data: contacts, loading, lastUpdated } = useLiveData<any[]>(getContacts);
  const list = contacts ?? [];

  const [companies, setCompanies] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newContact, setNewContact] = useState({ first_name: '', last_name: '', email: '', phone: '', company_id: '' });

  useEffect(() => {
    getCompanies().then((res) => setCompanies(res.data)).catch(() => {});
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createContact({ ...newContact, company_id: newContact.company_id ? parseInt(newContact.company_id) : null });
      setShowModal(false);
      setNewContact({ first_name: '', last_name: '', email: '', phone: '', company_id: '' });
    } catch (error) {
      console.error('Error creating contact', error);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-1)]">Contacts</h1>
            {!loading && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <Radio size={9} className="animate-pulse" />
                Live
              </span>
            )}
          </div>
          <p className="text-[var(--text-3)] text-xs mt-1">
            {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` : 'Your network of business professionals'}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all duration-150 shadow-[0_1px_4px_rgba(37,99,235,0.3)]"
        >
          <Plus size={16} />
          Add Contact
        </button>
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--border)] bg-white/[0.02]">
              <th className="px-6 py-3.5 text-[10px] font-semibold text-[var(--text-3)] uppercase tracking-widest">Name</th>
              <th className="px-6 py-3.5 text-[10px] font-semibold text-[var(--text-3)] uppercase tracking-widest">Email</th>
              <th className="px-6 py-3.5 text-[10px] font-semibold text-[var(--text-3)] uppercase tracking-widest">Phone</th>
              <th className="px-6 py-3.5 text-[10px] font-semibold text-[var(--text-3)] uppercase tracking-widest">Company</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {[180, 200, 120, 140].map((w, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className={`skeleton h-3 rounded`} style={{ width: w }} />
                      </td>
                    ))}
                  </tr>
                ))
              : list.map((contact: any) => (
                  <tr key={contact.id} className="hover:bg-white/[0.02] transition-colors duration-100">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600/15 text-blue-400 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                          {contact.first_name[0]}{contact.last_name[0]}
                        </div>
                        <span className="text-sm font-medium text-[var(--text-1)]">{contact.first_name} {contact.last_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-2)] text-sm">
                      <div className="flex items-center gap-2">
                        <Mail size={13} className="text-[var(--text-3)] shrink-0" />
                        {contact.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-2)] text-sm">
                      <div className="flex items-center gap-2">
                        <Phone size={13} className="text-[var(--text-3)] shrink-0" />
                        {contact.phone || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 bg-white/[0.04] text-[var(--text-3)] border border-[var(--border)] px-2.5 py-1 rounded-full text-xs">
                        <Building2 size={11} />
                        {companies.find((c: any) => c.id === contact.company_id)?.name || 'Individual'}
                      </span>
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
              <h2 className="text-lg font-semibold tracking-tight text-[var(--text-1)]">Add Contact</h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>First Name</label>
                  <input type="text" required placeholder="Jane" value={newContact.first_name}
                    onChange={e => setNewContact({ ...newContact, first_name: e.target.value })}
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Last Name</label>
                  <input type="text" required placeholder="Doe" value={newContact.last_name}
                    onChange={e => setNewContact({ ...newContact, last_name: e.target.value })}
                    className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input type="email" required placeholder="jane@company.com" value={newContact.email}
                  onChange={e => setNewContact({ ...newContact, email: e.target.value })}
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input type="text" placeholder="+1 (555) 000-0000" value={newContact.phone}
                  onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Company</label>
                <select value={newContact.company_id}
                  onChange={e => setNewContact({ ...newContact, company_id: e.target.value })}
                  className={inputCls}>
                  <option value="">Select a company</option>
                  {companies.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
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

export default Contacts;
