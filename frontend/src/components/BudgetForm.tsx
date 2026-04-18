import { useState } from 'react';
import api from '../api/client';

interface BudgetFormProps {
  onSuccess: () => void;
  currentLimit?: number;
}

const BudgetForm = ({ onSuccess, currentLimit }: BudgetFormProps) => {
  const [limit, setLimit] = useState(currentLimit?.toString() || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!limit || isNaN(parseFloat(limit)) || parseFloat(limit) <= 0) {
      setError('Please enter a valid budget amount');
      return;
    }

    setLoading(true);
    try {
      await api.post('/budgets', { limit: parseFloat(limit) });
      onSuccess();
    } catch {
      setError('Failed to set budget. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Monthly Budget Limit (₹)
        </label>
        <input
          type="number"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          placeholder="e.g. 2000"
          min="1"
          step="0.01"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
      >
        {loading ? 'Saving...' : 'Set Budget'}
      </button>
    </form>
  );
};

export default BudgetForm;
