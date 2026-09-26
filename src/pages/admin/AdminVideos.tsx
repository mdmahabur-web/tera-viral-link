import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Video, Category, VideoQuality, VideoStatus } from '../../types';
import { generateSlug } from '../../lib/slugify';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Eye,
  AlertTriangle,
  Sparkles,
  X,
  Save,
  CheckCircle2,
  Clipboard,
  Loader2,
  Download,
  Link2,
} from 'lucide-react';
import { LiveThumbnailPreview } from '../../components/LiveThumbnailPreview';
import { fetchTeraBoxMetadata } from '../../lib/teraboxService';

export const AdminVideos: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Table filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal states for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formThumbnail, setFormThumbnail] = useState('');
  const [formPlayerUrl, setFormPlayerUrl] = useState('');
  const [formSourceUrl, setFormSourceUrl] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formQuality, setFormQuality] = useState<VideoQuality>('1080P');
  const [formDuration, setFormDuration] = useState('10:00');
  const [formFileSize, setFormFileSize] = useState('450 MB');
  const [formStatus, setFormStatus] = useState<VideoStatus>('published');
  const [formFeatured, setFormFeatured] = useState(false);

  // Validation & alerts
  const [formError, setFormError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [thumbnailPreviewError, setThumbnailPreviewError] = useState(false);

  // Auto-Fetch TeraBox states
  const [teraBoxUrl, setTeraBoxUrl] = useState('');
  const [fetchingTeraBox, setFetchingTeraBox] = useState(false);
  const [fetchSuccessMessage, setFetchSuccessMessage] = useState<string | null>(null);
  const [fetchErrorMessage, setFetchErrorMessage] = useState<string | null>(null);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Video | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  // Check if opened with ?action=new
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      openAddModal();
      setSearchParams({});
    }
  }, [searchParams]);

  const loadData = async () => {
    setLoading(true);
    try {
      const vSnap = await getDocs(collection(db, 'videos'));
      const vList: Video[] = [];
      vSnap.forEach((d) => {
        vList.push({ id: d.id, ...(d.data() as Omit<Video, 'id'>) });
      });
      // Sort newest first
      vList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setVideos(vList);

      const cSnap = await getDocs(collection(db, 'categories'));
      const cList: Category[] = [];
      cSnap.forEach((d) => {
        cList.push({ id: d.id, ...(d.data() as Omit<Category, 'id'>) });
      });
      setCategories(cList);
      if (cList.length > 0 && !formCategory) {
        setFormCategory(cList[0].name);
      }
    } catch (err) {
      console.error('Error loading videos in admin:', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingVideo(null);
    setFormTitle('');
    setFormDescription('');
    setFormSlug('');
    setFormThumbnail('');
    setFormPlayerUrl('');
    setFormSourceUrl('');
    setFormCategory(categories[0]?.name || 'Viral Hits');
    setFormQuality('1080P');
    setFormDuration('10:00');
    setFormFileSize('450 MB');
    setFormStatus('published');
    setFormFeatured(false);
    setFormError(null);
    setDuplicateWarning(null);
    setThumbnailPreviewError(false);
    setTeraBoxUrl('');
    setFetchingTeraBox(false);
    setFetchSuccessMessage(null);
    setFetchErrorMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (v: Video) => {
    setEditingVideo(v);
    setFormTitle(v.title);
    setFormDescription(v.description || '');
    setFormSlug(v.slug);
    setFormThumbnail(v.thumbnailUrl);
    // If source_url is stored, load it. Otherwise, if playerWebsiteUrl was an original TeraBox link, use that as sourceUrl.
    const detectedSourceUrl = v.source_url || v.sourceUrl || (v.playerWebsiteUrl && !v.playerWebsiteUrl.includes('player.teraboxdl.site') ? v.playerWebsiteUrl : '');
    setFormSourceUrl(detectedSourceUrl);

    // If player_url is set to player.teraboxdl.site but we have the original source URL, restore the original URL
    const preferredPlayerUrl = (detectedSourceUrl && (v.player_url?.includes('player.teraboxdl.site') || v.playerWebsiteUrl?.includes('player.teraboxdl.site')))
      ? detectedSourceUrl
      : (v.player_url || v.playerWebsiteUrl || v.link || v.url || '');
    setFormPlayerUrl(preferredPlayerUrl);
    setFormCategory(v.category);
    setFormQuality(v.quality);
    setFormDuration(v.duration || '10:00');
    setFormFileSize(v.fileSize || '450 MB');
    setFormStatus(v.status);
    setFormFeatured(v.featured);
    setFormError(null);
    setDuplicateWarning(null);
    setThumbnailPreviewError(false);
    setTeraBoxUrl(detectedSourceUrl);
    setFetchingTeraBox(false);
    setFetchSuccessMessage(null);
    setFetchErrorMessage(null);
    setIsModalOpen(true);
  };

  // Mobile-friendly paste from clipboard for TeraBox link
  const handlePasteTeraBoxLink = async () => {
    try {
      if (navigator?.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setTeraBoxUrl(text.trim());
          setFetchErrorMessage(null);
          setFetchSuccessMessage(null);
        }
      }
    } catch {
      // Browser permission blocked or not allowed in iframe
    }
  };

  // Auto-Fetch metadata from TeraBox API (Never auto-submits form)
  const handleFetchTeraBox = async (e: React.MouseEvent) => {
    e.preventDefault();
    const cleanLink = teraBoxUrl.trim();
    if (!cleanLink) {
      setFetchErrorMessage('Please enter or paste a valid TeraBox link first.');
      return;
    }

    setFetchingTeraBox(true);
    setFetchErrorMessage(null);
    setFetchSuccessMessage(null);

    try {
      const result = await fetchTeraBoxMetadata(cleanLink);

      // 1. Auto-fill Name → server_filename
      if (result.title) {
        setFormTitle(result.title);
        // Only update slug if not editing or custom
        if (!editingVideo || !formSlug) {
          setFormSlug(generateSlug(result.title));
        }
      }

      // 2. Auto-fill Thumbnail → thumbs.url3, fallback url2 → url1
      if (result.thumbnail) {
        setFormThumbnail(result.thumbnail);
        setThumbnailPreviewError(false);
      }

      // 3. Auto-fill Size → formatted_size
      if (result.size) {
        setFormFileSize(result.size);
      }

      // 4. Auto-fill Resolution → quality + "p"
      if (result.quality) {
        setFormQuality(result.quality);
      }

      // 5. Auto-fill Duration → duration, formatted as MM:SS or HH:MM:SS
      if (result.duration) {
        setFormDuration(result.duration);
      }

      // 6. Auto-fill Player Website URL / player_url with original TeraBox URL (cleanLink)
      setFormPlayerUrl(cleanLink);
      handlePlayerUrlChange(cleanLink);

      // 7. Save original TeraBox link in source_url (Requirement 3)
      setFormSourceUrl(cleanLink);

      setFetchSuccessMessage(
        `Metadata loaded: "${result.title || 'Video'}" • ${result.resolutionText} • ${result.duration} • ${result.size}. All fields remain manually editable.`
      );
    } catch (err: any) {
      setFetchErrorMessage(err?.message || 'Failed to auto-fetch video details from TeraBox.');
    } finally {
      setFetchingTeraBox(false);
    }
  };

  // Auto-generate slug when title changes in Add mode
  const handleTitleChange = (val: string) => {
    setFormTitle(val);
    if (!editingVideo) {
      setFormSlug(generateSlug(val));
    }
  };

  // URL duplicate check (Section 19: Duplicate Video Protection)
  const handlePlayerUrlChange = (val: string) => {
    setFormPlayerUrl(val);
    const cleanUrl = val.trim().toLowerCase();
    if (!cleanUrl) {
      setDuplicateWarning(null);
      return;
    }
    const dup = videos.find(
      (v) =>
        v.id !== editingVideo?.id &&
        v.playerWebsiteUrl.trim().toLowerCase() === cleanUrl
    );
    if (dup) {
      setDuplicateWarning(
        `Warning: This Player Website URL is already assigned to "${dup.title}".`
      );
    } else {
      setDuplicateWarning(null);
    }
  };

  // Validate Player Website URL (Section 20)
  const validatePlayerUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url.trim());
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Required fields validation
    if (!formTitle.trim()) {
      setFormError('Video title is required.');
      return;
    }
    if (!formThumbnail.trim()) {
      setFormError('Thumbnail image URL is required (ImgBB or valid URL).');
      return;
    }
    if (!formPlayerUrl.trim()) {
      setFormError('Player Website URL is required.');
      return;
    }

    if (!validatePlayerUrl(formPlayerUrl)) {
      setFormError('Player Website URL must be a valid web address (e.g. https://...).');
      return;
    }

    // Ensure slug
    let finalSlug = formSlug.trim() || generateSlug(formTitle);
    // Ensure slug uniqueness
    const slugCollision = videos.find(
      (v) => v.id !== editingVideo?.id && v.slug === finalSlug
    );
    if (slugCollision) {
      finalSlug = generateSlug(finalSlug, Date.now().toString(36).slice(-4));
    }

    setSaving(true);
    const videoId = editingVideo ? editingVideo.id : `vid-${Date.now()}`;

    const videoData: Video = {
      id: videoId,
      title: formTitle.trim(),
      description: formDescription.trim(),
      slug: finalSlug,
      thumbnailUrl: formThumbnail.trim(),
      playerWebsiteUrl: formPlayerUrl.trim(),
      player_url: formPlayerUrl.trim(),
      link: formPlayerUrl.trim(),
      url: formPlayerUrl.trim(),
      source_url: (formSourceUrl.trim() || teraBoxUrl.trim() || ''),
      sourceUrl: (formSourceUrl.trim() || teraBoxUrl.trim() || ''),
      category: formCategory || 'General',
      quality: formQuality,
      duration: formDuration.trim() || '10:00',
      fileSize: formFileSize.trim() || '400 MB',
      views: editingVideo ? editingVideo.views : 0,
      status: formStatus,
      featured: formFeatured,
      createdAt: editingVideo ? editingVideo.createdAt : Date.now(),
      updatedAt: Date.now(),
    };

    try {
      await setDoc(doc(db, 'videos', videoId), videoData, { merge: true });
      await loadData();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving video:', err);
      setFormError(err.message || 'Failed to save video record.');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickStatusToggle = async (v: Video, newStatus: VideoStatus) => {
    try {
      await updateDoc(doc(db, 'videos', v.id), {
        status: newStatus,
        updatedAt: Date.now(),
      });
      setVideos((prev) =>
        prev.map((item) => (item.id === v.id ? { ...item, status: newStatus } : item))
      );
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const handleQuickFeaturedToggle = async (v: Video) => {
    try {
      await updateDoc(doc(db, 'videos', v.id), {
        featured: !v.featured,
        updatedAt: Date.now(),
      });
      setVideos((prev) =>
        prev.map((item) => (item.id === v.id ? { ...item, featured: !v.featured } : item))
      );
    } catch (err) {
      console.error('Error toggling featured:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDoc(doc(db, 'videos', deleteTarget.id));
      setVideos((prev) => prev.filter((v) => v.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error('Error deleting video:', err);
    }
  };

  // Filter list
  const filteredVideos = videos.filter((v) => {
    const matchesSearch =
      !searchTerm.trim() ||
      v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === 'all' || v.category.toLowerCase() === filterCategory.toLowerCase();
    const matchesStatus = filterStatus === 'all' || v.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white">Video Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Add, update, curate, and moderate video links and external player endpoints.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Video</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#11131c] border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by title or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#161a28] border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2">
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-[#161a28] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#161a28] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
      </div>

      {/* Video Table */}
      <div className="bg-[#11131c] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b0d14] text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Thumbnail & Title</th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-3">Quality</th>
                <th className="py-3.5 px-3">Views</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3">Featured</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Loading videos repository...
                  </td>
                </tr>
              ) : filteredVideos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No videos match your filter.
                  </td>
                </tr>
              ) : (
                filteredVideos.map((video) => (
                  <tr key={video.id} className="hover:bg-[#151926] transition-colors">
                    {/* Thumbnail & Title */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3 max-w-sm">
                        {video.thumbnailUrl?.trim() ? (
                          <img
                            src={video.thumbnailUrl.trim()}
                            alt={video.title}
                            className="w-16 h-10 object-cover rounded-lg bg-slate-900 shrink-0 border border-slate-800"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-16 h-10 rounded-lg bg-slate-900 shrink-0 border border-slate-800 flex items-center justify-center text-slate-600 text-[10px]">
                            No Img
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate text-xs">
                            {video.title}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                            <span className="font-mono">/video/{video.slug}</span>
                            <span>•</span>
                            <span>{video.duration}</span>
                            {video.fileSize && (
                              <>
                                <span>•</span>
                                <span>{video.fileSize}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3 text-slate-300 font-medium whitespace-nowrap">
                      {video.category}
                    </td>

                    {/* Quality */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-black text-amber-400 border border-amber-500/30 font-mono">
                        {video.quality}
                      </span>
                    </td>

                    {/* Views */}
                    <td className="py-3 px-3 whitespace-nowrap text-slate-300 font-mono">
                      {(video.views || 0).toLocaleString()}
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <select
                        value={video.status}
                        onChange={(e) =>
                          handleQuickStatusToggle(video, e.target.value as VideoStatus)
                        }
                        className={`text-[10px] font-bold uppercase rounded-lg px-2 py-1 border transition-all ${
                          video.status === 'published'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : video.status === 'draft'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="hidden">Hidden</option>
                      </select>
                    </td>

                    {/* Featured Toggle */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <button
                        onClick={() => handleQuickFeaturedToggle(video)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          video.featured
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : 'bg-slate-800/40 text-slate-600 border-slate-800 hover:text-slate-400'
                        }`}
                        title={video.featured ? 'Pinned Featured' : 'Not Featured'}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {video.source_url && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(video.source_url!);
                            }}
                            className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title={`Copy original TeraBox Source URL:\n${video.source_url}`}
                          >
                            <Link2 className="w-4 h-4" />
                          </button>
                        )}

                        <a
                          href={video.source_url || video.playerWebsiteUrl || video.player_url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Open TeraBox Link"
                        >
                          <Eye className="w-4 h-4" />
                        </a>

                        <button
                          onClick={() => openEditModal(video)}
                          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Edit Video"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteTarget(video)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Delete Video"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Video Modal (Fully responsive, mobile-scrollable, zero cutoff) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-sm p-2 sm:p-4 md:p-6 flex items-start justify-center animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-[#11131c] border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col my-2 sm:my-6 overflow-hidden max-h-[calc(100vh-1rem)] sm:max-h-[92vh]">
            
            {/* Pinned/Sticky Header */}
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-800 bg-[#11131c] px-4 sm:px-6 py-3.5 sm:py-4 shrink-0">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  {editingVideo ? 'Edit Video Link' : 'Add New Video Link'}
                </h2>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Fill in video details or auto-fetch metadata from TeraBox
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form with scrollable body and sticky action footer */}
            <form onSubmit={handleSaveVideo} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 text-xs">
                {formError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                    {formError}
                  </div>
                )}

                {duplicateWarning && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{duplicateWarning}</span>
                  </div>
                )}

                {/* Auto-Fetch TeraBox Feature Section */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-[#131724] to-[#0e111a] border border-amber-500/25 shadow-lg space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold text-white text-xs">Auto-Fetch from TeraBox</span>
                        <p className="text-[10px] text-slate-400 hidden sm:block">
                          Automatically extract Title, Thumbnail, Size, Resolution, and Duration
                        </p>
                      </div>
                    </div>

                    {/* Mobile-friendly Paste button */}
                    <button
                      type="button"
                      onClick={handlePasteTeraBoxLink}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold text-xs border border-slate-700 hover:border-amber-500/40 transition-all cursor-pointer active:scale-95 shadow-sm shrink-0"
                      title="Paste TeraBox link from clipboard"
                    >
                      <Clipboard className="w-3.5 h-3.5" />
                      <span>Paste</span>
                    </button>
                  </div>

                  {/* TeraBox Link Input with Fetch Button */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <input
                        type="url"
                        value={teraBoxUrl}
                        onChange={(e) => {
                          setTeraBoxUrl(e.target.value);
                          setFetchErrorMessage(null);
                        }}
                        placeholder="Paste TeraBox link here..."
                        className="w-full bg-[#0a0c13] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleFetchTeraBox}
                      disabled={fetchingTeraBox || !teraBoxUrl.trim()}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    >
                      {fetchingTeraBox ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Fetching...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>Fetch</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400 pt-0.5">
                    <span className="text-slate-500">Supported:</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300 font-mono">terabox.com</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300 font-mono">1024tera.com</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300 font-mono">terasharelink.com</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300 font-mono">+ more</span>
                  </div>

                  {fetchSuccessMessage && (
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span className="flex-1 leading-tight">{fetchSuccessMessage}</span>
                      <button
                        type="button"
                        onClick={() => setFetchSuccessMessage(null)}
                        className="text-emerald-400 hover:text-white p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {fetchErrorMessage && (
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span className="flex-1 leading-tight">{fetchErrorMessage}</span>
                      <button
                        type="button"
                        onClick={() => setFetchErrorMessage(null)}
                        className="text-rose-400 hover:text-white p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Video Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Viral Action Highlight 1080P"
                    className="w-full bg-[#161a28] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs sm:text-sm"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Description <span className="text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Brief description or tags for this video..."
                    className="w-full bg-[#161a28] border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs resize-none"
                  />
                </div>

                {/* Slug Preview */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    URL Slug (Auto-generated / Unique)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-mono text-[11px]">/video/</span>
                    <input
                      type="text"
                      value={formSlug}
                      onChange={(e) => setFormSlug(e.target.value)}
                      className="flex-1 bg-[#161a28] border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Thumbnail URL & Live Preview */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Thumbnail Image URL (ImgBB recommended) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={formThumbnail}
                    onChange={(e) => {
                      setFormThumbnail(e.target.value);
                      setThumbnailPreviewError(false);
                    }}
                    placeholder="https://i.ibb.co/... or image link"
                    className="w-full bg-[#161a28] border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
                  />

                  {/* Live Thumbnail Preview Box */}
                  <LiveThumbnailPreview url={formThumbnail} />
                </div>

                {/* Video Link / Player URL */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-semibold">
                      Video Link / Player URL <span className="text-rose-400">*</span>
                    </label>
                    <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-medium">
                      player_url
                    </span>
                  </div>
                  <input
                    type="url"
                    required
                    value={formPlayerUrl}
                    onChange={(e) => handlePlayerUrlChange(e.target.value)}
                    placeholder="https://teraboxapp.com/s/... or video link"
                    className="w-full bg-[#161a28] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono text-xs"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Original video URL automatically populated upon fetching.
                  </span>
                </div>

                {/* Source URL (Original TeraBox Link) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-semibold text-xs flex items-center gap-1.5">
                      <span>Source URL (Original TeraBox Link)</span>
                      <span className="text-[10px] text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
                        source_url
                      </span>
                    </label>
                    {formSourceUrl && (
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(formSourceUrl)}
                        className="text-[10px] text-slate-400 hover:text-amber-400 flex items-center gap-1 cursor-pointer"
                        title="Copy Source URL"
                      >
                        <Clipboard className="w-3 h-3" />
                        <span>Copy Source</span>
                      </button>
                    )}
                  </div>
                  <input
                    type="url"
                    value={formSourceUrl}
                    onChange={(e) => setFormSourceUrl(e.target.value)}
                    placeholder="https://terabox.com/s/... or 1024tera.com/s/..."
                    className="w-full bg-[#161a28] border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono text-xs"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Original TeraBox link preserved safely.
                  </span>
                </div>

                {/* Grid of properties: Category, Quality, Duration, File Size */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full bg-[#161a28] border border-slate-800 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-amber-500"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Quality</label>
                    <select
                      value={formQuality}
                      onChange={(e) => setFormQuality(e.target.value as VideoQuality)}
                      className="w-full bg-[#161a28] border border-slate-800 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                    >
                      <option value="720P">720P</option>
                      <option value="1080P">1080P</option>
                      <option value="2K">2K</option>
                      <option value="4K">4K</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Duration</label>
                    <input
                      type="text"
                      value={formDuration}
                      onChange={(e) => setFormDuration(e.target.value)}
                      placeholder="12:45"
                      className="w-full bg-[#161a28] border border-slate-800 rounded-xl px-2.5 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">File Size</label>
                    <input
                      type="text"
                      value={formFileSize}
                      onChange={(e) => setFormFileSize(e.target.value)}
                      placeholder="450 MB"
                      className="w-full bg-[#161a28] border border-slate-800 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Status & Featured */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Publishing Status
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as VideoStatus)}
                      className="w-full bg-[#161a28] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="published">Published (Visible to public)</option>
                      <option value="draft">Draft (Admin only)</option>
                      <option value="hidden">Hidden (De-listed)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3 sm:pt-6">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-semibold select-none">
                      <input
                        type="checkbox"
                        checked={formFeatured}
                        onChange={(e) => setFormFeatured(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-slate-700"
                      />
                      <span>Mark as Featured / Pinned</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Pinned/Sticky Action Buttons Footer */}
              <div className="sticky bottom-0 z-20 flex items-center justify-end gap-3 px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-800 bg-[#11131c] shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Video Record'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Section 44) */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        title="Delete Video Record"
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmText="Yes, Delete Video"
        danger={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
