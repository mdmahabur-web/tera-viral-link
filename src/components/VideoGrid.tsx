import React from 'react';
import { Video } from '../types';
import { VideoCard } from './VideoCard';
import { Film, RefreshCw } from 'lucide-react';

interface VideoGridProps {
  videos: Video[];
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  emptyTitle?: string;
  emptySubtitle?: string;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  videos,
  loading = false,
  hasMore = false,
  onLoadMore,
  emptyTitle = 'No videos found',
  emptySubtitle = 'There are no videos matching this criteria right now.',
}) => {
  if (loading && videos.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="flex flex-col bg-[#11131a] rounded-2xl overflow-hidden border border-slate-800/60 animate-pulse"
          >
            <div className="aspect-video w-full bg-[#171a25]" />
            <div className="p-3.5 space-y-3">
              <div className="h-4 bg-[#1e2333] rounded w-5/6" />
              <div className="h-3 bg-[#1e2333] rounded w-3/5" />
              <div className="pt-2 border-t border-slate-800/40 flex justify-between">
                <div className="h-3 bg-[#1e2333] rounded w-16" />
                <div className="h-3 bg-[#1e2333] rounded w-12" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="w-full py-16 px-4 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-4">
          <Film className="w-7 h-7" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-200">{emptyTitle}</h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-sm mt-1">{emptySubtitle}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>

      {hasMore && onLoadMore && (
        <div className="flex justify-center pt-4 pb-2">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#141824] hover:bg-[#1a2030] text-slate-200 hover:text-amber-400 font-semibold text-xs sm:text-sm border border-slate-800 hover:border-slate-700 transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                <span>Loading more...</span>
              </>
            ) : (
              <span>Load More Videos</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
