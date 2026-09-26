import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { Shield, FileText, AlertCircle, Mail, Send, CheckCircle } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  const { siteSettings } = useSettings();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 text-slate-300">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">Privacy Policy</h1>
          <p className="text-xs text-slate-400">Last updated: September 2026</p>
        </div>
      </div>

      <div className="space-y-4 text-sm leading-relaxed">
        <p>
          At <strong>{siteSettings.appName || 'Tera Viral Link'}</strong>, we prioritize the privacy and security of our visitors. This Privacy Policy documents the types of information collected and how we use it.
        </p>

        <h2 className="text-lg font-bold text-white pt-2">1. Information We Collect</h2>
        <p>
          We do not require users to create an account to browse videos, view discovery feeds, or access external player links. We utilize standard client-side browser storage (such as LocalStorage) to preserve your personal bookmarks and recently viewed video history locally on your device.
        </p>

        <h2 className="text-lg font-bold text-white pt-2">2. External Player Websites</h2>
        <p>
          Tera Viral Link is an index and discovery directory. Videos and streaming content are delivered via external player websites. When interacting with an external player, their respective privacy policies and terms of service apply.
        </p>

        <h2 className="text-lg font-bold text-white pt-2">3. Cookies and Advertising</h2>
        <p>
          Third-party advertisement vendors may serve banner advertisements that utilize cookies or web beacons to display relevant promotions. You can choose to disable cookies through your browser settings.
        </p>

        <h2 className="text-lg font-bold text-white pt-2">4. Contact Information</h2>
        <p>
          If you have questions regarding this Privacy Policy, please reach out to us at{' '}
          <span className="text-amber-400 font-mono">{siteSettings.contactEmail || 'contact@teravirallink.example'}</span>.
        </p>
      </div>
    </div>
  );
};

export const TermsPage: React.FC = () => {
  const { siteSettings } = useSettings();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 text-slate-300">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">Terms of Service</h1>
          <p className="text-xs text-slate-400">Effective Date: September 2026</p>
        </div>
      </div>

      <div className="space-y-4 text-sm leading-relaxed">
        <p>
          Welcome to <strong>{siteSettings.appName || 'Tera Viral Link'}</strong>. By accessing or using this website, you agree to be bound by these Terms of Service.
        </p>

        <h2 className="text-lg font-bold text-white pt-2">1. Use of the Platform</h2>
        <p>
          You agree to use this platform solely for personal and lawful purposes. You must not attempt to disrupt or interfere with the service, network operations, or security controls.
        </p>

        <h2 className="text-lg font-bold text-white pt-2">2. Disclaimer of Content</h2>
        <p>
          Tera Viral Link acts strictly as a discovery and indexing service for external video link locations. We do not host, store, or stream media files on our own servers. Content displayed inside external player embeds is the sole responsibility of the respective third-party hosting entities.
        </p>

        <h2 className="text-lg font-bold text-white pt-2">3. Limitation of Liability</h2>
        <p>
          Under no circumstances shall the operators of {siteSettings.appName || 'Tera Viral Link'} be liable for any indirect, consequential, or punitive damages arising from the use of links indexed on our platform.
        </p>
      </div>
    </div>
  );
};

export const DisclaimerPage: React.FC = () => {
  const { siteSettings } = useSettings();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 text-slate-300">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">DMCA & Content Disclaimer</h1>
          <p className="text-xs text-slate-400">Content Notice & Compliance</p>
        </div>
      </div>

      <div className="space-y-4 text-sm leading-relaxed">
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs sm:text-sm">
          <strong>Notice:</strong> {siteSettings.appName || 'Tera Viral Link'} does not host, upload, or encode any video media files. All video files are hosted by third-party services not affiliated with this website.
        </div>

        <p>
          All trademarks, registered trademarks, product names, and company names or logos appearing on the site are the property of their respective owners.
        </p>

        <h2 className="text-lg font-bold text-white pt-2">DMCA Copyright Infringement Claims</h2>
        <p>
          If you are a copyright owner or an agent thereof and believe that any link or content indexed on our site infringes upon your copyright, please contact our designated agent with detailed identification of the copyrighted work and the specific link URL. We respond promptly to valid takedown requests.
        </p>

        <p className="font-mono text-xs text-amber-400">
          Email: {siteSettings.contactEmail || 'dmca@teravirallink.example'}
        </p>
      </div>
    </div>
  );
};

export const ContactPage: React.FC = () => {
  const { siteSettings } = useSettings();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 text-slate-300">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
          <Mail className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">Contact Us</h1>
          <p className="text-xs text-slate-400">
            {siteSettings.contactNotice || 'Send questions, link reports, or partnership inquiries.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#11131c] border border-slate-800 space-y-2">
            <span className="text-slate-400 uppercase tracking-wider font-bold text-[10px]">
              Direct Contact
            </span>
            <p className="font-semibold text-white break-all">
              {siteSettings.contactEmail || 'contact@teravirallink.example'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#11131c] border border-slate-800 space-y-2">
            <span className="text-slate-400 uppercase tracking-wider font-bold text-[10px]">
              Response Time
            </span>
            <p className="text-slate-300">
              Inquiries are generally reviewed within 24 to 48 business hours.
            </p>
          </div>
        </div>

        <div className="md:col-span-2 bg-[#11131c] border border-slate-800 rounded-2xl p-6">
          {sent ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">Message Received</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Thank you for contacting Tera Viral Link. Your submission has been recorded.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#161a28] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Your Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#161a28] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  placeholder="you@domain.com"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-[#161a28] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  placeholder="Describe your inquiry or DMCA claim URL..."
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Message</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
      <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center font-black text-2xl font-mono">
        404
      </div>
      <h1 className="text-2xl font-black text-white">Page Not Found</h1>
      <p className="text-xs text-slate-400">
        The link you followed may be broken, or the page may have been removed.
      </p>
      <div className="pt-2">
        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
        >
          Go Back Home
        </a>
      </div>
    </div>
  );
};
