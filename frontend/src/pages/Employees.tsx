import { useEffect, useState } from 'react';
import { getEmployees, createEmployee, getCompanies } from '../api';
import { useLiveData } from '../hooks/useLiveData';
import { Plus, Mail, Briefcase, DollarSign, Building2, X, Radio } from 'lucide-react';

const inputCls = "w-full bg-[var(--bg-input)] border border-[var(--border)] focus:border-blue-500/60 rounded-lg px-4 py-2.5 text-sm text-[var(--text-1)] placeholder-[var(--text-3)] outline-none transition-all duration-150";

const Employees = () => {
  const { data: employees, loading, lastUpdated } = useLiveData<any[]>(getEmployees);
  const list = employees ?? [];

  const [companies, setCompanies] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    first_name: '', last_name: '', email: '',
    department: '', role: '', salary: '', company_id: ''
  });

  useEffect(() => {
    getCompanies().then((res) => setCompanies(res.data)).catch(() => {});
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEmployee({
        ...newEmployee,
        salary: parseFloat(newEmployee.salary),
        company_id: parseInt(newEmployee.company_id),
      });
      setShowModal(false);
      setNewEmployee({ first_name: '', last_name: '', email: '', department: '', role: '', salary: '', company_id: '' });
    } catch (error) {
      console.error('Error creating employee', error);
    }
  };

  const getInitials = (first: string, last: string) =>
    `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-1)]">Employees</h1>
            {!loading && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <Radio size={9} className="animate-pulse" />
                Live
              </span>
            )}
          </div>
          <p className="text-[var(--text-3)] text-xs mt-1">
            {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` : 'Manage your workforce and talent'}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all duration-150 shadow-[0_1px_4px_rgba(37,99,235,0.3)]"
        >
          <Plus size={16} />
          Add Employee
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-[var(--bg-surface)] border border-[var(--border)] p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-5">
                  <div className="skeleton w-11 h-11 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-3 w-28 rounded" />
                    <div className="skeleton h-2.5 w-20 rounded" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="skeleton h-2.5 w-full rounded" />
                  <div className="skeleton h-2.5 w-3/4 rounded" />
                  <div className="skeleton h-2.5 w-1/2 rounded" />
                </div>
              </div>
            ))
          : list.map((employee: any) => (
              <div key={employee.id} className="bg-[var(--bg-surface)] border border-[var(--border)] hover:border-white/[0.14] p-6 rounded-xl transition-all duration-150">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 bg-blue-600/15 rounded-full flex items-center justify-center text-blue-400 font-bold text-sm shrink-0">
                    {getInitials(employee.first_name, employee.last_name)}
                  </div>
                  <div>
                    <h3 className="font-semibold tracking-tight text-[var(--text-1)] text-sm">
                      {employee.first_name} {employee.last_name}
                    </h3>
                    <p className="text-blue-400 text-xs font-medium mt-0.5">{employee.role}</p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs text-[var(--text-3)]">
                    <Mail size={12} className="shrink-0" />
                    <span className="truncate">{employee.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-3)]">
                    <Briefcase size={12} className="shrink-0" />
                    <span>{employee.department}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-3)]">
                    <Building2 size={12} className="shrink-0" />
                    <span>{companies.find((c: any) => c.id === employee.company_id)?.name}</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-[var(--border)] flex justify-between items-center">
                  <div className="flex items-center text-emerald-400 font-bold text-sm num">
                    <DollarSign size={14} />
                    {employee.salary.toLocaleString()}<span className="text-[var(--text-3)] font-normal text-xs ml-1">/yr</span>
                  </div>
                  <span className="text-[10px] text-[var(--text-3)]">
                    {new Date(employee.hire_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] p-7 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold tracking-tight text-[var(--text-1)]">Add Employee</h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="First Name" required value={newEmployee.first_name}
                  onChange={e => setNewEmployee({ ...newEmployee, first_name: e.target.value })}
                  className={inputCls} />
                <input placeholder="Last Name" required value={newEmployee.last_name}
                  onChange={e => setNewEmployee({ ...newEmployee, last_name: e.target.value })}
                  className={inputCls} />
              </div>
              <input type="email" placeholder="Work Email" required value={newEmployee.email}
                onChange={e => setNewEmployee({ ...newEmployee, email: e.target.value })}
                className={inputCls} />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Department" required value={newEmployee.department}
                  onChange={e => setNewEmployee({ ...newEmployee, department: e.target.value })}
                  className={inputCls} />
                <input placeholder="Role" required value={newEmployee.role}
                  onChange={e => setNewEmployee({ ...newEmployee, role: e.target.value })}
                  className={inputCls} />
              </div>
              <input type="number" placeholder="Annual Salary ($)" required value={newEmployee.salary}
                onChange={e => setNewEmployee({ ...newEmployee, salary: e.target.value })}
                className={inputCls} />
              <select required value={newEmployee.company_id}
                onChange={e => setNewEmployee({ ...newEmployee, company_id: e.target.value })}
                className={inputCls}>
                <option value="">Assign to Company</option>
                {companies.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
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

export default Employees;
