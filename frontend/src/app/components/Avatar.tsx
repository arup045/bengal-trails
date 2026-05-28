// Premium avatar — uses the real uploaded photo if present, otherwise renders
// a clean, modern illustrated avatar from DiceBear (free, no key, deterministic
// per name so the same person always gets the same face).
import { useMemo } from 'react';

interface AvatarProps {
  name?: string | null;
  src?: string | null;
  size?: number;
  className?: string;
  /** DiceBear style — 'notionists' (default) is modern illustrated people. */
  style?: 'notionists' | 'lorelei' | 'personas' | 'shapes' | 'initials';
}

const PURPLE_FALLBACK_INITIAL = (n?: string | null) => (n || 'U').trim().charAt(0).toUpperCase();

export function Avatar({ name, src, size = 48, className = '', style = 'notionists' }: AvatarProps) {
  const seed = (name || 'traveller').trim().toLowerCase();
  const url = useMemo(
    () => `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}&radius=50&backgroundType=gradientLinear&backgroundColor=ede9fe,fef3c7,fce7f3`,
    [seed, style],
  );

  const px = `${size}px`;
  const base = `rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-purple-100 ${className}`;

  if (src) {
    return (
      <span className={base} style={{ width: px, height: px }}>
        <img src={src} alt={name || 'Avatar'} className="w-full h-full object-cover"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
      </span>
    );
  }

  return (
    <span className={base} style={{ width: px, height: px }}>
      <img
        src={url}
        alt={name || 'Avatar'}
        loading="lazy"
        className="w-full h-full object-cover"
        // If DiceBear ever fails, fall back to a coloured initial — never blank.
        onError={(e) => {
          const wrapper = e.currentTarget.parentElement;
          if (!wrapper) return;
          wrapper.innerHTML = `<span style="font-family:Poppins,sans-serif;font-weight:700;color:#7c3aed;font-size:${Math.round(size * 0.42)}px">${PURPLE_FALLBACK_INITIAL(name)}</span>`;
        }}
      />
    </span>
  );
}

export default Avatar;
