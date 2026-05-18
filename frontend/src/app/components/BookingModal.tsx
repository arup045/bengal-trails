import { useState } from 'react';
import { X, MapPin, Calendar, Users, CheckCircle, Loader2, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { authFetch } from '../utils/api';
import { toast } from 'sonner';

interface BookingModalProps {
  destination: { title: string; slug: string; priceFrom?: string; heroImage?: { url: string } };
  onClose: () => void;
}

type Step = 'details' | 'contact' | 'confirm' | 'success';

export function BookingModal({ destination, onClose }: BookingModalProps) {
  const [step,      setStep]      = useState<Step>('details');
  const [loading,   setLoading]   = useState(false);
  const [form,      setForm]      = useState({
    checkIn:  '',
    checkOut: '',
    guests:   1,
    name:     '',
    email:    '',
    phone:    '',
    message:  '',
  });

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const submitEnquiry = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/bookings/enquiry', {
        method: 'POST',
        body: JSON.stringify({
          destinationSlug: destination.slug,
          destinationName: destination.title,
          checkIn:  form.checkIn,
          checkOut: form.checkOut,
          guests:   form.guests,
          name:     form.name,
          email:    form.email,
          phone:    form.phone,
          message:  form.message,
        }),
      });
      if (res.ok) {
        setStep('success');
      } else {
        const d = await res.json();
        toast.error(d.error || 'Could not send enquiry. Please try again.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{    opacity: 0, y: 60 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl
                   shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {destination.heroImage?.url && (
              <img src={destination.heroImage.url} alt={destination.title}
                className="w-10 h-10 rounded-xl object-cover" />
            )}
            <div>
              <p className="font-poppins text-xs text-gray-400 uppercase tracking-wide">Enquiry for</p>
              <h3 className="font-poppins text-base font-semibold text-slate-900">{destination.title}</h3>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Step indicators */}
        {step !== 'success' && (
          <div className="flex items-center px-6 py-3 gap-2">
            {(['details','contact','confirm'] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-poppins font-semibold transition-colors
                  ${step === s ? 'bg-purple-600 text-white' : (i < ['details','contact','confirm'].indexOf(step) ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400')}`}>
                  {i + 1}
                </div>
                {i < 2 && <div className="flex-1 h-px bg-gray-200 w-8" />}
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <AnimatePresence mode="wait">

            {/* Step 1: Trip details */}
            {step === 'details' && (
              <motion.div key="details" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
                <h4 className="font-poppins font-semibold text-slate-900 mb-4 mt-2">Trip details</h4>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block font-poppins text-xs font-medium text-gray-500 mb-1.5">Check-in</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="date" value={form.checkIn} onChange={e => set('checkIn', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm font-poppins focus:outline-none focus:border-purple-400 transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block font-poppins text-xs font-medium text-gray-500 mb-1.5">Check-out</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="date" value={form.checkOut} onChange={e => set('checkOut', e.target.value)}
                        min={form.checkIn || new Date().toISOString().split('T')[0]}
                        className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm font-poppins focus:outline-none focus:border-purple-400 transition-colors" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block font-poppins text-xs font-medium text-gray-500 mb-1.5">Number of guests</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => set('guests', Math.max(1, form.guests - 1))}
                      className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-purple-400 transition-colors">-</button>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="font-poppins font-semibold text-slate-900 w-6 text-center">{form.guests}</span>
                    </div>
                    <button onClick={() => set('guests', Math.min(20, form.guests + 1))}
                      className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-purple-400 transition-colors">+</button>
                  </div>
                </div>
                {destination.priceFrom && (
                  <div className="mt-4 p-3 bg-purple-50 rounded-xl">
                    <p className="font-poppins text-xs text-purple-600 font-medium">Starting from</p>
                    <p className="font-poppins text-lg font-semibold text-purple-700">{destination.priceFrom}<span className="text-sm font-normal"> / person</span></p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2: Contact */}
            {step === 'contact' && (
              <motion.div key="contact" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
                <h4 className="font-poppins font-semibold text-slate-900 mb-4 mt-2">Your contact</h4>
                {[
                  { key: 'name',  label: 'Full name',    type: 'text',  placeholder: 'Rahul Kumar' },
                  { key: 'email', label: 'Email',         type: 'email', placeholder: 'rahul@email.com' },
                  { key: 'phone', label: 'Phone (optional)', type: 'tel', placeholder: '+91 98765 43210' },
                ].map(f => (
                  <div key={f.key} className="mb-3">
                    <label className="block font-poppins text-xs font-medium text-gray-500 mb-1.5">{f.label}</label>
                    <input type={f.type} value={(form as any)[f.key]} onChange={e => set(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-poppins focus:outline-none focus:border-purple-400 transition-colors" />
                  </div>
                ))}
                <div>
                  <label className="block font-poppins text-xs font-medium text-gray-500 mb-1.5">Message (optional)</label>
                  <textarea value={form.message} onChange={e => set('message', e.target.value)} rows={3}
                    placeholder="Any special requests or questions…"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-poppins focus:outline-none focus:border-purple-400 transition-colors resize-none" />
                </div>
              </motion.div>
            )}

            {/* Step 3: Confirm */}
            {step === 'confirm' && (
              <motion.div key="confirm" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
                <h4 className="font-poppins font-semibold text-slate-900 mb-4 mt-2">Confirm enquiry</h4>
                <div className="space-y-3">
                  {[
                    { label: 'Destination', value: destination.title },
                    { label: 'Check-in',    value: form.checkIn  || '—' },
                    { label: 'Check-out',   value: form.checkOut || '—' },
                    { label: 'Guests',      value: `${form.guests} person${form.guests > 1 ? 's' : ''}` },
                    { label: 'Name',        value: form.name },
                    { label: 'Email',       value: form.email },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="font-poppins text-sm text-gray-400">{row.label}</span>
                      <span className="font-poppins text-sm font-medium text-slate-900">{row.value}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 font-poppins text-xs text-gray-400 leading-relaxed">
                  We'll send a confirmation to <strong>{form.email}</strong> and a travel expert will contact you within 24 hours.
                </p>
              </motion.div>
            )}

            {/* Success */}
            {step === 'success' && (
              <motion.div key="success" initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}}
                className="text-center py-8">
                <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',delay:0.1}}
                  className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </motion.div>
                <h4 className="font-poppins text-xl font-semibold text-slate-900 mb-2">Enquiry sent!</h4>
                <p className="font-poppins text-sm text-gray-500 mb-1">
                  Thank you, <strong>{form.name}</strong>.
                </p>
                <p className="font-poppins text-sm text-gray-500 mb-5">
                  Check <strong>{form.email}</strong> — a travel expert will reach out within 24 hours.
                </p>
                <div className="flex items-center justify-center gap-2 text-purple-600">
                  <Mail className="w-4 h-4" />
                  <span className="font-poppins text-sm font-medium">Confirmation sent</span>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer CTA */}
        {step !== 'success' && (
          <div className="px-6 pb-6 pt-2 border-t border-gray-100 flex gap-3">
            {step !== 'details' && (
              <button onClick={() => setStep(step === 'confirm' ? 'contact' : 'details')}
                className="flex-1 py-3 rounded-xl border border-gray-200 font-poppins text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Back
              </button>
            )}
            <button
              onClick={() => {
                if (step === 'details') setStep('contact');
                else if (step === 'contact') {
                  if (!form.name || !form.email) { toast.error('Please enter your name and email'); return; }
                  setStep('confirm');
                } else submitEnquiry();
              }}
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 font-poppins text-sm font-medium text-white transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {step === 'details' ? 'Continue' : step === 'contact' ? 'Review' : 'Send Enquiry'}
            </button>
          </div>
        )}
        {step === 'success' && (
          <div className="px-6 pb-6 pt-2">
            <button onClick={onClose}
              className="w-full py-3 rounded-xl bg-slate-900 font-poppins text-sm font-medium text-white hover:bg-slate-800 transition-colors">
              Done
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
