import React, { useState, useEffect } from 'react';
import { Users, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import api, { ENDPOINTS } from '@/lib/api';

const MembersView = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchMembers = async () => {
    try {
      const res = await api.get(ENDPOINTS.USER.ALL);
      setMembers(res.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) return;
    
    setDeletingId(id);
    try {
      await api.delete(ENDPOINTS.USER.BY_ID(id));
      setMembers(members.filter(m => m._id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

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
        <h3 className="text-lg font-serif text-black dark:text-white mb-2">Error Loading Members</h3>
        <p className="text-sm text-black/50 dark:text-white/50">{error}</p>
        <button onClick={fetchMembers} className="mt-4 px-6 py-2 bg-[#c97b6b]/10 text-[#c97b6b] rounded-xl text-xs font-bold uppercase tracking-widest">Retry</button>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 rounded-2xl bg-[#c97b6b]/10 flex items-center justify-center mb-6">
          <Users className="w-8 h-8 text-[#c97b6b]" />
        </div>
        <h3 className="text-xl font-serif text-black dark:text-white mb-2">No Members Found</h3>
        <p className="text-sm text-black/50 dark:text-white/50 max-w-sm mb-6">
          There are currently no users registered on the platform.
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
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40">User</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40">Role</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40">Joined</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member._id} className="border-b border-black/5 dark:border-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c97b6b] to-[#a65d50] flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-white uppercase">{member.name?.charAt(0) || '?'}</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-black dark:text-white">{member.name}</p>
                      <p className="text-xs text-black/50 dark:text-white/50">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                    member.role === 'admin' 
                      ? 'bg-blue-500/10 text-blue-500' 
                      : 'bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60'
                  }`}>
                    {member.role || 'user'}
                  </span>
                </td>
                <td className="p-4 text-xs font-medium text-black/70 dark:text-white/70">
                  {new Date(member.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleDelete(member._id)}
                      disabled={deletingId === member._id || member.role === 'admin'}
                      className={`p-2 rounded-lg transition-colors ${
                        member.role === 'admin' 
                          ? 'text-black/20 dark:text-white/20 cursor-not-allowed'
                          : 'hover:bg-red-500/10 hover:text-red-500 text-black/40 dark:text-white/40 disabled:opacity-50'
                      }`}
                      title={member.role === 'admin' ? "Cannot delete admin" : "Delete User"}
                    >
                      {deletingId === member._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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

export default MembersView;

