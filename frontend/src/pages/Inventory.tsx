import { useEffect, useState, type FormEvent } from 'react';
import { getInventory, createInventoryItem, getSuppliers, createSupplier, getRestockSuggestions, executeRestock } from '../api';
import { useLiveData } from '../hooks/useLiveData';
import { Package, Plus, Truck, AlertTriangle, BarChart3, Tag, ShoppingCart, Loader2, Radio, X } from 'lucide-react';
import { clsx } from 'clsx';

const inputCls = "w-full bg-[var(--bg-input)] border border-[var(--border)] focus:border-blue-500/60 rounded-lg px-4 py-2.5 text-sm text-[var(--text-1)] placeholder-[var(--text-3)] outline-none transition-all duration-150";
const labelCls = "block text-xs font-medium text-[var(--text-3)] mb-1.5 uppercase tracking-wider";

const Inventory = () => {
  const { data: inventory, loading, lastUpdated } = useLiveData<any[]>(getInventory);
  const list = inventory ?? [];

  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [isRestocking, setIsRestocking] = useState(false);
  const [activeTab, setActiveTab] = useState('inventory');

  const [newItem, setNewItem] = useState({ name: '', sku: '', quantity: 0, reorder_level: 0, unit_price: 0, supplier_id: '' });
  const [newSupplier, setNewSupplier] = useState({ name: '', contact_name: '', email: '', phone: '', category: '' });

  useEffect(() => {
    getSuppliers().then((res) => {
      setSuppliers(res.data);
      if (res.data.length > 0) setNewItem(prev => ({ ...prev, supplier_id: res.data[0].id }));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (activeTab === 'suggestions') {
      getRestockSuggestions().then((res) => setSuggestions(res.data.suggestions)).catch(() => {});
    }
  }, [activeTab]);

  const handleCreateItem = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await createInventoryItem({
        ...newItem,
        quantity: parseInt(newItem.quantity as any),
        reorder_level: parseInt(newItem.reorder_level as any),
        unit_price: parseFloat(newItem.unit_price as any),
        supplier_id: parseInt(newItem.supplier_id as any),
      });
      setShowItemModal(false);
      setNewItem({ name: '', sku: '', quantity: 0, reorder_level: 0, unit_price: 0, supplier_id: suppliers[0]?.id || '' });
    } catch (error) {
      console.error('Error creating item', error);
    }
  };

  const handleCreateSupplier = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await createSupplier(newSupplier);
      setShowSupplierModal(false);
      setNewSupplier({ name: '', contact_name: '', email: '', phone: '', category: '' });
    } catch (error) {
      console.error('Error creating supplier', error);
    }
  };

  const handleExecuteRestock = async () => {
    setIsRestocking(true);
    try { await executeRestock(); } catch { /* silent */ } finally { setIsRestocking(false); }
  };

  const tabCls = (tab: string) => clsx(
    'px-5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 flex items-center gap-1.5',
    activeTab === tab
      ? tab === 'suggestions' ? 'bg-blue-600 text-white' : 'bg-[var(--bg-surface)] text-[var(--text-1)] shadow-sm'
      : 'text-[var(--text-3)] hover:text-[var(--text-2)]'
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-1)]">Supply Chain</h1>
            {!loading && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <Radio size={9} className="animate-pulse" />
                Live
              </span>
            )}
          </div>
          <p className="text-[var(--text-3)] text-xs mt-1">
            {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` : 'Manage inventory and suppliers'}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowSupplierModal(true)}
            className="flex items-center gap-2 bg-[var(--bg-surface)] border border-[var(--border)] hover:border-white/20 text-[var(--text-2)] text-sm px-3 py-2 rounded-lg transition-all duration-150">
            <Truck size={14} />Add Supplier
          </button>
          <button onClick={() => setShowItemModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all duration-150 shadow-[0_1px_4px_rgba(37,99,235,0.3)]">
            <Plus size={16} />Add Item
          </button>
        </div>
      </div>

      <div className="flex gap-1 mb-6 bg-[var(--bg-input)] p-0.5 rounded-xl border border-[var(--border)] w-fit">
        <button onClick={() => setActiveTab('inventory')} className={tabCls('inventory')}>Inventory</button>
        <button onClick={() => setActiveTab('suppliers')} className={tabCls('suppliers')}>Suppliers</button>
        <button onClick={() => setActiveTab('suggestions')} className={tabCls('suggestions')}>
          <BarChart3 size={13} />AI Restock
        </button>
      </div>

      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-[var(--bg-surface)] border border-[var(--border)] p-6 rounded-xl">
                  <div className="skeleton w-12 h-12 rounded-lg mb-4" />
                  <div className="skeleton h-4 w-32 rounded mb-2" />
                  <div className="skeleton h-3 w-20 rounded mb-4" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="skeleton h-16 rounded-lg" />
                    <div className="skeleton h-16 rounded-lg" />
                  </div>
                </div>
              ))
            : list.map((item: any) => (
                <div key={item.id} className="bg-[var(--bg-surface)] border border-[var(--border)] p-6 rounded-xl relative overflow-hidden">
                  {item.quantity <= item.reorder_level && (
                    <div className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-bold px-2.5 py-1 rounded-bl-lg flex items-center gap-1">
                      <AlertTriangle size={9} />LOW STOCK
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 bg-[var(--bg-input)] rounded-lg flex items-center justify-center text-blue-400">
                      <Package size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--text-1)]">{item.name}</h3>
                      <p className="text-[var(--text-3)] text-xs">SKU: {item.sku}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-[var(--bg-input)] p-3 rounded-lg border border-[var(--border)]">
                      <p className="text-[var(--text-3)] text-[10px] uppercase font-semibold mb-1">Quantity</p>
                      <p className={clsx('text-xl font-bold num', item.quantity <= item.reorder_level ? 'text-red-400' : 'text-[var(--text-1)]')}>
                        {item.quantity}
                      </p>
                    </div>
                    <div className="bg-[var(--bg-input)] p-3 rounded-lg border border-[var(--border)]">
                      <p className="text-[var(--text-3)] text-[10px] uppercase font-semibold mb-1">Price</p>
                      <p className="text-xl font-bold text-emerald-400 num">${item.unit_price}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[var(--text-3)]">
                    <div className="flex items-center gap-1.5"><Truck size={12} />{suppliers.find(s => s.id === item.supplier_id)?.name || '—'}</div>
                    <span>Reorder at <span className="text-[var(--text-2)] font-medium">{item.reorder_level}</span></span>
                  </div>
                </div>
              ))}
        </div>
      )}

      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suppliers.map((sup: any) => (
            <div key={sup.id} className="bg-[var(--bg-surface)] border border-[var(--border)] hover:border-blue-500/30 p-6 rounded-xl transition-all duration-150">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[var(--bg-input)] rounded-lg flex items-center justify-center text-blue-400">
                  <Truck size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text-1)]">{sup.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-3)]"><Tag size={11} />{sup.category}</div>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-[var(--text-3)]">
                <p>Contact: <span className="text-[var(--text-2)]">{sup.contact_name}</span></p>
                <p>Email: <span className="text-[var(--text-2)]">{sup.email}</span></p>
                <p>Phone: <span className="text-[var(--text-2)]">{sup.phone}</span></p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'suggestions' && (
        <div className="space-y-3">
          {suggestions.length === 0 ? (
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] p-12 rounded-xl text-center">
              <Package size={40} className="mx-auto text-[var(--text-3)] mb-3" />
              <h3 className="font-semibold text-[var(--text-2)]">Inventory is healthy</h3>
              <p className="text-[var(--text-3)] text-xs mt-1">No items need restocking right now.</p>
            </div>
          ) : suggestions.map((sug: any, idx: number) => (
            <div key={idx} className="bg-blue-600/[0.04] border border-blue-500/20 p-5 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-600/15 rounded-full flex items-center justify-center text-blue-400">
                  <ShoppingCart size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text-1)]">{sug.item_name}</h3>
                  <p className="text-blue-400/70 text-xs">Supplier: {sug.supplier}</p>
                </div>
              </div>
              <div className="flex items-center gap-8 text-right">
                <div>
                  <p className="text-[var(--text-3)] text-[10px] uppercase font-semibold mb-1">Current</p>
                  <p className="text-lg font-bold text-red-400 num">{sug.current_quantity}</p>
                </div>
                <div>
                  <p className="text-[var(--text-3)] text-[10px] uppercase font-semibold mb-1">Order</p>
                  <p className="text-lg font-bold text-emerald-400 num">{sug.suggested_order} units</p>
                </div>
                <button onClick={handleExecuteRestock} disabled={isRestocking}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg font-medium transition-all duration-150 disabled:opacity-50 flex items-center gap-2">
                  {isRestocking && <Loader2 size={14} className="animate-spin" />}
                  Purchase
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showItemModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] p-7 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold tracking-tight text-[var(--text-1)]">Add Inventory Item</h2>
              <button onClick={() => setShowItemModal(false)} className="text-[var(--text-3)] hover:text-[var(--text-1)] p-1 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateItem} className="space-y-4">
              <div>
                <label className={labelCls}>Item Name</label>
                <input type="text" required value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>SKU</label><input type="text" required value={newItem.sku} onChange={e => setNewItem({ ...newItem, sku: e.target.value })} className={inputCls} /></div>
                <div><label className={labelCls}>Unit Price</label><input type="number" required value={newItem.unit_price} onChange={e => setNewItem({ ...newItem, unit_price: e.target.value as any })} className={inputCls} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>Quantity</label><input type="number" required value={newItem.quantity} onChange={e => setNewItem({ ...newItem, quantity: e.target.value as any })} className={inputCls} /></div>
                <div><label className={labelCls}>Reorder Level</label><input type="number" required value={newItem.reorder_level} onChange={e => setNewItem({ ...newItem, reorder_level: e.target.value as any })} className={inputCls} /></div>
              </div>
              <div>
                <label className={labelCls}>Supplier</label>
                <select required value={newItem.supplier_id} onChange={e => setNewItem({ ...newItem, supplier_id: e.target.value })} className={inputCls}>
                  {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowItemModal(false)} className="flex-1 bg-white/[0.05] hover:bg-white/[0.09] text-[var(--text-2)] text-sm py-2.5 rounded-lg font-medium transition-all duration-150">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm py-2.5 rounded-lg font-medium transition-all duration-150 shadow-[0_1px_4px_rgba(37,99,235,0.3)]">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSupplierModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] p-7 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold tracking-tight text-[var(--text-1)]">Add Supplier</h2>
              <button onClick={() => setShowSupplierModal(false)} className="text-[var(--text-3)] hover:text-[var(--text-1)] p-1 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateSupplier} className="space-y-4">
              <div><label className={labelCls}>Supplier Name</label><input type="text" required value={newSupplier.name} onChange={e => setNewSupplier({ ...newSupplier, name: e.target.value })} className={inputCls} /></div>
              <div><label className={labelCls}>Contact Name</label><input type="text" value={newSupplier.contact_name} onChange={e => setNewSupplier({ ...newSupplier, contact_name: e.target.value })} className={inputCls} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>Email</label><input type="email" value={newSupplier.email} onChange={e => setNewSupplier({ ...newSupplier, email: e.target.value })} className={inputCls} /></div>
                <div><label className={labelCls}>Phone</label><input type="text" value={newSupplier.phone} onChange={e => setNewSupplier({ ...newSupplier, phone: e.target.value })} className={inputCls} /></div>
              </div>
              <div><label className={labelCls}>Category</label><input type="text" value={newSupplier.category} onChange={e => setNewSupplier({ ...newSupplier, category: e.target.value })} className={inputCls} /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowSupplierModal(false)} className="flex-1 bg-white/[0.05] hover:bg-white/[0.09] text-[var(--text-2)] text-sm py-2.5 rounded-lg font-medium transition-all duration-150">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm py-2.5 rounded-lg font-medium transition-all duration-150 shadow-[0_1px_4px_rgba(37,99,235,0.3)]">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
