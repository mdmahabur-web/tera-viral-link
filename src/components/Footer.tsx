import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { Flame } from 'lucide-react';

export const Footer: React.FC = () => {
  const { siteSettings } = useSettings();

  return (
    <footer className="w-full bg-[#090b10] border-t border-slate-900/90 text-slate-400 py-8 px-4 sm:px-6 mb-16 md:mb-0 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
            <Flame className="w-4 h-4 text-black fill-black" />
          </div>
          <span className="font-bold text-sm tracking-tight text-white">
            {siteSettings.appName || 'Tera Viral Link'}
          </span>
        </div>

        {/* Legal Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-400">
          <Link to="/privacy" className="hover:text-amber-400 transition-colors">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-amber-400 transition-colors">
            Terms of Service
          </Link>
          <Link to="/disclaimer" className="hover:text-amber-400 transition-colors">
            Disclaimer
          </Link>
          <Link to="/contact" className="hover:text-amber-400 transition-colors">
            Contact Us
          </Link>
        </div>

        {/* Copyright */}
        <p className="text-xs text-slate-400 text-center md:text-right">
          {siteSettings.footerText || '© 2026 Tera Viral Link. All rights reserved.'}
        </p>
      </div>
    </footer>
  );
};
