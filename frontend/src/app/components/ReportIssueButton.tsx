import { API_BASE } from '../utils/api';
import { useState } from 'react';
import { Flag } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  slug: string;
}

export function ReportIssueButton({ slug }: Props) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!message.trim()) {
      toast.error('Please describe the issue');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(
        `${API_BASE}/places/report`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
          },
          body: JSON.stringify({ slug, message, email }),
        },
      );
      if (res.ok) {
        toast.success('Thanks — our team will review this');
        setOpen(false);
        setMessage('');
        setEmail('');
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Could not send report. Try again later.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        aria-label="Report incorrect information about this place"
      >
        <Flag className="w-4 h-4" />
        Report incorrect info
      </button>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm max-w-md">
      <h4 className="text-sm font-semibold mb-2">Report an issue</h4>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        maxLength={2000}
        placeholder="What's wrong or out of date?"
        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7d1f2e]/30"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email (optional)"
        className="w-full mt-2 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7d1f2e]/30"
      />
      <div className="flex gap-2 mt-3 justify-end">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-3 py-1.5 text-sm rounded-full bg-gray-100 hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className="px-4 py-1.5 text-sm rounded-full bg-[#7d1f2e] text-white hover:bg-[#5a1621] disabled:opacity-50"
        >
          {submitting ? 'Sending…' : 'Send report'}
        </button>
      </div>
    </div>
  );
}
