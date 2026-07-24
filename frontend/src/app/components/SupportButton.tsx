import { MessageCircle } from 'lucide-react';

// A gentle "we're here to help" affordance — the reassurance travellers look for
// before booking. If a support WhatsApp number is configured
// (VITE_SUPPORT_WHATSAPP, digits only e.g. 919830000000) it opens a WhatsApp
// chat (the default channel in India); otherwise it links to the Contact page.
// Sits bottom-LEFT so it never collides with the bottom-right AI assistant FAB.
const WA = (import.meta.env.VITE_SUPPORT_WHATSAPP as string | undefined)?.replace(/[^0-9]/g, '');

export function SupportButton() {
  const isWhatsApp = !!WA;
  const href = isWhatsApp
    ? `https://wa.me/${WA}?text=${encodeURIComponent("Hi Bengal Trails! I'd like some help planning my West Bengal trip.")}`
    : '/contact';

  return (
    <a
      href={href}
      {...(isWhatsApp ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      aria-label={isWhatsApp ? 'Chat with us on WhatsApp' : 'Contact support'}
      className="group fixed bottom-8 left-5 z-40 flex items-center gap-0 rounded-full bg-purple-600 text-white shadow-lg hover:bg-purple-700 hover:shadow-xl transition-all font-poppins overflow-hidden"
    >
      <span className="w-12 h-12 flex items-center justify-center shrink-0">
        <MessageCircle className="w-5 h-5" strokeWidth={2} />
      </span>
      <span className="max-w-0 group-hover:max-w-[10rem] group-focus-visible:max-w-[10rem] overflow-hidden whitespace-nowrap transition-all duration-300 text-sm font-medium">
        <span className="pr-4">{isWhatsApp ? 'Chat with us' : 'Need help?'}</span>
      </span>
    </a>
  );
}

export default SupportButton;
