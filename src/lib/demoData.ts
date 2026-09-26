import { Video, Category } from '../types';
import { collection, getDocs, doc, setDoc, limit, query } from 'firebase/firestore';
import { db } from './firebase';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-viral', name: 'Viral Hits', slug: 'viral-hits', videoCount: 3, createdAt: Date.now() - 86400000 * 7 },
  { id: 'cat-trailers', name: 'Trailers & Clips', slug: 'trailers-clips', videoCount: 2, createdAt: Date.now() - 86400000 * 6 },
  { id: 'cat-gaming', name: 'Gaming & Esports', slug: 'gaming-esports', videoCount: 2, createdAt: Date.now() - 86400000 * 5 },
  { id: 'cat-cinematic', name: 'Cinematic Shorts', slug: 'cinematic-shorts', videoCount: 2, createdAt: Date.now() - 86400000 * 4 },
  { id: 'cat-music', name: 'Music & Vibes', slug: 'music-vibes', videoCount: 1, createdAt: Date.now() - 86400000 * 3 },
];

export const INITIAL_VIDEOS: Video[] = [
  {
    id: 'vid-demo-1',
    title: 'Cyberpunk Neo Tokyo Night Drive 4K HDR',
    slug: 'cyberpunk-neo-tokyo-night-drive-4k-hdr',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1000&auto=format&fit=crop',
    playerWebsiteUrl: 'https://teraboxapp.com/s/1cyberpunk-neo-tokyo-4k',
    player_url: 'https://teraboxapp.com/s/1cyberpunk-neo-tokyo-4k',
    source_url: 'https://teraboxapp.com/s/1cyberpunk-neo-tokyo-4k',
    category: 'Cinematic Shorts',
    quality: '4K',
    duration: '14:28',
    fileSize: '1.2 GB',
    views: 12480,
    status: 'published',
    featured: true,
    createdAt: Date.now() - 3600000 * 4,
    updatedAt: Date.now() - 3600000 * 4,
  },
  {
    id: 'vid-demo-2',
    title: 'Top 10 Insane Stunts of the Year Viral Compilation',
    slug: 'top-10-insane-stunts-of-the-year-viral-compilation',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?q=80&w=1000&auto=format&fit=crop',
    playerWebsiteUrl: 'https://teraboxapp.com/s/1top10-insane-stunts',
    player_url: 'https://teraboxapp.com/s/1top10-insane-stunts',
    source_url: 'https://teraboxapp.com/s/1top10-insane-stunts',
    category: 'Viral Hits',
    quality: '1080P',
    duration: '09:42',
    fileSize: '480 MB',
    views: 45920,
    status: 'published',
    featured: true,
    createdAt: Date.now() - 3600000 * 12,
    updatedAt: Date.now() - 3600000 * 12,
  },
  {
    id: 'vid-demo-3',
    title: 'Interstellar Deep Space Journey Cinematic Universe',
    slug: 'interstellar-deep-space-journey-cinematic-universe',
    thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop',
    playerWebsiteUrl: 'https://teraboxapp.com/s/1deep-space-journey',
    player_url: 'https://teraboxapp.com/s/1deep-space-journey',
    source_url: 'https://teraboxapp.com/s/1deep-space-journey',
    category: 'Cinematic Shorts',
    quality: '2K',
    duration: '18:15',
    fileSize: '950 MB',
    views: 28310,
    status: 'published',
    featured: false,
    createdAt: Date.now() - 3600000 * 20,
    updatedAt: Date.now() - 3600000 * 20,
  },
  {
    id: 'vid-demo-4',
    title: 'Ultimate Pro Esports Championship Highlights 2026',
    slug: 'ultimate-pro-esports-championship-highlights-2026',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop',
    playerWebsiteUrl: 'https://1024tera.com/s/1esports-championship-2026',
    player_url: 'https://1024tera.com/s/1esports-championship-2026',
    source_url: 'https://1024tera.com/s/1esports-championship-2026',
    category: 'Gaming & Esports',
    quality: '1080P',
    duration: '22:05',
    fileSize: '780 MB',
    views: 31200,
    status: 'published',
    featured: false,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'vid-demo-5',
    title: 'Midnight Synthwave Lo-Fi Beats to Relax & Code',
    slug: 'midnight-synthwave-lo-fi-beats-to-relax-code',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000&auto=format&fit=crop',
    playerWebsiteUrl: 'https://teraboxapp.com/s/1synthwave-lofi-beats',
    player_url: 'https://teraboxapp.com/s/1synthwave-lofi-beats',
    source_url: 'https://teraboxapp.com/s/1synthwave-lofi-beats',
    category: 'Music & Vibes',
    quality: '720P',
    duration: '45:00',
    fileSize: '320 MB',
    views: 18950,
    status: 'published',
    featured: false,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'vid-demo-6',
    title: 'Epic Action Movie Official Teaser & Behind The Scenes',
    slug: 'epic-action-movie-official-teaser-behind-the-scenes',
    thumbnailUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1000&auto=format&fit=crop',
    playerWebsiteUrl: 'https://terasharelink.com/s/1action-teaser-bts',
    player_url: 'https://terasharelink.com/s/1action-teaser-bts',
    source_url: 'https://terasharelink.com/s/1action-teaser-bts',
    category: 'Trailers & Clips',
    quality: '4K',
    duration: '04:12',
    fileSize: '290 MB',
    views: 52190,
    status: 'published',
    featured: true,
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 86400000 * 4,
  },
  {
    id: 'vid-demo-7',
    title: 'Next Gen Unreal Engine 5 Realism Tech Demo',
    slug: 'next-gen-unreal-engine-5-realism-tech-demo',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop',
    playerWebsiteUrl: 'https://teraboxapp.com/s/1ue5-realism-demo',
    player_url: 'https://teraboxapp.com/s/1ue5-realism-demo',
    source_url: 'https://teraboxapp.com/s/1ue5-realism-demo',
    category: 'Gaming & Esports',
    quality: '2K',
    duration: '11:34',
    fileSize: '620 MB',
    views: 15400,
    status: 'published',
    featured: false,
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'vid-demo-8',
    title: 'Global Trending Street Food Festival Journey',
    slug: 'global-trending-street-food-festival-journey',
    thumbnailUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop',
    playerWebsiteUrl: 'https://teraboxapp.com/s/1street-food-festival',
    player_url: 'https://teraboxapp.com/s/1street-food-festival',
    source_url: 'https://teraboxapp.com/s/1street-food-festival',
    category: 'Viral Hits',
    quality: '1080P',
    duration: '08:50',
    fileSize: '410 MB',
    views: 39800,
    status: 'published',
    featured: false,
    createdAt: Date.now() - 86400000 * 6,
    updatedAt: Date.now() - 86400000 * 6,
  },
];

