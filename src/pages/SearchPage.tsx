import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Video } from '../types';
import { VideoGrid } from '../components/VideoGrid';
import { Search } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [results, setResults] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function searchVideos() {
      if (!queryParam.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const vRef = collection(db, 'videos');
        // Fetch published videos and filter by title locally (case-insensitive substring)
        const q = query(vRef, where('status', '==', 'published'));
        const snap = await getDocs(q);

        const lowerQuery = queryParam.trim().toLowerCase();
        const matches: Video[] = [];

        snap.forEach((doc) => {
          const data = doc.data() as Omit<Video, 'id'>;
          if (data.title && data.title.toLowerCase().includes(lowerQuery)) {
            matches.push({ id: doc.id, ...data });
          }
        });

        // Sort matches by relevance/views
        matches.sort((a, b) => b.views - a.views);
        setResults(matches);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }

    searchVideos();
  }, [queryParam]);

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Search Results
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {queryParam ? `Showing matching titles for "${queryParam}"` : 'Enter a title to search'}
            </p>
          </div>
        </div>

        {queryParam && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
            {results.length} found
          </span>
        )}
      </div>

      <VideoGrid
        videos={results}
        loading={loading}
        emptyTitle={queryParam ? `No results for "${queryParam}"` : 'Type in the search bar above'}
        emptySubtitle="Try searching with different keywords or check our Trending section."
      />
    </div>
  );
};
