import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Video } from '../../types';
import {
  Link2,
  Copy,
  Check,
  Download,
  ExternalLink,
  Search,
  Filter,
  Film,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  Play,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { isSupportedTeraBoxUrl } from '../../lib/teraboxService';

export const AdminSourceUrls: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'with-source' | 'missing-source'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedPlayerId, setCopiedPlayerId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'videos'));
      const list: Video[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<Video, 'id'>) });
      });
      // Sort newest first
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setVideos(list);
    } catch (err) {
      console.error('Failed to load videos for source URLs:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper to extract effective source URL
  const getSourceUrl = (v: Video): string => {
    if (v.source_url?.trim()) return v.source_url.trim();
    if (v.sourceUrl?.trim()) return v.sourceUrl.trim();
    return (v.playerWebsiteUrl || v.player_url || v.link || v.url || '').trim();
  };

  // Helper to extract effective video URL (TeraBox URL)
  const getPlayerUrl = (v: Video): string => {
    if (v.source_url?.trim() && !v.source_url.includes('player.teraboxdl.site')) return v.source_url.trim();
    if (v.sourceUrl?.trim() && !v.sourceUrl.includes('player.teraboxdl.site')) return v.sourceUrl.trim();
    return (v.player_url || v.playerWebsiteUrl || v.link || v.url || '').trim();
  };

  const handleCopySourceUrl = (v: Video) => {
    const url = getSourceUrl(v);
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(v.id);
      showToast(`Copied Source URL for "${v.title}"`);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleCopyPlayerUrl = (v: Video) => {
    const url = getPlayerUrl(v);
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedPlayerId(v.id);
      showToast(`Copied Player URL for "${v.title}"`);
      setTimeout(() => setCopiedPlayerId(null), 2000);
    });
  };

  // Copy all valid source URLs to clipboard separated by newlines
  const handleCopyAllSourceUrls = () => {
    const urls = filteredVideos
      .map((v) => getSourceUrl(v))
      .filter((u) => Boolean(u));

    if (urls.length === 0) {
      showToast('No source URLs found to copy.');
      return;
    }

    navigator.clipboard.writeText(urls.join('\n')).then(() => {
      setCopiedAll(true);
      showToast(`Successfully copied ${urls.length} Source URLs to clipboard!`);
      setTimeout(() => setCopiedAll(false), 2500);
    });
  };

  // Download all source URLs as a plain text file (.txt)
  const handleDownloadTxt = () => {
    const urls = filteredVideos
      .map((v) => getSourceUrl(v))
      .filter((u) => Boolean(u));

    if (urls.length === 0) {
      showToast('No source URLs found to download.');
      return;
    }

    const content = urls.join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `terabox-source-urls-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(downloadUrl);
    showToast(`Downloaded ${urls.length} URLs as TXT file.`);
  };

  // Download detailed CSV with Title, Source URL, Player URL, Category, Date
  const handleDownloadCsv = () => {
    const rows = filteredVideos.map((v) => {
      const sourceUrl = getSourceUrl(v);
      const playerUrl = getPlayerUrl(v);
      const dateStr = v.createdAt ? new Date(v.createdAt).toISOString() : '';
      return [
        `"${v.id}"`,
        `"${(v.title || '').replace(/"/g, '""')}"`,
        `"${sourceUrl.replace(/"/g, '""')}"`,
        `"${playerUrl.replace(/"/g, '""')}"`,
        `"${(v.category || '').replace(/"/g, '""')}"`,
        `"${v.quality || ''}"`,
        `"${dateStr}"`,
      ].join(',');
    });

    const csvHeader = 'id,title,source_url,player_url,category,quality,createdAt\n';
    const csvContent = csvHeader + rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `terabox-source-urls-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(downloadUrl);
    showToast(`Downloaded ${rows.length} video rows as CSV file.`);
  };

  // Filtered dataset
  const filteredVideos = videos.filter((v) => {
    const sUrl = getSourceUrl(v);
    const pUrl = getPlayerUrl(v);
    const matchSearch =
      v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pUrl.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchSearch) return false;

    if (filterType === 'with-source') return Boolean(sUrl);
    if (filterType === 'missing-source') return !sUrl;
    return true;
  });

  const totalWithSource = videos.filter((v) => Boolean(getSourceUrl(v))).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#161a28] border border-amber-500/40 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-black shadow-lg shadow-amber-500/20">
            <Link2 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Source URLs</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {totalWithSource} Preserved
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Original TeraBox links preserved safely in <code className="text-amber-400 font-mono">source_url</code>. Copy individually or download all URLs at once.
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={loadVideos}
            disabled={loading}
            className="p-2.5 rounded-xl bg-[#141824] hover:bg-[#1a2030] text-slate-300 hover:text-white border border-slate-800 transition-all cursor-pointer"
            title="Reload video records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          <button
            onClick={handleCopyAllSourceUrls}
            disabled={filteredVideos.length === 0}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#141824] hover:bg-[#1a2030] text-slate-200 hover:text-white border border-slate-800 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
            title="Copy all visible source URLs separated by newlines"
          >
            {copiedAll ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copied All!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-amber-400" />
                <span>Copy All URLs</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadTxt}
            disabled={filteredVideos.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
            title="Download all source URLs as text file (.txt)"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Download All URLs (TXT)</span>
          </button>

          <button
            onClick={handleDownloadCsv}
            disabled={filteredVideos.length === 0}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#182030] hover:bg-[#202a40] text-slate-200 hover:text-white border border-slate-700 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
            title="Download structured spreadsheet with Title, Source URL, and Player URL (.csv)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#11131c] border border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Stored Source URLs
            </p>
            <p className="text-2xl font-black text-amber-400 mt-1">{totalWithSource}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Link2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#11131c] border border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Catalog Videos
            </p>
            <p className="text-2xl font-black text-white mt-1">{videos.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center">
            <Film className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#11131c] border border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Playback Ready (<code className="text-emerald-400">player_url</code>)
            </p>
            <p className="text-2xl font-black text-emerald-400 mt-1">
              {videos.filter((v) => Boolean(getPlayerUrl(v))).length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Play className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#11131c] border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, domain, or URL..."
            className="w-full bg-[#161a28] border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={filterType}
            onChange={(e: any) => setFilterType(e.target.value)}
            className="bg-[#161a28] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500 w-full sm:w-auto"
          >
            <option value="all">All Videos ({videos.length})</option>
            <option value="with-source">Has Source URL ({totalWithSource})</option>
            <option value="missing-source">Missing Source URL ({videos.length - totalWithSource})</option>
          </select>
        </div>
      </div>

      {/* Table of Source URLs */}
      <div className="bg-[#11131c] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#161a28] text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Video Info</th>
                <th className="py-3.5 px-4">Original TeraBox Source URL</th>
                <th className="py-3.5 px-4">Generated Playback URL</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center text-slate-400">
                    <div className="w-7 h-7 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading source links...</span>
                  </td>
                </tr>
              ) : filteredVideos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    <p className="font-semibold text-white">No video URLs matched</p>
                    <p className="text-xs text-slate-500 mt-1">Try adjusting your search or filter options.</p>
                  </td>
                </tr>
              ) : (
                filteredVideos.map((video) => {
                  const sourceUrl = getSourceUrl(video);
                  const playerUrl = getPlayerUrl(video);
                  const isSourceCopied = copiedId === video.id;
                  const isPlayerCopied = copiedPlayerId === video.id;

                  return (
                    <tr
                      key={video.id}
                      className="hover:bg-[#151926]/70 transition-colors group"
                    >
                      {/* Video Info: Thumbnail + Title + Meta */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-3">
                          {video.thumbnailUrl?.trim() ? (
                            <img
                              src={video.thumbnailUrl.trim()}
                              alt={video.title}
                              className="w-14 h-9 rounded-lg object-cover bg-slate-900 shrink-0 border border-slate-800"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-14 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-[9px] text-slate-600 shrink-0">
                              No Pic
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-white truncate text-xs group-hover:text-amber-400 transition-colors">
                              {video.title}
                            </p>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                              <span className="px-1 py-0.2 rounded bg-slate-800 text-slate-300 font-medium">
                                {video.category}
                              </span>
                              <span>•</span>
                              <span className="font-mono text-amber-400/80">{video.quality}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Source URL Column */}
                      <td className="py-3.5 px-4 max-w-sm">
                        {sourceUrl ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20 font-semibold truncate max-w-xs block">
                                {sourceUrl}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px]">
                              <button
                                onClick={() => handleCopySourceUrl(video)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                                  isSourceCopied
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
                                }`}
                                title="Copy original TeraBox link"
                              >
                                {isSourceCopied ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy Source URL</span>
                                  </>
                                )}
                              </button>

                              <a
                                href={sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-slate-400 hover:text-sky-400 transition-colors"
                                title="Open original TeraBox link in new tab"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Open TeraBox</span>
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] italic">
                            <AlertCircle className="w-3.5 h-3.5 text-slate-600" />
                            <span>No source URL saved</span>
                          </div>
                        )}
                      </td>

                      {/* Generated Playback URL Column */}
                      <td className="py-3.5 px-4 max-w-sm">
                        {playerUrl ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold truncate max-w-xs block">
                                {playerUrl}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px]">
                              <button
                                onClick={() => handleCopyPlayerUrl(video)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                                  isPlayerCopied
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
                                }`}
                                title="Copy generated player URL"
                              >
                                {isPlayerCopied ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy Player URL</span>
                                  </>
                                )}
                              </button>

                              <a
                                href={playerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-slate-400 hover:text-amber-400 transition-colors"
                                title="Test Player playback in new tab"
                              >
                                <Play className="w-3 h-3" />
                                <span>Test Playback</span>
                              </a>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-600 text-[11px] italic">No player URL</span>
                        )}
                      </td>

                      {/* Actions Column */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link
                          to={`/admin/videos`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#161a28] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 font-semibold transition-all"
                        >
                          <span>Manage</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
