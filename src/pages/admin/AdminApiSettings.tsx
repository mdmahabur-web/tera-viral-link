import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getApiCredentials,
  saveApiCredentials,
  resetApiCredentialsToDefault,
  DEFAULT_TERABOX_API_KEY,
  DEFAULT_TERABOX_API_SECRET,
} from '../../lib/apiSettingsService';
import { testTeraBoxCredentials } from '../../lib/teraboxService';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import {
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Activity,
  Lock,
  Sparkles,
} from 'lucide-react';

export const AdminApiSettings: React.FC = () => {
  const { user } = useAuth();

  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [isSecretMasked, setIsSecretMasked] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    setLoading(true);
    setSaveError(null);
    try {
      const creds = await getApiCredentials();
      setApiKey(creds.apiKey);
      setApiSecret(creds.apiSecret);
    } catch (err: any) {
      setSaveError('Failed to load API credentials from Firebase.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyKey = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testTeraBoxCredentials(apiKey, apiSecret);
      setTestResult(result);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Error occurred while testing connection.',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);

    if (!apiKey.trim()) {
      setSaveError('Client API Key cannot be empty.');
      return;
    }
    if (!apiSecret.trim()) {
      setSaveError('Client API Secret cannot be empty.');
      return;
    }

    setSaving(true);
    try {
      await saveApiCredentials(apiKey, apiSecret, user?.email || undefined);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to save credentials to Firebase.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetConfirm = async () => {
    setSaving(true);
    setShowResetModal(false);
    setSaveError(null);
    try {
      await resetApiCredentialsToDefault(user?.email || undefined);
      setApiKey(DEFAULT_TERABOX_API_KEY);
      setApiSecret(DEFAULT_TERABOX_API_SECRET);
      setSaveSuccess(true);
      setTestResult(null);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to reset credentials.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">API Credential Settings</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Securely configure and manage API credentials for the TeraBox Auto-Fetch integration.
            </p>
          </div>
        </div>
      </div>

      {/* Security Banner */}
      <div className="p-4 rounded-2xl bg-[#0f1320] border border-cyan-500/30 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xs font-bold text-white flex items-center gap-2">
            <span>Enterprise-Grade ABAC Security & Protection</span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono">
              Admin-Only
            </span>
          </h2>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            API credentials are never stored in unencrypted browser localStorage, client bundles, or exposed publicly.
            They are stored strictly in protected Firebase Firestore collections guarded by zero-trust security rules.
            The Secret is masked by default in the Admin console.
          </p>
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="bg-[#11131c] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">TeraBox Auto-Fetch Provider API</h2>
              <span className="text-[10px] text-slate-400">Endpoint: https://api.teraboxdl.site/v1/api (HMAC-SHA256)</span>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold uppercase border border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active Provider
          </span>
        </div>

        {/* Alerts */}
        {saveSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>API credentials saved successfully to Firebase! Auto-Fetch will immediately use these credentials.</span>
          </div>
        )}

        {saveError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        {testResult && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              testResult.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-500 space-y-2">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Loading secure API credentials...</span>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-5 text-xs">
            {/* Client API Key */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-semibold">
                Client API Key <span className="text-rose-400">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  required
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="tbx_..."
                  className="w-full bg-[#161a28] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs placeholder-slate-600 focus:outline-none focus:border-amber-500 pr-10"
                />
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="absolute right-2 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  title="Copy API Key"
                >
                  {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500">
                Supplied via <code className="text-amber-400">X-API-Key</code> request header.
              </p>
            </div>

            {/* Client API Secret */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-slate-300 font-semibold">
                  Client API Secret <span className="text-rose-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsSecretMasked(!isSecretMasked)}
                  className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {isSecretMasked ? (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Reveal Secret</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Mask Secret</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative flex items-center">
                <input
                  type={isSecretMasked ? 'password' : 'text'}
                  required
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                  placeholder="OCD_..."
                  className="w-full bg-[#161a28] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs placeholder-slate-600 focus:outline-none focus:border-amber-500 pr-10"
                />
                <div className="absolute right-3 text-slate-600">
                  <Lock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[10px] text-slate-500">
                Used to compute the HMAC-SHA256 signature for <code className="text-amber-400">X-Signature</code> header.
                Kept strictly confidential and masked in the UI.
              </p>
            </div>

            {/* Actions Bar */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {/* Test Connection Button */}
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testing || !apiKey || !apiSecret}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Activity className={`w-3.5 h-3.5 ${testing ? 'animate-spin text-amber-400' : 'text-slate-400'}`} />
                  <span>{testing ? 'Testing Connection...' : 'Test Connection'}</span>
                </button>

                {/* Reset to Defaults Button */}
                <button
                  type="button"
                  onClick={() => setShowResetModal(true)}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl bg-slate-800/60 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 font-semibold text-xs border border-slate-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Defaults</span>
                </button>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save API Credentials'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Reset Confirmation Modal */}
      <ConfirmationModal
        isOpen={showResetModal}
        title="Reset API Credentials"
        message="Are you sure you want to reset the TeraBox API Key and Secret to the default initial values? Any custom credentials will be overwritten."
        confirmText="Reset to Defaults"
        danger={true}
        onConfirm={handleResetConfirm}
        onCancel={() => setShowResetModal(false)}
      />
    </div>
  );
};
