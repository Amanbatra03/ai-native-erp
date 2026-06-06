import { useEffect, useState } from 'react';
import { getAuditLogs } from '../api';
import { Shield, Download, Filter } from 'lucide-react';

const inputCls =
  'bg-[var(--bg-input)] border border-[var(--border)] focus:border-blue-500/60 rounded-lg px-3 py-1.5 text-xs text-[var(--text-1)] placeholder-[var(--text-3)] outline-none transition-all duration-150';

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'text-emerald-400 bg-emerald-500/10',
  UPDATE: 'text-blue-400 bg-blue-500/10',
  DELETE: 'text-red-400 bg-red-500/10',
};

export default function AuditLog() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ entity: '', user: '', action: '' });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '')
      );
      const res = await getAuditLogs(params);
      setLogs(res.data);
    } catch {
      // keep stale
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const exportCSV = () => {
    const headers = ['ID', 'Timestamp', 'User', 'Action', 'Entity', 'Entity ID', 'Details', 'IP'];
    const rows = logs.map((l) => [
      l.id,
      new Date(l.timestamp).toISOString(),
      l.user_email,
      l.action,
      l.entity,
      l.entity_id ?? '',
      l.details ?? '',
      l.ip_address ?? '',
    ]);
    const csv = [headers, ...rows].map((r) => r.map(String).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield size={18} className="text-violet-400" />
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-1)]">Audit Log</h1>
          </div>
          <p className="text-[var(--text-3)] text-xs">Immutable record of all system actions</p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 bg-[var(--bg-surface)] border border-[var(--border)] hover:border-white/20 text-[var(--text-2)] text-xs px-3 py-2 rounded-lg transition-all duration-150"
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 p-4 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl">
        <Filter size={13} className="text-[var(--text-3)] shrink-0" />
        <input
          placeholder="Entity (employee, deal…)"
          value={filters.entity}
          onChange={(e) => setFilters({ ...filters, entity: e.target.value })}
          className={inputCls}
        />
        <input
          placeholder="User email"
          value={filters.user}
          onChange={(e) => setFilters({ ...filters, user: e.target.value })}
          className={inputCls}
        />
        <select
          value={filters.action}
          onChange={(e) => setFilters({ ...filters, action: e.target.value })}
          className={inputCls}
        >
          <option value="">All actions</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
        </select>
        <button
          onClick={fetchLogs}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-1.5 rounded-lg font-medium transition-all duration-150 shrink-0"
        >
          Apply
        </button>
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--border)] bg-white/[0.02]">
              {['Timestamp', 'User', 'Action', 'Entity', 'ID', 'Details', 'IP'].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3.5 text-[10px] font-semibold text-[var(--text-3)] uppercase tracking-widest"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} className="px-5 py-3.5">
                      <div className="skeleton h-3 rounded w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-[var(--text-3)] text-sm">
                  No audit events found
                </td>
              </tr>
            ) : (
              logs.map((l) => (
                <tr key={l.id} className="hover:bg-white/[0.015] transition-colors duration-100">
                  <td className="px-5 py-3 text-xs text-[var(--text-3)] whitespace-nowrap">
                    {new Date(l.timestamp).toLocaleString('en-US', {
                      month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </td>
                  <td className="px-5 py-3 text-xs text-[var(--text-2)]">{l.user_email}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${ACTION_COLORS[l.action] ?? ''}`}>
                      {l.action}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-[var(--text-1)] capitalize">{l.entity}</td>
                  <td className="px-5 py-3 text-xs text-[var(--text-3)] num">{l.entity_id ?? '—'}</td>
                  <td className="px-5 py-3 text-xs text-[var(--text-3)] max-w-xs truncate">{l.details ?? '—'}</td>
                  <td className="px-5 py-3 text-xs text-[var(--text-3)]">{l.ip_address ?? '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
