import React, { useEffect, useState } from 'react';
import { getEmployees, createEmployee, getCompanies } from '../api';
import { Plus, Mail, Briefcase, DollarSign, Building2, X } from 'lucide-react';

const inputCls = "w-full bg-[#111] border border-white/[0.08] focus:border-blue-500/60 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-700 outline-none transition-all duration-150";

const Employees = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    first_name: '', last_name: '', email: '',
    department: '', role: '', salary: '', company_id: ''
  });

  const fetchData = async () => {
    try {
      const [empRes, compRes] = await Promise.all([getEmployees(), getCompanies()]);
      setEmployees(empRes.data);
      setCompanies(compRes.data);
    } catch (error) {
      console.error('Error fetching employees', error);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEmployee({ ...newEmployee, salary: parseFloat(newEmployee.salary), company_id: parseInt(newEmployee.company_id) });
      setShowModal(false);
      setNewEmployee({ first_name: '', last_name: '', email: '', department: '', role: '', salary: '', company_id: '' });
      fetchData();
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
          <h1 className="text-2xl font-semibold tracking-tight">Employees</h1>
          <p className="text-gray-600 text-xs mt-1">Manage your workforce and talent</p>
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
        {employees.map((employee: any) => (
          <div key={employee.id} className="bg-[#0f0f0f] border border-white/[0.07] hover:border-white/[0.14] p-6 rounded-xl transition-all duration-150">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 bg-blue-600/15 rounded-full flex items-center justify-center text-blue-400 font-bold text-sm shrink-0">
                {getInitials(employee.first_name, employee.last_name)}
              </div>
              <div>
                <h3 className="font-semibold tracking-tight text-white text-sm">
                  {employee.first_name} {employee.last_name}
                </h3>
                <p className="text-blue-400 text-xs font-medium mt-0.5">{employee.role}</p>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Mail size={12} className="shrink-0" />
                <span className="truncate">{employee.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Briefcase size={12} className="shrink-0" />
                <span>{employee.department}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Building2 size={12} className="shrink-0" />
                <span>{companies.find((c: any) => c.id === employee.company_id)?.name}</span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/[0.05] flex justify-between items-center">
              <div className="flex items-center text-emerald-400 font-bold text-sm num">
                <DollarSign size={14} />
                {employee.salary.toLocaleString()}<span className="text-gray-600 font-normal text-xs ml-1">/yr</span>
              </div>
              <span className="text-[10px] text-gray-700">
                {new Date(employee.hire_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f0f0f] border border-white/[0.09] p-7 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold tracking-tight">Add Employee</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-600 hover:text-gray-300 transition-colors p-1 rounded-lg">
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
                  className="flex-1 bg-white/[0.05] hover:bg-white/[0.09] text-gray-300 text-sm py-2.5 rounded-lg transition-all duration-150 font-medium">
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
