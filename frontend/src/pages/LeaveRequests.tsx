import { useEffect, useState, type FormEvent } from 'react';
import { getLeaveRequests, createLeaveRequest, getEmployees, runLeaveAutomation } from '../api';
import { useLiveData } from '../hooks/useLiveData';
import { Calendar, Plus, User, Clock, CheckCircle, XCircle, Bot, Loader2, Radio, X } from 'lucide-react';

const inputCls = "w-full bg-[var(--bg-input)] border border-[var(--border)] focus:border-blue-500/60 rounded-lg px-4 py-2.5 text-sm text-[var(--text-1)] placeholder-[var(--text-3)] outline-none transition-all duration-150";
const labelCls = "block text-xs font-medium text-[var(--text-3)] mb-1.5 uppercase tracking-wider";

const statusIcon = (status: string) => {
  if (status === 'Approved') return <CheckCircle size={14} className="text-emerald-400" />;
  if (status === 'Rejected') return <XCircle size={14} className="text-red-400" />;
  return <Clock size={14} className="text-amber-400" />;
};

const LeaveRequests = () => {
  const { data: requests, loading, lastUpdated } = useLiveData<any[]>(getLeaveRequests);
  const list = requests ?? [];

  const [employees, setEmployees] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isAutomating, setIsAutomating] = useState(false);
  const [newLeave, setNewLeave] = useState({ employee_id: '', start_date: '', end_date: '', leave_type: 'Vacation', reason: '' });

  useEffect(() => {
    getEmployees().then((res) => setEmployees(res.data)).catch(() => {});
  }, []);

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await createLeaveRequest({ ...newLeave, employee_id: parseInt(newLeave.employee_id) });
      setShowModal(false);
      setNewLeave({ employee_id: '', start_date: '', end_date: '', leave_type: 'Vacation', reason: '' });
    } catch (error) {
      console.error('Error creating leave request', error);
    }
  };

  const handleRunAutomation = async () => {
    setIsAutomating(true);
    try { await runLeaveAutomation(); } catch { /* silent */ } finally { setIsAutomating(false); }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-1)]">Leave Requests</h1>
            {!loading && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <Radio size={9} className="animate-pulse" />
                Live
              </span>
            )}
          </div>
          <p className="text-[var(--text-3)] text-xs mt-1">
            {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` : 'Time-off management and approvals'}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleRunAutomation} disabled={isAutomating}
            className="flex items-center gap-2 bg-violet-600/90 hover:bg-violet-600 disabled:opacity-50 text-white text-sm px-3 py-2 rounded-lg font-medium transition-all duration-150">
            {isAutomating ? <Loader2 size={14} className="animate-spin" /> : <Bot size={14} />}
            AI Approve
          </button>
          <button onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all duration-150 shadow-[0_1px_4px_rgba(37,99,235,0.3)]">
            <Plus size={16} />
            Request Leave
          </button>
        </div>
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--border)] bg-white/[0.02]">
              {['Employee', 'Type', 'Duration', 'Status', 'Reason'].map((h) => (
                <th key={h} className="px-6 py-3.5 text-[10px] font-semibold text-[var(--text-3)] uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {[140, 80, 180, 90, 200].map((w, j) => (
                      <td key={j} className="px-6 py-4"><div className="skeleton h-3 rounded" style={{ width: w }} /></td>
                    ))}
                  </tr>
                ))
              : list.map((req: any) => {
                  const emp = employees.find(e => e.id === req.employee_id);
                  return (
                    <tr key={req.id} className="hover:bg-white/[0.02] transition-colors duration-100">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-[var(--text-1)]">
                          <User size={13} className="text-[var(--text-3)]" />
                          {emp ? `${emp.first_name} ${emp.last_name}` : `Employee #${req.employee_id}`}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-white/[0.04] text-[var(--text-2)] border border-[var(--border)] px-2.5 py-0.5 rounded-full text-xs">
                          {req.leave_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-[var(--text-3)]">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} />
                          {new Date(req.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          {' — '}
                          {new Date(req.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm">
                          {statusIcon(req.status)}
                          <span className="text-[var(--text-2)] text-xs">{req.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-[var(--text-3)] max-w-xs truncate">{req.reason || '—'}</td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] p-7 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold tracking-tight text-[var(--text-1)]">Request Leave</h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--text-3)] hover:text-[var(--text-1)] p-1 rounded-lg transition-colors"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className={labelCls}>Employee</label>
                <select required value={newLeave.employee_id} onChange={e => setNewLeave({ ...newLeave, employee_id: e.target.value })} className={inputCls}>
                  <option value="">Select employee</option>
                  {employees.map((e: any) => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Start Date</label>
                  <input type="date" required value={newLeave.start_date} onChange={e => setNewLeave({ ...newLeave, start_date: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>End Date</label>
                  <input type="date" required value={newLeave.end_date} onChange={e => setNewLeave({ ...newLeave, end_date: e.target.value })} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Type</label>
                <select value={newLeave.leave_type} onChange={e => setNewLeave({ ...newLeave, leave_type: e.target.value })} className={inputCls}>
                  <option>Vacation</option><option>Sick</option><option>Personal</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Reason</label>
                <textarea value={newLeave.reason} placeholder="Optional reason…" onChange={e => setNewLeave({ ...newLeave, reason: e.target.value })} className={`${inputCls} h-20 resize-none`} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white/[0.05] hover:bg-white/[0.09] text-[var(--text-2)] text-sm py-2.5 rounded-lg font-medium transition-all duration-150">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm py-2.5 rounded-lg font-medium transition-all duration-150 shadow-[0_1px_4px_rgba(37,99,235,0.3)]">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequests;
