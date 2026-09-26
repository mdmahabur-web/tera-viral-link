import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Wrench, AlertTriangle, Save, Check } from 'lucide-react';

export const AdminMaintenance: React.FC = () => {
  const { siteSettings, updateSiteSettings } = useSettings();

  const [mode, setMode] = useState(siteSettings.maintenanceMode || false);
  const [message, setMessage] = useState(
    siteSettings.maintenanceMessage ||
      'Tera Viral Link is currently undergoing scheduled maintenance. Please check back shortly.'
  );

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      await updateSiteSettings({
        maintenanceMode: mode,
        maintenanceMessage: message.trim(),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving maintenance settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white">Maintenance Mode</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Temporarily restrict public access during database upgrades or server updates.
          </p>
        </div>

        {success && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-semibold">
            <Check className="w-4 h-4" />
            <span>Maintenance status updated!</span>
          </div>
        )}
      </div>

      {mode && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold text-white block">Maintenance Mode is ACTIVE:</strong>
            Public visitors cannot browse video discovery feeds. As an authorized administrator, your session remains fully functional.
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-[#11131c] border border-slate-800 rounded-2xl p-6 space-y-6 text-xs">
        {/* Toggle switch */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-[#161a28] border border-slate-800">
          <div className="space-y-0.5">
            <label className="text-sm font-bold text-white block">
              Enable Public Maintenance Mode
            </label>
            <p className="text-slate-400 text-xs">
              When switched on, public visitors are shown the maintenance screen.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={mode}
              onChange={(e) => setMode(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
          </label>
        </div>

        {/* Message */}
        <div>
          <label className="block text-slate-300 font-semibold mb-1.5">
            Public Maintenance Notice Message
          </label>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-[#161a28] border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Maintenance State'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
