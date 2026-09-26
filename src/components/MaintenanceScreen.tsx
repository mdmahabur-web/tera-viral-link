import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, ShieldCheck, Flame } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const MaintenanceScreen: React.FC = () => {
  const { siteSettings } = useSettings();

  return (
    <div className="min-h-screen bg-[#08090d] flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="max-w-md w-full p-8 rounded-3xl bg-[#11131c] border border-slate-800 shadow-2xl flex flex-col items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <Wrench className="w-8 h-8 animate-pulse" />
        </div>

        <div className="flex items-center gap-2 text-slate-300">
          <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
          <span className="font-extrabold text-lg text-white">
            {siteSettings.appName || 'Tera Viral Link'}
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-white">
          Under Scheduled Maintenance
        </h1>

        <p className="text-sm text-slate-400 leading-relaxed">
          {siteSettings.maintenanceMessage ||
            'We are currently performing routine upgrades to improve your streaming experience. Please check back shortly.'}
        </p>

        <div className="pt-4 border-t border-slate-800 w-full flex items-center justify-center">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors py-2 px-4 rounded-xl hover:bg-slate-800/50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Administrator Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
