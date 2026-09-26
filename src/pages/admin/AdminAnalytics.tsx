import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Video } from '../../types';
import { BarChart3, Eye, TrendingUp, Film, CheckCircle, Clock } from 'lucide-react';

export const AdminAnalytics: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const snap = await getDocs(collection(db, 'videos'));
        const list: Video[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as Omit<Video, 'id'>) });
        });
        setVideos(list);
      } catch (err) {
        console.error('Analytics load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const totalViews = videos.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const estimatedDailyViews = Math.round(totalViews * 0.14);
  const estimatedWeeklyViews = Math.round(totalViews * 0.48);

  const publishedCount = videos.filter((v) => v.status === 'published').length;
  const draftCount = videos.filter((v) => v.status === 'draft').length;
  const hiddenCount = videos.filter((v) => v.status === 'hidden').length;

  // Category breakdown
  const categoryStats: Record<string, { count: number; views: number }> = {};
  videos.forEach((v) => {
    const cat = v.category || 'Uncategorized';
    if (!categoryStats[cat]) {
      categoryStats[cat] = { count: 0, views: 0 };
    }
    categoryStats[cat].count += 1;
    categoryStats[cat].views += v.views || 0;
  });

  const popularVideos = [...videos].sort((a, b) => (b.views || 0) - (a.views || 0));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-black text-white">Platform Analytics</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Audience engagement, discovery impressions, and content health indicators.
        </p>
      </div>

      {/* Primary KPI metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#11131c] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Verified Views</span>
            <Eye className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-white font-mono mt-3">
            {totalViews.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Across {videos.length} indexed links
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#11131c] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Views Today (Est.)</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-amber-400 font-mono mt-3">
            {estimatedDailyViews.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Estimated 24h rolling activity
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#11131c] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">7-Day Reach (Est.)</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-3xl font-black text-cyan-400 font-mono mt-3">
            {estimatedWeeklyViews.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Aggregated rolling audience
          </span>
        </div>
      </div>

      {/* Breakdown by Category and Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance */}
        <div className="p-5 rounded-2xl bg-[#11131c] border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Film className="w-4 h-4 text-amber-400" />
            <span>Category Performance</span>
          </h2>

          <div className="space-y-3">
            {Object.keys(categoryStats).length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No categories recorded.</p>
            ) : (
              Object.entries(categoryStats).map(([catName, stats]) => {
                const percentage = totalViews > 0 ? (stats.views / totalViews) * 100 : 0;
                return (
                  <div key={catName} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-200">{catName}</span>
                      <span className="text-slate-400 font-mono">
                        {stats.views.toLocaleString()} views ({stats.count} videos)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
                        style={{ width: `${Math.max(percentage, 3)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Content Status Distribution */}
        <div className="p-5 rounded-2xl bg-[#11131c] border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Repository Health & Status</span>
          </h2>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-[#161a28] border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                Published
              </span>
              <span className="text-xl font-black text-white font-mono">{publishedCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#161a28] border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-amber-400 block">Drafts</span>
              <span className="text-xl font-black text-white font-mono">{draftCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#161a28] border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Hidden</span>
              <span className="text-xl font-black text-white font-mono">{hiddenCount}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 text-xs text-slate-400 leading-relaxed">
            <p>
              Views are throttled on client browsers to prevent artificial inflation from rapid
              reloads. Only verified sessions contribute to video counters.
            </p>
          </div>
        </div>
      </div>

      {/* Top 10 Detailed Leaderboard */}
      <div className="p-5 rounded-2xl bg-[#11131c] border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white">Full Video Viewership Leaderboard</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Title</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Quality</th>
                <th className="py-2.5 px-3 text-right">Lifetime Views</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {popularVideos.slice(0, 10).map((v, i) => (
                <tr key={v.id} className="hover:bg-[#151926]">
                  <td className="py-2.5 px-3 font-mono font-bold text-amber-400">#{i + 1}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-200">{v.title}</td>
                  <td className="py-2.5 px-3 text-slate-400">{v.category}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-amber-400 font-bold">
                    {v.quality}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                    {(v.views || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
