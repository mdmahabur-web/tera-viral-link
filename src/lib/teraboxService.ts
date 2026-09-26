import { VideoQuality } from '../types';
import { getApiCredentials } from './apiSettingsService';

export interface TeraBoxVideoItem {
  server_filename?: string;
  filename?: string;
  name?: string;
  thumbs?: {
    url1?: string;
    url2?: string;
    url3?: string;
  };
  thumb?: string;
  thumbnail?: string;
  formatted_size?: string;
  size?: number | string;
  quality?: string | number;
  duration?: number | string;
  [key: string]: any;
}

export interface TeraBoxFetchResult {
  title: string;
  thumbnail: string;
  size: string;
  quality: VideoQuality;
  resolutionText: string;
  duration: string;
  player_url: string;
  source_url: string;
  rawItem: TeraBoxVideoItem;
}

/**
 * Recognized TeraBox domains and mirror hosts.
 */
export const SUPPORTED_TERABOX_DOMAINS = [
  'terabox.com',
  'teraboxapp.com',
  '1024tera.com',
  '1024terabox.com',
  'terabox.app',
  'terasharelink.com',
  'teraboxlink.com',
  'mirrobox.com',
  'nephobox.com',
  'freeterabox.com',
  'tibibox.com',
  '4funbox.com',
  'momerybox.com',
  'terafileshare.com',
];

/**
 * Checks whether a given URL belongs to a supported TeraBox or mirror domain.
 */
export function isSupportedTeraBoxUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const trimmed = url.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return false;
    }
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    return (
      SUPPORTED_TERABOX_DOMAINS.some(
        (domain) => host === domain || host.endsWith(`.${domain}`)
      ) || host.includes('terabox')
    );
  } catch {
    return false;
  }
}

/**
 * Computes an HMAC-SHA256 signature using the browser standard Web Crypto API.
 */
