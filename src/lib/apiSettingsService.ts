import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { ApiCredentials } from '../types';

export const DEFAULT_TERABOX_API_KEY = 'tbx_llqQ6BidxWNQ_qJa9vuKuszur4ZC6CTp5BP7Y1S8Ze0';
export const DEFAULT_TERABOX_API_SECRET = 'OCD_Ag7jnc2C3kW_ZnYxbWIKbNILlircq8jk5OSXM9Takq5-Ayf8YDjGt8N7Vzn-';

// In-memory cache for active admin session only (never plain localStorage)
let memoryCache: ApiCredentials | null = null;

/**
 * Retrieves the stored API credentials from Firebase Firestore.
 * If not present yet, it initializes the document with the default credentials.
 * Only authenticated Admins have Firestore permission to read/write this document.
 */
export async function getApiCredentials(): Promise<ApiCredentials> {
  if (memoryCache && memoryCache.apiKey && memoryCache.apiSecret) {
    return memoryCache;
  }

  try {
    const credRef = doc(db, 'api_credentials', 'terabox');
    const snap = await getDoc(credRef);
    if (snap.exists()) {
      const data = snap.data() as Partial<ApiCredentials>;
      const creds: ApiCredentials = {
        apiKey: data.apiKey?.trim() || DEFAULT_TERABOX_API_KEY,
        apiSecret: data.apiSecret?.trim() || DEFAULT_TERABOX_API_SECRET,
        updatedAt: data.updatedAt,
        updatedBy: data.updatedBy,
      };
      memoryCache = creds;
      return creds;
    } else {
      // First-time initialize with default credentials in Firestore
      const initial: ApiCredentials = {
        apiKey: DEFAULT_TERABOX_API_KEY,
        apiSecret: DEFAULT_TERABOX_API_SECRET,
        updatedAt: Date.now(),
        updatedBy: 'system-initial',
      };
      await setDoc(credRef, initial, { merge: true }).catch(() => {});
      memoryCache = initial;
      return initial;
    }
  } catch (err) {
    // If permission or offline, fall back to default credentials in memory
    const fallback: ApiCredentials = {
      apiKey: DEFAULT_TERABOX_API_KEY,
      apiSecret: DEFAULT_TERABOX_API_SECRET,
      updatedAt: Date.now(),
      updatedBy: 'fallback',
    };
    memoryCache = fallback;
    return fallback;
  }
}

/**
 * Updates API credentials in Firebase Firestore (admin only).
 */
export async function saveApiCredentials(
  apiKey: string,
  apiSecret: string,
  userEmail?: string
): Promise<void> {
  const cleanKey = apiKey.trim();
  const cleanSecret = apiSecret.trim();

  if (!cleanKey) {
    throw new Error('API Key cannot be empty.');
  }
  if (!cleanSecret) {
    throw new Error('API Secret cannot be empty.');
  }

  const payload: ApiCredentials = {
    apiKey: cleanKey,
    apiSecret: cleanSecret,
    updatedAt: Date.now(),
    updatedBy: userEmail || 'admin',
  };

  const credRef = doc(db, 'api_credentials', 'terabox');
  await setDoc(credRef, payload, { merge: true });
  memoryCache = payload;
}

/**
 * Resets API credentials to the default system values.
 */
export async function resetApiCredentialsToDefault(userEmail?: string): Promise<void> {
  await saveApiCredentials(DEFAULT_TERABOX_API_KEY, DEFAULT_TERABOX_API_SECRET, userEmail);
}

/**
 * Utility to produce a masked representation of the API secret for display in the Admin UI.
 */
export function maskSecret(secret: string): string {
  if (!secret) return '';
  if (secret.length <= 8) return '••••••••••••';
  const prefix = secret.slice(0, 4);
  const suffix = secret.slice(-4);
  return `${prefix}${'•'.repeat(Math.max(12, secret.length - 8))}${suffix}`;
}
