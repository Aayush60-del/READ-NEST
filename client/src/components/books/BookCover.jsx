import { useMemo, useState } from 'react';
import { BookOpenCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const gradients = [
  'from-[#3b2a1a] via-[#9f4f43] to-[#e8a898]',
  'from-[#122e22] via-[#2f766d] to-[#cde8df]',
  'from-[#1c2535] via-[#334155] to-[#d6d4d0]',
  'from-[#241714] via-[#c97b6b] to-[#f3d4c8]',
];

const getGradientIndex = (title = '') => {
  const value = String(title)
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return value % gradients.length;
};

const BookCover = ({
  src,
  title = 'Untitled Book',
  author = 'ReadNest',
  className = '',
  imageClassName = '',
  fallbackClassName = '',
  rounded = 'rounded-2xl',
  priority = false,
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const gradient = useMemo(() => gradients[getGradientIndex(title)], [title]);
  const showImage = Boolean(src) && !imageFailed;

  return (
    <div
      className={cn(
        'relative isolate h-full w-full overflow-hidden bg-[#1a1a1a] shadow-xl',
        rounded,
        className
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt={`${title} cover`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setImageFailed(true)}
          className={cn('h-full w-full object-cover', imageClassName)}
        />
      ) : (
        <div
          className={cn(
            'relative flex h-full w-full flex-col justify-between overflow-hidden bg-gradient-to-br p-5 text-white',
            gradient,
            fallbackClassName
          )}
        >
          <div className="absolute inset-y-0 left-0 w-8 bg-black/25" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(255,255,255,0.24),transparent_34%),linear-gradient(135deg,rgba(0,0,0,0.05),rgba(0,0,0,0.34))]" />
          <div className="absolute right-4 top-4 h-16 w-16 rounded-full border border-white/15" />
          <div className="relative z-10 ml-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/55">
            <BookOpenCheck className="h-4 w-4" />
            ReadNest
          </div>
          <div className="relative z-10 ml-4 text-left">
            <h3 className="font-serif text-[clamp(1rem,8vw,2.2rem)] leading-none tracking-tight text-white drop-shadow-sm line-clamp-4">
              {title}
            </h3>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-white/60 line-clamp-2">
              {author || 'Unknown author'}
            </p>
          </div>
          <div className="relative z-10 ml-4 flex items-center gap-2 text-white/40">
            <span className="h-px flex-1 bg-white/25" />
            <span className="text-xs">âœ¦</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookCover;

