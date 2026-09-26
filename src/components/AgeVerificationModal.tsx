import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, ArrowRight, ExternalLink } from 'lucide-react';

const AGE_VERIFIED_KEY = 'ageVerified';
const ALT_AGE_VERIFIED_KEY = 'tvl_age_verified';

export const AgeVerificationModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    // Check if the user has already verified their age in a previous session
    try {
      const verified =
        localStorage.getItem(AGE_VERIFIED_KEY) === 'true' ||
        localStorage.getItem(ALT_AGE_VERIFIED_KEY) === 'true';

      if (!verified) {
        setIsOpen(true);
      }
    } catch {
      // In case localStorage is blocked in private browsing, show verification
      setIsOpen(true);
    }
  }, []);

  const handleConfirmAge = () => {
    try {
      localStorage.setItem(AGE_VERIFIED_KEY, 'true');
      localStorage.setItem(ALT_AGE_VERIFIED_KEY, 'true');
    } catch {
      // Ignore storage errors in restricted iframes
    }
    setIsOpen(false);
  };

  const handleDenyAge = () => {
    setAccessDenied(true);
    // Delay slightly so the user sees the Access Denied notification, then redirect
    setTimeout(() => {
      try {
        window.location.replace('https://www.google.com');
      } catch {
        window.location.href = 'https://www.google.com';
      }
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 selection:bg-amber-500 selection:text-black animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-verification-title"
    >
      <div className="relative w-full max-w-md bg-[#0f111a] border border-amber-500/30 rounded-3xl p-6 sm:p-8 text-center shadow-2xl shadow-black/80 space-y-6">
        {accessDenied ? (
          /* Access Denied Screen if user is under 18 */
          <div className="space-y-4 py-4 animate-in fade-in duration-150">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-rose-400 tracking-tight">
                Access Denied
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                You must be 18 years of age or older to enter this website. You are being redirected to Google...
              </p>
            </div>

            <div className="pt-2">
              <a
                href="https://www.google.com"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
              >
                <span>Leave to Google immediately</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ) : (
          /* Age Verification Notice */
          <>
            {/* 18+ Warning Badge */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
                <span className="text-2xl font-black text-amber-400 font-mono tracking-tighter">
                  18+
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[11px] font-bold uppercase tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Age Verification Required</span>
              </div>
            </div>

            {/* English Explanatory Text */}
            <div className="space-y-2">
              <h2
                id="age-verification-title"
                className="text-xl sm:text-2xl font-black text-white tracking-tight"
              >
                Adults Only Content (18+)
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                This website contains age-restricted video links and media intended solely for adults aged 18 years and older.
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                By entering, you certify that you are at least 18 years old or the legal age of majority in your jurisdiction.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleConfirmAge}
                className="w-full py-3.5 px-5 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-black font-black text-sm tracking-wide shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer pointer-events-auto touch-manipulation"
              >
                <span>I am 18 or Older</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleDenyAge}
                className="w-full py-3 px-5 rounded-2xl bg-[#161926] hover:bg-rose-500/15 border border-slate-800 hover:border-rose-500/40 active:scale-[0.99] text-slate-400 hover:text-rose-300 font-bold text-xs tracking-wide transition-all cursor-pointer pointer-events-auto touch-manipulation"
              >
                <span>I am Under 18</span>
              </button>
            </div>

            {/* Notice Footer */}
            <p className="text-[10px] text-slate-600">
              Your confirmation will be remembered on this browser.
            </p>
          </>
        )}
      </div>
    </div>
  );
};
