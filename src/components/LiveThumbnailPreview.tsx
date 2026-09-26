import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, ImageOff, CheckCircle2, RefreshCw } from 'lucide-react';

interface LiveThumbnailPreviewProps {
  url: string;
}

export const LiveThumbnailPreview: React.FC<LiveThumbnailPreviewProps> = ({ url }) => {
  const cleanUrl = url ? url.trim() : '';
  const [currentSrc, setCurrentSrc] = useState<string>(cleanUrl);
  const [loading, setLoading] = useState<boolean>(Boolean(cleanUrl));
  const [hasError, setHasError] = useState<boolean>(false);
  const [hasRetriedProxy, setHasRetriedProxy] = useState<boolean>(false);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  // Whenever url prop changes (typed, pasted ImgBB, or auto-fetched from TeraBox), reset and load
  useEffect(() => {
    if (!cleanUrl) {
      setCurrentSrc('');
      setLoading(false);
      setHasError(false);
      setHasRetriedProxy(false);
      setDimensions(null);
      return;
    }

    setCurrentSrc(cleanUrl);
    setLoading(true);
    setHasError(false);
    setHasRetriedProxy(false);
    setDimensions(null);
  }, [cleanUrl]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    setDimensions({
      width: target.naturalWidth,
      height: target.naturalHeight,
    });
    setLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    // If we haven't tried the image proxy yet and we have a valid URL, retry once via configured proxy
    if (!hasRetriedProxy && cleanUrl) {
      setHasRetriedProxy(true);
      setLoading(true);
      // Configured image proxy: wsrv.nl safely proxies images, strips referrers, and bypasses hotlinking blocks
      const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(cleanUrl)}`;
      setCurrentSrc(proxyUrl);
    } else {
      // Proxy also failed, or already retried - show placeholder to prevent infinite loops
      setLoading(false);
      setHasError(true);
    }
  };

  // If no URL entered yet
  if (!cleanUrl) {
    return (
      <div className="mt-2.5 p-4 rounded-xl bg-[#0b0d14] border border-dashed border-slate-800 flex flex-col items-center justify-center text-center text-slate-500 py-6">
        <ImageIcon className="w-7 h-7 mb-2 text-slate-700" />
        <span className="text-xs font-semibold text-slate-400">Live Thumbnail Preview</span>
        <span className="text-[11px] text-slate-600 mt-0.5">
          Enter or paste an image URL above (ImgBB or direct image link) to see live preview
        </span>
      </div>
    );
  }

  return (
    <div className="mt-2.5 p-3 rounded-2xl bg-[#0b0d14] border border-slate-800 space-y-2">
      {/* Header bar */}
      <div className="flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5 font-semibold text-slate-300">
          <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
          <span>Live Thumbnail Preview</span>
        </div>

        <div className="flex items-center gap-2">
          {loading && (
            <div className="flex items-center gap-1 text-[10px] text-amber-400">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>{hasRetriedProxy ? 'Retrying via proxy...' : 'Loading image...'}</span>
            </div>
          )}

          {!loading && !hasError && (
            <div className="flex items-center gap-1.5">
              {hasRetriedProxy && (
                <span className="px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-mono border border-cyan-500/30">
                  Via Proxy
                </span>
              )}
              {dimensions && (
                <span className="text-[10px] text-slate-500 font-mono">
                  {dimensions.width}×{dimensions.height}
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified</span>
              </span>
            </div>
          )}

          {hasError && (
            <span className="text-rose-400 text-[10px] font-semibold">
              Failed to load
            </span>
          )}
        </div>
      </div>

      {/* Preview container with fixed 16:9 ratio */}
      <div className="relative w-full aspect-video max-w-sm rounded-xl overflow-hidden bg-[#121522] border border-slate-800/80 flex items-center justify-center">
        {/* Loading placeholder skeleton */}
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0d0f17]/90 backdrop-blur-xs text-slate-400">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-2" />
            <span className="text-[11px] text-slate-400">
              {hasRetriedProxy ? 'Loading via image proxy...' : 'Loading preview...'}
            </span>
          </div>
        )}

        {/* Error placeholder */}
        {hasError ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-[#11131c]">
            <ImageOff className="w-8 h-8 text-rose-400 mb-1.5" />
            <span className="text-xs font-bold text-rose-300">Thumbnail Preview Unavailable</span>
            <span className="text-[10px] text-slate-500 mt-1 max-w-xs">
              The image URL failed to load directly and via fallback proxy. Please verify the URL is valid, direct, and publicly viewable.
            </span>
          </div>
        ) : currentSrc ? (
          <img
            src={currentSrc}
            alt="Live Thumbnail Preview"
            referrerPolicy="no-referrer"
            onLoad={handleImageLoad}
            onError={handleImageError}
            className={`w-full h-full object-cover transition-opacity duration-200 ${
              loading ? 'opacity-0' : 'opacity-100'
            }`}
          />
        ) : null}
      </div>

      <div className="text-[10px] text-slate-500 flex items-center justify-between">
        <span className="truncate max-w-[280px] sm:max-w-md font-mono" title={cleanUrl}>
          {cleanUrl}
        </span>
        <span className="shrink-0 text-slate-600">16:9 HD Display</span>
      </div>
    </div>
  );
};
