import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Sliders, Save, Check } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { siteSettings, updateSiteSettings } = useSettings();

  const [appName, setAppName] = useState(siteSettings.appName || 'Tera Viral Link');
  const [logoUrl, setLogoUrl] = useState(siteSettings.logoUrl || '');
  const [footerText, setFooterText] = useState(siteSettings.footerText || '');
  const [contactEmail, setContactEmail] = useState(siteSettings.contactEmail || '');
  const [contactNotice, setContactNotice] = useState(siteSettings.contactNotice || '');

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      await updateSiteSettings({
        appName: appName.trim(),
        logoUrl: logoUrl.trim(),
        footerText: footerText.trim(),
        contactEmail: contactEmail.trim(),
        contactNotice: contactNotice.trim(),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating site settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white">Site Settings</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure application branding, logo image, copyright notices, and contact information.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-semibold">
            <Check className="w-4 h-4" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-[#11131c] border border-slate-800 rounded-2xl p-6 space-y-5 text-xs">
        <div>
          <label className="block text-slate-300 font-semibold mb-1">
            Application Brand Name
          </label>
          <input
            type="text"
            required
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            className="w-full bg-[#161a28] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">
            Custom Logo Image URL (Optional)
          </label>
          <input
            type="url"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://... or leave empty to use default flame icon"
            className="w-full bg-[#161a28] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">
            Footer Copyright Text
          </label>
          <input
            type="text"
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            className="w-full bg-[#161a28] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">
            Contact & DMCA Email Address
          </label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="w-full bg-[#161a28] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">
            Contact Page Guidance Notice
          </label>
          <textarea
            rows={3}
            value={contactNotice}
            onChange={(e) => setContactNotice(e.target.value)}
            className="w-full bg-[#161a28] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
