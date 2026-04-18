import { useEffect, useState, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import BudgetCard from '../components/BudgetCard';
import BudgetForm from '../components/BudgetForm';
import api from '../api/client';

interface BudgetStatus {
  hasBudget: boolean;
  limit?: number;
  spent?: number;
  remaining?: number;
  exceeded?: boolean;
  percentage?: number;
}

const Budget = () => {
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState('');

  const fetchBudget = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/budgets/check');
      setBudgetStatus(data);
      setShowForm(!data.hasBudget);
    } catch {
      setBudgetStatus({ hasBudget: false });
      setShowForm(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBudget();
  }, [fetchBudget]);

  const handleSuccess = async () => {
    setSuccess('Budget saved successfully!');
    setShowForm(false);
    await fetchBudget();
    setTimeout(() => setSuccess(''), 3000);
  };

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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Budget Management</h2>
          {budgetStatus?.hasBudget && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
            >
              Update Budget
            </button>
          )}
        </div>

        {success && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded-lg text-sm">
            ✅ {success}
          </div>
        )}

        {budgetStatus?.hasBudget && (
          <div className="mb-6">
            <BudgetCard
              limit={budgetStatus.limit!}
              spent={budgetStatus.spent!}
              remaining={budgetStatus.remaining!}
              exceeded={budgetStatus.exceeded!}
              percentage={budgetStatus.percentage!}
            />
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-md">
            <h3 className="font-semibold text-gray-800 mb-4">
              {budgetStatus?.hasBudget ? 'Update Monthly Budget' : 'Set Monthly Budget'}
            </h3>
            <BudgetForm
              onSuccess={handleSuccess}
              currentLimit={budgetStatus?.limit}
            />
            {budgetStatus?.hasBudget && (
              <button
                onClick={() => setShowForm(false)}
                className="mt-3 text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            )}
          </div>
        )}

        {!budgetStatus?.hasBudget && !showForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center max-w-md">
            <p className="text-gray-500 mb-4">No budget set for this month.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Set Budget
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Budget;
