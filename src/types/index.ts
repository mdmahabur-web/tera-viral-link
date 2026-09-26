export type VideoQuality = '720P' | '1080P' | '2K' | '4K';
export type VideoStatus = 'published' | 'draft' | 'hidden';

export interface Video {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string;
  description?: string;
  playerWebsiteUrl: string;
  player_url?: string;
  link?: string;
  url?: string;
  source_url?: string;
  sourceUrl?: string;
  category: string;
  quality: VideoQuality;
  duration: string; // e.g. "13:05"
  fileSize: string; // e.g. "450 MB"
  views: number;
  status: VideoStatus;
  featured: boolean;
  createdAt: number; // epoch ms or timestamp
  updatedAt: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  videoCount?: number;
  createdAt: number;
}

export interface AdSettings {
  topBannerEnabled: boolean;
  topBannerHtml: string;
  bottomBannerEnabled: boolean;
  bottomBannerHtml: string;
  updatedAt?: number;
}

export interface SiteSettings {
  appName: string;
  logoUrl: string;
  footerText: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  contactEmail: string;
  contactNotice: string;
  updatedAt?: number;
}

export interface AdminUser {
  uid: string;
  email: string;
  role: 'admin';
  createdAt: number;
}

export interface ApiCredentials {
  apiKey: string;
  apiSecret: string;
  updatedAt?: number;
  updatedBy?: string;
}

export type FeedTab = 'trending' | 'for-you' | 'popular' | 'latest';
