import React, { useState, useEffect } from 'react';
import { BookOpen, Trash2, Loader2, AlertCircle } from 'lucide-react';
import api, { ENDPOINTS } from '@/lib/api';
import BookCover from '@/components/books/BookCover';

const ManageBooksView = ({ searchQuery = '' }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchBooks = async () => {
    try {
      const res = await api.get(ENDPOINTS.BOOKS.ADMIN_LIST);
      setBooks(res.data || []);
      setError(null);
    } catch (err) {
      if (err.message === 'No books found') {
        setBooks([]); // Not an error, just empty
      } else {
        setError(err.message || 'Failed to load books');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
    const handleBooksUpdated = () => {
      fetchBooks();
    };

    window.addEventListener('readnest:books-updated', handleBooksUpdated);
    return () => window.removeEventListener('readnest:books-updated', handleBooksUpdated);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this book?')) return;
    
    setDeletingId(id);
    try {
      await api.delete(ENDPOINTS.BOOKS.DETAIL(id));
      setBooks(books.filter(b => b._id !== id));
      window.dispatchEvent(new CustomEvent('readnest:books-updated'));
    } catch (err) {
      setError(err.message || 'Failed to delete book');
    } finally {
      setDeletingId(null);
    }
  };


  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredBooks = normalizedSearch
    ? books.filter((book) => [book.title, book.author, book.category?.[0] || book.category]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch)))
    : books;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#c97b6b] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-serif text-black dark:text-white mb-2">Error Loading Catalog</h3>
        <p className="text-sm text-black/50 dark:text-white/50">{error}</p>
        <button onClick={fetchBooks} className="mt-4 px-6 py-2 bg-[#c97b6b]/10 text-[#c97b6b] rounded-xl text-xs font-bold uppercase tracking-widest">Retry</button>
      </div>
    );
  }

  if (filteredBooks.length === 0) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 rounded-2xl bg-[#c97b6b]/10 flex items-center justify-center mb-6">
          <BookOpen className="w-8 h-8 text-[#c97b6b]" />
        </div>
        <h3 className="text-xl font-serif text-black dark:text-white mb-2">Library is Empty</h3>
        <p className="text-sm text-black/50 dark:text-white/50 max-w-sm mb-6">
          No books match the current search, or the catalog is currently empty.
        </p>
      </div>
    );
  }

  return (
    <div className="p-0 sm:p-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black/5 dark:border-white/5">
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40">Book</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40">Category</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40">Pages</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBooks.map((book) => (
              <tr key={book._id} className="border-b border-black/5 dark:border-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group">
                <td className="p-4">
                  <div className="flex items-center gap-4">
                    <BookCover
                      src={book.coverImage}
                      title={book.title}
                      author={book.author}
                      rounded="rounded"
                      className="h-14 w-10 shadow-sm"
                    />
                    <div>
                      <p className="font-bold text-sm text-black dark:text-white line-clamp-1">{book.title}</p>
                      <p className="text-xs text-black/50 dark:text-white/50 font-serif italic">{book.author}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-black/5 dark:bg-white/5 rounded text-[10px] font-bold uppercase tracking-widest text-black/60 dark:text-white/60">
                    {book.category?.[0] || book.category || 'Uncategorized'}
                  </span>
                </td>
                <td className="p-4 text-sm font-medium text-black/70 dark:text-white/70">
                  {book.totalPages}
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleDelete(book._id)}
                      disabled={deletingId === book._id}
                      className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-black/40 dark:text-white/40 transition-colors disabled:opacity-50"
                    >
                      {deletingId === book._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageBooksView;

