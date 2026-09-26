import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { useVideos, useCategories } from '../hooks/useVideos';
import { VideoGrid } from '../components/VideoGrid';
import { CategoryBar } from '../components/CategoryBar';
import { FeedTab } from '../types';
import { Flame, Sparkles, Trophy, Clock } from 'lucide-react';

interface HomePageProps {
  initialTab?: FeedTab;
}

export const HomePage: React.FC<HomePageProps> = ({ initialTab = 'trending' }) => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const categoryParam = searchParams.get('category') || 'all';

  // Determine initial tab from pathname or prop
  const getTabFromPathname = (path: string): FeedTab => {
    const cleanPath = path.replace(/^\//, '');
    if (cleanPath === 'for-you') return 'for-you';
    if (cleanPath === 'popular') return 'popular';
    if (cleanPath === 'latest') return 'latest';
    if (cleanPath === 'trending' || cleanPath === '') return 'trending';
    return initialTab;
  };

  const [activeTab, setActiveTab] = useState<FeedTab>(() => getTabFromPathname(location.pathname));
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);

  // Sync activeTab whenever route pathname or initialTab changes
  useEffect(() => {
    const tabFromPath = getTabFromPathname(location.pathname);
    if (tabFromPath !== activeTab) {
      setActiveTab(tabFromPath);
    }
  }, [location.pathname, initialTab]);

  const { categories } = useCategories();
  const { videos, loading, hasMore, loadMore } = useVideos(activeTab, selectedCategory);

  const tabConfigs: { id: FeedTab; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
    { id: 'trending', label: 'Trending', icon: Flame, desc: 'Most viral and hottest links right now' },
    { id: 'for-you', label: 'For You', icon: Sparkles, desc: 'Recommended selections based on category' },
    { id: 'popular', label: 'Popular', icon: Trophy, desc: 'All-time most viewed link records' },
    { id: 'latest', label: 'Latest', icon: Clock, desc: 'Freshly indexed link submissions' },
  ];

  const currentTabConfig = tabConfigs.find((t) => t.id === activeTab) || tabConfigs[0];
  const Icon = currentTabConfig.icon;

  const handleTabChange = useCallback((newTab: FeedTab) => {
    setActiveTab(newTab);
    const targetRoute = newTab === 'trending' ? '/' : `/${newTab}`;
    if (location.pathname !== targetRoute) {
      navigate(targetRoute);
    }
  }, [location.pathname, navigate]);

  const handleSelectCategory = useCallback((cat: string) => {
    setSelectedCategory(cat);
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6">
      {/* Feed Selection Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{currentTabConfig.label}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {videos.length} Links
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">{currentTabConfig.desc}</p>
          </div>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden sm:flex items-center gap-1.5 p-1 rounded-2xl bg-[#11131c] border border-slate-800/80">
          {tabConfigs.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-black shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <TabIcon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile Quick Tab Strip */}
        <div className="flex sm:hidden items-center gap-1 overflow-x-auto no-scrollbar pb-1">
          {tabConfigs.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all cursor-pointer pointer-events-auto touch-manipulation ${
                  isActive
                    ? 'bg-amber-500 text-black font-bold shadow-sm'
                    : 'bg-[#121520] border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <TabIcon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Horizontal Filter Bar */}
      <div className="w-full">
        <CategoryBar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />
      </div>

      {/* Video Grid */}
      <VideoGrid
        videos={videos}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={loadMore}
        emptyTitle={`No ${currentTabConfig.label.toLowerCase()} videos found`}
        emptySubtitle={
          selectedCategory !== 'all'
            ? `There are no published videos in category "${selectedCategory}".`
            : 'Check back soon for new link updates.'
        }
      />
    </div>
  );
};
