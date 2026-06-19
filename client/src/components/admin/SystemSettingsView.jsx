import React, { useState } from 'react';
import { Settings, Shield, Globe, Database } from 'lucide-react';

const SystemSettingsView = () => {
  const defaultSettings = {
    maintenanceMode: false,
    allowSignups: true,
    publicLibrary: true,
    emailNotifications: true,
  };

  const [settings, setSettings] = useState(() => {
    try {
      return { ...defaultSettings, ...JSON.parse(localStorage.getItem('readnest_admin_settings') || '{}') };
    } catch {
      return defaultSettings;
    }
  });

  const [saving, setSaving] = useState(false);

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setSaving(true);
    localStorage.setItem('readnest_admin_settings', JSON.stringify(settings));
    window.setTimeout(() => setSaving(false), 400);
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif text-black dark:text-white mb-2 flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#c97b6b]" /> System Preferences
          </h2>
          <p className="text-black/60 dark:text-white/60 text-sm">Configure global application settings.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-[#c97b6b] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#b8695c] transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Core Settings */}
        <div className="space-y-4">
          <div className="bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-2xl p-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40 mb-6 flex items-center gap-2">
              <Shield className="w-3 h-3" /> Security
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-black dark:text-white">Maintenance Mode</p>
                  <p className="text-[11px] text-black/50 dark:text-white/50">Restrict access to admins only</p>
                </div>
                <button 
                  onClick={() => toggleSetting('maintenanceMode')}
                  className={`w-10 h-6 rounded-full transition-colors relative ${settings.maintenanceMode ? 'bg-[#c97b6b]' : 'bg-black/20 dark:bg-white/20'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${settings.maintenanceMode ? 'left-5' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-black dark:text-white">Allow New Signups</p>
                  <p className="text-[11px] text-black/50 dark:text-white/50">Users can register accounts</p>
                </div>
                <button 
                  onClick={() => toggleSetting('allowSignups')}
                  className={`w-10 h-6 rounded-full transition-colors relative ${settings.allowSignups ? 'bg-[#c97b6b]' : 'bg-black/20 dark:bg-white/20'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${settings.allowSignups ? 'left-5' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* General Settings */}
        <div className="space-y-4">
          <div className="bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-2xl p-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40 mb-6 flex items-center gap-2">
              <Globe className="w-3 h-3" /> General
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-black dark:text-white">Public Library</p>
                  <p className="text-[11px] text-black/50 dark:text-white/50">Guests can view catalog</p>
                </div>
                <button 
                  onClick={() => toggleSetting('publicLibrary')}
                  className={`w-10 h-6 rounded-full transition-colors relative ${settings.publicLibrary ? 'bg-[#c97b6b]' : 'bg-black/20 dark:bg-white/20'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${settings.publicLibrary ? 'left-5' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-black dark:text-white">System Emails</p>
                  <p className="text-[11px] text-black/50 dark:text-white/50">Send automated notifications</p>
                </div>
                <button 
                  onClick={() => toggleSetting('emailNotifications')}
                  className={`w-10 h-6 rounded-full transition-colors relative ${settings.emailNotifications ? 'bg-[#c97b6b]' : 'bg-black/20 dark:bg-white/20'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${settings.emailNotifications ? 'left-5' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="mt-8 p-6 bg-red-500/5 border border-red-500/20 rounded-2xl">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-4 flex items-center gap-2">
          <Database className="w-3 h-3" /> Danger Zone
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-black dark:text-white">Purge System Caches</p>
            <p className="text-[11px] text-black/50 dark:text-white/50">Forces a complete rebuild of analytics data</p>
          </div>
          <button className="px-4 py-2 border border-red-500/20 text-red-500 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-500/10 transition-colors">
            Purge Cache
          </button>
        </div>
      </div>

    </div>
  );
};

export default SystemSettingsView;

