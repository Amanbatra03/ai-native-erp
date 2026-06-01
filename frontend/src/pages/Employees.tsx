import React, { useEffect, useState } from 'react';
import { getEmployees, createEmployee, getCompanies } from '../api';
import { UserCircle, Plus, Mail, Briefcase, DollarSign, Building2 } from 'lucide-react';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    first_name: '',
    last_name: '',
    email: '',
    department: '',
    role: '',
    salary: '',
    company_id: ''
  });

  const fetchData = async () => {
    try {
      const [empRes, compRes] = await Promise.all([getEmployees(), getCompanies()]);
      setEmployees(empRes.data);
      setCompanies(compRes.data);
    } catch (error) {
      console.error("Error fetching employees", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEmployee({
        ...newEmployee,
        salary: parseFloat(newEmployee.salary),
        company_id: parseInt(newEmployee.company_id)
      });
      setShowModal(false);
      setNewEmployee({ first_name: '', last_name: '', email: '', department: '', role: '', salary: '', company_id: '' });
      fetchData();
    } catch (error) {
      console.error("Error creating employee", error);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Employees</h1>
          <p className="text-gray-400">Manage your workforce and talent</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Add Employee
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {employees.map((employee: any) => (
          <div key={employee.id} className="bg-gray-900 border border-gray-800 p-6 rounded-xl hover:border-blue-500 transition-all group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-gray-800 rounded-full flex items-center justify-center text-blue-400 border border-gray-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <UserCircle size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold">{employee.first_name} {employee.last_name}</h3>
                <p className="text-blue-400 text-sm font-medium">{employee.role}</p>
              </div>
            </div>
            
            <div className="space-y-3 mt-6">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Mail size={16} />
                <span>{employee.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Briefcase size={16} />
                <span>{employee.department}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Building2 size={16} />
                <span>{companies.find((c: any) => c.id === employee.company_id)?.name}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-800 flex justify-between items-center">
               <div className="flex items-center text-green-400 font-bold">
                 <DollarSign size={16} />
                 <span>{employee.salary.toLocaleString()} / yr</span>
               </div>
               <span className="text-xs text-gray-500 uppercase">Hired: {new Date(employee.hire_date).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Add New Employee</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  placeholder="First Name"
                  required
                  value={newEmployee.first_name}
                  onChange={e => setNewEmployee({ ...newEmployee, first_name: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                />
                <input
                  placeholder="Last Name"
                  required
                  value={newEmployee.last_name}
                  onChange={e => setNewEmployee({ ...newEmployee, last_name: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <input
                type="email"
                placeholder="Work Email"
                required
                value={newEmployee.email}
                onChange={e => setNewEmployee({ ...newEmployee, email: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  placeholder="Department"
                  required
                  value={newEmployee.department}
                  onChange={e => setNewEmployee({ ...newEmployee, department: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                />
                <input
                  placeholder="Role"
                  required
                  value={newEmployee.role}
                  onChange={e => setNewEmployee({ ...newEmployee, role: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <input
                type="number"
                placeholder="Annual Salary ($)"
                required
                value={newEmployee.salary}
                onChange={e => setNewEmployee({ ...newEmployee, salary: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              />
              <select
                required
                value={newEmployee.company_id}
                onChange={e => setNewEmployee({ ...newEmployee, company_id: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              >
                <option value="">Assign to Company</option>
                {companies.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <div className="flex gap-4 mt-8">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-800 py-2 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 py-2 rounded-lg font-bold">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
