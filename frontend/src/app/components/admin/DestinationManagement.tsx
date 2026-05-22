import { toast } from 'sonner';
import { authFetch } from '../../utils/api';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, Save, Star, Loader2 } from 'lucide-react';
import { ImageUploader } from '../ImageUploader';
import { motion, AnimatePresence } from 'motion/react';

// Matches the real `destinations` table (keys as the API returns them — the
// backend middleware camelCases columns: image_url → imageUrl, etc.).
interface Destination {
  id: string;
  name: string;
  slug?: string;
  category: string;
  region: string;
  description: string;
  shortDescription?: string;
  imageUrl?: string;
  priceFrom?: number | null;
  bestTimeToVisit?: string;
  duration?: string;
  featured?: boolean;
  status?: string;
  rating?: number;
  reviewCount?: number;
  viewCount?: number;
}

const CATEGORY_OPTIONS = [
  'Heritage', 'Nature', 'Wildlife', 'Hill Station', 'Beach',
  'Pilgrimage', 'Adventure', 'Urban', 'Tea Garden', 'Religious', 'Shopping',
];
const STATUS_OPTIONS = ['published', 'draft', 'archived'];

const emptyForm: Partial<Destination> = {
  name: '', category: 'Heritage', region: '', description: '',
  shortDescription: '', imageUrl: '', priceFrom: undefined,
  bestTimeToVisit: '', duration: '', featured: false, status: 'published',
};

