import React, { useState, useEffect } from 'react';
import { X, Bookmark, History, Trash2, ExternalLink } from 'lucide-react';
import { getBookmarks, getRecentlyViewed, StoredVideoSummary } from '../lib/userStorage';

interface WatchlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WatchlistModal: React.FC<WatchlistModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'recents'>('bookmarks');
  const [bookmarks, setBookmarks] = useState<StoredVideoSummary[]>([]);
  const [recents, setRecents] = useState<StoredVideoSummary[]>([]);

  useEffect(() => {
    if (isOpen) {
      setBookmarks(getBookmarks());
      setRecents(getRecentlyViewed());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClear = () => {
    if (activeTab === 'bookmarks') {
      localStorage.removeItem('tvl_bookmarks');
      setBookmarks([]);
    } else if (activeTab === 'recents') {
      localStorage.removeItem('tvl_recent_videos');
      setRecents([]);
    }
  };

  const currentList = activeTab === 'bookmarks' ? bookmarks : recents;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-[#11131c] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Your Saved Library</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1.5 bg-[#0b0c12] border-b border-slate-800">
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'bookmarks'
                ? 'bg-amber-500 text-black shadow font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved ({bookmarks.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('recents')}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'recents'
                ? 'bg-amber-500 text-black shadow font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History ({recents.length})</span>
          </button>
        </div>

        {/* List Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
          {currentList.length === 0 ? (
            <div className="text-center py-12 px-4 text-slate-400">
              <p className="text-sm font-medium">
                {activeTab === 'bookmarks'
                  ? 'No bookmarked videos yet. Click "Save" on any video card.'
                  : 'No recently viewed videos in this browser.'}
              </p>
            </div>
          ) : (
            currentList.map((item) => (
              <a
                key={item.id}
                href={item.targetUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onClose()}
                className="group flex items-center gap-3 p-2.5 rounded-xl bg-[#161924] hover:bg-[#1c202e] border border-slate-800/80 hover:border-amber-500/40 cursor-pointer transition-all duration-200 active:scale-[0.99]"
                title={`Open "${item.title}" on TeraBox (new tab)`}
              >
                {item.thumbnailUrl?.trim() ? (
                  <img
                    src={item.thumbnailUrl.trim()}
                    alt={item.title}
                    className="w-20 h-13 object-cover rounded-lg bg-slate-900 shrink-0 group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-20 h-13 rounded-lg bg-slate-900 shrink-0 flex items-center justify-center text-slate-600 text-[10px]">
                    No Img
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-amber-400 line-clamp-1 transition-colors">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                    <span className="text-amber-400 font-bold">{item.quality}</span>
                    <span>•</span>
                    <span>{item.duration}</span>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/60 group-hover:bg-amber-500 group-hover:text-black text-slate-400 transition-colors shrink-0">
                  <ExternalLink className="w-4 h-4" />
                </div>
              </a>
            ))
          )}
        </div>

        {/* Footer with Clear option */}
        {currentList.length > 0 && (
          <div className="p-3 border-t border-slate-800 flex justify-between items-center bg-[#0b0c12]">
            <span className="text-xs text-slate-400">Stored in your browser</span>
            <button
              onClick={handleClear}
              className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-medium py-1 px-2 rounded hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear {activeTab === 'bookmarks' ? 'Bookmarks' : 'History'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
