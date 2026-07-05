import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const variantStyles = {
  default: {
    link: 'w-[150px] sm:w-[190px] lg:w-[220px] min-w-[150px] sm:min-w-[190px] lg:min-w-[220px]',
    cover: 'mb-4 rounded-xl shadow-xl',
    title: 'line-clamp-2 font-serif text-lg leading-tight sm:text-xl',
    author: 'text-sm',
  },
  compact: {
    link: 'w-[145px] sm:w-[180px] lg:w-[210px] min-w-[145px] sm:min-w-[180px] lg:min-w-[210px]',
    cover: 'mb-4 rounded shadow-lg',
    title: 'line-clamp-2 font-serif text-base font-medium leading-tight sm:text-lg',
    author: 'text-xs',
  },
  library: {
    link: 'w-[150px] sm:w-[190px] lg:w-[220px] min-w-[150px] sm:min-w-[190px] lg:min-w-[220px]',
    cover: 'mb-3 rounded-xl shadow-lg',
    title: 'line-clamp-1 font-serif text-lg leading-tight',
    author: 'text-sm',
  },
};

const getProgressValue = (book, progress) => {
  const value = progress ?? book?.percentageCompleted ?? book?.progress ?? 0;
  return Math.min(100, Math.max(0, Number(value) || 0));
};

const getPageLabel = (book) => {
  const currentPage = book?.currentPage ?? book?.pagesRead;
  const totalPages = book?.totalPages;
  if (!currentPage || !totalPages) return null;
  return `${currentPage}/${totalPages} pp.`;
};

const BookCard = ({
  book,
  to,
  showProgress = false,
  progress,
  showAuthor = true,
  className = '',
  variant = 'default',
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const styles = variantStyles[variant] || variantStyles.default;
  const title = book?.title || 'Untitled Book';
  const author = book?.author || 'Unknown author';
  const coverSrc = book?.coverImage || book?.coverUrl || book?.image || book?.thumbnail;
  const showImage = Boolean(coverSrc) && !imageFailed;
  const progressValue = getProgressValue(book, progress);
  const isCompleted = Boolean(book?.isCompleted) || book?.status === 'completed' || progressValue >= 100;
  const pageLabel = getPageLabel(book);

  return (
    <Link
      to={to || (book?._id ? `/books/${book._id}` : '#')}
      className={cn(
        'group block cursor-pointer transition-transform duration-300 hover:-translate-y-1',
        styles.link,
        className
      )}
    >
      <div
        className={cn(
          'relative aspect-[2/3] w-full overflow-hidden border border-black/10 bg-[#f2e8dc] transition-shadow duration-300 group-hover:shadow-2xl dark:border-white/10 dark:bg-[#1c2535]',
          styles.cover
        )}
      >
        {showImage ? (
          <img
            src={coverSrc}
            alt={`${title} cover`}
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-[#241714] via-[#9f4f43] to-[#f3d4c8] p-5 text-white transition-transform duration-500 group-hover:scale-105">
            <div className="absolute inset-y-0 left-0 w-8 bg-black/25" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(255,255,255,0.24),transparent_34%),linear-gradient(135deg,rgba(0,0,0,0.05),rgba(0,0,0,0.34))]" />
            <div className="relative z-10 ml-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/60">
              <BookOpen className="h-4 w-4" />
              ReadNest
            </div>
            <div className="relative z-10 ml-3">
              <p className="line-clamp-4 font-serif text-[clamp(1rem,7vw,2rem)] leading-none text-white">
                {title}
              </p>
              <p className="mt-4 line-clamp-2 text-xs font-bold uppercase tracking-[0.18em] text-white/60">
                {author}
              </p>
            </div>
            <div className="relative z-10 ml-3 h-px w-2/3 bg-white/25" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/35 to-transparent" />
        {variant === 'library' && (
          <div className="absolute right-3 top-3">
            {isCompleted ? (
              <div className="flex items-center gap-1.5 rounded-full border border-[#1b6b54] bg-[#0e3b2e] px-2.5 py-1 text-[#4ade80] shadow-lg">
                <Check className="h-3 w-3" />
                <span className="text-[9px] font-bold uppercase tracking-widest">Completed</span>
              </div>
            ) : (
              <div className="rounded-full border border-white/10 bg-black/75 px-2.5 py-1 text-white shadow-lg backdrop-blur-md">
                <span className="text-[9px] font-bold uppercase tracking-widest">{progressValue}%</span>
              </div>
            )}
          </div>
        )}
      </div>

      <h3
        className={cn(
          'text-black transition-colors group-hover:text-[#a65d50] dark:text-white dark:group-hover:text-[#c97b6b]',
          styles.title
        )}
        title={title}
      >
        {title}
      </h3>

      {showAuthor && (
        <p
          className={cn('mt-1 truncate text-black/40 dark:text-white/40', styles.author)}
          title={author}
        >
          {author}
        </p>
      )}

      {showProgress && (
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-black/45 dark:text-white/45">
            <span>{isCompleted ? 'Completed' : 'Progress'}</span>
            <span>{isCompleted ? '100%' : pageLabel || `${progressValue}%`}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-[#c97b6b] transition-all duration-500"
              style={{ width: `${progressValue}%` }}
            />
          </div>
        </div>
      )}
    </Link>
  );
};

export default BookCard;
