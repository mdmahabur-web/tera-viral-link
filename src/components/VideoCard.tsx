import React, { useState } from 'react';
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

export const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const [imageError, setImageError] = useState(false);
  const [bookmarked, setBookmarked] = useState(() => isBookmarked(video.id));

  // Determine the authentic TeraBox destination URL
  const targetUrl = (
    video.source_url ||
    video.sourceUrl ||
    video.playerWebsiteUrl ||
    video.player_url ||
    video.link ||
    video.url ||
    ''
  ).trim();

  const handleCardClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!targetUrl) {
      e.preventDefault();
      return;
    }

    // 1. Record in recently viewed for user's library
    addRecentlyViewed(video);

    // 2. Throttled view count increment in Firestore (at most once every 15 mins per video per browser)
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

    // Allow default anchor navigation so browser naturally follows targetUrl in the same tab,
    // ensuring the device/browser's Back button seamlessly returns directly to this web app!
  };

  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = toggleBookmark(video);
    setBookmarked(newState);
  };

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
      href={targetUrl || '#'}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleCardClick}
      className="group relative flex flex-col bg-gradient-to-b from-[#131622] via-[#0f111a] to-[#090b10] border border-slate-800/80 hover:border-amber-500/50 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 transform hover:-translate-y-1.5 active:scale-[0.98] shadow-lg hover:shadow-2xl hover:shadow-amber-500/10 select-none text-left"
      title={`Watch "${video.title}" on TeraBox (Opens in new tab)`}
    >
      {/* Top subtle highlight sheen on hover */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none" />

      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-[#0a0c13]">
        {!imageError && video.thumbnailUrl?.trim() ? (
          <img
            src={video.thumbnailUrl.trim()}
            alt={video.title}
            loading="lazy"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-[#131620] to-[#0d0f17] text-slate-500">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              {video.category || 'Tera Viral'}
            </span>
          </div>
        )}

        {/* Ambient Dark Gradient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090b10] via-transparent to-black/35 pointer-events-none" />

        {/* Play Overlay with Glowing Pulse Animation */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-amber-500/90 group-hover:bg-amber-400 text-black flex items-center justify-center shadow-xl shadow-amber-500/30 transform scale-90 sm:scale-75 group-hover:scale-105 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out">
            <Play className="w-6 h-6 fill-black translate-x-0.5" />
          </div>
        </div>

        {/* Top Badges */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-auto">
          {/* Quality Badge */}
          {video.quality ? (
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-black tracking-wider uppercase bg-black/85 text-amber-400 border border-amber-500/40 backdrop-blur-md shadow-md">
              {video.quality}
            </span>
          ) : (
            <span />
          )}

          {/* Bookmark Quick Toggle Button */}
          <button
            type="button"
            onClick={handleBookmarkToggle}
            className={`p-1.5 rounded-lg backdrop-blur-md border transition-all duration-200 cursor-pointer ${
              bookmarked
                ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-black/60 hover:bg-black/80 text-white/80 hover:text-amber-400 border-white/10'
            }`}
            title={bookmarked ? 'Saved to Library' : 'Save Link'}
            aria-label="Bookmark video"
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-black' : ''}`} />
          </button>
        </div>

        {/* Bottom Badges */}
        <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
          {/* Category Pill */}
          {video.category && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-200 bg-black/70 backdrop-blur-md border border-white/10 truncate max-w-[120px]">
              {video.category}
            </span>
          )}

          {/* Duration Badge */}
          {video.duration && (
            <span className="ml-auto px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wider bg-black/85 text-white backdrop-blur-md border border-white/15 shadow-sm font-mono flex items-center gap-1">
              <span>{video.duration}</span>
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
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
        <div className="flex items-center justify-between gap-2 text-xs text-slate-400 border-t border-slate-800/60 pt-2.5 font-medium">
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
            <span>Watch on TeraBox</span>
            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </a>
  );
};
