import React from 'react';
import { NavLink } from 'react-router-dom';
import { Flame, Sparkles, Trophy, Clock } from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  const navItems = [
    { to: '/trending', label: 'Trending', icon: Flame },
    { to: '/for-you', label: 'For You', icon: Sparkles },
    { to: '/popular', label: 'Popular', icon: Trophy },
    { to: '/latest', label: 'Latest', icon: Clock },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0d0f17]/95 backdrop-blur-lg border-t border-slate-800/90 safe-bottom"
      aria-label="Main Navigation"
    >
      <div className="grid grid-cols-4 h-16 items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-xl transition-all duration-200 select-none ${
                  isActive
                    ? 'text-amber-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200 font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
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
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
