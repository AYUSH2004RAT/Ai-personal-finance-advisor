import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import mongoose from 'mongoose';
import { GoogleGenAI } from '@google/genai';
import protect from './server/middleware/auth.js';
import authRoutes from './server/routes/authRoutes.js';
import expenseRoutes from './server/routes/expenseRoutes.js';
import loanRoutes from './server/routes/loanRoutes.js';
import investmentRoutes from './server/routes/investmentRoutes.js';
import dashboardRoutes from './server/routes/dashboardRoutes.js';
import financeRoutes from './server/routes/financeRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/finance', financeRoutes);

app.post('/api/chat', protect, async (req, res) => {
  try {
    const { message, financialData } = req.body;

    // Extract financial metrics for the structured prompt
    const income = financialData?.metrics?.totalMonthlyIncome || 0;
    const totalExpenses = financialData?.metrics?.totalMonthlyExpenses || 0;
    const monthlyEMI = financialData?.metrics?.totalMonthlyEMI || 0;
    const fixedExpenses = monthlyEMI; // EMIs are fixed obligations
    const variableExpenses = totalExpenses; // tracked spending = variable
    const savings = income - totalExpenses - monthlyEMI;
    const totalDebt = financialData?.metrics?.totalDebt || 0;
    const totalInvestments = financialData?.metrics?.totalInvestments || 0;
    const userName = financialData?.profile?.name || 'User';

    // Build category breakdown from raw expenses
    let categoryBreakdown = '';
    if (financialData?.raw?.expenses?.length) {
      const byCategory = {};
      financialData.raw.expenses.forEach(e => {
        byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
      });
      categoryBreakdown = Object.entries(byCategory)
        .map(([cat, amt]) => `  - ${cat}: ₹${amt.toLocaleString('en-IN')}`)
        .join('\n');
    }

    // Build loan details
    let loanDetails = '';
    if (financialData?.raw?.loans?.length) {
      loanDetails = financialData.raw.loans
        .map(l => `  - ${l.name} (${l.type}): ₹${l.remaining.toLocaleString('en-IN')} remaining @ ${l.interest}%`)
        .join('\n');
    }

    // Build investment details
    let investmentDetails = '';
    if (financialData?.raw?.investments?.length) {
      investmentDetails = financialData.raw.investments
        .map(i => `  - ${i.type}: ₹${i.value.toLocaleString('en-IN')}`)
        .join('\n');
    }

    let sysInstruction = `You are a highly intelligent AI Financial Advisor inside a personal finance application.

You MUST provide accurate, data-driven, and personalized financial advice using the user's real financial data. Do NOT give generic advice.

-----------------------------------
USER FINANCIAL DATA:

- Monthly Income: ₹${income.toLocaleString('en-IN')}
- Total Expenses: ₹${totalExpenses.toLocaleString('en-IN')}
- Fixed Expenses (EMI/Rent): ₹${fixedExpenses.toLocaleString('en-IN')}
- Variable Expenses: ₹${variableExpenses.toLocaleString('en-IN')}
- Current Savings: ₹${savings.toLocaleString('en-IN')}
- Investments: ₹${totalInvestments.toLocaleString('en-IN')}
- Debt: ₹${totalDebt.toLocaleString('en-IN')}

- Expense Breakdown by Category:
${categoryBreakdown || '  - None'}

- Financial Goal:
(Assume the user's message contains their goal if applicable)
-----------------------------------

STEP-BY-STEP ANALYSIS (MANDATORY):

1. Calculate:
   - Savings Rate (%) = (Savings / Income) × 100
   - Expense Ratio (%) = (Total Expenses / Income) × 100
   - Debt-to-Income Ratio (%) = (Debt / Income) × 100
   - Remaining Balance

2. Apply 50/30/20 Rule:
   - Needs = Fixed Expenses
   - Wants = Variable Expenses
   - Savings = Remaining

   Compare and identify imbalance.

3. Detect Problems:
   - Overspending categories
   - Low savings rate (<20%)
   - High debt (>30% of income)

4. Goal Planning (VERY IMPORTANT):
   If a goal exists:
   - Extract goal amount and timeline (if possible)
   - Calculate required monthly savings
   - Suggest realistic plan

5. Personalization Rules:
   - Low income (<₹30K): focus on strict budgeting & saving
   - Medium income (₹30K–₹1L): balance saving + investing
   - High income (>₹1L): include investment & wealth growth strategies

-----------------------------------

OUTPUT FORMAT (STRICT):

1. 📊 Financial Summary
- Income:
- Expenses:
- Savings:
- Savings Rate:
- Remaining Balance:

2. ⚠️ Key Issues
- List specific financial problems using actual numbers

3. 📉 Budget Analysis (50/30/20 Rule)
- Needs:
- Wants:
- Savings:
- Explain mismatch

4. 🎯 Goal Plan
- Goal:
- Monthly saving required:
- Time estimate:
(If no goal, suggest one)

5. ✅ Smart Recommendations
- Give 4–6 highly specific actionable suggestions
- MUST include numbers (₹ or %)
- MUST be practical

6. 📊 Financial Health Score (0–100)
- Give score based on:
  - Savings rate
  - Expense control
  - Debt level
- Explain in 1–2 lines

7. 💡 Pro Tip
- One sharp, personalized tip

-----------------------------------

STRICT RULES:

- NEVER give generic advice like "save more money"
- ALWAYS use user's financial data in response
- ALWAYS include numbers and calculations
- Keep tone practical, human, and advisory (not robotic)
- Keep response structured and easy to read`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction: sysInstruction,
      }
    });
    res.json({ reply: response.text });
  } catch (err) {
    console.error(err);
    const status = err?.status || 500;
    const msg = status === 429 ? 'AI rate limit reached. Please wait a moment and try again.' : 'Failed to get AI response';
    res.status(status).json({ error: msg });
  }
});

app.post('/api/insights', protect, async (req, res) => {
  try {
    const { context } = req.body;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Based on this financial context: ${JSON.stringify(context)}, provide a short, actionable financial insight (max 2 sentences). Use Indian Rupees (₹).`,
    });
    res.json({ insight: response.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate insight' });
  }
});

async function startServer() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/finance-advisor';
  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }

  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'dev-secret-change-in-production';
    console.warn('WARNING: Using default JWT_SECRET. Set JWT_SECRET env variable in production.');
  }

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
