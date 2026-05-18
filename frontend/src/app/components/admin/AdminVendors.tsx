import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle, Clock, MapPin, Globe, Star } from 'lucide-react';
import { authFetch } from '../../utils/api';
import { toast } from 'sonner';

interface Application {
  id: number; business_name: string; business_type: string; description: string;
  experience_yrs: number; languages: string[]; service_areas: string[];
  phone: string; website: string; applicant_name: string; applicant_email: string;
  status: string; created_at: string;
}

const TYPE_LABELS: Record<string,string> = {
  tour_guide: 'Tour Guide', hotel: 'Hotel/Stay', restaurant: 'Restaurant', transport: 'Transport',
};

export function AdminVendors() {
  const [rows,    setRows]    = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState<'pending'|'approved'|'rejected'|'all'>('pending');
  const [notes,   setNotes]   = useState<Record<number,string>>({});

  useEffect(() => {
    setLoading(true);
    authFetch('/vendors/all' + (filter !== 'all' ? `?status=${filter}` : ''))
      .then(r => r.ok ? r.json() : { applications: [] })
      .then(d => setRows(d.applications || []))
      .finally(() => setLoading(false));
  }, [filter]);

  const review = async (id: number, status: 'approved'|'rejected') => {
    const res = await authFetch(`/vendors/${id}/review`, {
      method: 'PUT',
      body: JSON.stringify({ status, adminNotes: notes[id] || '' }),
    });
    if (res.ok) {
      toast.success(`Application ${status}`);
      setRows(r => r.filter(a => a.id !== id));
    } else {
      toast.error('Failed to update application');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-poppins text-lg font-semibold text-slate-900">
          Partner Applications <span className="ml-2 text-sm text-gray-400 font-normal">({rows.length})</span>
        </h2>
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {(['pending','approved','rejected','all'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg font-poppins text-xs font-medium capitalize transition-all
                ${filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-gray-500 hover:text-slate-700'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-purple-500" /></div>
      ) : rows.length === 0 ? (
        <div className="text-center py-12 text-gray-400 font-poppins text-sm">
          No {filter === 'all' ? '' : filter} applications.
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map(a => (
            <div key={a.id} className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                  <Star className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-poppins font-semibold text-slate-900 text-sm">{a.business_name}</h3>
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full font-poppins text-xs">
                      {TYPE_LABELS[a.business_type] || a.business_type}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-poppins font-medium
                      ${a.status==='pending' ? 'bg-amber-100 text-amber-700'
                      : a.status==='approved' ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'}`}>
                      {a.status}
                    </span>
                  </div>
                  <p className="font-poppins text-xs text-gray-500 mb-2">
                    Applied by <strong>{a.applicant_name}</strong> ({a.applicant_email}) · {a.experience_yrs} yrs experience
                  </p>
                  {a.description && <p className="font-poppins text-xs text-gray-500 mb-2 italic">"{a.description}"</p>}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {a.service_areas?.map(area => (
                      <span key={area} className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full font-poppins text-xs text-gray-600">
                        <MapPin className="w-2.5 h-2.5" />{area}
                      </span>
                    ))}
                  </div>

                  {a.status === 'pending' && (
                    <div className="space-y-2">
                      <textarea
                        value={notes[a.id] || ''}
                        onChange={e => setNotes(n => ({ ...n, [a.id]: e.target.value }))}
                        placeholder="Admin notes (optional)…"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl font-poppins text-xs focus:outline-none focus:border-purple-400 resize-none"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => review(a.id, 'approved')}
                          className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700
                                     font-poppins text-xs font-medium text-white rounded-xl transition-colors">
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button onClick={() => review(a.id, 'rejected')}
                          className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600
                                     font-poppins text-xs font-medium text-white rounded-xl transition-colors">
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
