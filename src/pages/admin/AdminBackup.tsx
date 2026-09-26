import React, { useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Video } from '../../types';
import { Download, FileJson, FileSpreadsheet, Check, Sparkles } from 'lucide-react';

export const AdminBackup: React.FC = () => {
  const [exporting, setExporting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchVideos = async (): Promise<Video[]> => {
    const snap = await getDocs(collection(db, 'videos'));
    const list: Video[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...(d.data() as Omit<Video, 'id'>) });
    });
    return list;
  };

  const handleExportJSON = async () => {
    setExporting(true);
    try {
      const videos = await fetchVideos();
      const exportData = videos.map((v) => ({
        id: v.id,
        title: v.title,
        slug: v.slug,
        thumbnailUrl: v.thumbnailUrl,
        playerWebsiteUrl: v.player_url || v.playerWebsiteUrl,
        player_url: v.player_url || v.playerWebsiteUrl,
        source_url: v.source_url || v.sourceUrl || '',
        category: v.category,
        quality: v.quality,
        duration: v.duration,
        fileSize: v.fileSize,
        views: v.views,
        status: v.status,
        featured: v.featured,
        createdAt: new Date(v.createdAt).toISOString(),
      }));

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tera-viral-link-backup-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setSuccessMsg(`Successfully exported ${videos.length} videos as JSON.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error('JSON export error:', err);
    } finally {
      setExporting(false);
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const videos = await fetchVideos();
      const headers = [
        'ID',
        'Title',
        'Slug',
        'Category',
        'Quality',
        'Duration',
        'FileSize',
        'Views',
        'Status',
        'Featured',
        'ThumbnailURL',
        'PlayerURL',
        'SourceURL',
        'CreatedAt',
      ];

      const rows = videos.map((v) => [
        `"${v.id}"`,
        `"${v.title.replace(/"/g, '""')}"`,
        `"${v.slug}"`,
        `"${v.category}"`,
        `"${v.quality}"`,
        `"${v.duration}"`,
        `"${v.fileSize}"`,
        v.views,
        `"${v.status}"`,
        v.featured,
        `"${v.thumbnailUrl}"`,
        `"${(v.player_url || v.playerWebsiteUrl || '').replace(/"/g, '""')}"`,
        `"${(v.source_url || v.sourceUrl || '').replace(/"/g, '""')}"`,
        `"${new Date(v.createdAt).toISOString()}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tera-viral-link-backup-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      setSuccessMsg(`Successfully exported ${videos.length} videos as CSV.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error('CSV export error:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-black text-white">Metadata Backup & Export</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Safely export complete video repository metadata in standardized JSON or CSV formats.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* JSON Export Card */}
        <div className="bg-[#11131c] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <FileJson className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-white">Full JSON Export</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Export all video attributes, slugs, view counters, timestamps, categories, and player URLs in raw structured JSON.
            </p>
          </div>

          <button
            onClick={handleExportJSON}
            disabled={exporting}
            className="w-full py-3 rounded-xl bg-[#161a28] hover:bg-amber-500 hover:text-black text-slate-200 font-bold text-xs border border-slate-700/80 hover:border-amber-400 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{exporting ? 'Generating JSON...' : 'Download JSON Archive'}</span>
          </button>
        </div>

        {/* CSV Export Card */}
        <div className="bg-[#11131c] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-white">Spreadsheet CSV Export</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Export comma-separated values compatible with Microsoft Excel, Google Sheets, or data pipeline tools.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="w-full py-3 rounded-xl bg-[#161a28] hover:bg-emerald-500 hover:text-black text-slate-200 font-bold text-xs border border-slate-700/80 hover:border-emerald-400 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{exporting ? 'Generating CSV...' : 'Download CSV Sheet'}</span>
          </button>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-[#0e1017] border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
        <strong className="text-slate-300 block">Note on Content Rights:</strong>
        This export utility only produces database link records and metadata. It never downloads or mirrors third-party video media.
      </div>
    </div>
  );
};
