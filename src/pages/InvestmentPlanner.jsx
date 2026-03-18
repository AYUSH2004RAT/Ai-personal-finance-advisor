import { useState, useEffect } from 'react';
import { Plus, TrendingUp, Loader2, Pencil, Trash2, X, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { clsx } from 'clsx';
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';

const ASSET_TYPES = ['Stock', 'ETF', 'Mutual Fund', 'Bond', 'Crypto', 'FD', 'PPF', 'Gold', 'Other'];

export default function InvestmentPlanner() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', symbol: '', type: 'Stock', quantity: '', purchasePrice: '', currentPrice: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchInvestments(); }, []);

  async function fetchInvestments() {
    setLoading(true);
    try {
      const data = await apiGet('/api/investments');
      setInvestments(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  function openAdd() {
    setEditing(null);
    setForm({ name: '', symbol: '', type: 'Stock', quantity: '', purchasePrice: '', currentPrice: '' });
    setShowModal(true);
  }

  function openEdit(inv) {
    setEditing(inv);
    setForm({
      name: inv.name,
      symbol: inv.symbol,
      type: inv.type,
      quantity: inv.quantity.toString(),
      purchasePrice: inv.purchasePrice.toString(),
      currentPrice: (inv.currentPrice || inv.purchasePrice).toString()
    });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        ...form,
        quantity: parseFloat(form.quantity),
        purchasePrice: parseFloat(form.purchasePrice),
        currentPrice: parseFloat(form.currentPrice) || parseFloat(form.purchasePrice)
      };
      if (editing) {
        const updated = await apiPut(`/api/investments/${editing._id}`, body);
        setInvestments(prev => prev.map(i => i._id === updated._id ? updated : i));
      } else {
        const created = await apiPost('/api/investments', body);
        setInvestments(prev => [created, ...prev]);
      }
      setShowModal(false);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this investment?')) return;
    try {
      await apiDelete(`/api/investments/${id}`);
      setInvestments(prev => prev.filter(i => i._id !== id));
    } catch (err) { setError(err.message); }
  }

  const totalInvested = investments.reduce((s, i) => s + (i.quantity * i.purchasePrice), 0);
  const totalCurrent = investments.reduce((s, i) => s + (i.quantity * (i.currentPrice || i.purchasePrice)), 0);
  const totalGain = totalCurrent - totalInvested;
  const gainPct = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(1) : 0;

  const typeAllocation = {};
  investments.forEach(i => {
    const val = i.quantity * (i.currentPrice || i.purchasePrice);
    typeAllocation[i.type] = (typeAllocation[i.type] || 0) + val;
  });
  const allocationEntries = Object.entries(typeAllocation).map(([name, val]) => ({
    name, value: val, pct: totalCurrent > 0 ? ((val / totalCurrent) * 100).toFixed(0) : 0
  }));
  const allocColors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-slate-400', 'bg-purple-500'];

  const fmt = (v) => v.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <header className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Investment Planner</h2>
          <p className="text-slate-500">Grow your wealth with AI-driven portfolio insights</p>
        </div>
        <button onClick={openAdd} className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-slate-800 transition-colors">
          <Plus className="w-5 h-5" />
          Add Asset
        </button>
      </header>

      {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium px-4 py-3 rounded-xl">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Portfolio Value</h3>
              <div className="flex items-end gap-3 mt-1">
                <p className="text-4xl font-black text-slate-900">{fmt(totalCurrent)}</p>
                <span className={clsx("font-bold text-sm px-2 py-1 rounded mb-1 flex items-center gap-1", totalGain >= 0 ? 'text-emerald-500 bg-emerald-50' : 'text-rose-500 bg-rose-50')}>
                  <TrendingUp className="w-4 h-4" />
                  {totalGain >= 0 ? '+' : ''}{gainPct}%
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-auto">
            <div className="bg-slate-50 p-4 rounded-xl">
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">Invested</p>
              <p className="text-lg font-black text-slate-900">{fmt(totalInvested)}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl">
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">Current</p>
              <p className="text-lg font-black text-slate-900">{fmt(totalCurrent)}</p>
            </div>
            <div className={clsx("p-4 rounded-xl", totalGain >= 0 ? 'bg-emerald-50' : 'bg-rose-50')}>
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">P&L</p>
              <p className={clsx("text-lg font-black", totalGain >= 0 ? 'text-emerald-600' : 'text-rose-600')}>{totalGain >= 0 ? '+' : ''}{fmt(totalGain)}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800 flex flex-col justify-center relative overflow-hidden">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 relative z-10">Asset Allocation</h3>
          {allocationEntries.length > 0 ? (
            <div className="space-y-4 relative z-10">
              {allocationEntries.map((asset, i) => (
                <div key={asset.name}>
                  <div className="flex justify-between text-sm font-bold mb-1">
                    <span>{asset.name}</span>
                    <span>{asset.pct}%</span>
                  </div>
                  <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                    <div className={`${allocColors[i % allocColors.length]} h-full`} style={{ width: `${asset.pct}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">Add investments to see allocation</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-lg text-slate-900">Your Assets</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs uppercase text-slate-400 bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 font-bold">Asset Name</th>
                <th className="px-6 py-4 font-bold">Symbol</th>
                <th className="px-6 py-4 font-bold">Type</th>
                <th className="px-6 py-4 font-bold text-right">Qty</th>
                <th className="px-6 py-4 font-bold text-right">Avg Price</th>
                <th className="px-6 py-4 font-bold text-right">Current Value</th>
                <th className="px-6 py-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-slate-500"><Loader2 className="w-5 h-5 animate-spin inline" /> Loading...</td></tr>
              ) : investments.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-slate-400 font-medium">No investments yet. Click "Add Asset" to start.</td></tr>
              ) : (
                investments.map((inv) => {
                  const curVal = inv.quantity * (inv.currentPrice || inv.purchasePrice);
                  const invVal = inv.quantity * inv.purchasePrice;
                  const g = curVal - invVal;
                  const gp = invVal > 0 ? ((g / invVal) * 100).toFixed(1) : 0;
                  return (
                    <tr key={inv._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs">
                            {inv.symbol.substring(0, 2)}
                          </div>
                          <span className="font-bold text-sm text-slate-900">{inv.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-500">{inv.symbol}</td>
                      <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">{inv.type}</span></td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-slate-900">{inv.quantity}</td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-slate-500">₹{inv.purchasePrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-black text-slate-900">₹{curVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          <span className={clsx("text-xs font-bold", g >= 0 ? 'text-emerald-500' : 'text-rose-500')}>{g >= 0 ? '+' : ''}{gp}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openEdit(inv)} className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(inv._id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">{editing ? 'Edit Asset' : 'Add Asset'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Asset Name</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" placeholder="E.g. Reliance Industries" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Symbol</label>
                  <input type="text" value={form.symbol} onChange={e => setForm(f => ({ ...f, symbol: e.target.value }))} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" placeholder="RELIANCE" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Type</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900">
                    {ASSET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Quantity</label>
                <input type="number" step="0.01" min="0" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Purchase Price (₹)</label>
                  <input type="number" step="0.01" min="0" value={form.purchasePrice} onChange={e => setForm(f => ({ ...f, purchasePrice: e.target.value }))} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Current Price (₹)</label>
                  <input type="number" step="0.01" min="0" value={form.currentPrice} onChange={e => setForm(f => ({ ...f, currentPrice: e.target.value }))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" placeholder="Optional" />
                </div>
              </div>
              <button type="submit" disabled={saving} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {editing ? 'Update Asset' : 'Add Asset'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
