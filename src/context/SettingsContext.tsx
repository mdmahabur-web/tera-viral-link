import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { SiteSettings, AdSettings } from '../types';

interface SettingsContextType {
  siteSettings: SiteSettings;
  adSettings: AdSettings;
  loading: boolean;
  updateSiteSettings: (newSettings: Partial<SiteSettings>) => Promise<void>;
  updateAdSettings: (newAds: Partial<AdSettings>) => Promise<void>;
}

const defaultSiteSettings: SiteSettings = {
  appName: 'Tera Viral Link',
  logoUrl: '',
  footerText: '© 2026 Tera Viral Link. Discover premium viral media links worldwide.',
  maintenanceMode: false,
  maintenanceMessage: 'Tera Viral Link is currently undergoing scheduled maintenance. Please check back shortly.',
  contactEmail: 'contact@teravirallink.example',
  contactNotice: 'For inquiries, copyright issues, or partnership requests, please submit your message.',
};

const defaultAdSettings: AdSettings = {
  topBannerEnabled: true,
  topBannerHtml: '<div class="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border border-amber-500/30 text-amber-300 text-center text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-inner"><span class="px-1.5 py-0.5 rounded bg-amber-500/20 text-[10px] uppercase tracking-wider font-bold">Sponsored</span> High Speed Cloud Player & Download Accelerator • Get Instant Access</div>',
  bottomBannerEnabled: true,
  bottomBannerHtml: '<div class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500/10 via-blue-500/20 to-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-center text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-inner"><span class="px-1.5 py-0.5 rounded bg-cyan-500/20 text-[10px] uppercase tracking-wider font-bold">Recommended</span> Stream in 4K Ultra HD With Unlimited Bandwidth • Instant Link Vault</div>',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [adSettings, setAdSettings] = useState<AdSettings>(defaultAdSettings);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Listen to site settings
    const unsubSite = onSnapshot(
      doc(db, 'settings', 'site'),
      (snap) => {
        if (snap.exists()) {
          setSiteSettings((prev) => ({ ...prev, ...(snap.data() as SiteSettings) }));
        }
      },
      (error) => {
        console.warn('Site settings snapshot error:', error.message);
      }
    );

    // Listen to ad settings
    const unsubAds = onSnapshot(
      doc(db, 'settings', 'ads'),
      (snap) => {
        if (snap.exists()) {
          setAdSettings((prev) => ({ ...prev, ...(snap.data() as AdSettings) }));
        }
        setLoading(false);
      },
      (error) => {
        console.warn('Ad settings snapshot error:', error.message);
        setLoading(false);
      }
    );

    return () => {
      unsubSite();
      unsubAds();
    };
  }, []);

  const updateSiteSettings = async (newSettings: Partial<SiteSettings>) => {
    const updated = { ...siteSettings, ...newSettings, updatedAt: Date.now() };
    const path = 'settings/site';
    try {
      await setDoc(doc(db, 'settings', 'site'), updated, { merge: true });
      setSiteSettings(updated);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  const updateAdSettings = async (newAds: Partial<AdSettings>) => {
    const updated = { ...adSettings, ...newAds, updatedAt: Date.now() };
    const path = 'settings/ads';
    try {
      await setDoc(doc(db, 'settings', 'ads'), updated, { merge: true });
      setAdSettings(updated);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        siteSettings,
        adSettings,
        loading,
        updateSiteSettings,
        updateAdSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
