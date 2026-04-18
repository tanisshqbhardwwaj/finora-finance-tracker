import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import BudgetCard from '../components/BudgetCard';
import api from '../api/client';
import { formatINR } from '../utils/currency';

interface DashboardData {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  recentTransactions: Transaction[];
  analytics: Analytics;
  budget: BudgetStatus | null;
}

interface Analytics {
  averageDailySpend: number;
  spentToday: number;
  spentThisMonth: number;
  expenseToIncomeRatio: number | null;
  topExpenseCategories: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  monthlyExpenseTrend: {
    month: string;
    amount: number;
  }[];
}

interface Transaction {
  id: string;
  amount: number;
  type: string;
  category: string;
  note?: string;
  date: string;
}

interface BudgetStatus {
  limit: number;
  spent: number;
  remaining: number;
  exceeded: boolean;
}

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [budgetStatus, setBudgetStatus] = useState<{
    hasBudget: boolean;
    limit?: number;
    spent?: number;
    remaining?: number;
    exceeded?: boolean;
    percentage?: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, budgetRes] = await Promise.all([
          api.get('/dashboard'),
          api.get('/budgets/check').catch(() => ({ data: { hasBudget: false } })),
        ]);
        setData(dashRes.data);
        setBudgetStatus(budgetRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 bg-gray-50 flex items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>

        {/* Budget Warning Banner */}
        {budgetStatus?.hasBudget && budgetStatus.exceeded && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <span>
              You've exceeded your monthly budget! Spent{' '}
              <strong>{formatINR(budgetStatus.spent)}</strong> of{' '}
              <strong>{formatINR(budgetStatus.limit)}</strong>.
            </span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Total Balance</p>
            <p className={`text-3xl font-bold ${(data?.totalBalance ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatINR(data?.totalBalance)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Total Income</p>
            <p className="text-3xl font-bold text-green-600">{formatINR(data?.totalIncome)}</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Total Expenses</p>
            <p className="text-3xl font-bold text-red-600">{formatINR(data?.totalExpenses)}</p>
          </div>
        </div>

        {/* Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Avg Daily Spend (30d)</p>
            <p className="text-2xl font-bold text-gray-800">{formatINR(data?.analytics.averageDailySpend)}</p>
            <p className="text-xs text-gray-500 mt-2">Based on your last 30 days of expenses.</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Spent Today</p>
            <p className="text-2xl font-bold text-red-600">{formatINR(data?.analytics.spentToday)}</p>
            <p className="text-xs text-gray-500 mt-2">Today's outgoing amount.</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Expense / Income Ratio</p>
            <p className="text-2xl font-bold text-gray-800">
              {data?.analytics.expenseToIncomeRatio === null ? 'N/A' : `${data?.analytics.expenseToIncomeRatio}%`}
            </p>
            <p className="text-xs text-gray-500 mt-2">Lower is generally healthier over time.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-4">Top Expense Categories (This Month)</h3>
            {(data?.analytics.topExpenseCategories.length ?? 0) === 0 ? (
              <p className="text-sm text-gray-500">No expense data yet this month.</p>
            ) : (
              <div className="space-y-3">
                {data?.analytics.topExpenseCategories.map((item) => (
                  <div key={item.category}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-700 font-medium">{item.category}</span>
                      <span className="text-gray-600">{formatINR(item.amount)} ({item.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-indigo-500"
                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-4">6-Month Expense Trend</h3>
            {(data?.analytics.monthlyExpenseTrend.length ?? 0) === 0 ? (
              <p className="text-sm text-gray-500">No trend data available yet.</p>
            ) : (
              <div className="space-y-3">
                {data?.analytics.monthlyExpenseTrend.map((point) => {
                  const maxAmount = Math.max(...(data?.analytics.monthlyExpenseTrend.map((p) => p.amount) || [0]));
                  const width = maxAmount > 0 ? (point.amount / maxAmount) * 100 : 0;
                  return (
                    <div key={point.month}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-700 font-medium">{point.month}</span>
                        <span className="text-gray-600">{formatINR(point.amount)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="h-2 rounded-full bg-red-400" style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Budget Progress */}
        {budgetStatus?.hasBudget && (
          <div className="mb-8">
            <BudgetCard
              limit={budgetStatus.limit!}
              spent={budgetStatus.spent!}
              remaining={budgetStatus.remaining!}
              exceeded={budgetStatus.exceeded!}
              percentage={budgetStatus.percentage!}
            />
          </div>
        )}

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Transactions</h3>
          {data?.recentTransactions.length === 0 ? (
            <p className="text-gray-500 text-sm">No transactions yet.</p>
          ) : (
            <div className="space-y-3">
              {data?.recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{t.category}</p>
                    <p className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString()} {t.note && `· ${t.note}`}</p>
                  </div>
                  <span className={`font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatINR(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
