import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, UserCheck, Lock, Key, Info } from 'lucide-react';

interface AdminRecord {
  uid: string;
  email: string;
  role: string;
  createdAt?: number;
}

export const AdminSecurity: React.FC = () => {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdmins() {
      try {
        const snap = await getDocs(collection(db, 'admins'));
        const list: AdminRecord[] = [];
        snap.forEach((d) => {
          list.push({ uid: d.id, ...(d.data() as any) });
        });
        setAdmins(list);
      } catch (err) {
        console.error('Error loading admin records:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAdmins();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-black text-white">Security & Access Control</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Role-Based Access Control (RBAC) and registered administrator privileges.
        </p>
      </div>

      {/* Info Card explaining First Admin Rule */}
      <div className="p-4 rounded-2xl bg-[#11131c] border border-amber-500/20 text-xs space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold">
          <Info className="w-4 h-4" />
          <span>Security Architecture & First-Admin Provisioning Policy</span>
        </div>
        <p className="text-slate-300 leading-relaxed">
          In compliance with the system specification:
          When the database contains no registered administrator, the first registered user is securely appointed as the initial Administrator.
          All subsequent public registrations are restricted to normal user access and denied admin routes by both client guards and Cloud Firestore Security Rules.
        </p>
      </div>

      {/* Current Active Session */}
      <div className="bg-[#11131c] border border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-emerald-400" />
          <span>Current Active Administrator Session</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-[#161a28] border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Authenticated Email</span>
            <p className="font-semibold text-white font-mono">{user?.email}</p>
          </div>

          <div className="p-3 rounded-xl bg-[#161a28] border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Firebase User ID (UID)</span>
            <p className="font-semibold text-white font-mono text-[11px] truncate">{user?.uid}</p>
          </div>
        </div>
      </div>

      {/* Authorized Admins Table */}
      <div className="bg-[#11131c] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Authorized Database Administrators
          </h3>
          <span className="text-xs text-amber-400 font-bold">
            {admins.length} Total Registered
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b0d14] text-slate-400 font-semibold border-b border-slate-800 text-[10px] uppercase">
              <tr>
                <th className="py-3 px-4">Admin Email</th>
                <th className="py-3 px-4">Role Badge</th>
                <th className="py-3 px-4 font-mono">UID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-slate-500">
                    Loading admin records...
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-slate-500">
                    No explicit admin documents loaded.
                  </td>
                </tr>
              ) : (
                admins.map((adm) => (
                  <tr key={adm.uid} className="hover:bg-[#151926]">
                    <td className="py-3 px-4 font-semibold text-white">
                      {adm.email || 'Admin'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        {adm.role || 'admin'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 truncate max-w-xs">
                      {adm.uid}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