export async function seedInitialDemoData(): Promise<void> {
  try {
    const vRef = collection(db, 'videos');
    const snap = await getDocs(query(vRef, limit(1)));
    if (!snap.empty) {
      return; // Already populated
    }

    // Seed default settings
    await setDoc(doc(db, 'settings', 'site'), {
      appName: 'Tera Viral Link',
      logoUrl: '',
      footerText: '© 2026 Tera Viral Link. Discover premium viral media links worldwide.',
      maintenanceMode: false,
      maintenanceMessage: 'Tera Viral Link is currently undergoing scheduled maintenance. Please check back shortly.',
      contactEmail: 'support@teravirallink.example',
      contactNotice: 'For inquiries, DMCA, or partnership requests, please submit your message.',
      updatedAt: Date.now(),
    }, { merge: true });

    await setDoc(doc(db, 'settings', 'ads'), {
      topBannerEnabled: true,
      topBannerHtml: '<div class="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border border-amber-500/30 text-amber-300 text-center text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-inner"><span class="px-1.5 py-0.5 rounded bg-amber-500/20 text-[10px] uppercase tracking-wider font-bold">Sponsored</span> High Speed Cloud Player & Download Accelerator • Get Premium Access</div>',
      bottomBannerEnabled: true,
      bottomBannerHtml: '<div class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500/10 via-blue-500/20 to-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-center text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-inner"><span class="px-1.5 py-0.5 rounded bg-cyan-500/20 text-[10px] uppercase tracking-wider font-bold">Recommended</span> Stream in 4K Ultra HD With Unlimited Bandwidth • Instant Link Vault</div>',
      updatedAt: Date.now(),
    }, { merge: true });

    // Seed categories
    for (const cat of INITIAL_CATEGORIES) {
      await setDoc(doc(db, 'categories', cat.id), cat, { merge: true });
    }

    // Seed initial videos
    for (const vid of INITIAL_VIDEOS) {
      await setDoc(doc(db, 'videos', vid.id), vid, { merge: true });
    }

    console.log('Initial demo data seeded successfully.');
  } catch (err) {
    console.warn('Initial demo seed skipped or unauthorized:', err);
  }
}
