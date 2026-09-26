import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Megaphone, Save, Check, Eye, Code, Sparkles } from 'lucide-react';

export const AdminAds: React.FC = () => {
  const { adSettings, updateAdSettings } = useSettings();

  const [topEnabled, setTopEnabled] = useState(adSettings.topBannerEnabled);
  const [topHtml, setTopHtml] = useState(adSettings.topBannerHtml);

  const [bottomEnabled, setBottomEnabled] = useState(adSettings.bottomBannerEnabled);
  const [bottomHtml, setBottomHtml] = useState(adSettings.bottomBannerHtml);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      await updateAdSettings({
        topBannerEnabled: topEnabled,
        topBannerHtml: topHtml,
        bottomBannerEnabled: bottomEnabled,
        bottomBannerHtml: bottomHtml,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update ads:', err);
    } finally {
      setSaving(false);
    }
  };

  const loadSampleTopBanner = () => {
    setTopHtml(
      '<div class="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border border-amber-500/30 text-amber-300 text-center text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-inner"><span class="px-1.5 py-0.5 rounded bg-amber-500/20 text-[10px] uppercase tracking-wider font-bold">Sponsored</span> High Speed Cloud Player & Download Accelerator • Get Premium Access</div>'
    );
  };

  const loadSampleBottomBanner = () => {
    setBottomHtml(
      '<div class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500/10 via-blue-500/20 to-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-center text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-inner"><span class="px-1.5 py-0.5 rounded bg-cyan-500/20 text-[10px] uppercase tracking-wider font-bold">Recommended</span> Stream in 4K Ultra HD With Unlimited Bandwidth • Instant Link Vault</div>'
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white">Advertisement Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure dynamic Top Banner and Bottom Banner placements on all video Details Pages.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-semibold">
            <Check className="w-4 h-4" />
            <span>Ad configuration saved!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Top Banner Configuration */}
        <div className="bg-[#11131c] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <Megaphone className="w-5 h-5 text-amber-400" />
              <div>
                <h2 className="text-sm font-bold text-white">Top Banner Ad Slot</h2>
                <p className="text-[11px] text-slate-400">Positioned immediately above the External Player Website</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={loadSampleTopBanner}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 underline"
              >
                <Sparkles className="w-3 h-3" />
                <span>Reset to Sample Preset</span>
              </button>

              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-200">
                <input
                  type="checkbox"
                  checked={topEnabled}
                  onChange={(e) => setTopEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-slate-700"
                />
                <span>Enable Slot</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-slate-400" />
              <span>HTML / Responsive Banner Code</span>
            </label>
            <textarea
              rows={4}
              value={topHtml}
              onChange={(e) => setTopHtml(e.target.value)}
              placeholder="<div>Paste responsive banner HTML or embed code here</div>"
              className="w-full bg-[#161a28] border border-slate-800 rounded-xl p-3 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Live Preview Container */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>Live Visual Preview</span>
            </span>
            <div className="p-3 rounded-xl bg-[#090b10] border border-slate-800/80 min-h-[60px] flex items-center justify-center">
              {topEnabled ? (
                topHtml ? (
                  <div
                    className="w-full flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: topHtml }}
                  />
                ) : (
                  <span className="text-xs text-slate-500">Slot enabled but no HTML provided</span>
                )
              ) : (
                <span className="text-xs text-slate-600">Slot is currently disabled</span>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Banner Configuration */}
        <div className="bg-[#11131c] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <Megaphone className="w-5 h-5 text-cyan-400" />
              <div>
                <h2 className="text-sm font-bold text-white">Bottom Banner Ad Slot</h2>
                <p className="text-[11px] text-slate-400">Positioned immediately below the External Player Website</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={loadSampleBottomBanner}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 underline"
              >
                <Sparkles className="w-3 h-3" />
                <span>Reset to Sample Preset</span>
              </button>

              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-200">
                <input
                  type="checkbox"
                  checked={bottomEnabled}
                  onChange={(e) => setBottomEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 bg-slate-900 border-slate-700"
                />
                <span>Enable Slot</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-slate-400" />
              <span>HTML / Responsive Banner Code</span>
            </label>
            <textarea
              rows={4}
              value={bottomHtml}
              onChange={(e) => setBottomHtml(e.target.value)}
              placeholder="<div>Paste responsive banner HTML or embed code here</div>"
              className="w-full bg-[#161a28] border border-slate-800 rounded-xl p-3 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Live Preview Container */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>Live Visual Preview</span>
            </span>
            <div className="p-3 rounded-xl bg-[#090b10] border border-slate-800/80 min-h-[60px] flex items-center justify-center">
              {bottomEnabled ? (
                bottomHtml ? (
                  <div
                    className="w-full flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: bottomHtml }}
                  />
                ) : (
                  <span className="text-xs text-slate-500">Slot enabled but no HTML provided</span>
                )
              ) : (
                <span className="text-xs text-slate-600">Slot is currently disabled</span>
              )}
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-xl shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Ad Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
