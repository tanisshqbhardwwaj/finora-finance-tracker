import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/client';

interface Category {
  id: string;
  name: string;
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this category from your list?')) return;
    setError('');
    setSuccess('');
    setDeletingId(id);
    try {
      await api.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setSuccess('Category removed.');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to remove category');
    } finally {
      setDeletingId(null);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!newName.trim()) {
      setError('Category name is required');
      return;
    }
    try {
      await api.post('/categories', { name: newName.trim() });
      setNewName('');
      setSuccess('Category added!');
      fetchCategories();
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Category already exists or failed to add');
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Categories</h2>

        <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-lg mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Add Custom Category</h3>
          <form onSubmit={handleAdd} className="flex gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Category name"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
            >
              Add
            </button>
          </form>
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
          {success && <p className="text-green-600 text-sm mt-2">{success}</p>}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-lg">
          <h3 className="font-semibold text-gray-800 mb-4">Your Categories</h3>
          {loading ? (
            <p className="text-gray-500 text-sm">Loading...</p>
          ) : categories.length === 0 ? (
            <p className="text-gray-500 text-sm">No categories yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleDelete(c.id)}
                  disabled={deletingId === c.id}
                  className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium hover:bg-red-100 hover:text-red-700 transition-colors disabled:opacity-60"
                  title="Click to remove"
                >
                  {deletingId === c.id ? 'Removing...' : `${c.name} ×`}
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Categories;