export async function generateHmacSha256(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await window.crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Formats duration into MM:SS or HH:MM:SS.
 */
export function formatDuration(duration: any): string {
  if (duration === null || duration === undefined || duration === '') {
    return '10:00';
  }

  // If already formatted like "12:34" or "01:23:45"
  if (typeof duration === 'string' && duration.includes(':')) {
    const parts = duration.split(':').map((p) => p.trim());
    if (parts.length === 2 || parts.length === 3) {
      return parts.map((p) => p.padStart(2, '0')).join(':');
    }
  }

  const num = Number(duration);
  if (isNaN(num) || num < 0) {
    return '10:00';
  }

  const totalSeconds = Math.round(num);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Maps raw quality string or number to VideoQuality type.
 */
export function mapQuality(rawQuality: any): VideoQuality {
  if (!rawQuality) return '1080P';
  const str = String(rawQuality).toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (str.includes('4K') || str.includes('2160')) return '4K';
  if (str.includes('2K') || str.includes('1440')) return '2K';
  if (str.includes('720')) return '720P';
  if (str.includes('1080')) return '1080P';
  return '1080P';
}

/**
 * Executes Auto-Fetch from TeraBox using HMAC-SHA256 authentication.
 */
export async function fetchTeraBoxMetadata(
  teraboxLink: string,
  credentialOverrides?: { apiKey: string; apiSecret: string }
): Promise<TeraBoxFetchResult> {
  const cleanLink = teraboxLink.trim();
  if (!cleanLink) {
    throw new Error('Please enter or paste a valid TeraBox link.');
  }

  // Retrieve current active credentials
  const creds = credentialOverrides || (await getApiCredentials());
  if (!creds.apiKey || !creds.apiSecret) {
    throw new Error('TeraBox API credentials not configured. Please check API settings.');
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const requestBody = { url: cleanLink };
  const bodyString = JSON.stringify(requestBody);

  // Signature string: POST + "/v1/api" + timestamp + JSON.stringify(body)
  const stringToSign = 'POST' + '/v1/api' + timestamp + bodyString;
  const signature = await generateHmacSha256(creds.apiSecret, stringToSign);

  let response: Response;
  try {
    response = await fetch('https://api.teraboxdl.site/v1/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': creds.apiKey,
        'X-Timestamp': timestamp,
        'X-Signature': signature,
      },
      body: bodyString,
    });
  } catch (netErr: any) {
    throw new Error(`Network error connecting to TeraBox API: ${netErr?.message || 'Check your connection'}`);
  }

  let data: any;
  try {
    data = await response.json();
  } catch {
    throw new Error(`TeraBox API returned an unexpected response (HTTP ${response.status}).`);
  }

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || data?.errmsg || `TeraBox API returned HTTP ${response.status}`;
    throw new Error(errorMsg);
  }

  // Check for TeraBox API errno
  if (data?.errno !== undefined && data.errno !== 0) {
    throw new Error(data.errmsg || `TeraBox returned error code: ${data.errno}`);
  }

  // Locate list[0]
  const list = data?.list || data?.data?.list || [];
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error(data?.errmsg || 'No video files found for this TeraBox link.');
  }

  const item: TeraBoxVideoItem = list[0];

  // Auto-fill mappings:
  // Name -> server_filename
  const title = item.server_filename || item.filename || item.name || '';

  // Thumbnail -> thumbs.url3, fallback url2 -> url1
  const thumbnail = item.thumbs?.url3 || item.thumbs?.url2 || item.thumbs?.url1 || item.thumb || item.thumbnail || '';

  // Size -> formatted_size
  const size = item.formatted_size || (item.size ? `${item.size} bytes` : '450 MB');

  // Resolution -> quality + "p"
  const rawQuality = item.quality !== undefined && item.quality !== null ? `${item.quality}p` : '1080p';
  const quality = mapQuality(item.quality || rawQuality);

  // Duration -> duration, formatted as MM:SS or HH:MM:SS
  const duration = formatDuration(item.duration);

  // Extract direct streaming link and file identifiers
  const direct = item.dlink || item.direct || item.direct_link || item.download_url || '';
  const fs_id = item.fs_id || item.fsid || '';

  // User requirement: No player format conversion, keep the original TeraBox link
  const player_url = cleanLink;

  return {
    title,
    thumbnail,
    size,
    quality,
    resolutionText: rawQuality,
    duration,
    player_url,
    source_url: cleanLink,
    rawItem: item,
  };
}

/**
 * Validates the API Key and Secret against the TeraBox endpoint.
 */
export async function testTeraBoxCredentials(
  apiKey: string,
  apiSecret: string
): Promise<{ success: boolean; message: string }> {
  const cleanKey = apiKey.trim();
  const cleanSecret = apiSecret.trim();

  if (!cleanKey || !cleanSecret) {
    return { success: false, message: 'API Key and Secret must not be empty.' };
  }

  try {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const requestBody = { url: 'https://teraboxapp.com/s/1probe_test_auth' };
    const bodyString = JSON.stringify(requestBody);
    const stringToSign = 'POST' + '/v1/api' + timestamp + bodyString;
    const signature = await generateHmacSha256(cleanSecret, stringToSign);

    const res = await fetch('https://api.teraboxdl.site/v1/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': cleanKey,
        'X-Timestamp': timestamp,
        'X-Signature': signature,
      },
      body: bodyString,
    });

    const data = await res.json().catch(() => null);

    if (res.status === 401 || res.status === 403) {
      return {
        success: false,
        message: data?.error || data?.message || 'Authentication failed: Invalid API Key or Secret.',
      };
    }

    if (res.status === 200) {
      return {
        success: true,
        message: 'Credentials verified! TeraBox API accepted HMAC-SHA256 signature and API key.',
      };
    }

    return {
      success: false,
      message: data?.error || data?.message || `Server responded with status ${res.status}.`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Connection test error: ${err?.message || 'Network request failed.'}`,
    };
  }
}
