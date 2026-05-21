import { useState, useEffect } from 'react';
import { MapPin, Globe, Star, Briefcase, Users, Loader2, Award } from 'lucide-react';
import { motion } from 'motion/react';
import { API_BASE } from '../utils/api';

interface Vendor {
  business_name:   string;
  business_type:   string;
  description:     string;
  experience_yrs:  number;
  languages:       string[];
  service_areas:   string[];
  website:         string;
  guide_name:      string;
  avatar_url?:     string;
}

const TYPE_LABELS: Record<string, { label: string; emoji: string }> = {
  tour_guide: { label: 'Tour Guides',  emoji: '🥾' },
  hotel:      { label: 'Stays',         emoji: '🏨' },
  restaurant: { label: 'Restaurants',   emoji: '🍴' },
  transport:  { label: 'Transport',     emoji: '🚐' },
};

export function PartnersDirectory() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [type,    setType]    = useState<string>('');
  const [area,    setArea]    = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (area) params.set('area', area);
    fetch(`${API_BASE}/vendors/approved?${params}`)
      .then(r => r.ok ? r.json() : { vendors: [] })
      // The API camelCases all keys (business_name → businessName …). This
      // component is written against snake_case, so map each vendor back once
      // here rather than guarding every field in the JSX. Falls back to
      // snake_case so it keeps working regardless of API casing.
      .then(d => setVendors((d.vendors || []).map((v: any): Vendor => ({
        business_name:  v.businessName  ?? v.business_name,
        business_type:  v.businessType  ?? v.business_type,
        description:    v.description,
        experience_yrs: v.experienceYrs ?? v.experience_yrs,
        languages:      v.languages,
        service_areas:  v.serviceAreas  ?? v.service_areas,
        website:        v.website,
        guide_name:     v.guideName     ?? v.guide_name,
        avatar_url:     v.avatarUrl      ?? v.avatar_url,
      }))))
      .finally(() => setLoading(false));
  }, [type, area]);

  const grouped = vendors.reduce((acc: Record<string, Vendor[]>, v) => {
    (acc[v.business_type] = acc[v.business_type] || []).push(v);
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-green-50 px-4 py-1.5 rounded-full mb-4">
          <Award className="w-4 h-4 text-green-600" />
          <span className="font-poppins text-sm font-medium text-green-700">Verified partners</span>
        </div>
        <h1 className="font-poppins text-3xl sm:text-4xl font-semibold text-slate-900 mb-3">
          Bengal Trails Partners
        </h1>
        <p className="font-poppins text-base text-gray-500 max-w-xl mx-auto">
          Hand-picked local guides, hotels, restaurants and transport providers — vetted by our team.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        <button onClick={() => setType('')}
          className={`px-4 py-2 rounded-full font-poppins text-sm font-medium transition-all
            ${type === '' ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
          All
        </button>
        {Object.entries(TYPE_LABELS).map(([k, v]) => (
          <button key={k} onClick={() => setType(k)}
            className={`px-4 py-2 rounded-full font-poppins text-sm font-medium transition-all flex items-center gap-1.5
              ${type === k ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            <span>{v.emoji}</span>{v.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>
      )}

      {/* Empty state */}
      {!loading && vendors.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="font-poppins text-gray-500 mb-4">No partners yet in this category.</p>
          <a href="#/vendor" className="inline-block px-5 py-2.5 bg-green-600 hover:bg-green-700
                                       text-white font-poppins text-sm font-medium rounded-xl transition-colors">
            Become the first partner
          </a>
        </div>
      )}

      {/* Grid by category */}
      {!loading && Object.entries(grouped).map(([cat, items]) => (
        <div key={cat} className="mb-10">
          <h2 className="font-poppins text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span>{TYPE_LABELS[cat]?.emoji}</span>
            {TYPE_LABELS[cat]?.label || cat}
            <span className="font-poppins text-sm font-normal text-gray-400">({items.length})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((v, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  {v.avatar_url ? (
                    <img src={v.avatar_url} alt={v.guide_name}
                      className="w-12 h-12 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                      <span className="font-poppins font-semibold text-purple-700">{v.guide_name?.[0]}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-poppins font-semibold text-slate-900 text-sm truncate">{v.business_name}</h3>
                    <p className="font-poppins text-xs text-gray-400 truncate">by {v.guide_name}</p>
                  </div>
                  <div className="flex items-center gap-0.5 px-2 py-0.5 bg-amber-50 rounded-full shrink-0">
                    <Award className="w-3 h-3 text-amber-600" />
                    <span className="font-poppins text-xs font-medium text-amber-700">{v.experience_yrs}y</span>
                  </div>
                </div>

                {v.description && (
                  <p className="font-poppins text-xs text-gray-500 mb-3 line-clamp-2">{v.description}</p>
                )}

                <div className="space-y-1.5 mb-3">
                  {v.service_areas?.length > 0 && (
                    <div className="flex items-start gap-1.5 text-xs text-gray-500">
                      <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                      <span className="font-poppins truncate">{v.service_areas.slice(0,3).join(', ')}</span>
                    </div>
                  )}
                  {v.languages?.length > 0 && (
                    <div className="flex items-start gap-1.5 text-xs text-gray-500">
                      <Users className="w-3 h-3 mt-0.5 shrink-0" />
                      <span className="font-poppins truncate">{v.languages.join(', ')}</span>
                    </div>
                  )}
                </div>

                {v.website && (
                  <a href={v.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 font-poppins text-xs font-medium text-purple-600 hover:text-purple-700">
                    <Globe className="w-3 h-3" /> Visit website
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      ))}

      {/* CTA */}
      <div className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 text-center">
        <h3 className="font-poppins text-xl font-semibold text-slate-900 mb-2">Are you a tour guide, hotel or restaurant?</h3>
        <p className="font-poppins text-sm text-gray-500 mb-5">Join our verified partner network and reach thousands of travellers.</p>
        <a href="#/vendor"
          className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-poppins text-sm font-medium rounded-xl transition-colors">
          Become a Partner
        </a>
      </div>
    </div>
  );
}
