import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Video, Category, FeedTab } from '../types';
import { seedInitialDemoData } from '../lib/demoData';

const PAGE_SIZE = 12;

export function useVideos(feedType: FeedTab = 'trending', selectedCategory: string = 'all') {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);

  const fetchVideos = useCallback(async (isNextPage = false) => {
    if (isNextPage) {
      if (!lastDoc || loadingMore) return;
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      // Ensure initial demo data exists if empty
      await seedInitialDemoData();

      const videosRef = collection(db, 'videos');
      const constraints: any[] = [
        where('status', '==', 'published'),
      ];

      if (selectedCategory && selectedCategory !== 'all') {
        constraints.push(where('category', '==', selectedCategory));
      }

      // Order based on feed
      if (feedType === 'popular') {
        constraints.push(orderBy('views', 'desc'));
      } else if (feedType === 'latest') {
        constraints.push(orderBy('createdAt', 'desc'));
      } else if (feedType === 'trending') {
        // Trending: featured first, then views & recency
        constraints.push(orderBy('views', 'desc'));
      } else {
        // For You: recency & balanced views
        constraints.push(orderBy('createdAt', 'desc'));
      }

      constraints.push(limit(PAGE_SIZE));

      if (isNextPage && lastDoc) {
        constraints.push(startAfter(lastDoc));
      }

      const q = query(videosRef, ...constraints);
      const snapshot = await getDocs(q);

      const items: Video[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...(doc.data() as Omit<Video, 'id'>) });
      });

      // Special in-memory sorting adjustments for Trending if needed (e.g. pinned/featured boost)
      let processedItems = items;
      if (feedType === 'trending' && !isNextPage) {
        processedItems = [...items].sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return b.views - a.views;
        });
      }

      if (isNextPage) {
        setVideos((prev) => [...prev, ...processedItems]);
      } else {
        setVideos(processedItems);
      }

      const docs = snapshot.docs;
      if (docs.length >= PAGE_SIZE) {
        setHasMore(true);
        setLastDoc(docs[docs.length - 1]);
      } else {
        setHasMore(false);
        setLastDoc(null);
      }
    } catch (err) {
      console.error('Error fetching videos:', err);
      // Fallback: don't crash public users
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [feedType, selectedCategory, lastDoc, loadingMore]);

  // Refetch when tab or category changes
  useEffect(() => {
    setLastDoc(null);
    fetchVideos(false);
  }, [feedType, selectedCategory]);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchVideos(true);
    }
  };

  return {
    videos,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    refetch: () => fetchVideos(false),
  };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const catRef = collection(db, 'categories');
        const snap = await getDocs(catRef);
        const list: Category[] = [];
        snap.forEach((doc) => {
          list.push({ id: doc.id, ...(doc.data() as Omit<Category, 'id'>) });
        });
        setCategories(list);
      } catch (err) {
        console.warn('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { categories, loading };
}
