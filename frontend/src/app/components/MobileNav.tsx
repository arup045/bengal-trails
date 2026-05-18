import { useState, useEffect } from 'react';
import { Home, Compass, CalendarDays, Map, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const TABS = [
  { label: 'Home',      icon: Home,          href: '#/'                },
  { label: 'Explore',   icon: Compass,       href: '#/explore'         },
  { label: 'Festivals', icon: CalendarDays,  href: '#/festivals'       },
  { label: 'Itinerary', icon: Map,           href: '#/itinerary-builder'},
  { label: 'Profile',   icon: User,          href: '#/profile'         },
];

function isActiveHref(href: string, hash: string) {
  const h = hash || '#/';
  if (href === '#/') return h === '#/' || h === '#';
  return h.startsWith(href);
}

export function MobileNav() {
  const { user } = useAuth();
  // Re-render on every hash change so active state stays accurate
  const [hash, setHash] = useState(window.location.hash || '#/');

  useEffect(() => {
    const update = () => setHash(window.location.hash || '#/');
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden
                 bg-white/95 backdrop-blur-md border-t border-gray-200/80"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Mobile navigation"
    >
      <div className="flex items-stretch h-16">
        {TABS.map(({ label, icon: Icon, href }) => {
          const target = label === 'Profile' ? (user ? '#/profile' : '#/signin') : href;
          const active = isActiveHref(target, hash);
          return (
            <a
              key={label}
              href={target}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 relative
                         transition-colors duration-150 select-none
                         ${active ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-purple-600 rounded-full" />
              )}
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-poppins font-medium leading-none">{label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
