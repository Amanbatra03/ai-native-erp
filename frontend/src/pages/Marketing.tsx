import { useEffect, useState, type FormEvent } from 'react';
import { getCampaigns, createCampaign, getLeads, createLead, runLeadQualification } from '../api';
import { useLiveData } from '../hooks/useLiveData';
import { Megaphone, Target, UserPlus, Sparkles, Loader2, Mail, ShieldCheck, ShieldAlert, Shield, Radio, X } from 'lucide-react';
import { clsx } from 'clsx';

const inputCls = "w-full bg-[var(--bg-input)] border border-[var(--border)] focus:border-blue-500/60 rounded-lg px-4 py-2.5 text-sm text-[var(--text-1)] placeholder-[var(--text-3)] outline-none transition-all duration-150";
const labelCls = "block text-xs font-medium text-[var(--text-3)] mb-1.5 uppercase tracking-wider";

const PriorityIcon = ({ priority }: { priority: string }) => {
  if (priority === 'Hot') return <ShieldCheck className="text-red-400" size={14} />;
  if (priority === 'Warm') return <Shield className="text-amber-400" size={14} />;
  return <ShieldAlert className="text-blue-400" size={14} />;
};

const Marketing = () => {
  const { data: leads, loading: leadsLoading, lastUpdated } = useLiveData<any[]>(getLeads);
  const leadList = leads ?? [];

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isQualifying, setIsQualifying] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ name: '', budget: 0 });
  const [newLead, setNewLead] = useState({ name: '', email: '', source: '', campaign_id: '' });

  useEffect(() => {
    getCampaigns().then((res) => {
      setCampaigns(res.data);
      if (res.data.length > 0) setNewLead(prev => ({ ...prev, campaign_id: res.data[0].id }));
    }).catch(() => {});
  }, []);

  const handleCreateCampaign = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await createCampaign({ ...newCampaign, budget: parseFloat(newCampaign.budget as any) });
      setShowCampaignModal(false);
      setNewCampaign({ name: '', budget: 0 });
    } catch { console.error('Error creating campaign'); }
  };

  const handleCreateLead = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await createLead({ ...newLead, campaign_id: parseInt(newLead.campaign_id as any) });
      setShowLeadModal(false);
      setNewLead({ name: '', email: '', source: '', campaign_id: campaigns[0]?.id || '' });
    } catch { console.error('Error creating lead'); }
  };

  const handleQualifyLeads = async () => {
    setIsQualifying(true);
    try { await runLeadQualification(); } catch { /* silent */ } finally { setIsQualifying(false); }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-1)]">Marketing</h1>
            {!leadsLoading && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <Radio size={9} className="animate-pulse" />
                Live
              </span>
            )}
          </div>
          <p className="text-[var(--text-3)] text-xs mt-1">
            {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` : 'Manage campaigns and AI-qualified leads'}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleQualifyLeads} disabled={isQualifying}
            className="flex items-center gap-2 bg-violet-600/90 hover:bg-violet-600 disabled:opacity-50 text-white text-sm px-3 py-2 rounded-lg font-medium transition-all duration-150">
            {isQualifying ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            AI Qualify
          </button>
          <button onClick={() => setShowCampaignModal(true)}
            className="flex items-center gap-2 bg-[var(--bg-surface)] border border-[var(--border)] hover:border-white/20 text-[var(--text-2)] text-sm px-3 py-2 rounded-lg transition-all duration-150">
            <Megaphone size={14} />New Campaign
          </button>
          <button onClick={() => setShowLeadModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all duration-150 shadow-[0_1px_4px_rgba(37,99,235,0.3)]">
            <UserPlus size={14} />Add Lead
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Campaigns sidebar */}
        <div className="lg:col-span-1 space-y-3">
          <p className="text-[10px] font-semibold text-[var(--text-3)] uppercase tracking-widest mb-3">Campaigns</p>
          {campaigns.map((camp: any) => (
            <div key={camp.id} className="bg-[var(--bg-surface)] border border-[var(--border)] p-4 rounded-xl">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-sm text-[var(--text-1)]">{camp.name}</h3>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full font-semibold uppercase">{camp.status}</span>
              </div>
              <div className="flex justify-between text-xs text-[var(--text-3)]">
                <span>${camp.budget.toLocaleString()}</span>
                <span>{camp.leads?.length ?? 0} leads</span>
              </div>
            </div>
          ))}
          {campaigns.length === 0 && <p className="text-[var(--text-3)] text-xs italic text-center py-4">No campaigns yet</p>}
        </div>

        {/* Leads table */}
        <div className="lg:col-span-3">
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--border)] bg-white/[0.02]">
                  {['Lead', 'Source', 'AI Score', 'Priority', 'Status'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-[10px] font-semibold text-[var(--text-3)] uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {leadsLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        {[160, 100, 80, 70, 80].map((w, j) => (
                          <td key={j} className="px-5 py-3.5"><div className="skeleton h-3 rounded" style={{ width: w }} /></td>
                        ))}
                      </tr>
                    ))
                  : leadList.map((lead: any) => (
                      <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors duration-100">
                        <td className="px-5 py-3.5">
                          <p className="text-sm font-medium text-[var(--text-1)]">{lead.name}</p>
                          <p className="text-xs text-[var(--text-3)] flex items-center gap-1"><Mail size={10} />{lead.email}</p>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-[var(--text-3)]">{lead.source}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-12 bg-[var(--bg-input)] h-1.5 rounded-full overflow-hidden">
                              <div className={clsx('h-full rounded-full transition-all duration-700',
                                lead.ai_score > 70 ? 'bg-red-500' : lead.ai_score > 40 ? 'bg-amber-500' : 'bg-blue-500'
                              )} style={{ width: `${lead.ai_score}%` }} />
                            </div>
                            <span className="text-xs font-bold text-[var(--text-2)] num">{lead.ai_score}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className={clsx(
                            'flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-lg w-fit',
                            lead.priority === 'Hot' ? 'bg-red-500/10 text-red-400' :
                            lead.priority === 'Warm' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'
                          )}>
                            <PriorityIcon priority={lead.priority} />
                            {lead.priority}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={clsx('text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase',
                            lead.status === 'Qualified' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/[0.05] text-[var(--text-3)]'
                          )}>{lead.status}</span>
                        </td>
                      </tr>
                    ))}
                {!leadsLoading && leadList.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-12 text-center text-[var(--text-3)] text-sm italic">No leads yet. Add a lead or launch a campaign.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showCampaignModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] p-7 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold tracking-tight text-[var(--text-1)] flex items-center gap-2"><Megaphone size={18} />New Campaign</h2>
              <button onClick={() => setShowCampaignModal(false)} className="text-[var(--text-3)] hover:text-[var(--text-1)] p-1 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div><label className={labelCls}>Campaign Name</label><input type="text" required value={newCampaign.name} onChange={e => setNewCampaign({ ...newCampaign, name: e.target.value })} className={inputCls} /></div>
              <div><label className={labelCls}>Budget</label><input type="number" required value={newCampaign.budget} onChange={e => setNewCampaign({ ...newCampaign, budget: e.target.value as any })} className={inputCls} /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCampaignModal(false)} className="flex-1 bg-white/[0.05] hover:bg-white/[0.09] text-[var(--text-2)] text-sm py-2.5 rounded-lg font-medium transition-all duration-150">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm py-2.5 rounded-lg font-medium transition-all duration-150 shadow-[0_1px_4px_rgba(37,99,235,0.3)]">Launch</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLeadModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] p-7 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold tracking-tight text-[var(--text-1)] flex items-center gap-2"><Target size={18} />Add Lead</h2>
              <button onClick={() => setShowLeadModal(false)} className="text-[var(--text-3)] hover:text-[var(--text-1)] p-1 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateLead} className="space-y-4">
              <div><label className={labelCls}>Full Name</label><input type="text" required value={newLead.name} onChange={e => setNewLead({ ...newLead, name: e.target.value })} className={inputCls} /></div>
              <div><label className={labelCls}>Email</label><input type="email" required value={newLead.email} onChange={e => setNewLead({ ...newLead, email: e.target.value })} className={inputCls} /></div>
              <div><label className={labelCls}>Source</label><input type="text" required placeholder="LinkedIn, Referral…" value={newLead.source} onChange={e => setNewLead({ ...newLead, source: e.target.value })} className={inputCls} /></div>
              <div>
                <label className={labelCls}>Campaign</label>
                <select required value={newLead.campaign_id} onChange={e => setNewLead({ ...newLead, campaign_id: e.target.value })} className={inputCls}>
                  {campaigns.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowLeadModal(false)} className="flex-1 bg-white/[0.05] hover:bg-white/[0.09] text-[var(--text-2)] text-sm py-2.5 rounded-lg font-medium transition-all duration-150">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm py-2.5 rounded-lg font-medium transition-all duration-150 shadow-[0_1px_4px_rgba(37,99,235,0.3)]">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketing;
