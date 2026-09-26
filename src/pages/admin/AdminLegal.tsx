import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Shield, AlertCircle, Mail, ExternalLink } from 'lucide-react';

export const AdminLegal: React.FC = () => {
  const pages = [
    {
      title: 'Privacy Policy',
      path: '/privacy',
      desc: 'Explains visitor privacy, localStorage bookmarks, and external player policies.',
      icon: Shield,
    },
    {
      title: 'Terms of Service',
      path: '/terms',
      desc: 'Outlines terms for using Tera Viral Link discovery and external redirection.',
      icon: FileText,
    },
    {
      title: 'DMCA & Content Disclaimer',
      path: '/disclaimer',
      desc: 'Explicit disclaimer clarifying that this platform does not host, upload, or encode media files.',
      icon: AlertCircle,
    },
    {
      title: 'Contact & Support',
      path: '/contact',
      desc: 'Contact submission interface and guidance notice for users and copyright holders.',
      icon: Mail,
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-black text-white">Legal & Compliance Pages</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Public legal disclosures and compliance documentation.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {pages.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.path}
              className="bg-[#11131c] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className="text-base font-bold text-white">{p.title}</h2>
                <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <Link
                  to={p.path}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300"
                >
                  <span>Preview Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
