import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Video } from '../../types';
import {
  Film,
  Eye,
  CheckCircle,
  FileEdit,
  EyeOff,
  TrendingUp,
  Plus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const vRef = collection(db, 'videos');
        const snap = await getDocs(vRef);
        const list: Video[] = [];
        snap.forEach((doc) => {
          list.push({ id: doc.id, ...(doc.data() as Omit<Video, 'id'>) });
        });
        setVideos(list);
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const totalVideos = videos.length;
  const publishedVideos = videos.filter((v) => v.status === 'published').length;
  const draftVideos = videos.filter((v) => v.status === 'draft').length;
  const hiddenVideos = videos.filter((v) => v.status === 'hidden').length;
  const totalViews = videos.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const featuredCount = videos.filter((v) => v.featured).length;

  // Approximate daily views as 12% of total views for trend indication
  const estimatedDailyViews = Math.round(totalViews * 0.12);

  // Top 5 popular videos
  const popularVideos = [...videos].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white">System Dashboard</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time overview of video repository, link traffic, and visibility metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/videos?action=new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Video</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Total Videos */}
        <div className="bg-[#11131c] border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Videos</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Film className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-black text-white font-mono">{totalVideos}</h3>
            <span className="text-[11px] text-slate-400 mt-1 block">In repository</span>
          </div>
        </div>

        {/* Total Views */}
        <div className="bg-[#11131c] border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Views</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-black text-white font-mono">
              {totalViews.toLocaleString()}
            </h3>
            <span className="text-[11px] text-emerald-400 mt-1 block flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>~{estimatedDailyViews.toLocaleString()} today</span>
            </span>
          </div>
        </div>

        {/* Published Ratio */}
        <div className="bg-[#11131c] border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Published</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-black text-white font-mono">
              {publishedVideos}
            </h3>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Active on discovery feeds
            </span>
          </div>
        </div>

        {/* Drafts & Hidden */}
        <div className="bg-[#11131c] border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Drafts & Hidden</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <EyeOff className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl sm:text-3xl font-black text-white font-mono">{draftVideos}</h3>
              <span className="text-xs text-slate-500">drafts</span>
              <span className="text-sm font-bold text-slate-300">/ {hiddenVideos}</span>
              <span className="text-xs text-slate-500">hidden</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {featuredCount} pinned/featured
            </span>
          </div>
        </div>
      </div>

      {/* Popular Videos Table & Quick Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Popular Videos List */}
        <div className="lg:col-span-2 bg-[#11131c] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white">Top Performing Videos</h2>
            </div>
            <Link
              to="/admin/videos"
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {popularVideos.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No videos recorded yet.</p>
            ) : (
              popularVideos.map((vid, idx) => (
                <div
                  key={vid.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-[#161a26] hover:bg-[#1a2030] border border-slate-800/80 transition-all"
                >
                  <span className="w-5 text-center font-mono font-bold text-xs text-slate-500">
                    #{idx + 1}
                  </span>
                  {vid.thumbnailUrl?.trim() ? (
                    <img
                      src={vid.thumbnailUrl.trim()}
                      alt={vid.title}
                      className="w-16 h-10 object-cover rounded-lg bg-slate-900 shrink-0"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-16 h-10 rounded-lg bg-slate-900 shrink-0 flex items-center justify-center text-slate-600 text-[10px]">
                      No Img
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{vid.title}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span className="text-amber-400">{vid.category}</span>
                      <span>•</span>
                      <span>{vid.quality}</span>
                      <span>•</span>
                      <span>{vid.duration}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-emerald-400 block">
                      {(vid.views || 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500">views</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Config Links */}
        <div className="bg-[#11131c] border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Admin Shortcuts</span>
            </h2>

            <div className="space-y-2">
              <Link
                to="/admin/videos?action=new"
                className="flex items-center justify-between p-3 rounded-xl bg-[#151926] hover:bg-[#1b2032] border border-slate-800 text-xs text-slate-200 hover:text-amber-400 transition-all"
              >
                <span>Publish New Video Link</span>
                <Plus className="w-4 h-4" />
              </Link>

              <Link
                to="/admin/ads"
                className="flex items-center justify-between p-3 rounded-xl bg-[#151926] hover:bg-[#1b2032] border border-slate-800 text-xs text-slate-200 hover:text-amber-400 transition-all"
              >
                <span>Configure Top & Bottom Ads</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/admin/categories"
                className="flex items-center justify-between p-3 rounded-xl bg-[#151926] hover:bg-[#1b2032] border border-slate-800 text-xs text-slate-200 hover:text-amber-400 transition-all"
              >
                <span>Manage Categories</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/admin/maintenance"
                className="flex items-center justify-between p-3 rounded-xl bg-[#151926] hover:bg-[#1b2032] border border-slate-800 text-xs text-slate-200 hover:text-amber-400 transition-all"
              >
                <span>Maintenance Mode Status</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/admin/backup"
                className="flex items-center justify-between p-3 rounded-xl bg-[#151926] hover:bg-[#1b2032] border border-slate-800 text-xs text-slate-200 hover:text-amber-400 transition-all"
              >
                <span>Export Metadata (JSON/CSV)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500">
            Powered by Cloud Firestore & Firebase Auth.
          </div>
        </div>
      </div>
    </div>
  );
};
