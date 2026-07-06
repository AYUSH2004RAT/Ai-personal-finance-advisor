<div align="center">

# 💰 AI Personal Finance Advisor

### Your AI-Powered Financial Command Center

A full-stack fintech web application that helps users track expenses, manage loans, plan investments, and get **personalized financial advice** powered by **Google Gemini AI** — all in one beautiful dashboard.

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Visit_App-00C853?style=for-the-badge&logoColor=white)](https://ai-personal-finance-advisor-pi.vercel.app)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/AYUSH2004RAT/Ai-personal-finance-advisor)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](./LICENSE)

![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite_6-646CFF?style=flat-square&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini_AI-4285F4?style=flat-square&logo=google&logoColor=white)
![JWT](https://img.shields.io/badge/JWT_Auth-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed_on_Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

</div>

---

## 📸 Screenshots

<div align="center">

> _Screenshots coming soon — deploy the app locally or visit the [Live Demo](https://ai-personal-finance-advisor-pi.vercel.app) to see it in action!_

<!-- Uncomment and replace with actual screenshots:
| Dashboard | AI Advisor | Expense Tracker |
|:---------:|:----------:|:---------------:|
| ![Dashboard](./screenshots/dashboard.png) | ![AI Chat](./screenshots/ai-advisor.png) | ![Expenses](./screenshots/expenses.png) |

| Investment Planner | Loan Manager | Auth |
|:------------------:|:------------:|:----:|
| ![Investments](./screenshots/investments.png) | ![Loans](./screenshots/loans.png) | ![Login](./screenshots/login.png) |
-->

</div>

---

## ✨ Features

| Category | Feature |
|:---------|:--------|
| 📊 **Dashboard** | Real-time financial overview with interactive Recharts visualizations (bar, pie, line & area charts) |
| 💸 **Expense Tracker** | Add, categorize, and analyze expenses with category-wise breakdown |
| 🤖 **AI Financial Advisor** | Chat with Google Gemini AI — get personalized, data-driven advice based on your actual finances |
| 💬 **Natural Language Queries** | Ask questions like _"Am I spending too much on food?"_ and get actionable insights |
| 🏦 **Loan Manager** | Track multiple loans, EMIs, interest rates, and remaining balances |
| 📈 **Investment Planner** | Plan and monitor investments across different asset types |
| 🔐 **Secure Auth** | JWT-based authentication with bcrypt password hashing |
| 📱 **Responsive UI** | Mobile-first design with Tailwind CSS — works beautifully on all devices |
| 🎨 **Modern UX** | Smooth Framer Motion animations, Lucide icons, and a polished dark UI |
| ⚡ **AI Insights** | Auto-generated financial insights powered by Gemini on your dashboard |

---

## 🧠 How the AI Integration Works

```
┌──────────────────────────────────────────────────────────────┐
│                        USER                                  │
│   "How can I save ₹50,000 in the next 6 months?"            │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                   REACT FRONTEND                             │
│   Collects user message + all financial data from context    │
│   (expenses, loans, investments, income)                     │
└──────────────────────┬───────────────────────────────────────┘
                       │  POST /api/chat
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                   EXPRESS BACKEND                             │
│                                                              │
│   1. Authenticates request via JWT middleware                 │
│   2. Extracts financial metrics:                             │
│      • Income, Expenses, Savings, EMIs, Debt                 │
│      • Category-wise expense breakdown                       │
│      • Loan & investment details                             │
│   3. Builds a structured system prompt with the user's       │
│      real financial data embedded                            │
│   4. Sends to Google Gemini 2.5 Flash                        │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                 GOOGLE GEMINI AI                              │
│                                                              │
│   Responds with structured, personalized advice:             │
│   📊 Financial Summary  →  ⚠️ Key Issues                    │
│   📉 Budget Analysis (50/30/20 Rule)                         │
│   🎯 Goal Plan  →  ✅ Smart Recommendations                 │
│   📊 Financial Health Score (0-100)  →  💡 Pro Tip           │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                   REACT FRONTEND                             │
│   Renders the AI response with Markdown formatting           │
└──────────────────────────────────────────────────────────────┘
```

The AI **never gives generic advice**. Every response uses the user's actual income, expenses, debt, and investment data to deliver actionable, number-backed recommendations.

---

## 📁 Folder Structure

```
ai-personal-finance-advisor/
├── client/                          # React Frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx           # Top navigation bar
│   │   │   └── Sidebar.jsx          # Sidebar navigation
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # JWT auth state management
│   │   ├── pages/
│   │   │   ├── AIAdvisor.jsx        # AI chat interface
│   │   │   ├── Dashboard.jsx        # Main financial dashboard
│   │   │   ├── ExpenseTracker.jsx   # Expense management
│   │   │   ├── InvestmentPlanner.jsx# Investment tracking
│   │   │   ├── LoanManager.jsx      # Loan & EMI management
│   │   │   ├── Login.jsx            # Login page
│   │   │   └── Register.jsx         # Registration page
│   │   ├── utils/
│   │   │   └── api.js               # Axios API helper
│   │   ├── App.jsx                  # Root component & routing
│   │   ├── main.jsx                 # App entry point
│   │   └── index.css                # Global styles
│   ├── index.html
│   ├── vite.config.js
│   ├── vercel.json                  # Vercel SPA routing config
│   └── package.json
│
├── server/                          # Node.js + Express Backend
│   ├── middleware/
│   │   └── auth.js                  # JWT verification middleware
│   ├── models/
│   │   ├── User.js                  # User schema (bcrypt hashed)
│   │   ├── Expense.js               # Expense schema
│   │   ├── Investment.js            # Investment schema
│   │   └── Loan.js                  # Loan schema
│   ├── routes/
│   │   ├── authRoutes.js            # Register / Login
│   │   ├── dashboardRoutes.js       # Aggregated dashboard data
│   │   ├── expenseRoutes.js         # CRUD expenses
│   │   ├── financeRoutes.js         # Financial summaries
│   │   ├── investmentRoutes.js      # CRUD investments
│   │   └── loanRoutes.js            # CRUD loans
│   ├── server.js                    # Express app + Gemini AI endpoints
│   ├── .env.example                 # Environment variable template
│   └── package.json
│
├── .gitignore
├── package.json                     # Root-level scripts
└── README.md
```

---

## 🚀 Setup & Installation

### Prerequisites

| Tool | Version |
|:-----|:--------|
| **Node.js** | v18 or higher |
| **npm** | v9 or higher |
| **MongoDB** | Atlas (cloud) or local instance |
| **Google Gemini API Key** | [Get one here](https://aistudio.google.com/app/apikey) |

### 1. Clone the Repository

```bash
git clone https://github.com/AYUSH2004RAT/Ai-personal-finance-advisor.git
cd Ai-personal-finance-advisor
```

### 2. Install Dependencies

```bash
# Install all dependencies (client + server) from root
npm run install-all
```

Or install individually:

```bash
# Client
cd client && npm install

# Server
cd ../server && npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the **`server/`** directory using the template below:

```bash
cp server/.env.example server/.env
```

Create a `.env` file in the **`client/`** directory:

```env
VITE_API_URL=http://localhost:3000
```

### 4. Run the Application

```bash
# Terminal 1 — Start the backend
npm run server

# Terminal 2 — Start the frontend
npm run client
```

| Service | URL |
|:--------|:----|
| Frontend | `http://localhost:5173` |
| Backend API | `http://localhost:3000` |

---

## 🔐 Environment Variables

### Server (`server/.env`)

| Variable | Description | Example |
|:---------|:------------|:--------|
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/finance-advisor` |
| `JWT_SECRET` | Secret key for JWT token signing | `your-very-secret-jwt-key-change-this` |
| `GEMINI_API_KEY` | Google Gemini API key | `AIzaSy...` |
| `CORS_ORIGIN` | Allowed frontend origins (comma-separated) | `https://your-app.vercel.app` |

### Client (`client/.env`)

| Variable | Description | Example |
|:---------|:------------|:--------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:3000` |

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|:------|:-----------|:--------|
| **Frontend** | React 19 | Component-based UI |
| **Styling** | Tailwind CSS 4 | Utility-first responsive design |
| **Build Tool** | Vite 6 | Lightning-fast dev server & bundler |
| **Charts** | Recharts 3 | Interactive data visualizations |
| **Animations** | Framer Motion | Smooth UI transitions |
| **Icons** | Lucide React | Beautiful, consistent iconography |
| **Markdown** | react-markdown | Render AI responses |
| **Routing** | React Router 7 | Client-side navigation |
| **Backend** | Node.js + Express 4 | REST API server |
| **Database** | MongoDB + Mongoose 9 | NoSQL document storage |
| **AI** | Google Gemini 2.5 Flash | Personalized financial advice |
| **Auth** | JWT + bcryptjs | Secure authentication |
| **Deployment** | Vercel | Frontend & backend hosting |

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|:-------|:---------|:-----|:------------|
| `POST` | `/api/auth/register` | ❌ | Create a new user account |
| `POST` | `/api/auth/login` | ❌ | Login & receive JWT token |
| `GET` | `/api/dashboard` | 🔐 | Aggregated financial dashboard data |
| `GET/POST/DELETE` | `/api/expenses` | 🔐 | CRUD expense records |
| `GET/POST/DELETE` | `/api/loans` | 🔐 | CRUD loan records |
| `GET/POST/DELETE` | `/api/investments` | 🔐 | CRUD investment records |
| `GET` | `/api/finance` | 🔐 | Financial summaries & analytics |
| `POST` | `/api/chat` | 🔐 | Send message to AI advisor |
| `POST` | `/api/insights` | 🔐 | Generate AI financial insights |

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

```
MIT License

Copyright (c) 2026 AYUSH

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">

**⭐ If you found this project useful, give it a star on GitHub! ⭐**

Built with ❤️ by [AYUSH](https://github.com/AYUSH2004RAT)

[![GitHub Stars](https://img.shields.io/github/stars/AYUSH2004RAT/Ai-personal-finance-advisor?style=social)](https://github.com/AYUSH2004RAT/Ai-personal-finance-advisor)

</div>
