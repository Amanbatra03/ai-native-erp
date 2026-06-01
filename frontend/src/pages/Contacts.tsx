import React, { useEffect, useState } from 'react';
import { getContacts, createContact, getCompanies } from '../api';
import { Users, Plus, Mail, Phone, Building2 } from 'lucide-react';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newContact, setNewContact] = useState({ first_name: '', last_name: '', email: '', phone: '', company_id: '' });

  const fetchData = async () => {
    try {
      const [contactsRes, companiesRes] = await Promise.all([getContacts(), getCompanies()]);
      setContacts(contactsRes.data);
      setCompanies(companiesRes.data);
    } catch (error) {
      console.error("Error fetching contacts", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createContact({
        ...newContact,
        company_id: newContact.company_id ? parseInt(newContact.company_id) : null
      });
      setShowModal(false);
      setNewContact({ first_name: '', last_name: '', email: '', phone: '', company_id: '' });
      fetchData();
    } catch (error) {
      console.error("Error creating contact", error);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Contacts</h1>
          <p className="text-gray-400">Your network of business professionals</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Add Contact
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left">
          <thead className="bg-gray-800/50 text-gray-400 text-sm">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Phone</th>
              <th className="px-6 py-4 font-medium">Company</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {contacts.map((contact: any) => (
              <tr key={contact.id} className="hover:bg-gray-800/30 transition-colors">
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600/20 text-blue-400 rounded-full flex items-center justify-center font-bold">
                    {contact.first_name[0]}{contact.last_name[0]}
                  </div>
                  <span className="font-medium">{contact.first_name} {contact.last_name}</span>
                </td>
                <td className="px-6 py-4 text-gray-300">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-gray-500" />
                    {contact.email}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-300">
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-gray-500" />
                    {contact.phone || "N/A"}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs flex items-center gap-1 w-fit">
                    <Building2 size={12} />
                    {companies.find((c: any) => c.id === contact.company_id)?.name || "Individual"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Add New Contact</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={newContact.first_name}
                    onChange={e => setNewContact({ ...newContact, first_name: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={newContact.last_name}
                    onChange={e => setNewContact({ ...newContact, last_name: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newContact.email}
                  onChange={e => setNewContact({ ...newContact, email: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                <input
                  type="text"
                  value={newContact.phone}
                  onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Company</label>
                <select
                  value={newContact.company_id}
                  onChange={e => setNewContact({ ...newContact, company_id: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select a Company</option>
                  {companies.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
                >
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
