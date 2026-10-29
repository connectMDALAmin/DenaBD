import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import { firebaseSync, AdminUser, AuditLog, AppSettings } from '../../services/firebase/firebaseSync';
import { getDhakaFormattedTime } from '../../utils/dateUtils';
import {
  Shield,
  Users,
  Activity,
  Sliders,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Search,
  Lock,
  UserCheck,
  UserX,
  Server,
  Database,
  Save,
} from 'lucide-react';

export const AdminPanelView: React.FC = () => {
  const { firebaseUser, isAdmin, setActiveTab } = useApp();
  const { language } = useI18n();

  const [activeSubTab, setActiveSubTab] = useState<'users' | 'audit' | 'settings'>('users');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch admin data
  const loadAdminData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const [loadedUsers, loadedLogs, loadedSettings] = await Promise.all([
        firebaseSync.getAllUsers(),
        firebaseSync.getAdminAuditLogs(),
        firebaseSync.getAppSettings(),
      ]);
      setUsers(loadedUsers);
      setAuditLogs(loadedLogs);
      setAppSettings(loadedSettings);
    } catch (err: any) {
      console.error('Error loading admin panel data:', err);
      setErrorMsg(err?.message || 'Access Denied: Backend rejected administrative query.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  // Handle user status toggle
  const handleToggleStatus = async (user: AdminUser) => {
    try {
      setActionLoading(true);
      setErrorMsg(null);
      const nextStatus = user.status === 'active' ? 'suspended' : 'active';
      await firebaseSync.updateUserStatus(user.id, nextStatus);
      setSuccessMsg(
        language === 'bn'
          ? `${user.displayName}-এর স্ট্যাটাস পরিবর্তন করা হয়েছে (${nextStatus})`
          : `Updated status for ${user.displayName} to ${nextStatus}`
      );
      await loadAdminData();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update user status.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle user role change
  const handleToggleRole = async (user: AdminUser) => {
    if (user.email.toLowerCase() === 'ar2x7ar@gmail.com' || user.id === 'ggKzc6zAJwRSBZg4cDQPFOvrZOH3') {
      alert(language === 'bn' ? 'সিস্টেমের প্রধান মালিকের রোল পরিবর্তন করা যাবে না!' : 'Primary system owner role cannot be revoked.');
      return;
    }
    const nextRole = user.role === 'admin' ? 'user' : 'admin';
    const confirmChange = window.confirm(
      language === 'bn'
        ? `আপনি কি নিশ্চিতভাবে ${user.displayName}-কে ${nextRole === 'admin' ? 'অ্যাডমিন' : 'সাধারণ ব্যবহারকারী'} বানাতে চান?`
        : `Are you sure you want to change ${user.displayName}'s role to ${nextRole}?`
    );
    if (!confirmChange) return;

    try {
      setActionLoading(true);
      setErrorMsg(null);
      await firebaseSync.setUserRole(user.id, user.email, nextRole);
      setSuccessMsg(
        language === 'bn'
          ? `${user.displayName}-এর রোল পরিবর্তিত হয়েছে (${nextRole})`
          : `Role changed to ${nextRole} for ${user.displayName}`
      );
      await loadAdminData();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update user role.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle save settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appSettings) return;

    try {
      setActionLoading(true);
      setErrorMsg(null);
      await firebaseSync.saveAppSettings(appSettings);
      setSuccessMsg(language === 'bn' ? 'সিস্টেম সেটিংস সফলভাবে সংরক্ষিত হয়েছে!' : 'System settings saved successfully!');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save settings.');
    } finally {
      setActionLoading(false);
    }
  };

  // Guard: If not admin, show authentic Windows XP Access Denied dialog
  if (!isAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-[#ECE9D8]">
        <div className="w-full max-w-md bg-[#ECE9D8] border-2 border-[#D83B01] rounded-[6px] xp-window-shadow overflow-hidden text-xs">
          <div className="bg-gradient-to-r from-[#D83B01] to-[#EA6127] text-white px-3 py-1 font-bold flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Lock size={14} />
              <span>{language === 'bn' ? 'নিরাপত্তা সতর্কতা — অনুমতি নেই' : 'Security Alert — Access Denied'}</span>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 border border-red-300 flex items-center justify-center text-red-600 shrink-0">
                <AlertTriangle size={22} />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-gray-900 text-sm">
                  {language === 'bn' ? 'অ্যাডমিনিস্ট্রেটর অ্যাক্সেস প্রয়োজন' : 'Administrator Clearance Required'}
                </h3>
                <p className="text-gray-700 leading-relaxed text-[11px]">
                  {language === 'bn'
                    ? 'আপনার গুগল একাউন্টটি দেনাপাওনা সিস্টেমের অনুমোদিত অ্যাডমিন তালিকায় নেই। ফায়ারবেস ব্যাকএন্ড সিকিউরিটি রুলস দ্বারা এই প্যানেল সম্পূর্ণ সুরক্ষিত।'
                    : 'Your account is not listed in the authorized administrative group. Administrative access is strictly enforced via Firestore Security Rules.'}
                </p>
                <div className="pt-2 text-[11px] text-gray-500">
                  <p>
                    <strong>Logged in:</strong> {firebaseUser?.email || 'Unknown'}
                  </p>
                  <p>
                    <strong>Primary Admin:</strong> ar2x7ar@gmail.com (UID: ggKzc6zAJwRSBZg4cDQPFOvrZOH3)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#D0CCB8]">
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className="xp-button-primary px-5 py-1 text-xs font-bold cursor-pointer"
              >
                {language === 'bn' ? 'ড্যাশবোর্ডে ফিরে যান' : 'Return to Dashboard'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(
    (u) =>
      u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#ECE9D8] overflow-hidden text-xs select-none">
      {/* Top XP Control Panel Banner */}
      <div className="bg-[#E2DECE] border-b border-[#C0BCA8] p-3 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#0055EA] flex items-center justify-center text-white shadow-xs">
            <Shield size={18} />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <span>{language === 'bn' ? 'দেনাপাওনা অ্যাডমিন ও নিরাপত্তা প্যানেল' : 'DenaPawna Security & Admin Control Panel'}</span>
              <span className="px-1.5 py-0.2 bg-emerald-600 text-white rounded text-[10px] font-bold">
                ROOT ACCESS
              </span>
            </h2>
            <p className="text-[11px] text-gray-600">
              {language === 'bn'
                ? `লগইনকৃত অ্যাডমিন: ${firebaseUser?.email || 'AR2x7AR@gmail.com'}`
                : `Logged in as Super Admin: ${firebaseUser?.email || 'AR2x7AR@gmail.com'}`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadAdminData}
          disabled={loading || actionLoading}
          className="xp-button px-3 py-1 flex items-center gap-1.5 text-gray-800 cursor-pointer"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          <span>{language === 'bn' ? 'রিফ্রেশ করুন' : 'Refresh Data'}</span>
        </button>
      </div>

      {/* Status Notifications */}
      {errorMsg && (
        <div className="px-3 py-2 bg-red-100 border-b border-red-300 text-red-800 text-xs flex items-center gap-2 shrink-0">
          <AlertTriangle size={14} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="px-3 py-2 bg-emerald-100 border-b border-emerald-300 text-emerald-800 text-xs flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle size={14} className="shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button type="button" onClick={() => setSuccessMsg(null)} className="text-gray-500 hover:text-black">
            ✕
          </button>
        </div>
      )}

      {/* Classic XP Tabbed Navigation */}
      <div className="flex items-center gap-1 px-3 pt-2 bg-[#DED9C7] border-b border-[#7F9DB9] shrink-0">
        <button
          type="button"
          onClick={() => setActiveSubTab('users')}
          className={`px-4 py-1.5 rounded-t-[4px] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeSubTab === 'users'
              ? 'bg-[#ECE9D8] text-[#003399] border-t-2 border-x-2 border-[#0055EA] -mb-[1px] z-10 shadow-xs'
              : 'bg-[#D2CBB5] text-gray-700 hover:bg-[#DDD7C2]'
          }`}
        >
          <Users size={14} />
          <span>{language === 'bn' ? 'ব্যবহারকারী ব্যবস্থাপনা' : 'User Management'}</span>
          <span className="px-1.5 py-0.2 bg-gray-200 rounded-full text-[10px] text-gray-700 font-normal">
            {users.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('audit')}
          className={`px-4 py-1.5 rounded-t-[4px] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeSubTab === 'audit'
              ? 'bg-[#ECE9D8] text-[#003399] border-t-2 border-x-2 border-[#0055EA] -mb-[1px] z-10 shadow-xs'
              : 'bg-[#D2CBB5] text-gray-700 hover:bg-[#DDD7C2]'
          }`}
        >
          <Activity size={14} />
          <span>{language === 'bn' ? 'নিরাপত্তা ও অডিট লগ' : 'Activity & Audit Log'}</span>
          <span className="px-1.5 py-0.2 bg-gray-200 rounded-full text-[10px] text-gray-700 font-normal">
            {auditLogs.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('settings')}
          className={`px-4 py-1.5 rounded-t-[4px] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
            activeSubTab === 'settings'
              ? 'bg-[#ECE9D8] text-[#003399] border-t-2 border-x-2 border-[#0055EA] -mb-[1px] z-10 shadow-xs'
              : 'bg-[#D2CBB5] text-gray-700 hover:bg-[#DDD7C2]'
          }`}
        >
          <Sliders size={14} />
          <span>{language === 'bn' ? 'সিস্টেম কনফিগারেশন' : 'System Settings'}</span>
        </button>
      </div>

      {/* Main Tab Content Canvas */}
      <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
        {/* SUBTAB 1: USER MANAGEMENT */}
        {activeSubTab === 'users' && (
          <div className="space-y-3">
            {/* Search Bar */}
            <div className="flex items-center gap-2 bg-white p-1.5 border border-[#7F9DB9] rounded-[3px] xp-bevel-inset">
              <Search size={14} className="text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={language === 'bn' ? 'নাম বা ইমেইল দিয়ে খুঁজুন...' : 'Search by name or email...'}
                className="w-full bg-transparent outline-none text-xs text-gray-800"
              />
            </div>

            {/* Users Table */}
            <div className="bg-white border border-[#7F9DB9] rounded-[3px] overflow-x-auto xp-bevel-inset">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#ECE9D8] border-b border-[#D0CCB8] text-gray-800 font-bold sticky top-0">
                  <tr>
                    <th className="p-2 border-r border-[#D0CCB8]">User / Identity</th>
                    <th className="p-2 border-r border-[#D0CCB8]">Email</th>
                    <th className="p-2 border-r border-[#D0CCB8]">Role</th>
                    <th className="p-2 border-r border-[#D0CCB8]">Status</th>
                    <th className="p-2 border-r border-[#D0CCB8]">Last Login (Dhaka)</th>
                    <th className="p-2 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-gray-500 italic">
                        {loading ? 'Loading user directory from Firebase...' : 'No registered users match your search.'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isOwner = u.email.toLowerCase() === 'ar2x7ar@gmail.com';
                      return (
                        <tr key={u.id} className="hover:bg-blue-50/50">
                          <td className="p-2 font-medium text-gray-900 border-r border-gray-100 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 text-[#003399] font-bold flex items-center justify-center text-[11px] shrink-0">
                              {u.displayName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold">{u.displayName}</div>
                              <div className="text-[10px] text-gray-500 font-mono">UID: {u.id.substring(0, 10)}...</div>
                            </div>
                          </td>
                          <td className="p-2 text-gray-700 border-r border-gray-100 font-mono text-[11px]">
                            {u.email}
                          </td>
                          <td className="p-2 border-r border-gray-100">
                            {u.role === 'admin' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                🛡️ Admin
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-gray-100 text-gray-700 border border-gray-200">
                                User
                              </span>
                            )}
                          </td>
                          <td className="p-2 border-r border-gray-100">
                            {u.status === 'active' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                ✓ Active
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                                ✕ Suspended
                              </span>
                            )}
                          </td>
                          <td className="p-2 text-gray-600 border-r border-gray-100 text-[11px]">
                            {u.lastLoginAt ? getDhakaFormattedTime(new Date(u.lastLoginAt)) : '—'}
                          </td>
                          <td className="p-2 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(u)}
                              disabled={actionLoading || isOwner}
                              className={`px-2 py-0.5 rounded text-[10px] font-medium cursor-pointer border ${
                                u.status === 'active'
                                  ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                              } disabled:opacity-40`}
                              title={isOwner ? 'Cannot suspend primary system owner' : 'Toggle account suspension'}
                            >
                              {u.status === 'active' ? (
                                <span className="flex items-center gap-1">
                                  <UserX size={10} />
                                  <span>{language === 'bn' ? 'সাসপেন্ড' : 'Suspend'}</span>
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <UserCheck size={10} />
                                  <span>{language === 'bn' ? 'সক্রিয় করুন' : 'Activate'}</span>
                                </span>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleRole(u)}
                              disabled={actionLoading || isOwner}
                              className="px-2 py-0.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded text-[10px] font-medium border border-gray-300 cursor-pointer disabled:opacity-40"
                              title={isOwner ? 'Primary owner role is protected' : 'Change admin authorization'}
                            >
                              {u.role === 'admin'
                                ? (language === 'bn' ? 'অ্যাডমিন বাতিল' : 'Revoke Admin')
                                : (language === 'bn' ? 'অ্যাডমিন বানান' : 'Make Admin')}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUBTAB 2: ACTIVITY & AUDIT LOG */}
        {activeSubTab === 'audit' && (
          <div className="space-y-3">
            <div className="p-2.5 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-900 flex items-center gap-2">
              <Shield size={16} className="text-blue-600 shrink-0" />
              <span>
                {language === 'bn'
                  ? 'সমস্ত নিরাপত্তা ঘটনা ও অ্যাডমিন কার্যক্রম ফায়ারবেস ক্লাউড ডেটাবেজে সংরক্ষিত হচ্ছে।'
                  : 'Immutable audit log of all logins, role elevations, and critical system events.'}
              </span>
            </div>

            <div className="bg-white border border-[#7F9DB9] rounded-[3px] overflow-hidden xp-bevel-inset">
              <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-100">
                {auditLogs.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 italic">No audit records logged yet.</div>
                ) : (
                  auditLogs.map((log) => (
                    <div key={log.id} className="p-2.5 hover:bg-gray-50 flex items-start justify-between gap-3 text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 font-mono text-[11px]">{log.action}</span>
                          <span className="text-[10px] text-gray-500">• by {log.adminEmail}</span>
                        </div>
                        <p className="text-gray-700 text-[11px]">{log.details}</p>
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono shrink-0">
                        {getDhakaFormattedTime(new Date(log.timestamp))}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 3: SYSTEM SETTINGS */}
        {activeSubTab === 'settings' && appSettings && (
          <form onSubmit={handleSaveSettings} className="space-y-4 max-w-2xl">
            {/* Fieldset: Maintenance & Availability */}
            <fieldset className="border border-[#7F9DB9] p-3 sm:p-4 rounded-[4px] bg-white xp-bevel-inset space-y-3">
              <legend className="px-1.5 font-bold text-[#003399] text-xs">
                {language === 'bn' ? 'সিস্টেম অবস্থা ও রক্ষণাবেক্ষণ' : 'System Availability & Maintenance'}
              </legend>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-800">
                <input
                  type="checkbox"
                  checked={appSettings.maintenanceMode}
                  onChange={(e) =>
                    setAppSettings({ ...appSettings, maintenanceMode: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#0055EA]"
                />
                <span>{language === 'bn' ? 'মেইনটেনেন্স মোড সক্রিয় করুন' : 'Enable Maintenance Mode'}</span>
              </label>

              <div>
                <label className="block text-gray-700 font-medium mb-1 text-[11px]">
                  {language === 'bn' ? 'মেইনটেনেন্স নোটিশ বার্তা:' : 'Maintenance Announcement Text:'}
                </label>
                <input
                  type="text"
                  value={appSettings.maintenanceMessage}
                  onChange={(e) =>
                    setAppSettings({ ...appSettings, maintenanceMessage: e.target.value })
                  }
                  className="w-full p-2 bg-[#F9F9F9] border border-gray-300 rounded text-xs"
                />
              </div>
            </fieldset>

            {/* Fieldset: Global Banner */}
            <fieldset className="border border-[#7F9DB9] p-3 sm:p-4 rounded-[4px] bg-white xp-bevel-inset space-y-3">
              <legend className="px-1.5 font-bold text-[#003399] text-xs">
                {language === 'bn' ? 'ঘোষণা ও ব্যানার' : 'Global Announcement Banner'}
              </legend>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-800">
                <input
                  type="checkbox"
                  checked={appSettings.announcementBanner}
                  onChange={(e) =>
                    setAppSettings({ ...appSettings, announcementBanner: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#0055EA]"
                />
                <span>{language === 'bn' ? 'শীর্ষ ব্যানার প্রদর্শন করুন' : 'Show Top Broadcast Banner'}</span>
              </label>

              <div>
                <label className="block text-gray-700 font-medium mb-1 text-[11px]">
                  {language === 'bn' ? 'ব্যানার বার্তা:' : 'Banner Message:'}
                </label>
                <input
                  type="text"
                  value={appSettings.announcementText}
                  onChange={(e) =>
                    setAppSettings({ ...appSettings, announcementText: e.target.value })
                  }
                  placeholder={language === 'bn' ? 'যেমন: দেনাপাওনা ভার্সন ২.৫ লাইভ আপডেট সম্পন্ন হয়েছে!' : 'e.g., Welcome to DenaPawna Khata!'}
                  className="w-full p-2 bg-[#F9F9F9] border border-gray-300 rounded text-xs"
                />
              </div>
            </fieldset>

            {/* Fieldset: Cloud Infrastructure Specs */}
            <fieldset className="border border-[#7F9DB9] p-3 sm:p-4 rounded-[4px] bg-[#F8F9FA] space-y-2 text-[11px]">
              <legend className="px-1.5 font-bold text-gray-700 text-xs">
                {language === 'bn' ? 'ক্লাউড ইনফ্রাস্ট্রাকচার তথ্য' : 'Cloud Infrastructure Diagnostics'}
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
                <div className="flex items-center gap-1.5">
                  <Database size={13} className="text-emerald-600" />
                  <span><strong>Project:</strong> gen-lang-client-0521177835</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Server size={13} className="text-blue-600" />
                  <span><strong>Database ID:</strong> ai-studio-pawna-cbcff...</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield size={13} className="text-purple-600" />
                  <span><strong>Security:</strong> Hardened Rules Active</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={13} className="text-green-600" />
                  <span><strong>Owner:</strong> AR2x7AR@gmail.com</span>
                </div>
              </div>
            </fieldset>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={actionLoading}
                className="xp-button-primary px-6 py-2 flex items-center gap-1.5 font-bold cursor-pointer disabled:opacity-60"
              >
                <Save size={14} />
                <span>{language === 'bn' ? 'সেটিংস সংরক্ষণ করুন' : 'Save Global Settings'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
