import { Video } from '../types';

const RECENTLY_VIEWED_KEY = 'tvl_recent_videos';
const BOOKMARKS_KEY = 'tvl_bookmarks';

export interface StoredVideoSummary {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl: string;
  quality: string;
  duration: string;
  viewedAt: number;
  targetUrl: string;
}

function extractTargetUrl(video: Video): string {
  return (
    video.source_url ||
    video.sourceUrl ||
    video.playerWebsiteUrl ||
    video.player_url ||
    video.link ||
    video.url ||
    ''
  ).trim();
}

export function getRecentlyViewed(): StoredVideoSummary[] {
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addRecentlyViewed(video: Video): void {
  try {
    const current = getRecentlyViewed();
    const filtered = current.filter((item) => item.id !== video.id && item.slug !== video.slug);
    const updated: StoredVideoSummary = {
      id: video.id,
      slug: video.slug,
      title: video.title,
      thumbnailUrl: video.thumbnailUrl,
      quality: video.quality,
      duration: video.duration,
      viewedAt: Date.now(),
      targetUrl: extractTargetUrl(video),
    };
    const nextList = [updated, ...filtered].slice(0, 20); // keep up to 20
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(nextList));
  } catch (err) {
    console.error('Error saving recent video:', err);
  }
}

export function getBookmarks(): StoredVideoSummary[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isBookmarked(videoId: string): boolean {
  try {
    const list = getBookmarks();
    return list.some((item) => item.id === videoId);
  } catch {
    return false;
  }
}

export function toggleBookmark(video: Video): boolean {
  try {
    const current = getBookmarks();
    const exists = current.some((item) => item.id === video.id);
    let nextList: StoredVideoSummary[];
    if (exists) {
      nextList = current.filter((item) => item.id !== video.id);
    } else {
      const item: StoredVideoSummary = {
        id: video.id,
        slug: video.slug,
        title: video.title,
        thumbnailUrl: video.thumbnailUrl,
        quality: video.quality,
        duration: video.duration,
        viewedAt: Date.now(),
        targetUrl: extractTargetUrl(video),
      };
      nextList = [item, ...current];
    }
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(nextList));
    return !exists;
  } catch {
    return false;
  }
}
