import React from 'react';

interface AdBannerProps {
  enabled: boolean;
  htmlContent: string;
  position: 'top' | 'bottom';
}

export const AdBanner: React.FC<AdBannerProps> = ({
  enabled,
  htmlContent,
  position,
}) => {
  if (!enabled) return null;

  return (
    <aside
      className={`w-full max-w-5xl mx-auto px-2 sm:px-4 ${
        position === 'top' ? 'mb-4' : 'mt-4'
      }`}
      aria-label={`Advertisement ${position}`}
    >
      <div className="relative w-full overflow-hidden rounded-2xl bg-[#0f121b] border border-slate-800/80 p-2 sm:p-3 min-h-[60px] flex items-center justify-center transition-all shadow-sm">
        {/* Ad badge tag */}
        <div className="absolute top-1 right-2 pointer-events-none">
          <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold bg-black/60 px-1.5 py-0.5 rounded">
            Ad
          </span>
        </div>

        {htmlContent ? (
          <div
            className="w-full flex items-center justify-center [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        ) : (
          <div className="text-center py-2 text-xs text-slate-500 font-medium">
            <span>Advertisement Space</span>
          </div>
        )}
      </div>
    </aside>
  );
};
