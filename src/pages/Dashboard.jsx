import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, CreditCard, ShieldCheck, Lightbulb, Loader2, Wallet, Check, Sparkles } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';
import { apiGet } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { user, updateIncome } = useAuth();
  const [incomeInput, setIncomeInput] = useState('');
  const [savingIncome, setSavingIncome] = useState(false);

  useEffect(() => {
    apiGet('/api/dashboard')
      .then(d => { setData(d); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-rose-500 font-medium">{error}</p>
      </div>
    );
  }

  const fmt = (v) => v.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

  const monthlyData = data?.monthlySpending || [];
  const pieData = data?.expenseBreakdown || [];
  const totalPie = pieData.reduce((s, p) => s + p.value, 0);

  const handleIncomeSubmit = async (e) => {
    e.preventDefault();
    if (!incomeInput) return;
    setSavingIncome(true);
    try {
      await updateIncome(incomeInput);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingIncome(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {!user?.monthlyIncome && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              Unlock Personalized AI Insights
            </h3>
            <p className="text-indigo-700 text-sm mt-1">Please enter your monthly net income to let the AI analyze your spending patterns and debt correctly.</p>
          </div>
          <form onSubmit={handleIncomeSubmit} className="flex items-center gap-2 w-full md:w-auto">
            <input type="number" min="0" value={incomeInput} onChange={e => setIncomeInput(e.target.value)} placeholder="e.g. 50000" className="px-4 py-2.5 rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm w-full md:w-48" required disabled={savingIncome} />
            <button type="submit" disabled={savingIncome} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2">
              {savingIncome ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Monthly Income</span>
            <Wallet className="text-indigo-500 w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-slate-900">{fmt(user?.monthlyIncome || 0)}</p>
          <p className="text-xs text-indigo-600 font-semibold bg-indigo-50 self-start px-2 py-0.5 rounded">Net Income</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Total Investments</span>
            <ArrowUpRight className="text-emerald-500 w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-slate-900">{fmt(data?.totalInvestmentValue || 0)}</p>
          <p className="text-xs text-emerald-600 font-semibold bg-emerald-50 self-start px-2 py-0.5 rounded">Portfolio Value</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">This Month Expenses</span>
            <ArrowDownRight className="text-rose-500 w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-slate-900">{fmt(data?.currentMonthExpenses || 0)}</p>
          <p className="text-xs text-rose-600 font-semibold bg-rose-50 self-start px-2 py-0.5 rounded">Current Month</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Total Debt</span>
            <CreditCard className="text-slate-400 w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-slate-900">{fmt(data?.totalDebt || 0)}</p>
          <p className="text-xs text-slate-600 font-semibold bg-slate-50 self-start px-2 py-0.5 rounded">Outstanding</p>
        </div>
        
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">Health Score</span>
            <ShieldCheck className="text-amber-400 w-5 h-5" />
          </div>
          <p className="text-3xl font-black">{data?.healthScore || 0}/100</p>
          <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
            <div className="bg-white h-full" style={{ width: `${data?.healthScore || 0}%` }}></div>
          </div>
          <p className="text-xs font-medium text-slate-300 mt-1">
            {(data?.healthScore || 0) >= 75 ? 'Great financial health!' : (data?.healthScore || 0) >= 50 ? 'Room for improvement' : 'Needs attention'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-slate-900">Monthly Spending Trends</h3>
            <span className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">Last 6 Months</span>
          </div>
          <div className="h-64 w-full">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} dy={10} />
                  <Tooltip
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Spent']}
                  />
                  <Bar dataKey="value" fill="#0f172a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 font-medium">No spending data yet. Add expenses to see trends.</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
          <h3 className="font-bold text-lg text-slate-900 mb-6">Expense Breakdown</h3>
          {pieData.length > 0 ? (
            <>
              <div className="relative flex-1 flex flex-col items-center justify-center py-4 min-h-[200px] w-full h-[200px]">
                <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                  <span className="text-2xl font-black text-slate-900">{fmt(totalPie)}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">total</span>
                </div>
              </div>
              <div className="space-y-3 mt-4">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                      <span className="text-slate-600 font-medium">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-900">{fmt(item.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 font-medium text-sm">No expenses yet</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden flex flex-col justify-center">
          <div className="absolute -right-4 -top-4 opacity-10">
            <Lightbulb className="w-32 h-32" />
          </div>
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="text-amber-400 w-5 h-5" />
            <span className="text-xs font-bold tracking-wider uppercase opacity-80">AI Quick Tip</span>
          </div>
          <p className="text-lg font-medium leading-snug relative z-10">
            {data?.totalDebt > 0
              ? `Focus on paying off high-interest debt first. Your total debt is ${fmt(data.totalDebt)}. Use the Avalanche method to save on interest.`
              : data?.totalExpenses > 0
                ? `Track your spending patterns. You've spent ${fmt(data.totalExpenses)} total. Head to the Expense Tracker for details.`
                : 'Start adding your expenses, loans, and investments to get personalized AI insights!'}
          </p>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-slate-900">Recent Transactions</h3>
          </div>
          <div className="space-y-4">
            {(data?.recentTransactions || []).length > 0 ? (
              data.recentTransactions.map((tx, i) => (
                <div key={tx._id || i} className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">
                      {tx.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900">{tx.name}</p>
                      <p className="text-xs text-slate-500">{tx.cat} • {new Date(tx.date).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-slate-900">
                    {tx.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm font-medium text-center py-4">No transactions yet. Add expenses to see them here.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
