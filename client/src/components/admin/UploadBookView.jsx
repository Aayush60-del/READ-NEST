import React, { useState } from 'react';
import { Upload, Image as ImageIcon, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import api, { ENDPOINTS } from '@/lib/api';

const MAX_COVER_SIZE = 10 * 1024 * 1024;
const MAX_BOOK_SIZE = 50 * 1024 * 1024;

const UploadBookView = () => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    category: '',
    totalPages: ''
  });

  const [coverImage, setCoverImage] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [status, setStatus] = useState({ loading: false, error: null, success: false });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;

    if (e.target.name === 'coverImage') {
      if (file && !file.type.startsWith('image/')) {
        setStatus({ loading: false, error: 'Cover image must be an image file.', success: false });
        e.target.value = '';
        return;
      }

      if (file && file.size > MAX_COVER_SIZE) {
        setStatus({ loading: false, error: 'Cover image must be smaller than 10MB.', success: false });
        e.target.value = '';
        return;
      }

      setCoverImage(file);
    }

    if (e.target.name === 'pdfFile') {
      const allowedBookTypes = ['application/pdf', 'application/epub+zip'];
      if (file && !allowedBookTypes.includes(file.type)) {
        setStatus({ loading: false, error: 'Book file must be a PDF or EPUB.', success: false });
        e.target.value = '';
        return;
      }

      if (file && file.size > MAX_BOOK_SIZE) {
        setStatus({ loading: false, error: 'Book file must be smaller than 50MB.', success: false });
        e.target.value = '';
        return;
      }

      setPdfFile(file);
    }

    setStatus((prev) => ({ ...prev, error: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, success: false });

    const normalizedTotalPages = formData.totalPages.trim()
      ? Number(formData.totalPages)
      : null;

    if (!formData.title.trim() || !formData.author.trim() || !formData.description.trim() || !formData.category.trim()) {
      setStatus({ loading: false, error: 'Title, author, category, and description are required.', success: false });
      return;
    }

    if (normalizedTotalPages !== null && (!Number.isFinite(normalizedTotalPages) || normalizedTotalPages < 1)) {
      setStatus({ loading: false, error: 'Manual total pages must be at least 1.', success: false });
      return;
    }

    if (!coverImage || !pdfFile) {
      setStatus({ loading: false, error: 'Both cover image and PDF/EPUB file are required.', success: false });
      return;
    }

    try {
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('author', formData.author.trim());
      data.append('description', formData.description.trim());
      data.append('category', formData.category.trim());
      if (normalizedTotalPages !== null) {
        data.append('totalPages', String(normalizedTotalPages));
      }
      data.append('coverImage', coverImage);
      data.append('pdfFile', pdfFile);

      await api.post(ENDPOINTS.BOOKS.LIST, data);

      setStatus({ loading: false, error: null, success: true });
      setFormData({ title: '', author: '', description: '', category: '', totalPages: '' });
      setCoverImage(null);
      setPdfFile(null);
      document.getElementById('coverImage').value = '';
      document.getElementById('pdfFile').value = '';
      window.dispatchEvent(new CustomEvent('readnest:books-updated'));

      setTimeout(() => setStatus(prev => ({ ...prev, success: false })), 4000);
    } catch (err) {
      setStatus({ loading: false, error: err.message || 'Failed to upload book.', success: false });
    }
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-serif text-black dark:text-white mb-2 flex items-center gap-2">
          <Upload className="w-5 h-5 text-[#c97b6b]" /> Upload New Book
        </h2>
        <p className="text-black/60 dark:text-white/60 text-sm">Add a new book to the ReadNest library catalog.</p>
      </div>

      {status.success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Book uploaded successfully and is now available in the library!</p>
        </div>
      )}

      {status.error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 dark:text-red-400 font-medium">{status.error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-black/50 dark:text-white/50 mb-1.5">Book Title</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. The Great Gatsby"
                className="w-full bg-white dark:bg-[#0f1419] border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-black dark:text-white focus:outline-none focus:border-[#c97b6b] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-black/50 dark:text-white/50 mb-1.5">Author</label>
              <input
                type="text"
                name="author"
                required
                value={formData.author}
                onChange={handleChange}
                placeholder="e.g. F. Scott Fitzgerald"
                className="w-full bg-white dark:bg-[#0f1419] border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-black dark:text-white focus:outline-none focus:border-[#c97b6b] transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-black/50 dark:text-white/50 mb-1.5">Category</label>
                <input
                  type="text"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g. Fiction, Classic"
                  className="w-full bg-white dark:bg-[#0f1419] border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-black dark:text-white focus:outline-none focus:border-[#c97b6b] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-black/50 dark:text-white/50 mb-1.5">Total Pages</label>
                <input
                  type="number"
                  name="totalPages"
                  min="1"
                  value={formData.totalPages}
                  onChange={handleChange}
                  placeholder="Auto for PDF"
                  className="w-full bg-white dark:bg-[#0f1419] border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-black dark:text-white focus:outline-none focus:border-[#c97b6b] transition-colors"
                />
                <p className="mt-1.5 text-[11px] leading-4 text-black/45 dark:text-white/45">
                  PDFs are detected automatically. Use this only as a fallback for EPUB or unusual files.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-black/50 dark:text-white/50 mb-1.5">Description</label>
              <textarea
                name="description"
                required
                rows="4"
                value={formData.description}
                onChange={handleChange}
                placeholder="A brief summary of the book..."
                className="w-full bg-white dark:bg-[#0f1419] border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-black dark:text-white focus:outline-none focus:border-[#c97b6b] transition-colors resize-none"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 border border-dashed border-black/20 dark:border-white/20 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-black dark:text-white">Cover Image</h4>
                  <p className="text-[11px] text-black/50 dark:text-white/50">High quality JPG or PNG under 10MB</p>
                </div>
              </div>
              <input
                type="file"
                id="coverImage"
                name="coverImage"
                accept="image/*"
                required
                onChange={handleFileChange}
                className="w-full text-sm text-black/60 dark:text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:tracking-widest file:uppercase file:bg-blue-500/10 file:text-blue-500 hover:file:bg-blue-500/20 transition-all"
              />
            </div>

            <div className="p-6 border border-dashed border-black/20 dark:border-white/20 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#c97b6b]/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#c97b6b]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-black dark:text-white">Book File</h4>
                  <p className="text-[11px] text-black/50 dark:text-white/50">PDF page count is detected on upload. EPUB needs fallback pages.</p>
                </div>
              </div>
              <input
                type="file"
                id="pdfFile"
                name="pdfFile"
                accept="application/pdf,application/epub+zip,.epub"
                required
                onChange={handleFileChange}
                className="w-full text-sm text-black/60 dark:text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:tracking-widest file:uppercase file:bg-[#c97b6b]/10 file:text-[#c97b6b] hover:file:bg-[#c97b6b]/20 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row justify-end gap-3">
          <button
            type="submit"
            disabled={status.loading}
            className="w-full sm:w-auto px-8 py-3 bg-[#c97b6b] hover:bg-[#b8695c] text-white text-sm font-bold tracking-widest uppercase rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {status.loading ? 'Uploading...' : (
              <>
                <Upload className="w-4 h-4" /> Publish Book
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadBookView;
