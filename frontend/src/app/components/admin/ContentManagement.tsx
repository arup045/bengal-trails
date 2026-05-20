import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { API_BASE, getToken } from '../../utils/api';
import { invalidateSiteContentCache } from '../../utils/useSiteContent';
import { toast } from 'sonner';
import {
  Image as ImageIcon, Type, Bell, Star, Utensils, Upload, Save,
  Eye, EyeOff, Plus, Trash2, ChevronUp, ChevronDown, Loader2,
  Check, RotateCcw,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface HeroContent {
  title: string;
  subtitle: string;
  backgroundImage: string;
  ctaText: string;
  ctaLink: string;
  badgeText: string;
}

interface AnnouncementContent {
  enabled: boolean;
  text: string;
  link: string;
  bgColor: string;
}

interface FeaturedSlug {
  slug: string;
  name: string;
  image: string;
  region: string;
}

interface FoodSection {
  title: string;
  subtitle: string;
  featured: string[];
}

type TabId = 'hero' | 'announcement' | 'featured' | 'food';

// ─── ImageUploader ─────────────────────────────────────────────────────────────
function ImageUploadField({
  label, value, onChange,
}: { label: string; value: string; onChange: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(`${API_BASE}/uploads/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken() || ''}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      onChange(data.url);
      toast.success('Image uploaded successfully');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1 font-poppins">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Image URL or upload below"
          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 font-poppins"
        />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-poppins disabled:opacity-60"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); e.target.value = ''; }}
        />
      </div>
      {value && (
        <div className="mt-2 h-24 w-full rounded-lg overflow-hidden border border-gray-200">
          <img src={value} alt="preview" className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function ContentManagement() {
  const [activeTab, setActiveTab] = useState<TabId>('hero');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Section states
  const [hero, setHero] = useState<HeroContent>({
    title: 'Discover the Heart\nof West Bengal',
    subtitle: '232+ destinations, 100 festivals, authentic Bengali food and curated journeys — all in one place, always free.',
    backgroundImage: 'https://i1-c.pinimg.com/1200x/0b/e5/5f/0be55f42f18168dfc304f2985cf03f94.jpg',
    ctaText: 'Explore Now',
    ctaLink: '#/explore',
    badgeText: 'West Bengal, India',
  });

  const [announcement, setAnnouncement] = useState<AnnouncementContent>({
    enabled: false,
    text: '🎉 Special Offer: 20% OFF on all weekend packages!',
    link: '#/explore',
    bgColor: '#7c3aed',
  });

  const [featured, setFeatured] = useState<FeaturedSlug[]>([]);
  const [featuredInput, setFeaturedInput] = useState({ slug: '', name: '', image: '', region: '' });

  const [food, setFood] = useState<FoodSection>({
    title: 'Taste of Bengal',
    subtitle: 'Authentic flavours from every corner of West Bengal',
    featured: [],
  });
  const [newDish, setNewDish] = useState('');

  // ── Load existing settings ──
  useEffect(() => {
    const token = getToken();
    fetch(`${API_BASE}/admin/settings`, {
      headers: { Authorization: `Bearer ${token || ''}` },
    })
      .then(r => r.json())
      .then(({ settings }) => {
        if (settings.hero)                  setHero(s => ({ ...s, ...settings.hero }));
        if (settings.announcement)          setAnnouncement(s => ({ ...s, ...settings.announcement }));
        if (settings.featured_destinations) setFeatured(settings.featured_destinations);
        if (settings.food_section)          setFood(s => ({ ...s, ...settings.food_section }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── Save current tab ──
  const handleSave = async () => {
    setSaving(true);
    const token = getToken();
    const payload: Record<string, any> = {};

    if (activeTab === 'hero')         payload.hero = hero;
    if (activeTab === 'announcement') payload.announcement = announcement;
    if (activeTab === 'featured')     payload.featured_destinations = featured;
    if (activeTab === 'food')         payload.food_section = food;

    try {
      const res = await fetch(`${API_BASE}/admin/settings`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token || ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Save failed');
      invalidateSiteContentCache();
      toast.success('Content saved! Changes are now live on the website.');
    } catch (err: any) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const tabs: { id: TabId; label: string; icon: any }[] = [
    { id: 'hero',         label: 'Hero Banner',          icon: ImageIcon  },
    { id: 'announcement', label: 'Announcement Bar',     icon: Bell       },
    { id: 'featured',     label: 'Featured Destinations', icon: Star      },
    { id: 'food',         label: 'Food Section',         icon: Utensils   },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="font-poppins">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white font-poppins">Content Management</h2>
          <p className="text-sm text-gray-400 mt-0.5">Edit website content — changes go live instantly</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60 font-poppins"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all font-poppins ${
                activeTab === t.id
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-[#1a1a1a] text-gray-400 hover:text-white hover:bg-[#252525] border border-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Panel content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="bg-[#1a1a1a] rounded-xl border border-gray-700 p-6"
        >

          {/* ── HERO BANNER ── */}
          {activeTab === 'hero' && (
            <div className="space-y-5">
              <SectionTitle icon={ImageIcon} title="Hero Banner" desc="The main banner shown on the homepage" />

              <div className="grid md:grid-cols-2 gap-5">
                <Field label="Badge Text" value={hero.badgeText} onChange={v => setHero(s => ({ ...s, badgeText: v }))} placeholder="West Bengal, India" />
                <Field label="CTA Button Text" value={hero.ctaText} onChange={v => setHero(s => ({ ...s, ctaText: v }))} placeholder="Explore Now" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1 font-poppins">Headline</label>
                <textarea
                  value={hero.title}
                  onChange={e => setHero(s => ({ ...s, title: e.target.value }))}
                  rows={2}
                  placeholder="Discover the Heart&#10;of West Bengal"
                  className="w-full px-3 py-2 text-sm border border-gray-600 bg-[#111] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-100 font-poppins resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">Use a new line for the second line of the headline</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1 font-poppins">Subheading</label>
                <textarea
                  value={hero.subtitle}
                  onChange={e => setHero(s => ({ ...s, subtitle: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-600 bg-[#111] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-100 font-poppins resize-none"
                />
              </div>

              <Field label="CTA Button Link" value={hero.ctaLink} onChange={v => setHero(s => ({ ...s, ctaLink: v }))} placeholder="#/explore" />

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1 font-poppins">Background Image</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={hero.backgroundImage}
                    onChange={e => setHero(s => ({ ...s, backgroundImage: e.target.value }))}
                    placeholder="Paste image URL or upload"
                    className="flex-1 px-3 py-2 text-sm border border-gray-600 bg-[#111] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-100 font-poppins"
                  />
                  <AdminUploadButton onUpload={url => setHero(s => ({ ...s, backgroundImage: url }))} />
                </div>
                {hero.backgroundImage && (
                  <div className="mt-2 h-28 rounded-lg overflow-hidden border border-gray-700">
                    <img src={hero.backgroundImage} alt="Hero preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── ANNOUNCEMENT BAR ── */}
          {activeTab === 'announcement' && (
            <div className="space-y-5">
              <SectionTitle icon={Bell} title="Announcement Bar" desc="Top-of-page announcement strip" />

              <div className="flex items-center justify-between p-4 bg-[#111] rounded-lg border border-gray-700">
                <div>
                  <p className="text-sm font-medium text-gray-200 font-poppins">Enable Announcement</p>
                  <p className="text-xs text-gray-500 mt-0.5">Show the announcement bar on all pages</p>
                </div>
                <button
                  onClick={() => setAnnouncement(s => ({ ...s, enabled: !s.enabled }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    announcement.enabled ? 'bg-purple-600' : 'bg-gray-600'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${announcement.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <AnimatePresence>
                {announcement.enabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1 font-poppins">Announcement Text</label>
                      <input
                        type="text"
                        value={announcement.text}
                        onChange={e => setAnnouncement(s => ({ ...s, text: e.target.value }))}
                        placeholder="🎉 Special Offer: 20% OFF on all weekend packages!"
                        className="w-full px-3 py-2 text-sm border border-gray-600 bg-[#111] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-100 font-poppins"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1 font-poppins">Link URL</label>
                        <input
                          type="text"
                          value={announcement.link}
                          onChange={e => setAnnouncement(s => ({ ...s, link: e.target.value }))}
                          placeholder="#/explore"
                          className="w-full px-3 py-2 text-sm border border-gray-600 bg-[#111] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-100 font-poppins"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1 font-poppins">Background Color</label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="color"
                            value={announcement.bgColor}
                            onChange={e => setAnnouncement(s => ({ ...s, bgColor: e.target.value }))}
                            className="h-10 w-14 rounded border border-gray-600 bg-transparent cursor-pointer"
                          />
                          <input
                            type="text"
                            value={announcement.bgColor}
                            onChange={e => setAnnouncement(s => ({ ...s, bgColor: e.target.value }))}
                            className="flex-1 px-3 py-2 text-sm border border-gray-600 bg-[#111] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-100 font-poppins"
                          />
                        </div>
                      </div>
                    </div>
                    {/* Live preview */}
                    <div
                      className="rounded-lg px-4 py-2.5 text-center text-sm font-medium text-white font-poppins"
                      style={{ backgroundColor: announcement.bgColor }}
                    >
                      {announcement.text || 'Announcement preview'}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* ── FEATURED DESTINATIONS ── */}
          {activeTab === 'featured' && (
            <div className="space-y-5">
              <SectionTitle icon={Star} title="Featured Destinations" desc="Destinations highlighted on the homepage (shown first in grids)" />

              {/* Add new */}
              <div className="p-4 bg-[#111] rounded-lg border border-gray-700 space-y-3">
                <p className="text-sm font-medium text-gray-300 font-poppins">Add Destination</p>
                <div className="grid md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={featuredInput.slug}
                    onChange={e => setFeaturedInput(s => ({ ...s, slug: e.target.value }))}
                    placeholder="Slug (e.g. darjeeling)"
                    className="px-3 py-2 text-sm border border-gray-600 bg-[#1a1a1a] rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 font-poppins"
                  />
                  <input
                    type="text"
                    value={featuredInput.name}
                    onChange={e => setFeaturedInput(s => ({ ...s, name: e.target.value }))}
                    placeholder="Display Name"
                    className="px-3 py-2 text-sm border border-gray-600 bg-[#1a1a1a] rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 font-poppins"
                  />
                  <input
                    type="text"
                    value={featuredInput.region}
                    onChange={e => setFeaturedInput(s => ({ ...s, region: e.target.value }))}
                    placeholder="Region"
                    className="px-3 py-2 text-sm border border-gray-600 bg-[#1a1a1a] rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 font-poppins"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={featuredInput.image}
                      onChange={e => setFeaturedInput(s => ({ ...s, image: e.target.value }))}
                      placeholder="Image URL"
                      className="flex-1 px-3 py-2 text-sm border border-gray-600 bg-[#1a1a1a] rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 font-poppins"
                    />
                    <AdminUploadButton onUpload={url => setFeaturedInput(s => ({ ...s, image: url }))} />
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!featuredInput.slug || !featuredInput.name) {
                      toast.error('Slug and name are required');
                      return;
                    }
                    setFeatured(prev => [...prev, { ...featuredInput }]);
                    setFeaturedInput({ slug: '', name: '', image: '', region: '' });
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-poppins hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>

              {/* List */}
              <div className="space-y-2">
                {featured.length === 0 && (
                  <p className="text-center text-gray-500 py-8 text-sm font-poppins">No featured destinations yet. Add some above.</p>
                )}
                {featured.map((dest, i) => (
                  <div key={dest.slug + i} className="flex items-center gap-3 p-3 bg-[#111] rounded-lg border border-gray-700">
                    {dest.image && (
                      <img src={dest.image} alt={dest.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-200 font-poppins truncate">{dest.name}</p>
                      <p className="text-xs text-gray-500 font-poppins">{dest.slug} · {dest.region}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setFeatured(prev => { const a = [...prev]; [a[i-1], a[i]] = [a[i], a[i-1]]; return a; })}
                        disabled={i === 0}
                        className="p-1.5 rounded hover:bg-gray-700 disabled:opacity-30 text-gray-400"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setFeatured(prev => { const a = [...prev]; [a[i], a[i+1]] = [a[i+1], a[i]]; return a; })}
                        disabled={i === featured.length - 1}
                        className="p-1.5 rounded hover:bg-gray-700 disabled:opacity-30 text-gray-400"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setFeatured(prev => prev.filter((_, idx) => idx !== i))}
                        className="p-1.5 rounded hover:bg-red-900/50 text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── FOOD SECTION ── */}
          {activeTab === 'food' && (
            <div className="space-y-5">
              <SectionTitle icon={Utensils} title="Food Section" desc="Featured dishes shown on the food guide and homepage" />

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1 font-poppins">Section Title</label>
                  <input
                    type="text"
                    value={food.title}
                    onChange={e => setFood(s => ({ ...s, title: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-600 bg-[#111] rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 font-poppins"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1 font-poppins">Section Subtitle</label>
                  <input
                    type="text"
                    value={food.subtitle}
                    onChange={e => setFood(s => ({ ...s, subtitle: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-600 bg-[#111] rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 font-poppins"
                  />
                </div>
              </div>

              <div className="p-4 bg-[#111] rounded-lg border border-gray-700">
                <p className="text-sm font-medium text-gray-300 mb-3 font-poppins">Featured Dish Slugs</p>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newDish}
                    onChange={e => setNewDish(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newDish.trim()) {
                        setFood(s => ({ ...s, featured: [...s.featured, newDish.trim()] }));
                        setNewDish('');
                      }
                    }}
                    placeholder="Dish slug (e.g. macher-jhol)"
                    className="flex-1 px-3 py-2 text-sm border border-gray-600 bg-[#1a1a1a] rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 font-poppins"
                  />
                  <button
                    onClick={() => {
                      if (newDish.trim()) {
                        setFood(s => ({ ...s, featured: [...s.featured, newDish.trim()] }));
                        setNewDish('');
                      }
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-poppins hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {food.featured.map((dish, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-900/40 text-purple-300 rounded-full text-sm font-poppins border border-purple-700/30"
                    >
                      {dish}
                      <button
                        onClick={() => setFood(s => ({ ...s, featured: s.featured.filter((_, idx) => idx !== i) }))}
                        className="text-purple-400 hover:text-red-400 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {food.featured.length === 0 && (
                    <p className="text-xs text-gray-500 font-poppins">No featured dishes. Add slugs above.</p>
                  )}
                </div>
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* Sticky save footer */}
      <div className="mt-6 p-4 bg-[#111] rounded-xl border border-gray-700 flex items-center justify-between">
        <p className="text-sm text-gray-400 font-poppins">
          Saving updates the live website immediately for all visitors.
        </p>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium text-sm hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg disabled:opacity-60 font-poppins"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {saving ? 'Saving…' : 'Save & Publish'}
        </button>
      </div>
    </div>
  );
}

// ─── Shared sub-components ─────────────────────────────────────────────────────

function SectionTitle({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 pb-4 border-b border-gray-700">
      <div className="w-9 h-9 rounded-lg bg-purple-900/40 border border-purple-700/30 grid place-items-center shrink-0">
        <Icon className="w-4 h-4 text-purple-400" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-white font-poppins">{title}</h3>
        <p className="text-sm text-gray-400 font-poppins">{desc}</p>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1 font-poppins">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border border-gray-600 bg-[#111] rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 font-poppins"
      />
    </div>
  );
}

function AdminUploadButton({ onUpload }: { onUpload: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(`${API_BASE}/uploads/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken() || ''}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      onUpload(data.url);
      toast.success('Image uploaded!');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-sm font-poppins transition-colors disabled:opacity-60 shrink-0"
      >
        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); e.target.value = ''; }}
      />
    </>
  );
}
