import React, { useEffect, useState } from 'react';
import { getCampaigns, createCampaign, getLeads, createLead, runLeadQualification } from '../api';
import { 
  Megaphone, Plus, Target, UserPlus, 
  Sparkles, Loader2, Mail, ExternalLink,
  ShieldCheck, ShieldAlert, Shield
} from 'lucide-react';
import { clsx } from 'clsx';

const Marketing = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isQualifying, setIsQualifying] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);

  const [newCampaign, setNewCampaign] = useState({ name: '', budget: 0 });
  const [newLead, setNewLead] = useState({ name: '', email: '', source: '', campaign_id: '' });

  const fetchData = async () => {
    try {
      const [campRes, leadRes] = await Promise.all([getCampaigns(), getLeads()]);
      setCampaigns(campRes.data);
      setLeads(leadRes.data);
      if (campRes.data.length > 0 && !newLead.campaign_id) {
        setNewLead(prev => ({ ...prev, campaign_id: campRes.data[0].id }));
      }
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCampaign({ ...newCampaign, budget: parseFloat(newCampaign.budget as any) });
      setShowCampaignModal(false);
      setNewCampaign({ name: '', budget: 0 });
      fetchData();
    } catch (error) {
      console.error("Error creating campaign", error);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLead({ ...newLead, campaign_id: parseInt(newLead.campaign_id as any) });
      setShowLeadModal(false);
      setNewLead({ name: '', email: '', source: '', campaign_id: campaigns[0]?.id || '' });
      fetchData();
    } catch (error) {
      console.error("Error creating lead", error);
    }
  };

  const handleQualifyLeads = async () => {
    setIsQualifying(true);
    try {
      await runLeadQualification();
      await fetchData();
      alert("AI Lead Qualification completed!");
    } catch (error) {
      console.error("Error qualifying leads", error);
    } finally {
      setIsQualifying(false);
    }
  };

  const PriorityIcon = ({ priority }: { priority: string }) => {
    switch (priority) {
      case 'Hot': return <ShieldCheck className="text-red-400" size={16} />;
      case 'Warm': return <Shield className="text-orange-400" size={16} />;
      default: return <ShieldAlert className="text-blue-400" size={16} />;
    }
  };

  if (loading) return <div className="p-8 flex items-center justify-center h-full"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Marketing Intelligence</h1>
          <p className="text-gray-400">Manage campaigns and AI-qualified leads</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleQualifyLeads}
            disabled={isQualifying}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {isQualifying ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            AI Qualify Leads
          </button>
          <button
            onClick={() => setShowCampaignModal(true)}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors border border-gray-700"
          >
            <Megaphone size={18} />
            New Campaign
          </button>
          <button
            onClick={() => setShowLeadModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <UserPlus size={18} />
            Add Lead
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Campaigns Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Active Campaigns</h2>
          {campaigns.map((camp: any) => (
            <div key={camp.id} className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold">{camp.name}</h3>
                <span className="text-[10px] bg-green-900/30 text-green-400 px-2 py-0.5 rounded-full font-bold uppercase">{camp.status}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Budget: ${camp.budget.toLocaleString()}</span>
                <span>{camp.leads?.length || 0} Leads</span>
              </div>
            </div>
          ))}
          {campaigns.length === 0 && <p className="text-gray-600 text-sm italic text-center py-4">No campaigns found.</p>}
        </div>

        {/* Leads Table */}
        <div className="lg:col-span-3">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-800/50">
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-gray-500">Lead Info</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-gray-500">Source</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-gray-500">AI Score</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-gray-500">Priority</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {leads.map((lead: any) => (
                  <tr key={lead.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-100">{lead.name}</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Mail size={10} /> {lead.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">{lead.source}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full max-w-[60px] bg-gray-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={clsx(
                              "h-full rounded-full transition-all duration-1000",
                              lead.ai_score > 70 ? "bg-red-500" : lead.ai_score > 40 ? "bg-orange-500" : "bg-blue-500"
                            )}
                            style={{ width: `${lead.ai_score}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold">{lead.ai_score}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={clsx(
                        "flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-lg w-fit",
                        lead.priority === 'Hot' ? "bg-red-900/20 text-red-400" : 
                        lead.priority === 'Warm' ? "bg-orange-900/20 text-orange-400" : "bg-blue-900/20 text-blue-400"
                      )}>
                        <PriorityIcon priority={lead.priority} />
                        {lead.priority}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                        lead.status === 'Qualified' ? "bg-green-900/30 text-green-400" : "bg-gray-800 text-gray-500"
                      )}>
                        {lead.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {leads.length === 0 && (
              <div className="p-12 text-center text-gray-600 italic">
                No leads available. Start by adding a lead or launching a campaign.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Megaphone className="text-blue-500" /> New Campaign</h2>
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Campaign Name</label>
                <input
                  type="text" required value={newCampaign.name}
                  onChange={e => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Budget</label>
                <input
                  type="number" required value={newCampaign.budget}
                  onChange={e => setNewCampaign({ ...newCampaign, budget: e.target.value as any })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-4 mt-8">
                <button type="button" onClick={() => setShowCampaignModal(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors">Launch</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLeadModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Target className="text-blue-500" /> Add New Lead</h2>
            <form onSubmit={handleCreateLead} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                <input
                  type="text" required value={newLead.name}
                  onChange={e => setNewLead({ ...newLead, name: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                <input
                  type="email" required value={newLead.email}
                  onChange={e => setNewLead({ ...newLead, email: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Lead Source</label>
                <input
                  type="text" required value={newLead.source} placeholder="e.g. LinkedIn, Referral, Web"
                  onChange={e => setNewLead({ ...newLead, source: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Campaign</label>
                <select
                  required value={newLead.campaign_id}
                  onChange={e => setNewLead({ ...newLead, campaign_id: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  {campaigns.map((camp: any) => (
                    <option key={camp.id} value={camp.id}>{camp.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4 mt-8">
                <button type="button" onClick={() => setShowLeadModal(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketing;
