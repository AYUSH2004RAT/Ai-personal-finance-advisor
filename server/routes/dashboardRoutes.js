import { Router } from 'express';
import Expense from '../models/Expense.js';
import Loan from '../models/Loan.js';
import Investment from '../models/Investment.js';
import protect from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/', async (req, res) => {
  try {
    const userId = req.user._id;

    const [expenses, loans, investments] = await Promise.all([
      Expense.find({ userId }),
      Loan.find({ userId }),
      Investment.find({ userId })
    ]);

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalDebt = loans.reduce((sum, l) => sum + l.remainingBalance, 0);
    const totalInvestmentValue = investments.reduce((sum, i) => sum + (i.quantity * (i.currentPrice || i.purchasePrice)), 0);

    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlySpending = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth() + i, 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const monthExpenses = expenses.filter(e => {
        const eDate = new Date(e.date);
        return eDate >= d && eDate <= monthEnd;
      });
      const total = monthExpenses.reduce((s, e) => s + e.amount, 0);
      monthlySpending.push({
        name: d.toLocaleString('en-IN', { month: 'short' }).toUpperCase(),
        value: total
      });
    }

    const categoryMap = {};
    expenses.forEach(e => {
      categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
    });
    const colors = ['#0f172a', '#10b981', '#f43f5e', '#6366f1', '#f59e0b', '#8b5cf6'];
    const expenseBreakdown = Object.entries(categoryMap).map(([name, value], i) => ({
      name, value, color: colors[i % colors.length]
    }));

    const recentTransactions = expenses.slice(0, 5).map(e => ({
      _id: e._id,
      name: e.description || e.category,
      cat: e.category,
      date: e.date,
      amount: -e.amount
    }));

    const monthIncome = 85000;
    const currentMonthExpenses = expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((s, e) => s + e.amount, 0);

    let healthScore = 100;
    if (monthIncome > 0) {
      const expenseRatio = (currentMonthExpenses / monthIncome) * 40;
      healthScore -= Math.min(expenseRatio, 40);
    }
    if (totalDebt > 0) {
      const debtRatio = Math.min((totalDebt / (monthIncome * 12)) * 30, 30);
      healthScore -= debtRatio;
    }
    if (totalInvestmentValue > 0) {
      healthScore += Math.min(10, (totalInvestmentValue / monthIncome) * 2);
    }
    healthScore = Math.max(0, Math.min(100, Math.round(healthScore)));

    const nextLoan = loans
      .filter(l => l.nextPaymentDate)
      .sort((a, b) => new Date(a.nextPaymentDate) - new Date(b.nextPaymentDate))[0];

    res.json({
      totalExpenses,
      totalDebt,
      totalInvestmentValue,
      currentMonthExpenses,
      monthlySpending,
      expenseBreakdown,
      recentTransactions,
      healthScore,
      nextPayment: nextLoan ? {
        amount: Math.round(nextLoan.remainingBalance / (nextLoan.termMonths || 1)),
        date: nextLoan.nextPaymentDate,
        name: nextLoan.name
      } : null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
