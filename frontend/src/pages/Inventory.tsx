import React, { useEffect, useState } from 'react';
import { getInventory, createInventoryItem, getSuppliers, createSupplier, getRestockSuggestions, executeRestock } from '../api';
import { Package, Plus, Truck, AlertTriangle, BarChart3, Tag, ShoppingCart, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [isRestocking, setIsRestocking] = useState(false);
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'suppliers', 'suggestions'

  const [newItem, setNewItem] = useState({ 
    name: '', sku: '', quantity: 0, reorder_level: 0, unit_price: 0, supplier_id: '' 
  });
  const [newSupplier, setNewSupplier] = useState({ 
    name: '', contact_name: '', email: '', phone: '', category: '' 
  });

  const fetchData = async () => {
    try {
      const [invRes, supRes] = await Promise.all([getInventory(), getSuppliers()]);
      setInventory(invRes.data);
      setSuppliers(supRes.data);
      if (supRes.data.length > 0) {
        setNewItem(prev => ({ ...prev, supplier_id: supRes.data[0].id }));
      }
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const res = await getRestockSuggestions();
      setSuggestions(res.data.suggestions);
    } catch (error) {
      console.error("Error fetching suggestions", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'suggestions') {
      fetchSuggestions();
    }
  }, [activeTab]);

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createInventoryItem({
        ...newItem,
        quantity: parseInt(newItem.quantity as any),
        reorder_level: parseInt(newItem.reorder_level as any),
        unit_price: parseFloat(newItem.unit_price as any),
        supplier_id: parseInt(newItem.supplier_id as any)
      });
      setShowItemModal(false);
      setNewItem({ name: '', sku: '', quantity: 0, reorder_level: 0, unit_price: 0, supplier_id: suppliers[0]?.id || '' });
      fetchData();
    } catch (error) {
      console.error("Error creating item", error);
    }
  };

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSupplier(newSupplier);
      setShowSupplierModal(false);
      setNewSupplier({ name: '', contact_name: '', email: '', phone: '', category: '' });
      fetchData();
    } catch (error) {
      console.error("Error creating supplier", error);
    }
  };

  const handleExecuteRestock = async () => {
    setIsRestocking(true);
    try {
      await executeRestock();
      await Promise.all([fetchData(), fetchSuggestions()]);
      alert("AI Restock completed successfully!");
    } catch (error) {
      console.error("Error executing restock", error);
    } finally {
      setIsRestocking(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Supply Chain</h1>
          <p className="text-gray-400">Manage inventory and suppliers</p>
        </div>
        <div className="flex gap-4">
           <button
            onClick={() => setShowSupplierModal(true)}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors border border-gray-700"
          >
            <Truck size={20} />
            Add Supplier
          </button>
          <button
            onClick={() => setShowItemModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Add Item
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-900 p-1 rounded-xl border border-gray-800 w-fit">
        <button
          onClick={() => setActiveTab('inventory')}
          className={clsx(
            "px-6 py-2 rounded-lg font-medium transition-all",
            activeTab === 'inventory' ? "bg-gray-800 text-white shadow-lg" : "text-gray-400 hover:text-white"
          )}
        >
          Inventory
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={clsx(
            "px-6 py-2 rounded-lg font-medium transition-all",
            activeTab === 'suppliers' ? "bg-gray-800 text-white shadow-lg" : "text-gray-400 hover:text-white"
          )}
        >
          Suppliers
        </button>
        <button
          onClick={() => setActiveTab('suggestions')}
          className={clsx(
            "px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2",
            activeTab === 'suggestions' ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
          )}
        >
          <BarChart3 size={18} />
          AI Restock suggestions
        </button>
      </div>

      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {inventory.map((item: any) => (
            <div key={item.id} className="bg-gray-900 border border-gray-800 p-6 rounded-xl relative overflow-hidden group">
              {item.quantity <= item.reorder_level && (
                <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                  <AlertTriangle size={10} />
                  LOW STOCK
                </div>
              )}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-blue-400">
                  <Package size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{item.name}</h3>
                  <p className="text-gray-500 text-sm">SKU: {item.sku}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-black/30 p-3 rounded-lg border border-gray-800">
                  <p className="text-gray-500 text-xs uppercase font-bold mb-1">Quantity</p>
                  <p className={clsx("text-xl font-bold", item.quantity <= item.reorder_level ? "text-red-400" : "text-white")}>
                    {item.quantity}
                  </p>
                </div>
                <div className="bg-black/30 p-3 rounded-lg border border-gray-800">
                  <p className="text-gray-500 text-xs uppercase font-bold mb-1">Price</p>
                  <p className="text-xl font-bold text-green-400">${item.unit_price}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-400 flex items-center gap-2">
                  <Truck size={14} />
                  {suppliers.find(s => s.id === item.supplier_id)?.name || "Unknown"}
                </div>
                <div className="text-gray-400">
                  Reorder at: <span className="text-white font-medium">{item.reorder_level}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {suppliers.map((supplier: any) => (
            <div key={supplier.id} className="bg-gray-900 border border-gray-800 p-6 rounded-xl hover:border-blue-500 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-blue-400">
                    <Truck size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{supplier.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Tag size={14} />
                      {supplier.category}
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-gray-400 text-sm">
                <p><span className="text-gray-600 font-medium">Contact:</span> {supplier.contact_name}</p>
                <p><span className="text-gray-600 font-medium">Email:</span> {supplier.email}</p>
                <p><span className="text-gray-600 font-medium">Phone:</span> {supplier.phone}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'suggestions' && (
        <div className="space-y-4">
          {suggestions.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 p-12 rounded-xl text-center">
              <Package size={48} className="mx-auto text-gray-700 mb-4" />
              <h3 className="text-xl font-bold text-gray-400">Inventory is healthy</h3>
              <p className="text-gray-600">AI has not detected any items that need restocking.</p>
            </div>
          ) : (
            suggestions.map((sug: any, idx: number) => (
              <div key={idx} className="bg-blue-900/10 border border-blue-900/30 p-6 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center text-blue-400">
                    <ShoppingCart size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{sug.item_name}</h3>
                    <p className="text-blue-400/70 text-sm">Supplier: {sug.supplier}</p>
                  </div>
                </div>
                <div className="flex gap-12 text-right">
                  <div>
                    <p className="text-gray-500 text-xs uppercase font-bold mb-1">Current Stock</p>
                    <p className="text-xl font-bold text-red-400">{sug.current_quantity}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase font-bold mb-1">AI Recommendation</p>
                    <p className="text-xl font-bold text-green-400">Order {sug.suggested_order} units</p>
                  </div>
                  <button 
                    onClick={handleExecuteRestock}
                    disabled={isRestocking}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition-colors self-center disabled:opacity-50 flex items-center gap-2"
                  >
                    {isRestocking && <Loader2 size={16} className="animate-spin" />}
                    Purchase
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modals ... (keeping it simple for now, item modal shown below) */}
       {showItemModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Add Inventory Item</h2>
            <form onSubmit={handleCreateItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Item Name</label>
                <input
                  type="text" required value={newItem.name}
                  onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">SKU</label>
                  <input
                    type="text" required value={newItem.sku}
                    onChange={e => setNewItem({ ...newItem, sku: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Unit Price</label>
                  <input
                    type="number" required value={newItem.unit_price}
                    onChange={e => setNewItem({ ...newItem, unit_price: e.target.value as any })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Current Qty</label>
                  <input
                    type="number" required value={newItem.quantity}
                    onChange={e => setNewItem({ ...newItem, quantity: e.target.value as any })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Reorder Level</label>
                  <input
                    type="number" required value={newItem.reorder_level}
                    onChange={e => setNewItem({ ...newItem, reorder_level: e.target.value as any })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Supplier</label>
                <select
                  required value={newItem.supplier_id}
                  onChange={e => setNewItem({ ...newItem, supplier_id: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  {suppliers.map((sup: any) => (
                    <option key={sup.id} value={sup.id}>{sup.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4 mt-8">
                <button type="button" onClick={() => setShowItemModal(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSupplierModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Add New Supplier</h2>
            <form onSubmit={handleCreateSupplier} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Supplier Name</label>
                <input
                  type="text" required value={newSupplier.name}
                  onChange={e => setNewSupplier({ ...newSupplier, name: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Contact Name</label>
                <input
                  type="text" value={newSupplier.contact_name}
                  onChange={e => setNewSupplier({ ...newSupplier, contact_name: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                  <input
                    type="email" value={newSupplier.email}
                    onChange={e => setNewSupplier({ ...newSupplier, email: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                  <input
                    type="text" value={newSupplier.phone}
                    onChange={e => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                <input
                  type="text" value={newSupplier.category}
                  onChange={e => setNewSupplier({ ...newSupplier, category: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-4 mt-8">
                <button type="button" onClick={() => setShowSupplierModal(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
