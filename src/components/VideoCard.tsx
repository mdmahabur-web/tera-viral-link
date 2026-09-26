import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Video } from '../types';
import {
  Eye,
  HardDrive,
  Calendar,
  Play,
  ExternalLink,
  Bookmark,
  Sparkles,
} from 'lucide-react';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { addRecentlyViewed, isBookmarked, toggleBookmark } from '../lib/userStorage';

interface VideoCardProps {
  video: Video;
}

const VideoCardComponent: React.FC<VideoCardProps> = ({ video }) => {
  const [imageError, setImageError] = useState(false);
  const [bookmarked, setBookmarked] = useState(() => isBookmarked(video.id));
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLAnchorElement | null>(null);

  // Intersection Observer: Only render rich media (images/video decoding) when near or in viewport
  useEffect(() => {
    const element = cardRef.current;
    if (!element) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        },
        {
          rootMargin: '250px 0px', // Preload smoothly 250px ahead of scroll
          threshold: 0.01,
        }
      );

      observer.observe(element);
      return () => {
        observer.disconnect();
      };
    } else {
      setIsVisible(true);
    }
  }, []);

  // Determine the authentic destination URL
  const targetUrl = (
    video.source_url ||
    video.sourceUrl ||
    video.playerWebsiteUrl ||
    video.player_url ||
    video.link ||
    video.url ||
    ''
  ).trim();

  // Memoized card click handler
  const handleCardClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!targetUrl) {
        e.preventDefault();
        return;
      }

      // Record in recently viewed for user's library
      addRecentlyViewed(video);

      // Throttled view count increment in Firestore (at most once every 15 mins per video per browser)
      try {
        const viewKey = `tvl_view_${video.id}`;
        const lastView = localStorage.getItem(viewKey);
        const now = Date.now();
        const fifteenMinutes = 15 * 60 * 1000;

        if (!lastView || now - parseInt(lastView, 10) > fifteenMinutes) {
          localStorage.setItem(viewKey, now.toString());
          updateDoc(doc(db, 'videos', video.id), {
            views: increment(1),
          }).catch(() => {});
        }
      } catch {}
    },
    [targetUrl, video]
  );

  // Memoized bookmark toggle handler
  const handleBookmarkToggle = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const newState = toggleBookmark(video);
      setBookmarked(newState);
    },
    [video]
  );

  const formatViews = (count: number): string => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return `${count}`;
  };

  const formatTimeAgo = (timestamp: number): string => {
    if (!timestamp) return 'Recent';
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    return `${Math.floor(months / 12)}y ago`;
  };

  return (
    <a
      ref={cardRef}
      href={targetUrl || '#'}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleCardClick}
      style={{
        contain: 'content',
        isolation: 'isolate',
        transform: 'translateZ(0)',
        willChange: 'transform',
      }}
      className="gpu-card-contained group relative flex flex-col bg-[#0f111a] border border-slate-800/80 hover:border-amber-500/70 rounded-2xl overflow-hidden cursor-pointer select-none text-left transition-colors duration-200 shadow-md"
      title={`Watch "${video.title}" on TeraBox (Opens in new tab)`}
    >
      {/* Thumbnail / Media Container with strict aspect ratio */}
      <div className="relative aspect-video w-full overflow-hidden bg-[#08090f] z-0">
        {isVisible ? (
          !imageError && video.thumbnailUrl?.trim() ? (
            <img
              src={video.thumbnailUrl.trim()}
              alt={video.title}
              loading="lazy"
              decoding="async"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#111420] text-slate-500">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                {video.category || 'TeraBox Video'}
              </span>
            </div>
          )
        ) : (
          /* Lightweight skeleton poster while off-screen (prevents DOM layout shifts & avoids GPU decode pressure) */
          <div className="w-full h-full bg-[#121522] flex items-center justify-center">
            <span className="text-[10px] text-slate-600 font-mono">Loading...</span>
          </div>
        )}

        {/* Ambient Dark Gradient (Solid GPU-friendly gradient without blurs) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f111a] via-transparent to-black/40 pointer-events-none z-10" />

        {/* Play Overlay (Rendered with clean CSS without heavy blur filters) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-lg transform group-hover:scale-110 opacity-85 sm:opacity-0 group-hover:opacity-100 transition-all duration-200">
            <Play className="w-5 h-5 fill-black translate-x-0.5" />
          </div>
        </div>

        {/* Top Badges (Solid high-contrast backgrounds - zero backdrop-blur to protect GPU) */}
        <div className="absolute top-2 inset-x-2 flex items-center justify-between pointer-events-auto z-20">
          {/* Quality Badge */}
          {video.quality ? (
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-black tracking-wider uppercase bg-[#08090f]/95 text-amber-400 border border-amber-500/40 shadow-sm font-mono">
              {video.quality}
            </span>
          ) : (
            <span />
          )}

          {/* Bookmark Quick Toggle Button */}
          <button
            type="button"
            onClick={handleBookmarkToggle}
            className={`p-1.5 rounded-lg border transition-colors duration-150 cursor-pointer ${
              bookmarked
                ? 'bg-amber-500 text-black border-amber-400 shadow-sm'
                : 'bg-[#08090f]/90 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border-slate-700/80'
            }`}
            title={bookmarked ? 'Saved to Library' : 'Save Link'}
            aria-label="Bookmark video"
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-black' : ''}`} />
          </button>
        </div>

        {/* Bottom Badges */}
        <div className="absolute bottom-2 inset-x-2 flex items-center justify-between pointer-events-none z-20">
          {/* Category Pill */}
          {video.category && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-200 bg-[#08090f]/90 border border-slate-700/70 truncate max-w-[120px]">
              {video.category}
            </span>
          )}

          {/* Duration Badge */}
          {video.duration && (
            <span className="ml-auto px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wider bg-[#08090f]/95 text-white border border-slate-700/80 shadow-sm font-mono">
              {video.duration}
            </span>
          )}
        </div>
      </div>

      {/* Card Content Footer */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-3 bg-[#0f111a] z-10">
        {/* Title */}
        <div className="space-y-1">
          {video.featured && (
            <div className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-0.5">
              <Sparkles className="w-3 h-3" />
              <span>Featured</span>
            </div>
          )}
          <h3 className="text-sm sm:text-[15px] font-bold text-slate-100 group-hover:text-amber-400 transition-colors duration-200 line-clamp-2 leading-snug">
            {video.title}
          </h3>
        </div>

        {/* Bottom Stats & CTA */}
        <div className="flex items-center justify-between gap-2 text-xs text-slate-400 border-t border-slate-800/80 pt-2.5 font-medium">
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <div className="flex items-center gap-1 text-slate-300">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatViews(video.views)}</span>
            </div>

            {video.fileSize && (
              <div className="flex items-center gap-1">
                <HardDrive className="w-3 h-3 text-slate-500" />
                <span>{video.fileSize}</span>
              </div>
            )}

            <div className="hidden xs:flex items-center gap-1 text-slate-500">
              <Calendar className="w-3 h-3 text-slate-600" />
              <span>{formatTimeAgo(video.createdAt)}</span>
            </div>
          </div>

          {/* Watch Indicator */}
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400 group-hover:text-amber-300 transition-colors shrink-0">
            <span>Watch</span>
            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </a>
  );
};

// Memoize VideoCard to eliminate unnecessary re-renders while scrolling the feed
export const VideoCard = memo(VideoCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.video.id === nextProps.video.id &&
    prevProps.video.views === nextProps.video.views &&
    prevProps.video.thumbnailUrl === nextProps.video.thumbnailUrl &&
    prevProps.video.title === nextProps.video.title &&
    prevProps.video.featured === nextProps.video.featured
  );
});
