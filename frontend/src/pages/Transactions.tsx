import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/client';
import { formatINR } from '../utils/currency';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  category: string;
  note?: string;
  date: string;
}

interface Category {
  id: string;
  name: string;
}

const emptyForm = {
  amount: '',
  type: 'expense',
  category: '',
  note: '',
  date: new Date().toISOString().split('T')[0],
};

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filterType) params.type = filterType;
      const [txRes, catRes] = await Promise.all([
        api.get('/transactions', { params }),
        api.get('/categories'),
      ]);
      setTransactions(txRes.data.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const normalizedCategory = form.category.trim();

    if (!form.amount || !normalizedCategory || !form.date) {
      setError('Amount, category, and date are required');
      return;
    }
    setSubmitting(true);
    try {
      const payload = { ...form, category: normalizedCategory };
      if (editId) {
        await api.put(`/transactions/${editId}`, payload);
      } else {
        await api.post('/transactions', payload);
      }

      // Keep the suggestions list in sync immediately after user adds a new category.
      setCategories((prev) => {
        if (prev.some((c) => c.name.toLowerCase() === normalizedCategory.toLowerCase())) {
          return prev;
        }

        return [...prev, { id: `local-${normalizedCategory.toLowerCase()}`, name: normalizedCategory }]
          .sort((a, b) => a.name.localeCompare(b.name));
      });

      setForm(emptyForm);
      setEditId(null);
      fetchData();
    } catch {
      setError('Failed to save transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (t: Transaction) => {
    setEditId(t.id);
    setForm({
      amount: t.amount.toString(),
      type: t.type,
      category: t.category,
      note: t.note || '',
      date: new Date(t.date).toISOString().split('T')[0],
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this transaction?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      fetchData();
    } catch {
      setError('Failed to delete transaction');
    }
  };

  const handleExportCSV = () => {
    const token = localStorage.getItem('token');
    const url = `/api/export/transactions`;
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'transactions.csv');
    // Add auth header via fetch and create blob URL
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        link.href = blobUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      });
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Transactions</h2>
          <button
            onClick={handleExportCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
          >
            ⬇️ Export CSV
          </button>
        </div>

        {/* Add / Edit Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">
            {editId ? 'Edit Transaction' : 'Add Transaction'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Amount (₹)</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                min="0.01"
                step="0.01"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Category</label>
              <input
                type="text"
                list="transaction-categories"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Type or select category"
              >
              </input>
              <datalist id="transaction-categories">
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Note (optional)</label>
              <input
                type="text"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Optional note"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm disabled:opacity-60"
              >
                {submitting ? 'Saving...' : editId ? 'Update' : 'Add'}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={() => { setEditId(null); setForm(emptyForm); }}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </div>

        {/* Filter */}
        <div className="flex gap-3 mb-4">
          {['', 'income', 'expense'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterType === type
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {type === '' ? 'All' : type === 'income' ? 'Income' : 'Expenses'}
            </button>
          ))}
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <p className="text-gray-500 p-6 text-sm">Loading...</p>
          ) : transactions.length === 0 ? (
            <p className="text-gray-500 p-6 text-sm">No transactions found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-600 font-medium">Date</th>
                  <th className="text-left px-6 py-3 text-gray-600 font-medium">Category</th>
                  <th className="text-left px-6 py-3 text-gray-600 font-medium">Type</th>
                  <th className="text-left px-6 py-3 text-gray-600 font-medium">Note</th>
                  <th className="text-right px-6 py-3 text-gray-600 font-medium">Amount</th>
                  <th className="text-right px-6 py-3 text-gray-600 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-600">
                      {new Date(t.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 font-medium text-gray-800">{t.category}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        t.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-500">{t.note || '-'}</td>
                    <td className={`px-6 py-3 text-right font-semibold ${
                      t.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {t.type === 'income' ? '+' : '-'}{formatINR(t.amount)}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => handleEdit(t)}
                        className="text-indigo-600 hover:text-indigo-800 mr-3 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default Transactions;
