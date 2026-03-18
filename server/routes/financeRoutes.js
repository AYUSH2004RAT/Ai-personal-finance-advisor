import { Router } from 'express';
import protect from '../middleware/auth.js';
import User from '../models/User.js';
import Expense from '../models/Expense.js';
import Loan from '../models/Loan.js';
import Investment from '../models/Investment.js';

const router = Router();

router.get('/summary', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select('monthlyIncome name');
    const expenses = await Expense.find({ userId }).sort({ date: -1 }).limit(50);
    const loans = await Loan.find({ userId });
    const investments = await Investment.find({ userId });

    const totalIncome = user.monthlyIncome || 0;
    
    // Calculate total monthly expense in current month
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const monthlyExpenses = expenses
      .filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, e) => sum + e.amount, 0);

    // Calculate total debt and monthly EMIs
    const totalDebt = loans.reduce((sum, l) => sum + l.remainingBalance, 0);
    // Simple heuristic for EMI if not provided directly (Principal * Interest / 12)
    const monthlyEMI = loans.reduce((sum, l) => {
      // Very rough EMI estimate if exact term details are missing
      if (l.termMonths > 0) {
        return sum + (l.remainingBalance / l.termMonths) + (l.remainingBalance * (l.interestRate / 100) / 12);
      }
      return sum;
    }, 0);

    const totalInvestments = investments.reduce((sum, i) => sum + (i.quantity * (i.currentPrice || i.purchasePrice)), 0);

    res.json({
      profile: {
        name: user.name,
        monthlyIncome: totalIncome
      },
      metrics: {
        totalMonthlyIncome: totalIncome,
        totalMonthlyExpenses: monthlyExpenses,
        totalDebt: totalDebt,
        totalMonthlyEMI: monthlyEMI,
        totalInvestments: totalInvestments,
        savingsRate: totalIncome > 0 ? ((totalIncome - monthlyExpenses - monthlyEMI) / totalIncome) * 100 : 0
      },
      raw: {
        expenses: expenses.map(e => ({ category: e.category, amount: e.amount, date: e.date })),
        loans: loans.map(l => ({ name: l.name, type: l.type, remaining: l.remainingBalance, interest: l.interestRate })),
        investments: investments.map(i => ({ type: i.type, value: i.quantity * (i.currentPrice || i.purchasePrice) }))
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
