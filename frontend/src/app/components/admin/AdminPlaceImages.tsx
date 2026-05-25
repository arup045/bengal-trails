import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { authFetch, uploadImage } from '../../utils/api';
import { DISTRICTS, placesForDistrict } from '../../data/districts';
import { getDistrictContent } from '../../data/districtContent';

interface SectionGroup { key: string; label: string; items: string[]; }
interface ItemMeta { image?: string; type?: string; rating?: number; hours?: string; }

export function AdminPlaceImages() {
  const [districtSlug, setDistrictSlug] = useState(DISTRICTS[0]?.slug || 'kolkata');
  const [items, setItems] = useState<Record<string, ItemMeta>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const groups = useMemo<SectionGroup[]>(() => {
    const content = getDistrictContent(districtSlug);
    const places = placesForDistrict(districtSlug).map((p) => p.title);
    return [
      { key: 'places',    label: 'Top Places (place pages)', items: places },
      { key: 'landmarks', label: 'Landmarks',                items: content?.landmarks || [] },
      { key: 'parks',     label: 'Parks, Stadiums & Arenas', items: content?.parks || [] },
      { key: 'activities',label: 'Activities & Experiences', items: content?.activities || [] },
      { key: 'foods',     label: 'Iconic Local & Street Food', items: content?.foods || [] },
      { key: 'foodZones', label: 'Street Food Zones & Hubs', items: content?.foodZones || [] },
      { key: 'stays',     label: 'Hotels & Restaurants',     items: content?.stays || [] },
    ].filter((g) => g.items.length > 0);
  }, [districtSlug]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`/admin/place-images/${districtSlug}`);
      const data = res.ok ? await res.json() : { items: {} };
      setItems(data.items || {});
    } catch { setItems({}); } finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [districtSlug]);

  const onPick = (name: string, section: string) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(name);
    try {
      const { url } = await uploadImage(file);
      const res = await authFetch('/admin/place-images', { method: 'POST', body: JSON.stringify({ districtSlug, itemName: name, section, imageUrl: url }) });
      if (!res.ok) throw new Error();
      setItems((prev) => ({ ...prev, [name]: { ...(prev[name] || {}), image: url } }));
      toast.success(`Image set for ${name}`);
    } catch { toast.error('Upload failed. Try again.'); }
    finally { setUploading(null); if (fileInputs.current[name]) fileInputs.current[name]!.value = ''; }
  };

  // Save a single text/number field on blur (only if it actually changed).
  const saveField = async (name: string, section: string, key: 'itemType' | 'rating' | 'hours', raw: string) => {
    const current = items[name] || {};
    const value = raw.trim();
    const existing = key === 'itemType' ? (current.type || '') : key === 'hours' ? (current.hours || '') : (current.rating != null ? String(current.rating) : '');
    if (value === existing) return;
    try {
      const res = await authFetch('/admin/place-images', { method: 'POST', body: JSON.stringify({ districtSlug, itemName: name, section, [key]: value }) });
      if (!res.ok) throw new Error();
      setItems((prev) => {
        const next = { ...(prev[name] || {}) } as ItemMeta;
        if (key === 'itemType') next.type = value || undefined;
        else if (key === 'hours') next.hours = value || undefined;
        else next.rating = value === '' ? undefined : Number(value);
        return { ...prev, [name]: next };
      });
    } catch { toast.error('Could not save'); }
  };

  const clearItem = async (name: string) => {
    try {
      const res = await authFetch('/admin/place-images', { method: 'DELETE', body: JSON.stringify({ districtSlug, itemName: name }) });
      if (!res.ok) throw new Error();
      setItems((prev) => { const n = { ...prev }; delete n[name]; return n; });
      toast.success('Cleared');
    } catch { toast.error('Could not clear'); }
  };

  const totalItems = groups.reduce((s, g) => s + g.items.length, 0);
  const withImages = groups.reduce((s, g) => s + g.items.filter((i) => items[i]?.image).length, 0);

  return (
    <div className="p-1">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">District Card Details</h2>
          <p className="text-gray-600 text-sm">Add a real photo, type, rating and opening hours for each item. Cards show a placeholder until set — never fake values.</p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">District</label>
          <select value={districtSlug} onChange={(e) => setDistrictSlug(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 min-w-[200px]">
            {DISTRICTS.map((d) => <option key={d.slug} value={d.slug}>{d.name}</option>)}
          </select>
        </div>
      </div>

      <div className="mb-6 inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-lg text-sm font-medium">
        <ImageIcon className="w-4 h-4" /> {withImages} / {totalItems} items have photos
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-purple-600 animate-spin" /></div>
      ) : (
        <div className="space-y-8">
          {groups.map((g) => (
            <div key={g.key}>
              <h3 className="font-semibold text-gray-900 mb-3">{g.label} <span className="text-gray-400 font-normal">({g.items.length})</span></h3>
              <div className="space-y-3">
                {g.items.map((name) => {
                  const m = items[name] || {};
                  const busy = uploading === name;
                  return (
                    <div key={name} className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white border border-gray-200 rounded-xl p-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
                        {m.image ? <img src={m.image} alt={name} className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-gray-300" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate mb-2" title={name}>{name}</p>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                          <label className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-700 cursor-pointer border border-purple-200 rounded-lg py-1.5">
                            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                            {m.image ? 'Replace' : 'Photo'}
                            <input ref={(el) => { fileInputs.current[name] = el; }} type="file" accept="image/*" className="hidden" disabled={busy} onChange={onPick(name, g.key)} />
                          </label>
                          <input defaultValue={m.type || ''} placeholder="Type (e.g. Stadium)" onBlur={(e) => saveField(name, g.key, 'itemType', e.target.value)}
                            className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-purple-400 min-w-0" />
                          <input defaultValue={m.rating != null ? String(m.rating) : ''} type="number" min={0} max={5} step={0.1} placeholder="Rating"
                            onBlur={(e) => saveField(name, g.key, 'rating', e.target.value)}
                            className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-purple-400 min-w-0" />
                          <input defaultValue={m.hours || ''} placeholder="Hours (e.g. Closes 8 PM)" onBlur={(e) => saveField(name, g.key, 'hours', e.target.value)}
                            className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-purple-400 min-w-0" />
                        </div>
                      </div>
                      {(m.image || m.type || m.rating != null || m.hours) && (
                        <button onClick={() => clearItem(name)} title="Clear all details" className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-600 shrink-0 self-start sm:self-center">
                          <Trash2 className="w-3.5 h-3.5" /> Clear
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
