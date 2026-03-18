import { useState, useEffect } from 'react';
import { Plus, TrendingDown, CalendarDays, CheckCircle2, Loader2, Pencil, Trash2, X } from 'lucide-react';
import { clsx } from 'clsx';
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';

const LOAN_TYPES = ['Personal', 'Auto', 'Home', 'Education', 'Credit', 'Business', 'Other'];

export default function LoanManager() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'Personal', principalAmount: '', remainingBalance: '', interestRate: '', termMonths: '', nextPaymentDate: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchLoans(); }, []);

  async function fetchLoans() {
    setLoading(true);
    try {
      const data = await apiGet('/api/loans');
      setLoans(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  function openAdd() {
    setEditing(null);
    setForm({ name: '', type: 'Personal', principalAmount: '', remainingBalance: '', interestRate: '', termMonths: '', nextPaymentDate: '' });
    setShowModal(true);
  }

  function openEdit(loan) {
    setEditing(loan);
    setForm({
      name: loan.name,
      type: loan.type,
      principalAmount: loan.principalAmount.toString(),
      remainingBalance: loan.remainingBalance.toString(),
      interestRate: loan.interestRate.toString(),
      termMonths: loan.termMonths.toString(),
      nextPaymentDate: loan.nextPaymentDate ? new Date(loan.nextPaymentDate).toISOString().split('T')[0] : ''
    });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        ...form,
        principalAmount: parseFloat(form.principalAmount),
        remainingBalance: parseFloat(form.remainingBalance),
        interestRate: parseFloat(form.interestRate),
        termMonths: parseInt(form.termMonths) || 0
      };
      if (editing) {
        const updated = await apiPut(`/api/loans/${editing._id}`, body);
        setLoans(prev => prev.map(l => l._id === updated._id ? updated : l));
      } else {
        const created = await apiPost('/api/loans', body);
        setLoans(prev => [created, ...prev]);
      }
      setShowModal(false);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this loan?')) return;
    try {
      await apiDelete(`/api/loans/${id}`);
      setLoans(prev => prev.filter(l => l._id !== id));
    } catch (err) { setError(err.message); }
  }

  const totalDebt = loans.reduce((s, l) => s + l.remainingBalance, 0);
  const totalPrincipal = loans.reduce((s, l) => s + l.principalAmount, 0);
  const paidOff = totalPrincipal > 0 ? Math.round(((totalPrincipal - totalDebt) / totalPrincipal) * 100) : 0;
  const nextLoan = loans.filter(l => l.nextPaymentDate).sort((a, b) => new Date(a.nextPaymentDate) - new Date(b.nextPaymentDate))[0];
  const fmt = (v) => v.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <header className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Loan Manager</h2>
          <p className="text-slate-500">Track your debts and optimize your repayment strategy</p>
        </div>
        <button onClick={openAdd} className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-slate-800 transition-colors">
          <Plus className="w-5 h-5" />
          Add Loan
        </button>
      </header>

      {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium px-4 py-3 rounded-xl">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Debt</span>
            <TrendingDown className="text-emerald-500 w-5 h-5" />
          </div>
          <p className="text-4xl font-black text-slate-900">{fmt(totalDebt)}</p>
          <span className="text-xs font-bold bg-slate-50 text-slate-500 px-2 py-1 rounded self-start">{loans.length} active loan{loans.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Next Payment</span>
            <CalendarDays className="text-amber-500 w-5 h-5" />
          </div>
          {nextLoan ? (
            <>
              <p className="text-4xl font-black text-slate-900">{fmt(Math.round(nextLoan.remainingBalance / (nextLoan.termMonths || 1)))}</p>
              <span className="text-xs font-bold bg-amber-50 text-amber-600 px-2 py-1 rounded self-start">
                Due {new Date(nextLoan.nextPaymentDate).toLocaleDateString('en-IN')} • {nextLoan.name}
              </span>
            </>
          ) : (
            <p className="text-2xl font-black text-slate-300 mt-2">No upcoming</p>
          )}
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">Progress</span>
            <CheckCircle2 className="text-emerald-400 w-5 h-5" />
          </div>
          <p className="text-4xl font-black">{paidOff}%</p>
          <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden mt-2">
            <div className="bg-emerald-400 h-full" style={{ width: `${paidOff}%` }}></div>
          </div>
          <p className="text-xs font-medium text-slate-300 mt-1">paid off</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-lg text-slate-900">Active Loans</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-slate-500 font-medium"><Loader2 className="w-5 h-5 animate-spin inline" /> Loading...</div>
          ) : loans.length === 0 ? (
            <div className="p-8 text-center text-slate-400 font-medium">No loans yet. Click "Add Loan" to get started.</div>
          ) : (
            loans.map((loan) => (
              <div key={loan._id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-bold text-lg text-slate-900">{loan.name}</h4>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 uppercase tracking-wider">
                        {loan.type || 'Personal'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                      <span><span className="font-semibold text-slate-700">Interest:</span> {loan.interestRate}% APR</span>
                      <span><span className="font-semibold text-slate-700">Term:</span> {loan.termMonths} months</span>
                      {loan.nextPaymentDate && <span><span className="font-semibold text-slate-700">Next:</span> {new Date(loan.nextPaymentDate).toLocaleDateString('en-IN')}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end gap-2 min-w-[200px]">
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Remaining</p>
                        <p className="text-2xl font-black text-slate-900">₹{loan.remainingBalance.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className={clsx("h-full", loan.interestRate > 10 ? 'bg-rose-500' : 'bg-emerald-500')} style={{ width: `${((loan.principalAmount - loan.remainingBalance) / loan.principalAmount) * 100}%` }}></div>
                      </div>
                      <div className="flex justify-between w-full text-xs font-medium text-slate-500">
                        <span>₹{(loan.principalAmount - loan.remainingBalance).toLocaleString('en-IN')} paid</span>
                        <span>of ₹{loan.principalAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button onClick={() => openEdit(loan)} className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(loan._id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">{editing ? 'Edit Loan' : 'Add Loan'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Loan Name</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" placeholder="E.g. Home Loan" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900">
                  {LOAN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Principal (₹)</label>
                  <input type="number" min="0" value={form.principalAmount} onChange={e => setForm(f => ({ ...f, principalAmount: e.target.value }))} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Remaining (₹)</label>
                  <input type="number" min="0" value={form.remainingBalance} onChange={e => setForm(f => ({ ...f, remainingBalance: e.target.value }))} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Interest Rate (%)</label>
                  <input type="number" step="0.01" min="0" value={form.interestRate} onChange={e => setForm(f => ({ ...f, interestRate: e.target.value }))} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Term (months)</label>
                  <input type="number" min="0" value={form.termMonths} onChange={e => setForm(f => ({ ...f, termMonths: e.target.value }))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Next Payment Date</label>
                <input type="date" value={form.nextPaymentDate} onChange={e => setForm(f => ({ ...f, nextPaymentDate: e.target.value }))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
              </div>
              <button type="submit" disabled={saving} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {editing ? 'Update Loan' : 'Add Loan'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
