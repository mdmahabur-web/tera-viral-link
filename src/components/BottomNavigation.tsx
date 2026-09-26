import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Flame, Sparkles, Trophy, Clock } from 'lucide-react';
import { FeedTab } from '../types';

interface BottomNavigationProps {
  currentTab?: FeedTab;
  onSelectTab?: (tab: FeedTab) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: { id: FeedTab; to: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'trending', to: '/trending', label: 'Trending', icon: Flame },
    { id: 'for-you', to: '/for-you', label: 'For You', icon: Sparkles },
    { id: 'popular', to: '/popular', label: 'Popular', icon: Trophy },
    { id: 'latest', to: '/latest', label: 'Latest', icon: Clock },
  ];

  // Resolve current active tab from prop or URL pathname
  const pathname = location.pathname;
  const resolvedTab: FeedTab = currentTab || (
    pathname === '/for-you'
      ? 'for-you'
      : pathname === '/popular'
      ? 'popular'
      : pathname === '/latest'
      ? 'latest'
      : 'trending'
  );

  const handleTabClick = (item: typeof navItems[0], e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (onSelectTab) {
      onSelectTab(item.id);
    }

    if (pathname !== item.to && !(item.id === 'trending' && pathname === '/')) {
      navigate(item.to);
    }

    // Smooth scroll to top of feed
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-auto bg-[#0d0f17]/95 backdrop-blur-lg border-t border-slate-800/90 safe-bottom select-none"
      aria-label="Main Navigation"
    >
      <div className="grid grid-cols-4 h-16 items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = resolvedTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={(e) => handleTabClick(item, e)}
              onTouchStart={(e) => {
                // Keep touch interaction responsive and prevent event swallowing
                e.stopPropagation();
              }}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-xl transition-all duration-200 select-none cursor-pointer pointer-events-auto touch-manipulation active:scale-95 ${
                isActive
                  ? 'text-amber-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <div
                className={`relative p-1 rounded-xl transition-all ${
                  isActive ? 'bg-amber-500/10' : ''
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 text-amber-400 fill-amber-400/20' : 'text-slate-400'
                  }`}
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
                )}
              </div>
              <span className="text-[11px] tracking-tight leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
