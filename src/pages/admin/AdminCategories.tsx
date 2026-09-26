import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Category, Video } from '../../types';
import { generateSlug } from '../../lib/slugify';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { Plus, Edit2, Trash2, Tags, X, Check, AlertCircle } from 'lucide-react';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [assignedVideoCount, setAssignedVideoCount] = useState(0);

  useEffect(() => {
    loadCategoriesAndCounts();
  }, []);

  const loadCategoriesAndCounts = async () => {
    setLoading(true);
    try {
      const cSnap = await getDocs(collection(db, 'categories'));
      const cList: Category[] = [];
      cSnap.forEach((d) => {
        cList.push({ id: d.id, ...(d.data() as Omit<Category, 'id'>) });
      });

      const vSnap = await getDocs(collection(db, 'videos'));
      const vList: Video[] = [];
      vSnap.forEach((d) => {
        vList.push({ id: d.id, ...(d.data() as Omit<Video, 'id'>) });
      });

      setVideos(vList);

      // Compute actual video counts per category
      const enrichedCategories = cList.map((c) => {
        const count = vList.filter(
          (v) => v.category?.toLowerCase() === c.name?.toLowerCase()
        ).length;
        return { ...c, videoCount: count };
      });

      setCategories(enrichedCategories);
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategorySlug('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategorySlug(cat.slug);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setCategoryName(val);
    if (!editingCategory) {
      setCategorySlug(generateSlug(val));
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      setFormError('Category name is required.');
      return;
    }

    setSaving(true);
    const catId = editingCategory ? editingCategory.id : `cat-${Date.now()}`;
    const finalSlug = categorySlug.trim() || generateSlug(categoryName);

    try {
      const updatedData: Category = {
        id: catId,
        name: categoryName.trim(),
        slug: finalSlug,
        createdAt: editingCategory ? editingCategory.createdAt : Date.now(),
      };

      await setDoc(doc(db, 'categories', catId), updatedData, { merge: true });

      // If renaming an existing category, update assigned videos safely (Section 9)
      if (editingCategory && editingCategory.name !== categoryName.trim()) {
        const oldName = editingCategory.name.toLowerCase();
        const affectedVideos = videos.filter(
          (v) => v.category && v.category.toLowerCase() === oldName
        );
        for (const v of affectedVideos) {
          await updateDoc(doc(db, 'videos', v.id), {
            category: categoryName.trim(),
            updatedAt: Date.now(),
          });
        }
      }

      await loadCategoriesAndCounts();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving category:', err);
      setFormError(err.message || 'Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  const promptDeleteCategory = (cat: Category) => {
    const count = videos.filter(
      (v) => v.category?.toLowerCase() === cat.name.toLowerCase()
    ).length;
    setAssignedVideoCount(count);
    setDeleteTarget(cat);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      // Reassign all affected videos to "General" to prevent orphaned data (Section 9)
      const affectedVideos = videos.filter(
        (v) => v.category?.toLowerCase() === deleteTarget.name.toLowerCase()
      );
      for (const v of affectedVideos) {
        await updateDoc(doc(db, 'videos', v.id), {
          category: 'General',
          updatedAt: Date.now(),
        });
      }

      await deleteDoc(doc(db, 'categories', deleteTarget.id));
      await loadCategoriesAndCounts();
      setDeleteTarget(null);
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white">Category Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Organize discovery feeds with custom content categories and safe reassignment logic.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories List */}
      <div className="bg-[#11131c] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b0d14] text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Category Name</th>
                <th className="py-3.5 px-4">Slug Identifier</th>
                <th className="py-3.5 px-4">Active Videos</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500">
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500">
                    No categories found. Click "Add Category" above.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-[#151926] transition-colors">
                    <td className="py-3 px-4 font-bold text-white text-sm flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                        <Tags className="w-3.5 h-3.5" />
                      </div>
                      <span>{cat.name}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {cat.slug}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-bold text-[11px]">
                        {cat.videoCount || 0} videos
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Rename Category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => promptDeleteCategory(cat)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Delete Category"
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

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-[#11131c] border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Category Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={categoryName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Comedy Reels"
                  className="w-full bg-[#161a28] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Slug (URL parameter)
                </label>
                <input
                  type="text"
                  value={categorySlug}
                  onChange={(e) => setCategorySlug(e.target.value)}
                  placeholder="comedy-reels"
                  className="w-full bg-[#161a28] border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono text-[11px] placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal with Safe Reassignment Notice */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        title="Delete Category"
        message={
          assignedVideoCount > 0
            ? `There are ${assignedVideoCount} videos currently assigned to "${deleteTarget?.name}". Deleting this category will automatically reassign these videos to "General" to prevent orphaned records.`
            : `Are you sure you want to delete category "${deleteTarget?.name}"?`
        }
        confirmText="Confirm Deletion"
        danger={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
