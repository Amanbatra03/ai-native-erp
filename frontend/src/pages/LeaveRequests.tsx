import React, { useEffect, useState } from 'react';
import { getLeaveRequests, createLeaveRequest, getEmployees, runLeaveAutomation } from '../api';
import { Calendar, Plus, User, Clock, CheckCircle, XCircle, Bot, Loader2 } from 'lucide-react';

const LeaveRequests = () => {
  const [requests, setRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isAutomating, setIsAutomating] = useState(false);
  const [newLeave, setNewLeave] = useState({
    employee_id: '',
    start_date: '',
    end_date: '',
    leave_type: 'Vacation',
    reason: ''
  });

  const fetchData = async () => {
    try {
      const [leaveRes, empRes] = await Promise.all([getLeaveRequests(), getEmployees()]);
      setRequests(leaveRes.data);
      setEmployees(empRes.data);
    } catch (error) {
      console.error("Error fetching leave requests", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLeaveRequest({
        ...newLeave,
        employee_id: parseInt(newLeave.employee_id)
      });
      setShowModal(false);
      setNewLeave({ employee_id: '', start_date: '', end_date: '', leave_type: 'Vacation', reason: '' });
      fetchData();
    } catch (error) {
      console.error("Error creating leave request", error);
    }
  };

  const handleRunAutomation = async () => {
    setIsAutomating(true);
    try {
      await runLeaveAutomation();
      await fetchData();
    } catch (error) {
      console.error("Error running automation", error);
    } finally {
      setIsAutomating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return <CheckCircle size={16} className="text-green-400" />;
      case 'Rejected': return <XCircle size={16} className="text-red-400" />;
      default: return <Clock size={16} className="text-orange-400" />;
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Leave Requests</h1>
          <p className="text-gray-400">Time-off management and AI-automated approvals</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleRunAutomation}
            disabled={isAutomating}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {isAutomating ? <Loader2 size={20} className="animate-spin" /> : <Bot size={20} />}
            Run AI Agent
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Request Leave
          </button>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left">
          <thead className="bg-gray-800/50 text-gray-400 text-sm">
            <tr>
              <th className="px-6 py-4 font-medium">Employee</th>
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium">Duration</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {requests.map((req: any) => {
              const emp = employees.find(e => e.id === req.employee_id);
              return (
                <tr key={req.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 font-medium">
                      <User size={14} className="text-gray-500" />
                      {emp ? `${emp.first_name} ${emp.last_name}` : `ID: ${req.employee_id}`}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs">
                      {req.leave_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-500" />
                      {new Date(req.start_date).toLocaleDateString()} - {new Date(req.end_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(req.status)}
                      <span className="text-sm">{req.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400 max-w-xs truncate">
                    {req.reason}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Submit Leave Request</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <select
                required
                value={newLeave.employee_id}
                onChange={e => setNewLeave({ ...newLeave, employee_id: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              >
                <option value="">Select Employee</option>
                {employees.map((e: any) => (
                  <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={newLeave.start_date}
                    onChange={e => setNewLeave({ ...newLeave, start_date: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={newLeave.end_date}
                    onChange={e => setNewLeave({ ...newLeave, end_date: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>
              <select
                value={newLeave.leave_type}
                onChange={e => setNewLeave({ ...newLeave, leave_type: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              >
                <option value="Vacation">Vacation</option>
                <option value="Sick">Sick</option>
                <option value="Personal">Personal</option>
              </select>
              <textarea
                placeholder="Reason for leave"
                value={newLeave.reason}
                onChange={e => setNewLeave({ ...newLeave, reason: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white h-24"
              />
              <div className="flex gap-4 mt-8">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-800 py-2 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 py-2 rounded-lg font-bold">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequests;
