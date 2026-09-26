import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, X, Flame, Bookmark, ShieldCheck } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onOpenWatchlist?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenWatchlist }) => {
  const { siteSettings } = useSettings();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0b0c12]/95 backdrop-blur-md border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand / Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg p-1"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Flame className="w-5 h-5 text-black fill-black" />
          </div>
          <span className="font-extrabold text-base sm:text-lg tracking-tight text-white group-hover:text-amber-400 transition-colors">
            {siteSettings.appName || 'Tera Viral Link'}
          </span>
        </Link>

        {/* Desktop Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search viral video titles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#131622] hover:bg-[#161a29] focus:bg-[#161a29] text-sm text-slate-100 placeholder-slate-400 pl-10 pr-4 py-2 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile Search Button */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors"
            aria-label="Toggle search"
          >
            {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>

          {/* Bookmarks / Watchlist modal toggle */}
          {onOpenWatchlist && (
            <button
              onClick={onOpenWatchlist}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-amber-400 hover:bg-slate-800/60 rounded-xl transition-colors border border-transparent hover:border-slate-700/60"
              title="Saved Watchlist & Recents"
            >
              <Bookmark className="w-4 h-4" />
              <span className="hidden sm:inline">Watchlist</span>
            </button>
          )}

          {/* Admin Panel Link */}
          <Link
            to={isAdmin ? '/admin' : '/admin/login'}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl transition-all border ${
              location.pathname.startsWith('/admin')
                ? 'bg-amber-500 text-black border-amber-400 font-bold'
                : 'text-slate-400 hover:text-amber-400 bg-slate-900/80 hover:bg-slate-800 border-slate-800'
            }`}
            title="Admin Console"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin</span>
          </Link>
        </div>
      </div>

      {/* Mobile Search Dropdown Bar */}
      {searchOpen && (
        <div className="md:hidden px-3 py-2.5 bg-[#0e1018] border-t border-slate-800 animate-in slide-in-from-top duration-200">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search viral video titles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              className="w-full bg-[#161a29] text-sm text-slate-100 placeholder-slate-400 pl-10 pr-10 py-2 rounded-xl border border-amber-500/50 focus:border-amber-400 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>
      )}
    </header>
  );
};
