import { useState, useEffect } from 'react';
import { Loader2, Mail, Calendar, Users, MapPin, CheckCircle, Clock } from 'lucide-react';
import { authFetch } from '../../utils/api';

interface Enquiry {
  id: number; destination_name: string; check_in: string; check_out: string;
  guests: number; name: string; email: string; phone: string; message: string;
  status: string; created_at: string;
}

export function AdminEnquiries() {
  const [rows,    setRows]    = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState<'all'|'new'|'contacted'>('all');

  useEffect(() => {
    setLoading(true);
    authFetch('/admin/enquiries' + (filter !== 'all' ? `?status=${filter}` : ''))
      .then(r => r.ok ? r.json() : { enquiries: [] })
      .then(d => setRows(d.enquiries || []))
      .finally(() => setLoading(false));
  }, [filter]);

  const markContacted = async (id: number) => {
    await authFetch(`/admin/enquiries/${id}/status`, {
      method: 'PUT', body: JSON.stringify({ status: 'contacted' }),
    });
    setRows(r => r.map(e => e.id === id ? { ...e, status: 'contacted' } : e));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-poppins text-lg font-semibold text-slate-900">
          Booking Enquiries <span className="ml-2 text-sm text-gray-400 font-normal">({rows.length})</span>
        </h2>
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {(['all','new','contacted'] as const).map(f => (
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
        <div className="text-center py-12 text-gray-400 font-poppins text-sm">No enquiries yet.</div>
      ) : (
        <div className="space-y-3">
          {rows.map(e => (
            <div key={e.id} className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-poppins font-medium
                      ${e.status === 'new' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                      {e.status}
                    </span>
                    <span className="font-poppins text-xs text-gray-400">
                      {new Date(e.created_at).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <h3 className="font-poppins font-semibold text-slate-900 text-sm mb-2">
                    {e.name} — {e.destination_name}
                  </h3>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 font-poppins">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{e.email}</span>
                    {e.phone && <span className="flex items-center gap-1">📞 {e.phone}</span>}
                    {e.check_in && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{e.check_in} → {e.check_out}</span>}
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{e.guests} guests</span>
                  </div>
                  {e.message && (
                    <p className="mt-2 font-poppins text-xs text-gray-500 italic">"{e.message}"</p>
                  )}
                </div>
                {e.status === 'new' && (
                  <button onClick={() => markContacted(e.id)}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-600 hover:bg-green-700
                               font-poppins text-xs font-medium text-white transition-colors">
                    <CheckCircle className="w-3.5 h-3.5" /> Mark contacted
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
