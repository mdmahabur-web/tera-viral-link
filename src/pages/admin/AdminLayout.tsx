import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import {
  LayoutDashboard,
  Film,
  Tags,
  BarChart3,
  Megaphone,
  Sliders,
  ShieldCheck,
  KeyRound,
  Download,
  Wrench,
  FileText,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Flame,
  ChevronRight,
  Link2,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, isAdmin, loading, logout } = useAuth();
  const { siteSettings } = useSettings();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { to: '/admin', end: true, label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/videos', end: false, label: 'Video Management', icon: Film },
    { to: '/admin/source-urls', end: false, label: 'Source URL', icon: Link2 },
    { to: '/admin/categories', end: false, label: 'Category Management', icon: Tags },
    { to: '/admin/analytics', end: false, label: 'Analytics', icon: BarChart3 },
    { to: '/admin/ads', end: false, label: 'Advertisement Management', icon: Megaphone },
    { to: '/admin/settings', end: false, label: 'Site Settings', icon: Sliders },
    { to: '/admin/api-settings', end: false, label: 'API setting', icon: KeyRound },
    { to: '/admin/security', end: false, label: 'Admin / Security', icon: ShieldCheck },
    { to: '/admin/backup', end: false, label: 'Backup / Export', icon: Download },
    { to: '/admin/maintenance', end: false, label: 'Maintenance Mode', icon: Wrench },
    { to: '/admin/legal', end: false, label: 'Legal Pages', icon: FileText },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090b10] flex items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Protected Route Check
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#08090d] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#11131c] border border-slate-800 rounded-2xl p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Admin Access Restricted</h2>
          <p className="text-xs text-slate-400">
            You must be logged in as an authorized administrator to access the Tera Viral Link control center.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              to="/admin/login"
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md transition-all"
            >
              Go to Admin Login
            </Link>
            <Link
              to="/"
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all"
            >
              Return to Public Site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090d] text-slate-200 flex flex-col lg:flex-row">
      {/* Mobile Header Bar */}
      <div className="lg:hidden sticky top-0 z-40 bg-[#0d0f17] border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
            <Flame className="w-4 h-4 text-black fill-black" />
          </div>
          <span className="font-bold text-sm text-white">Admin Console</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation (Desktop + Mobile Drawer) */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-30 h-screen w-64 bg-[#0d0f17] border-r border-slate-800/90 flex flex-col justify-between transition-transform duration-200 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto no-scrollbar">
          {/* Brand header */}
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center shadow-md shadow-amber-500/20">
                <Flame className="w-5 h-5 text-black fill-black" />
              </div>
              <div>
                <h2 className="font-extrabold text-sm text-white tracking-tight">
                  {siteSettings.appName || 'Tera Viral'}
                </h2>
                <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400">
                  Admin Console
                </span>
              </div>
            </div>
            {mobileMenuOpen && (
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick link to public discovery */}
          <div className="px-3 pt-3">
            <Link
              to="/"
              className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#141824] hover:bg-[#1a2030] text-xs font-semibold text-slate-300 hover:text-amber-400 border border-slate-800/80 transition-all group"
            >
              <span>View Public Site</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400" />
            </Link>
          </div>

          {/* Navigation Menu (All 11 items as required by Section 68) */}
          <nav className="p-3 space-y-1 flex-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                      isActive
                        ? 'bg-amber-500 text-black shadow-md font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#151824]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-black' : 'text-slate-400 group-hover:text-amber-400'
                        }`}
                      />
                      <span className="flex-1 truncate">{item.label}</span>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-black shrink-0" />}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* User & Logout section */}
          <div className="p-3 border-t border-slate-800/80 bg-[#090b10]">
            <div className="p-2 rounded-xl bg-[#131622] border border-slate-800 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs uppercase">
                  {user.email ? user.email[0] : 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-white truncate">{user.email}</p>
                  <p className="text-[10px] text-amber-400">Verified Administrator</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 text-xs font-semibold border border-rose-500/20 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
