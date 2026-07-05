import React from 'react';
import { Activity, BookOpen, Clock, Users } from 'lucide-react';
import BookCover from '@/components/books/BookCover';

const formatDate = (value) => {
  if (!value) return 'Unknown time';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Unknown time' : date.toLocaleString();
};

const getId = (item, fallback) => item?.id || item?._id || item?.bookId || item?.email || item?.title || fallback;

const SectionCard = ({ title, icon: Icon, children }) => (
  <section className="rounded-2xl border border-[#e8e4db] bg-white/80 p-4 shadow-[0_14px_40px_rgba(15,20,25,0.05)] backdrop-blur dark:border-white/10 dark:bg-[#0f1419]/35">
    <div className="mb-4 flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#c97b6b]/10 text-[#c97b6b]">
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-black/45 dark:text-white/45">{title}</h3>
    </div>
    {children}
  </section>
);

const EmptyState = ({ message }) => (
  <div className="rounded-xl border border-dashed border-black/10 bg-black/[0.02] p-6 text-sm text-black/50 dark:border-white/10 dark:bg-white/[0.02] dark:text-white/50">
    {message}
  </div>
);

const LoadingRows = () => (
  <div className="space-y-3">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="flex items-center gap-3 rounded-xl border border-black/5 bg-black/[0.02] p-3 dark:border-white/5 dark:bg-white/[0.02]">
        <div className="h-12 w-10 animate-pulse rounded bg-black/10 dark:bg-white/10" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-3 w-2/3 animate-pulse rounded bg-black/10 dark:bg-white/10" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-black/10 dark:bg-white/10" />
        </div>
        <div className="h-6 w-10 animate-pulse rounded bg-black/10 dark:bg-white/10" />
      </div>
    ))}
  </div>
);

const ActivityView = ({ analytics, loading = false }) => {
  const recentActivity = analytics?.recentActivity || [];
  const recentUsers = analytics?.recentUsers || [];
  const topBooks = analytics?.topBooks || [];

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-8">
        <h2 className="mb-2 flex items-center gap-2 font-serif text-2xl text-black dark:text-white">
          <Activity className="h-5 w-5 text-[#c97b6b]" /> Platform Analytics
        </h2>
        <p className="text-sm text-black/60 dark:text-white/60">Real reading activity, top books, and member growth from the database.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard title="Recent Reading Activity" icon={Clock}>
          {loading ? (
            <LoadingRows />
          ) : recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((item, index) => (
                <div key={getId(item, index)} className="rounded-xl border border-black/5 bg-black/[0.02] p-4 dark:border-white/5 dark:bg-white/[0.02]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-black dark:text-white">
                        {item.user?.name || item.user?.email || 'Unknown reader'}
                      </p>
                      <p className="mt-1 truncate text-xs text-black/50 dark:text-white/50">
                        {item.book?.title || 'Untitled book'}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-[#c97b6b]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#c97b6b]">
                      {Number(item.percentageCompleted || 0)}%
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-black/45 dark:text-white/45">
                    <span>{item.user?.email || 'No email'}</span>
                    <span>Page {Number(item.currentPage || 0).toLocaleString()}</span>
                    <span>{formatDate(item.updatedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No reading activity has been recorded yet." />
          )}
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Top Books" icon={BookOpen}>
            {loading ? (
              <LoadingRows />
            ) : topBooks.length > 0 ? (
              <div className="space-y-3">
                {topBooks.map((book, index) => (
                  <div key={getId(book, index)} className="flex items-center gap-3 rounded-xl border border-black/5 bg-black/[0.02] p-3 dark:border-white/5 dark:bg-white/[0.02]">
                    <BookCover
                      src={book.coverImage || book.coverUrl || book.image}
                      title={book.title}
                      author={book.author}
                      rounded="rounded"
                      className="h-16 w-11 shrink-0 shadow-sm"
                      imageClassName="object-contain bg-[#f2e8dc] dark:bg-[#111827]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-black dark:text-white">{book.title || 'Untitled book'}</p>
                      <p className="truncate text-xs text-black/50 dark:text-white/50">{book.author || 'Unknown author'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#c97b6b]">{Number(book.readers || book.readerCount || 0).toLocaleString()}</p>
                      <p className="text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40">Readers</p>
                      {book.averageProgress !== undefined && (
                        <p className="mt-1 text-[10px] text-black/35 dark:text-white/35">{Number(book.averageProgress || 0)}% avg</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="Top books will appear after readers make progress." />
            )}
          </SectionCard>

          <SectionCard title="Recent Users" icon={Users}>
            {loading ? (
              <LoadingRows />
            ) : recentUsers.length > 0 ? (
              <div className="space-y-3">
                {recentUsers.map((user, index) => (
                  <div key={getId(user, index)} className="flex items-center gap-3 rounded-xl border border-black/5 bg-black/[0.02] p-3 dark:border-white/5 dark:bg-white/[0.02]">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#c97b6b]/10 text-sm font-bold uppercase text-[#c97b6b]">
                      {(user.name || user.email || 'U').charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-black dark:text-white">{user.name || 'Unnamed user'}</p>
                      <p className="truncate text-xs text-black/50 dark:text-white/50">{user.email || 'No email'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#c97b6b]">{user.role || 'user'}</p>
                      <p className="text-xs text-black/40 dark:text-white/40">{formatDate(user.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No users have joined yet." />
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default ActivityView;
