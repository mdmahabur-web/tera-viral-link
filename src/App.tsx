import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';

// Public Components
import { Header } from './components/Header';
import { BottomNavigation } from './components/BottomNavigation';
import { Footer } from './components/Footer';
import { WatchlistModal } from './components/WatchlistModal';
import { MaintenanceScreen } from './components/MaintenanceScreen';
import { AgeVerificationModal } from './components/AgeVerificationModal';

// Public Pages
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import {
  PrivacyPage,
  TermsPage,
  DisclaimerPage,
  ContactPage,
  NotFoundPage,
} from './pages/LegalPages';

// Admin Components & Pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminVideos } from './pages/admin/AdminVideos';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { AdminAds } from './pages/admin/AdminAds';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminApiSettings } from './pages/admin/AdminApiSettings';
import { AdminSecurity } from './pages/admin/AdminSecurity';
import { AdminBackup } from './pages/admin/AdminBackup';
import { AdminMaintenance } from './pages/admin/AdminMaintenance';
import { AdminLegal } from './pages/admin/AdminLegal';
import { AdminSourceUrls } from './pages/admin/AdminSourceUrls';

// Public Layout Container
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [watchlistOpen, setWatchlistOpen] = useState(false);
  const { siteSettings } = useSettings();
  const { isAdmin } = useAuth();

  // If maintenance mode is active and user is not an admin, display maintenance screen
  if (siteSettings.maintenanceMode && !isAdmin) {
    return <MaintenanceScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#08090d] text-slate-100 selection:bg-amber-500 selection:text-black">
      <Header onOpenWatchlist={() => setWatchlistOpen(true)} />
      <main className="flex-1 w-full pb-20 md:pb-6">{children}</main>
      <Footer />
      <BottomNavigation />
      <WatchlistModal
        isOpen={watchlistOpen}
        onClose={() => setWatchlistOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <BrowserRouter>
          <AgeVerificationModal />
          <Routes>
            {/* Public App Routes */}
            <Route
              path="/"
              element={
                <PublicLayout>
                  <HomePage initialTab="trending" />
                </PublicLayout>
              }
            />
            <Route
              path="/trending"
              element={
                <PublicLayout>
                  <HomePage initialTab="trending" />
                </PublicLayout>
              }
            />
            <Route
              path="/for-you"
              element={
                <PublicLayout>
                  <HomePage initialTab="for-you" />
                </PublicLayout>
              }
            />
            <Route
              path="/popular"
              element={
                <PublicLayout>
                  <HomePage initialTab="popular" />
                </PublicLayout>
              }
            />
            <Route
              path="/latest"
              element={
                <PublicLayout>
                  <HomePage initialTab="latest" />
                </PublicLayout>
              }
            />
            <Route
              path="/search"
              element={
                <PublicLayout>
                  <SearchPage />
                </PublicLayout>
              }
            />
            <Route
              path="/video/:slug"
              element={<Navigate to="/" replace />}
            />
            <Route
              path="/privacy"
              element={
                <PublicLayout>
                  <PrivacyPage />
                </PublicLayout>
              }
            />
            <Route
              path="/terms"
              element={
                <PublicLayout>
                  <TermsPage />
                </PublicLayout>
              }
            />
            <Route
              path="/disclaimer"
              element={
                <PublicLayout>
                  <DisclaimerPage />
                </PublicLayout>
              }
            />
            <Route
              path="/contact"
              element={
                <PublicLayout>
                  <ContactPage />
                </PublicLayout>
              }
            />

            {/* Admin Login Route */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Protected Admin Console Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="videos" element={<AdminVideos />} />
              <Route path="source-urls" element={<AdminSourceUrls />} />
              <Route path="source-url" element={<Navigate to="/admin/source-urls" replace />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="ads" element={<AdminAds />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="api-settings" element={<AdminApiSettings />} />
              <Route path="security" element={<AdminSecurity />} />
              <Route path="backup" element={<AdminBackup />} />
              <Route path="maintenance" element={<AdminMaintenance />} />
              <Route path="legal" element={<AdminLegal />} />
            </Route>

            {/* Custom 404 Route */}
            <Route
              path="*"
              element={
                <PublicLayout>
                  <NotFoundPage />
                </PublicLayout>
              }
            />
          </Routes>
        </BrowserRouter>
      </SettingsProvider>
    </AuthProvider>
  );
}
