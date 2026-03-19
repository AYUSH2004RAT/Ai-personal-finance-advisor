import { useState, useEffect } from 'react';
import { Plus, Loader2, Pencil, Trash2, X } from 'lucide-react';
import { clsx } from 'clsx';
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';

const CATEGORIES = ['Groceries', 'Transport', 'Food & Drinks', 'Entertainment', 'Shopping', 'Health', 'Education', 'Bills & Utilities', 'Rent', 'Other'];

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ date: '', category: 'Groceries', amount: '', description: '', status: 'Completed' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchExpenses(); }, []);

  async function fetchExpenses() {
    setLoading(true);
    try {
      const data = await apiGet('/api/expenses');
      setExpenses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditing(null);
    setForm({ date: new Date().toISOString().split('T')[0], category: 'Groceries', amount: '', description: '', status: 'Completed' });
    setShowModal(true);
  }

  function openEdit(exp) {
    setEditing(exp);
    setForm({
      date: new Date(exp.date).toISOString().split('T')[0],
      category: exp.category,
      amount: exp.amount.toString(),
      description: exp.description,
      status: exp.status
    });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { ...form, amount: parseFloat(form.amount) };
      if (editing) {
        const updated = await apiPut(`/api/expenses/${editing._id}`, body);
        setExpenses(prev => prev.map(ex => ex._id === updated._id ? updated : ex));
      } else {
        const created = await apiPost('/api/expenses', body);
        setExpenses(prev => [created, ...prev]);
      }
      setShowModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this expense?')) return;
    try {
      await apiDelete(`/api/expenses/${id}`);
      setExpenses(prev => prev.filter(ex => ex._id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  const totalSpending = expenses.reduce((s, e) => s + e.amount, 0);
  const categoryTotals = {};
  expenses.forEach(e => { categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount; });
  const topCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxCat = topCategories.length > 0 ? topCategories[0][1] : 1;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <header className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Expense Tracker</h2>
          <p className="text-slate-500">Manage and monitor your daily spending effortlessly</p>
        </div>
        <button onClick={openAdd} className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-slate-800 transition-colors">
          <Plus className="w-5 h-5" />
          Add Expense
        </button>
      </header>

      {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium px-4 py-3 rounded-xl">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Spending</h3>
              <p className="text-3xl font-black text-slate-900 mt-1">
                {totalSpending.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
              </p>
            </div>
            <span className="text-slate-500 text-xs font-bold bg-slate-50 px-2 py-1 rounded">{expenses.length} entries</span>
          </div>
          <div className="flex items-end justify-between h-48 gap-2 px-2 mt-auto">
            {topCategories.map(([name, val]) => (
              <div key={name} className="flex flex-col items-center gap-2 w-full group">
                <div className="bg-slate-200 hover:bg-slate-900 w-full rounded-t transition-colors" style={{ height: `${(val / maxCat) * 100}%` }}></div>
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-900 uppercase truncate w-full text-center">{name.substring(0, 5)}</span>
              </div>
            ))}
            {topCategories.length === 0 && <div className="w-full flex items-center justify-center text-slate-400 text-sm">No data</div>}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-900">All Expenses</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs uppercase text-slate-400 bg-slate-50">
                  <th className="px-6 py-4 font-bold">Date</th>
                  <th className="px-6 py-4 font-bold">Category</th>
                  <th className="px-6 py-4 font-bold text-right">Amount</th>
                  <th className="px-6 py-4 font-bold text-center">Status</th>
                  <th className="px-6 py-4 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={5} className="p-6 text-center text-slate-500"><Loader2 className="w-5 h-5 animate-spin inline" /> Loading...</td></tr>
                ) : expenses.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-400 font-medium">No expenses yet. Click "Add Expense" to get started.</td></tr>
                ) : (
                  expenses.map((exp) => (
                    <tr key={exp._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-900">{new Date(exp.date).toLocaleDateString('en-IN')}</span>
                          <span className="text-xs text-slate-500">{exp.description}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{exp.category}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-black text-slate-900">-₹{exp.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500">
                          <span className={clsx("w-2 h-2 rounded-full", exp.status === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500')}></span>
                          {exp.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openEdit(exp)} className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(exp._id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">{editing ? 'Edit Expense' : 'Add Expense'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Amount (₹)</label>
                <input type="number" step="0.01" min="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" placeholder="E.g. D-Mart groceries" />
              </div>
              <button type="submit" disabled={saving} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {editing ? 'Update Expense' : 'Add Expense'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
