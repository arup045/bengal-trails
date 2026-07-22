import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Loader2, Upload, MapPin, Globe, Phone, Briefcase, Star, ChevronRight } from 'lucide-react';
import { authFetch } from '../utils/api';
import { toast } from 'sonner';

const TYPES = [
  { value: 'tour_guide',  label: 'Tour Guide',     icon: MapPin,     desc: 'Lead trips & walking tours' },
  { value: 'hotel',       label: 'Hotel / Stay',   icon: Briefcase,  desc: 'Accommodation & homestays' },
  { value: 'restaurant',  label: 'Restaurant',     icon: Star,       desc: 'Food & dining experiences' },
  { value: 'transport',   label: 'Transport',      icon: Globe,      desc: 'Cars, boats & travel services' },
];

const AREAS = ['Darjeeling','Kalimpong','Siliguri','Kolkata','Sundarbans','Bishnupur','Digha','Murshidabad','Shantiniketan','Dooars','Cooch Behar','Purulia'];
const LANGS = ['Bengali','English','Hindi','Nepali','Santali','Odia'];

type Step = 'type' | 'details' | 'review' | 'success';

export function VendorOnboarding() {
  const [step, setStep]     = useState<Step>('type');
  const [loading, setLoading] = useState(false);
  const [form, setForm]     = useState({
    businessType:  '',
    businessName:  '',
    description:   '',
    experienceYrs: 0,
    languages:     [] as string[],
    serviceAreas:  [] as string[],
    phone:         '',
    website:       '',
  });

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const toggleArr = (k: 'languages' | 'serviceAreas', v: string) =>
    set(k, form[k].includes(v) ? form[k].filter(x => x !== v) : [...form[k], v]);

  const submit = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/vendors/apply', {
        method: 'POST',
        body: JSON.stringify({
          businessName:  form.businessName,
          businessType:  form.businessType,
          description:   form.description,
          experienceYrs: form.experienceYrs,
          languages:     form.languages,
          serviceAreas:  form.serviceAreas,
          phone:         form.phone,
          website:       form.website,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Submission failed'); return; }
      setStep('success');
    } catch { toast.error('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-purple-50 px-4 py-1.5 rounded-full mb-4">
          <Briefcase className="w-4 h-4 text-purple-600" />
          <span className="font-poppins text-sm font-medium text-purple-700">Partner with Bengal Trails</span>
        </div>
        <h1 className="font-poppins text-3xl font-semibold text-slate-900 mb-3">Become a verified partner</h1>
        <p className="font-poppins text-base text-gray-500 max-w-md mx-auto">
          Reach thousands of travellers visiting West Bengal. Free to apply — we review within 48 hours.
        </p>
      </div>

      {/* Step indicator */}
      {step !== 'success' && (
        <div className="flex items-center justify-center gap-2 mb-8">
          {(['type','details','review'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-poppins text-xs font-semibold transition-all
                ${step === s ? 'bg-purple-600 text-white' : i < ['type','details','review'].indexOf(step) ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-400'}`}>
                {i + 1}
              </div>
              {i < 2 && <div className="w-10 h-px bg-gray-200" />}
            </div>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">

        {/* Step 1 — Business type */}
        {step === 'type' && (
          <motion.div key="type" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
            <h2 className="font-poppins text-lg font-semibold text-slate-900 mb-5">What type of business are you?</h2>
            <div className="grid grid-cols-2 gap-3">
              {TYPES.map(t => {
                const Icon = t.icon;
                const sel  = form.businessType === t.value;
                return (
                  <button key={t.value} onClick={() => set('businessType', t.value)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all
                      ${sel ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <Icon className={`w-6 h-6 mb-2 ${sel ? 'text-purple-600' : 'text-gray-400'}`} />
                    <p className="font-poppins font-semibold text-sm text-slate-900">{t.label}</p>
                    <p className="font-poppins text-xs text-gray-400 mt-0.5">{t.desc}</p>
                  </button>
                );
              })}
            </div>
            <button disabled={!form.businessType} onClick={() => setStep('details')}
              className="w-full mt-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 font-poppins font-medium text-white transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Step 2 — Details */}
        {step === 'details' && (
          <motion.div key="details" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="space-y-5">
            <h2 className="font-poppins text-lg font-semibold text-slate-900">Business details</h2>

            {[
              { k:'businessName', label:'Business / Trading name', type:'text', placeholder:'e.g. Himalayan Trails Pvt Ltd' },
              { k:'phone',        label:'Contact phone',            type:'tel',  placeholder:'+91 98765 43210' },
              { k:'website',      label:'Website (optional)',       type:'url',  placeholder:'https://yourwebsite.com' },
            ].map(f => (
              <div key={f.k}>
                <label className="block font-poppins text-sm font-medium text-slate-700 mb-1.5">{f.label}</label>
                <input type={f.type} value={(form as any)[f.k]} onChange={e => set(f.k, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl font-poppins text-sm focus:outline-none focus:border-purple-400 transition-colors" />
              </div>
            ))}

            <div>
              <label className="block font-poppins text-sm font-medium text-slate-700 mb-1.5">About your business</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
                placeholder="Tell travellers what makes you special…"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl font-poppins text-sm focus:outline-none focus:border-purple-400 transition-colors resize-none" />
            </div>

            <div>
              <label className="block font-poppins text-sm font-medium text-slate-700 mb-2">Years of experience</label>
              <div className="flex items-center gap-3">
                <button onClick={() => set('experienceYrs', Math.max(0, form.experienceYrs - 1))}
                  className="w-9 h-9 rounded-full border border-gray-200 hover:border-purple-400 flex items-center justify-center">−</button>
                <span className="font-poppins font-semibold text-lg text-slate-900 w-12 text-center">{form.experienceYrs}</span>
                <button onClick={() => set('experienceYrs', form.experienceYrs + 1)}
                  className="w-9 h-9 rounded-full border border-gray-200 hover:border-purple-400 flex items-center justify-center">+</button>
              </div>
            </div>

            <div>
              <label className="block font-poppins text-sm font-medium text-slate-700 mb-2">Service areas</label>
              <div className="flex flex-wrap gap-2">
                {AREAS.map(a => (
                  <button key={a} onClick={() => toggleArr('serviceAreas', a)}
                    className={`px-3 py-1.5 rounded-full font-poppins text-xs transition-all
                      ${form.serviceAreas.includes(a) ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-poppins text-sm font-medium text-slate-700 mb-2">Languages spoken</label>
              <div className="flex flex-wrap gap-2">
                {LANGS.map(l => (
                  <button key={l} onClick={() => toggleArr('languages', l)}
                    className={`px-3 py-1.5 rounded-full font-poppins text-xs transition-all
                      ${form.languages.includes(l) ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep('type')}
                className="flex-1 py-3 rounded-xl border border-gray-200 font-poppins text-sm font-medium text-gray-700 hover:bg-gray-50">Back</button>
              <button onClick={() => { if (!form.businessName) { toast.error('Enter your business name'); return; } setStep('review'); }}
                className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 font-poppins text-sm font-medium text-white transition-colors flex items-center justify-center gap-2">
                Review <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3 — Review */}
        {step === 'review' && (
          <motion.div key="review" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
            <h2 className="font-poppins text-lg font-semibold text-slate-900 mb-5">Review your application</h2>
            <div className="bg-gray-50 rounded-2xl p-5 space-y-3 mb-6">
              {[
                ['Business', form.businessName],
                ['Type',     TYPES.find(t => t.value === form.businessType)?.label || ''],
                ['Phone',    form.phone || '—'],
                ['Experience', `${form.experienceYrs} years`],
                ['Areas',    form.serviceAreas.join(', ') || '—'],
                ['Languages',form.languages.join(', ') || '—'],
              ].map(([k,v]) => (
                <div key={k} className="flex justify-between border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                  <span className="font-poppins text-sm text-gray-400">{k}</span>
                  <span className="font-poppins text-sm font-medium text-slate-900 text-right max-w-[60%]">{v}</span>
                </div>
              ))}
            </div>
            <p className="font-poppins text-xs text-gray-400 mb-4 text-center">Our team reviews applications within 48 hours and will contact you by email.</p>
            <div className="flex gap-3">
              <button onClick={() => setStep('details')}
                className="flex-1 py-3 rounded-xl border border-gray-200 font-poppins text-sm font-medium text-gray-700 hover:bg-gray-50">Back</button>
              <button onClick={submit} disabled={loading}
                className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 font-poppins text-sm font-medium text-white transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit Application
              </button>
            </div>
          </motion.div>
        )}

        {/* Success */}
        {step === 'success' && (
          <motion.div key="success" initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} className="text-center py-10">
            <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',delay:0.1}}
              className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-purple-600" />
            </motion.div>
            <h2 className="font-poppins text-2xl font-semibold text-slate-900 mb-3">Application submitted!</h2>
            <p className="font-poppins text-gray-500 mb-6 max-w-sm mx-auto">
              We'll review your application within 48 hours and send you an email with the next steps.
            </p>
            <a href="/" className="inline-block px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-poppins text-sm font-medium rounded-xl transition-colors">
              Back to Home
            </a>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