export function DestinationManagement() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(false);   // save in-flight
  const [fetching, setFetching] = useState(true);  // initial list load
  const [formData, setFormData] = useState<Partial<Destination>>(emptyForm);

  // ── Load REAL destinations from the database ────────────────────────────────
  const loadDestinations = async () => {
    setFetching(true);
    try {
      const res = await authFetch('/admin/destinations');
      if (res.ok) {
        const data = await res.json();
        setDestinations(Array.isArray(data.destinations) ? data.destinations : []);
      } else {
        toast.error('Failed to load destinations');
        setDestinations([]);
      }
    } catch (err) {
      console.error('Load destinations error:', err);
      setDestinations([]);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { loadDestinations(); }, []);

  const filteredDestinations = destinations.filter(dest =>
    (dest.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (dest.region || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (dest.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    const confirmed = await new Promise<boolean>((resolve) => {
      toast.warning('Delete this destination?', {
        action: { label: 'Delete', onClick: () => resolve(true) },
        cancel:  { label: 'Cancel', onClick: () => resolve(false) },
        duration: 8000,
        onDismiss:   () => resolve(false),
        onAutoClose: () => resolve(false),
      });
    });
    if (!confirmed) return;

    try {
      const res = await authFetch(`/admin/destinations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDestinations(prev => prev.filter(d => d.id !== id));
        toast.success('Destination deleted');
      } else {
        const j = await res.json().catch(() => ({}));
        toast.error(j.error || 'Failed to delete destination');
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Error deleting destination');
    }
  };

  const handleEdit = (destination: Destination) => {
    setEditingDestination(destination);
    setFormData({ ...destination });
    setIsAddModalOpen(true);
  };

  const handleSave = async () => {
    // Backend requires name, category, region, description.
    if (!formData.name || !formData.category || !formData.region || !formData.description) {
      toast.error('Name, category, region and description are required');
      return;
    }
    setLoading(true);
    try {
      const method = editingDestination ? 'PUT' : 'POST';
      const path = editingDestination
        ? `/admin/destinations/${editingDestination.id}`
        : '/admin/destinations';

      // Map to the snake_case column names the backend reads.
      const payload = {
        name:               formData.name,
        category:           formData.category,
        region:             formData.region,
        description:        formData.description,
        short_description:  formData.shortDescription || null,
        image_url:          formData.imageUrl || null,
        price_from:         formData.priceFrom != null && formData.priceFrom !== ('' as any)
                              ? Number(formData.priceFrom) : null,
        best_time_to_visit: formData.bestTimeToVisit || null,
        duration:           formData.duration || null,
        featured:           !!formData.featured,
        status:             formData.status || 'published',
      };

      const res = await authFetch(path, { method, body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.destination) {
        if (editingDestination) {
          setDestinations(prev => prev.map(d => d.id === editingDestination.id ? data.destination : d));
          toast.success('Destination updated');
        } else {
          setDestinations(prev => [data.destination, ...prev]);
          toast.success('Destination created');
        }
        handleCloseModal();
      } else {
        toast.error(data.error || 'Failed to save destination');
      }
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Error saving destination');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingDestination(null);
    setFormData(emptyForm);
  };

  const fmtPrice = (n?: number | null) =>
    n != null && Number(n) > 0 ? `₹${Number(n).toLocaleString('en-IN')}` : '—';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl mb-1">Destination Management</h2>
          <p className="text-gray-600">Manage all destinations across West Bengal</p>
        </div>
        <button
          onClick={() => { setFormData(emptyForm); setEditingDestination(null); setIsAddModalOpen(true); }}
          className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Destination
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search destinations by name, region, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Destinations</p>
          <p className="text-3xl font-bold text-purple-600">{destinations.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Search Results</p>
          <p className="text-3xl font-bold text-blue-600">{filteredDestinations.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Unique Regions</p>
          <p className="text-3xl font-bold text-green-600">
            {new Set(destinations.map(d => d.region).filter(Boolean)).size}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Featured</p>
          <p className="text-3xl font-bold text-orange-600">
            {destinations.filter(d => d.featured).length}
          </p>
        </div>
      </div>

      {/* Destinations Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {fetching ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          </div>
        ) : destinations.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-1">No destinations in the database yet.</p>
            <p className="text-sm text-gray-400">Use “Add Destination” to create the first one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Destination</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Region</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Price from</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDestinations.map((dest) => (
                  <tr key={dest.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {dest.imageUrl ? (
                          <img src={dest.imageUrl} alt={dest.name} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 text-xs">No img</div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                            {dest.name}
                            {dest.featured && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                          </p>
                          <p className="text-sm text-gray-600 truncate max-w-xs">{dest.shortDescription || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">{dest.category}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{dest.region}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{fmtPrice(dest.priceFrom)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                        dest.status === 'published' ? 'bg-green-100 text-green-700'
                        : dest.status === 'draft' ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-600'
                      }`}>{dest.status || 'published'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(dest)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(dest.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold">
                  {editingDestination ? 'Edit Destination' : 'Add New Destination'}
                </h3>
                <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Name + Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Destination Name *</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., Darjeeling"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                    <select
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                    >
                      {/* Preserve a value that isn't in the preset list */}
                      {formData.category && !CATEGORY_OPTIONS.includes(formData.category) && (
                        <option value={formData.category}>{formData.category}</option>
                      )}
                      {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* Region + Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Region *</label>
                    <input
                      type="text"
                      value={formData.region || ''}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., North Bengal"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price from (₹)</label>
                    <input
                      type="number"
                      value={formData.priceFrom ?? ''}
                      onChange={(e) => setFormData({ ...formData, priceFrom: e.target.value === '' ? undefined : Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., 2500"
                    />
                  </div>
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Short Description</label>
                  <textarea
                    value={formData.shortDescription || ''}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Brief description shown on cards..."
                  />
                </div>

                {/* Full Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Description *</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Detailed description..."
                  />
                </div>

                {/* Duration + Best Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Duration</label>
                    <input
                      type="text"
                      value={formData.duration || ''}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., 2-3 days"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Best Time to Visit</label>
                    <input
                      type="text"
                      value={formData.bestTimeToVisit || ''}
                      onChange={(e) => setFormData({ ...formData, bestTimeToVisit: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., Oct-Mar"
                    />
                  </div>
                </div>

                {/* Status + Featured */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <select
                      value={formData.status || 'published'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white capitalize"
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer select-none px-1 py-2">
                      <input
                        type="checkbox"
                        checked={!!formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm font-semibold text-gray-700">Featured destination</span>
                    </label>
                  </div>
                </div>

                {/* Image */}
                <ImageUploader
                  label="Hero Image"
                  value={formData.imageUrl || ''}
                  onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                  folder="bengal-trails/destinations"
                  helperText="Click to upload from your computer, or paste a URL below."
                />

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleSave}
                    disabled={loading || !formData.name || !formData.category || !formData.region || !formData.description}
                    className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-5 h-5" />
                    {loading ? 'Saving...' : editingDestination ? 'Update' : 'Create'}
                  </button>
                  <button onClick={handleCloseModal} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
