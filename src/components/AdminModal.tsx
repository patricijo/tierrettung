import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Database,
  Edit3,
  KeyRound,
  LogOut,
  PawPrint,
  PhoneCall,
  Plus,
  RefreshCw,
   RotateCcw,
  Save,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import type { AnimalProfile, CountryCode, EmergencyHotline } from '../data/rescueData';
import {
  deleteAnimalProfileAdminApi,
  deleteHotlineAdminApi,
  deleteOrganizationAdminApi,
  fetchAdminOverview,
  getSavedAdminToken,
  loginAdmin,
  resetDatabaseAdminApi,
  saveAdminToken,
  saveAnimalProfileAdminApi,
  saveHotlineAdminApi,
  saveOrganizationAdminApi,
  updateOrganizationStatusAdminApi,
} from '../services/apiService';
import type {
  DatabaseStatusInfo,
  OrganizationStatus,
  OrganizationType,
  RescueOrganization,
} from '../types/organization';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
}

type AdminTab = 'organizations' | 'animals' | 'hotlines';

export function AdminModal({ isOpen, onClose, onDataChanged }: AdminModalProps) {
  const [token, setToken] = useState<string | null>(() => getSavedAdminToken());
  const [usernameInput, setUsernameInput] = useState('admin');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('organizations');
  const [isLoading, setIsLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const [dbStatus, setDbStatus] = useState<DatabaseStatusInfo | null>(null);
  const [organizations, setOrganizations] = useState<RescueOrganization[]>([]);
  const [animals, setAnimals] = useState<AnimalProfile[]>([]);
  const [hotlines, setHotlines] = useState<EmergencyHotline[]>([]);

  // Organization filters & editor
  const [orgStatusFilter, setOrgStatusFilter] = useState<'all' | OrganizationStatus>('all');
  const [orgSearch, setOrgSearch] = useState('');
  const [editingOrg, setEditingOrg] = useState<Partial<RescueOrganization> | null>(null);

  // Animal profile editor
  const [editingAnimal, setEditingAnimal] = useState<AnimalProfile | null>(null);

  // Hotline editor
  const [editingHotline, setEditingHotline] = useState<EmergencyHotline | null>(null);

  const loadOverview = async (currentToken: string, reconnect = false) => {
    setIsLoading(true);
    setErrorBanner(null);
    try {
      const data = await fetchAdminOverview(currentToken, reconnect);
      setDbStatus(data.dbStatus);
      setOrganizations(data.organizations);
      setAnimals(data.animals);
      setHotlines(data.hotlines);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Fehler beim Laden';
      if (msg.includes('Nicht autorisiert') || msg.includes('401')) {
        saveAdminToken(null);
        setToken(null);
      } else {
        setErrorBanner(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && token) {
      loadOverview(token);
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => {
      setActionFeedback((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoggingIn(true);
    try {
      const res = await loginAdmin(usernameInput.trim(), passwordInput);
      setToken(res.token);
      setPasswordInput('');
      await loadOverview(res.token);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Anmeldung fehlgeschlagen');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    saveAdminToken(null);
    setToken(null);
  };

  const handleOrgStatusChange = async (
    id: string,
    status: OrganizationStatus,
    verifiedPartner?: boolean,
  ) => {
    if (!token) return;
    try {
      await updateOrganizationStatusAdminApi(token, id, status, verifiedPartner);
      await loadOverview(token);
      onDataChanged();
      showToast(
        status === 'approved'
          ? 'Organisation freigegeben & live geschaltet!'
          : status === 'rejected'
            ? 'Organisation abgelehnt.'
            : 'Status aktualisiert.',
      );
    } catch (err) {
      setErrorBanner(err instanceof Error ? err.message : 'Fehler beim Status-Update');
    }
  };

  const handleDeleteOrg = async (id: string, name: string) => {
    if (!token) return;
    if (!window.confirm(`Organisation „${name}“ wirklich aus der Datenbank löschen?`)) return;
    try {
      await deleteOrganizationAdminApi(token, id);
      await loadOverview(token);
      onDataChanged();
      showToast('Organisation gelöscht.');
    } catch (err) {
      setErrorBanner(err instanceof Error ? err.message : 'Fehler beim Löschen');
    }
  };

  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingOrg?.name || !editingOrg?.phone) return;
    try {
      await saveOrganizationAdminApi(
        token,
        editingOrg as Partial<RescueOrganization> & { name: string; phone: string },
      );
      setEditingOrg(null);
      await loadOverview(token);
      onDataChanged();
      showToast('Organisation in Datenbank gespeichert.');
    } catch (err) {
      setErrorBanner(err instanceof Error ? err.message : 'Fehler beim Speichern');
    }
  };

  const handleSaveAnimal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingAnimal) return;
    try {
      await saveAnimalProfileAdminApi(token, editingAnimal);
      setEditingAnimal(null);
      await loadOverview(token);
      onDataChanged();
      showToast(`Tier-Profil „${editingAnimal.name}“ gespeichert!`);
    } catch (err) {
      setErrorBanner(err instanceof Error ? err.message : 'Fehler beim Speichern');
    }
  };

  const handleDeleteAnimal = async (id: string, name: string) => {
    if (!token) return;
    if (!window.confirm(`Tier-Profil „${name}“ wirklich löschen?`)) return;
    try {
      await deleteAnimalProfileAdminApi(token, id);
      await loadOverview(token);
      onDataChanged();
      showToast(`Tier-Profil „${name}“ gelöscht.`);
    } catch (err) {
      setErrorBanner(err instanceof Error ? err.message : 'Fehler beim Löschen');
    }
  };

  const handleSaveHotline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingHotline) return;
    try {
      await saveHotlineAdminApi(token, editingHotline);
      setEditingHotline(null);
      await loadOverview(token);
      onDataChanged();
      showToast(`Hotline „${editingHotline.name}“ gespeichert!`);
    } catch (err) {
      setErrorBanner(err instanceof Error ? err.message : 'Fehler beim Speichern');
    }
  };

  const handleDeleteHotline = async (id: string, name: string) => {
    if (!token) return;
    if (!window.confirm(`Notrufnummer „${name}“ wirklich löschen?`)) return;
    try {
      await deleteHotlineAdminApi(token, id);
      await loadOverview(token);
      onDataChanged();
      showToast('Hotline gelöscht.');
    } catch (err) {
      setErrorBanner(err instanceof Error ? err.message : 'Fehler beim Löschen');
    }
  };

  const handleResetSeed = async () => {
    if (!token) return;
    if (
      !window.confirm(
        'Möchtest du alle Sammlungen (Organisationen, Tiere, Hotlines) auf den Auslieferungszustand zurücksetzen?',
      )
    ) {
      return;
    }
    try {
      const res = await resetDatabaseAdminApi(token);
      setDbStatus(res.dbStatus);
      setOrganizations(res.organizations);
      setAnimals(res.animals);
      setHotlines(res.hotlines);
      onDataChanged();
      showToast('Datenbank auf Standard-Seed zurückgesetzt.');
    } catch (err) {
      setErrorBanner(err instanceof Error ? err.message : 'Fehler beim Zurücksetzen');
    }
  };

  const filteredOrgs = organizations.filter((org) => {
    if (orgStatusFilter !== 'all' && org.status !== orgStatusFilter) return false;
    if (!orgSearch.trim()) return true;
    const q = orgSearch.toLowerCase();
    return (
      org.name.toLowerCase().includes(q) ||
      org.city.toLowerCase().includes(q) ||
      org.postcode.toLowerCase().includes(q) ||
      (org.contactName || '').toLowerCase().includes(q)
    );
  });

  const pendingCount = organizations.filter((o) => o.status === 'pending').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-2 backdrop-blur-xs sm:p-4">
      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-600 text-white">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-wider text-teal-300 uppercase">
                  Backend & MongoDB Verwaltung
                </span>
                {dbStatus && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                      dbStatus.connected
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {dbStatus.connected
                      ? 'MongoDB Live-Server aktiv'
                      : 'MongoDB Persistenz-Speicher aktiv'}
                  </span>
                )}
              </div>
              <h2 className="text-base font-extrabold sm:text-lg">
                TierRettung Kompass – Admin-Zentrale
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {token && (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Abmelden</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 hover:text-white"
              aria-label="Schließen"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Not logged in -> Login View */}
        {!token ? (
          <div className="mx-auto my-auto w-full max-w-md p-6 sm:p-8">
            <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-700 text-white">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Admin-Login</h3>
                  <p className="text-xs text-slate-500">
                    Geschützt über <code className="font-mono">.env</code> Zugangsdaten
                  </p>
                </div>
              </div>

              {authError && (
                <div className="mt-4 rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs font-bold text-rose-900">
                  {authError}
                </div>
              )}

              <form onSubmit={handleLogin} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    Benutzername (<code className="font-mono">ADMIN_USERNAME</code>)
                  </label>
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-teal-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    Passwort (<code className="font-mono">ADMIN_PASSWORD</code>)
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Passwort aus .env eingeben"
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-teal-600 focus:outline-hidden"
                  />
                </div>

                <div className="rounded-xl border border-teal-200 bg-teal-50/80 p-3 text-[11px] text-teal-950">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Aktueller Standard in .env:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setUsernameInput('admin');
                        setPasswordInput('TierRettung!Admin2026');
                      }}
                      className="rounded-lg bg-teal-700 px-2 py-1 text-[10px] font-bold text-white hover:bg-teal-800"
                    >
                      Ausfüllen
                    </button>
                  </div>
                  <p className="mt-1 font-mono text-[11px]">
                    User: <strong>admin</strong> | Pass: <strong>TierRettung!Admin2026</strong>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full rounded-xl bg-teal-700 py-3 text-xs font-extrabold text-white shadow-sm hover:bg-teal-800 disabled:opacity-50"
                >
                  {isLoggingIn ? 'Prüfe Zugangsdaten...' : 'Im Admin-Bereich anmelden'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Logged in -> Full Admin Dashboard */
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Database Status & Navigation Bar */}
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Tabs */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('organizations')}
                    className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-extrabold transition ${
                      activeTab === 'organizations'
                        ? 'bg-teal-700 text-white shadow-2xs'
                        : 'bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Building2 className="h-4 w-4" />
                    <span>Organisationen ({organizations.length})</span>
                    {pendingCount > 0 && (
                      <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black text-slate-950">
                        {pendingCount} neu
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('animals')}
                    className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-extrabold transition ${
                      activeTab === 'animals'
                        ? 'bg-teal-700 text-white shadow-2xs'
                        : 'bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <PawPrint className="h-4 w-4" />
                    <span>Tier-Profile & Erste Hilfe ({animals.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('hotlines')}
                    className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-extrabold transition ${
                      activeTab === 'hotlines'
                        ? 'bg-teal-700 text-white shadow-2xs'
                        : 'bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <PhoneCall className="h-4 w-4" />
                    <span>Notruf-Hotlines ({hotlines.length})</span>
                  </button>
                </div>

                {/* DB Actions */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => loadOverview(token, true)}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    title="MongoDB Verbindung erneut prüfen"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>DB-Sync</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetSeed}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-rose-50 hover:text-rose-700"
                    title="Datenbank auf Auslieferungszustand zurücksetzen"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Seed-Reset</span>
                  </button>
                </div>
              </div>

              {/* MongoDB Info Strip */}
              {dbStatus && (
                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[11px] text-slate-600">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-800">MONGODB_URI (.env):</span>
                    <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-700">
                      {dbStatus.uriMasked}
                    </code>
                    <span>•</span>
                    <span>
                      DB: <strong className="text-slate-800">{dbStatus.dbName}</strong>
                    </span>
                  </div>
                  <div>
                    {dbStatus.connected ? (
                      <span className="font-bold text-emerald-700">
                        ✓ Direkt mit MongoDB-Server verbunden
                      </span>
                    ) : (
                      <span className="text-amber-800">
                        Lokaler MongoDB-Persistenzspeicher aktiv (
                        <code className="font-mono">server/data/mongodb-store.json</code>) – bereit
                        für <code className="font-mono">docker compose up -d</code> oder MongoDB
                        Atlas
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {actionFeedback && (
              <div className="bg-emerald-600 px-6 py-2 text-center text-xs font-extrabold text-white">
                {actionFeedback}
              </div>
            )}

            {errorBanner && (
              <div className="flex items-center justify-between bg-rose-600 px-6 py-2 text-xs font-bold text-white">
                <span>{errorBanner}</span>
                <button
                  type="button"
                  onClick={() => setErrorBanner(null)}
                  className="underline"
                >
                  Ausblenden
                </button>
              </div>
            )}

            {/* Main Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* TAB 1: ORGANISATIONEN VERWALTEN */}
              {activeTab === 'organizations' && (
                <div className="space-y-5">
                  {/* Editor Modal / Card if editingOrg is set */}
                  {editingOrg ? (
                    <form
                      onSubmit={handleSaveOrg}
                      className="rounded-3xl border-2 border-teal-600 bg-teal-50/40 p-5 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-black text-slate-900">
                          {editingOrg.id
                            ? `Organisation bearbeiten: ${editingOrg.name}`
                            : 'Neue Tierrettungs-Organisation anlegen'}
                        </h3>
                        <button
                          type="button"
                          onClick={() => setEditingOrg(null)}
                          className="text-xs font-bold text-slate-500 hover:text-slate-800"
                        >
                          Abbrechen
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-700">
                            Name der Einrichtung *
                          </label>
                          <input
                            type="text"
                            required
                            value={editingOrg.name || ''}
                            onChange={(e) =>
                              setEditingOrg({ ...editingOrg, name: e.target.value })
                            }
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700">Typ</label>
                          <select
                            value={editingOrg.type || 'wildlife_rescue'}
                            onChange={(e) => {
                              const t = e.target.value as OrganizationType;
                              setEditingOrg({
                                ...editingOrg,
                                type: t,
                                typeLabel:
                                  t === 'wildlife_rescue'
                                    ? 'Wildtierstation'
                                    : t === 'animal_shelter'
                                      ? 'Tierheim / Tierschutz'
                                      : 'Tierklinik',
                              });
                            }}
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                          >
                            <option value="wildlife_rescue">Wildtierstation</option>
                            <option value="veterinary">Tierklinik / Tierarzt</option>
                            <option value="animal_shelter">Tierheim / Tierschutz</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700">Land</label>
                          <select
                            value={editingOrg.countryCode || 'DE'}
                            onChange={(e) =>
                              setEditingOrg({
                                ...editingOrg,
                                countryCode: e.target.value as CountryCode,
                              })
                            }
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                          >
                            <option value="DE">DE</option>
                            <option value="AT">AT</option>
                            <option value="CH">CH</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700">PLZ</label>
                          <input
                            type="text"
                            value={editingOrg.postcode || ''}
                            onChange={(e) =>
                              setEditingOrg({ ...editingOrg, postcode: e.target.value })
                            }
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-700">Stadt</label>
                          <input
                            type="text"
                            value={editingOrg.city || ''}
                            onChange={(e) =>
                              setEditingOrg({ ...editingOrg, city: e.target.value })
                            }
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-700">
                            Vollständige Adresse
                          </label>
                          <input
                            type="text"
                            value={editingOrg.address || ''}
                            onChange={(e) =>
                              setEditingOrg({ ...editingOrg, address: e.target.value })
                            }
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700">Lat</label>
                          <input
                            type="number"
                            step="any"
                            value={editingOrg.lat ?? 52.52}
                            onChange={(e) =>
                              setEditingOrg({
                                ...editingOrg,
                                lat: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700">Lon</label>
                          <input
                            type="number"
                            step="any"
                            value={editingOrg.lon ?? 13.405}
                            onChange={(e) =>
                              setEditingOrg({
                                ...editingOrg,
                                lon: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700">
                            Telefonnummer *
                          </label>
                          <input
                            type="text"
                            required
                            value={editingOrg.phone || ''}
                            onChange={(e) =>
                              setEditingOrg({ ...editingOrg, phone: e.target.value })
                            }
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700">
                            Öffnungszeiten
                          </label>
                          <input
                            type="text"
                            value={editingOrg.openingHours || ''}
                            onChange={(e) =>
                              setEditingOrg({ ...editingOrg, openingHours: e.target.value })
                            }
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700">
                            Status
                          </label>
                          <select
                            value={editingOrg.status || 'approved'}
                            onChange={(e) =>
                              setEditingOrg({
                                ...editingOrg,
                                status: e.target.value as OrganizationStatus,
                              })
                            }
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold"
                          >
                            <option value="approved">Freigegeben (Öffentlich)</option>
                            <option value="pending">Wartet auf Prüfung (Pending)</option>
                            <option value="rejected">Abgelehnt</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-800">
                          <input
                            type="checkbox"
                            checked={Boolean(editingOrg.emergency)}
                            onChange={(e) =>
                              setEditingOrg({ ...editingOrg, emergency: e.target.checked })
                            }
                          />
                          <span>24h / Notdienst-Priorität</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-800">
                          <input
                            type="checkbox"
                            checked={Boolean(editingOrg.verifiedPartner)}
                            onChange={(e) =>
                              setEditingOrg({
                                ...editingOrg,
                                verifiedPartner: e.target.checked,
                              })
                            }
                          />
                          <span>Geprüfte Partner-Station (Grünes Siegel)</span>
                        </label>
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingOrg(null)}
                          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700"
                        >
                          Abbrechen
                        </button>
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-5 py-2 text-xs font-extrabold text-white hover:bg-teal-800"
                        >
                          <Save className="h-4 w-4" />
                          <span>In Datenbank speichern</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Filter & Action Bar */
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {(
                          [
                            { id: 'all', label: `Alle (${organizations.length})` },
                            {
                              id: 'pending',
                              label: `Wartet auf Freigabe (${pendingCount})`,
                            },
                            {
                              id: 'approved',
                              label: `Freigegeben (${
                                organizations.filter((o) => o.status === 'approved').length
                              })`,
                            },
                            {
                              id: 'rejected',
                              label: `Abgelehnt (${
                                organizations.filter((o) => o.status === 'rejected').length
                              })`,
                            },
                          ] as const
                        ).map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setOrgStatusFilter(f.id)}
                            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                              orgStatusFilter === f.id
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Search className="pointer-events-none absolute top-2.5 left-3 h-3.5 w-3.5 text-slate-400" />
                          <input
                            type="text"
                            value={orgSearch}
                            onChange={(e) => setOrgSearch(e.target.value)}
                            placeholder="Suche Name, PLZ, Ort..."
                            className="rounded-xl border border-slate-300 py-1.5 pr-3 pl-8 text-xs focus:border-teal-600 focus:outline-hidden"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingOrg({
                              name: '',
                              type: 'wildlife_rescue',
                              typeLabel: 'Wildtierstation',
                              countryCode: 'DE',
                              city: '',
                              postcode: '',
                              address: '',
                              lat: 52.52,
                              lon: 13.405,
                              phone: '',
                              emergency: true,
                              verifiedPartner: true,
                              status: 'approved',
                              specialties: ['igel', 'vogel'],
                            })
                          }
                          className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-3.5 py-2 text-xs font-extrabold text-white hover:bg-teal-800"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Neue Organisation</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Organization Cards */}
                  <div className="space-y-3">
                    {filteredOrgs.map((org) => (
                      <div
                        key={org.id}
                        className={`rounded-2xl border p-4 transition ${
                          org.status === 'pending'
                            ? 'border-amber-300 bg-amber-50/40'
                            : org.status === 'rejected'
                              ? 'border-rose-200 bg-rose-50/20 opacity-75'
                              : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              {org.status === 'pending' && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-black text-white uppercase">
                                  <AlertTriangle className="h-3 w-3" />
                                  Wartet auf Prüfung
                                </span>
                              )}
                              {org.status === 'approved' && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-black text-white uppercase">
                                  <ShieldCheck className="h-3 w-3" />
                                  Freigegeben
                                </span>
                              )}
                              {org.status === 'rejected' && (
                                <span className="rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-black text-white uppercase">
                                  Abgelehnt
                                </span>
                              )}
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                                {org.countryCode} • {org.typeLabel}
                              </span>
                              {org.emergency && (
                                <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800">
                                  Notdienst
                                </span>
                              )}
                            </div>

                            <h4 className="text-sm font-black text-slate-900">{org.name}</h4>
                            <p className="text-xs text-slate-600">
                              {org.address} • Tel.:{' '}
                              <strong className="text-slate-900">{org.phone}</strong>
                              {org.openingHours ? ` • ${org.openingHours}` : ''}
                            </p>
                            {org.description && (
                              <p className="text-xs text-slate-500 italic">„{org.description}“</p>
                            )}

                            {/* Internal Admin Verification Contact */}
                            {(org.contactName || org.contactEmail) && (
                              <div className="mt-2 inline-flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] text-slate-600">
                                <span className="font-bold text-slate-800">
                                  Interner Kontakt:
                                </span>
                                <span>{org.contactName || '–'}</span>
                                {org.contactEmail && (
                                  <a
                                    href={`mailto:${org.contactEmail}`}
                                    className="font-semibold text-teal-700 underline"
                                  >
                                    {org.contactEmail}
                                  </a>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex shrink-0 flex-wrap items-center gap-2">
                            {org.status !== 'approved' && (
                              <button
                                type="button"
                                onClick={() => handleOrgStatusChange(org.id, 'approved', true)}
                                className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-extrabold text-white hover:bg-emerald-700"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Freigeben</span>
                              </button>
                            )}
                            {org.status !== 'rejected' && (
                              <button
                                type="button"
                                onClick={() => handleOrgStatusChange(org.id, 'rejected', false)}
                                className="inline-flex items-center gap-1 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                <span>Ablehnen</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setEditingOrg(org)}
                              className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                              <span>Bearbeiten</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteOrg(org.id, org.name)}
                              className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100"
                              title="Löschen"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: TIER-PROFILE & ERSTE-HILFE-WISSEN */}
              {activeTab === 'animals' && (
                <div className="space-y-5">
                  {editingAnimal ? (
                    <form
                      onSubmit={handleSaveAnimal}
                      className="rounded-3xl border-2 border-teal-600 bg-teal-50/40 p-5 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-black text-slate-900">
                          Tier-Profil bearbeiten: {editingAnimal.name}
                        </h3>
                        <button
                          type="button"
                          onClick={() => setEditingAnimal(null)}
                          className="text-xs font-bold text-slate-500 hover:text-slate-800"
                        >
                          Abbrechen
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700">
                            Tier-ID (eindeutig) *
                          </label>
                          <input
                            type="text"
                            required
                            value={editingAnimal.id}
                            onChange={(e) =>
                              setEditingAnimal({ ...editingAnimal, id: e.target.value })
                            }
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700">
                            Anzeigename *
                          </label>
                          <input
                            type="text"
                            required
                            value={editingAnimal.name}
                            onChange={(e) =>
                              setEditingAnimal({ ...editingAnimal, name: e.target.value })
                            }
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700">
                            Kategorie
                          </label>
                          <select
                            value={editingAnimal.category}
                            onChange={(e) =>
                              setEditingAnimal({
                                ...editingAnimal,
                                category: e.target.value as 'wildtier' | 'haustier',
                              })
                            }
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                          >
                            <option value="wildtier">Wildtier</option>
                            <option value="haustier">Haustier</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-700">
                            Untertitel
                          </label>
                          <input
                            type="text"
                            value={editingAnimal.subtitle}
                            onChange={(e) =>
                              setEditingAnimal({ ...editingAnimal, subtitle: e.target.value })
                            }
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700">
                            Warn-Badge (Dringlichkeit)
                          </label>
                          <input
                            type="text"
                            value={editingAnimal.urgencyBadge}
                            onChange={(e) =>
                              setEditingAnimal({
                                ...editingAnimal,
                                urgencyBadge: e.target.value,
                              })
                            }
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700">
                          Kurz-Zusammenfassung (Schritt 1)
                        </label>
                        <textarea
                          rows={2}
                          value={editingAnimal.summary}
                          onChange={(e) =>
                            setEditingAnimal({ ...editingAnimal, summary: e.target.value })
                          }
                          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                        />
                      </div>

                      {/* Critical No-Gos */}
                      <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-xs font-black text-rose-900 uppercase">
                            <ShieldAlert className="h-4 w-4 text-rose-600" />
                            NIEMALS tun! (Kritische No-Gos in Schritt 1)
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setEditingAnimal({
                                ...editingAnimal,
                                criticalNoGos: [
                                  ...editingAnimal.criticalNoGos,
                                  { title: 'NIEMALS ...', reason: 'Begründung...' },
                                ],
                              })
                            }
                            className="rounded-lg bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white"
                          >
                            + No-Go hinzufügen
                          </button>
                        </div>

                        {editingAnimal.criticalNoGos.map((nogo, idx) => (
                          <div
                            key={idx}
                            className="grid grid-cols-1 gap-2 sm:grid-cols-12 items-start"
                          >
                            <input
                              type="text"
                              value={nogo.title}
                              onChange={(e) => {
                                const next = [...editingAnimal.criticalNoGos];
                                next[idx] = { ...next[idx], title: e.target.value };
                                setEditingAnimal({ ...editingAnimal, criticalNoGos: next });
                              }}
                              placeholder="Verbots-Titel"
                              className="sm:col-span-4 rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold"
                            />
                            <input
                              type="text"
                              value={nogo.reason}
                              onChange={(e) => {
                                const next = [...editingAnimal.criticalNoGos];
                                next[idx] = { ...next[idx], reason: e.target.value };
                                setEditingAnimal({ ...editingAnimal, criticalNoGos: next });
                              }}
                              placeholder="Erklärung warum lebensgefährlich"
                              className="sm:col-span-7 rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const next = editingAnimal.criticalNoGos.filter(
                                  (_, i) => i !== idx,
                                );
                                setEditingAnimal({ ...editingAnimal, criticalNoGos: next });
                              }}
                              className="sm:col-span-1 rounded-xl bg-rose-100 p-2 text-rose-700 hover:bg-rose-200"
                            >
                              <Trash2 className="h-3.5 w-3.5 mx-auto" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* First Aid Steps (1 line per step) */}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-700">
                            Sichern & Eigenschutz (1 Punkt pro Zeile)
                          </label>
                          <textarea
                            rows={4}
                            value={editingAnimal.securingSteps.join('\n')}
                            onChange={(e) =>
                              setEditingAnimal({
                                ...editingAnimal,
                                securingSteps: e.target.value
                                  .split('\n')
                                  .map((s) => s.trim())
                                  .filter(Boolean),
                              })
                            }
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-xs leading-relaxed"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700">
                            Erste-Hilfe-Maßnahmen (1 Schritt pro Zeile)
                          </label>
                          <textarea
                            rows={4}
                            value={editingAnimal.firstAidSteps.join('\n')}
                            onChange={(e) =>
                              setEditingAnimal({
                                ...editingAnimal,
                                firstAidSteps: e.target.value
                                  .split('\n')
                                  .map((s) => s.trim())
                                  .filter(Boolean),
                              })
                            }
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-xs leading-relaxed"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingAnimal(null)}
                          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700"
                        >
                          Abbrechen
                        </button>
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-5 py-2 text-xs font-extrabold text-white hover:bg-teal-800"
                        >
                          <Save className="h-4 w-4" />
                          <span>Tier-Profil in MongoDB speichern</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {animals.map((animal) => (
                        <div
                          key={animal.id}
                          className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800 uppercase">
                                {animal.category} • ID: {animal.id}
                              </span>
                              <span className="text-[11px] font-bold text-rose-700">
                                {animal.criticalNoGos.length} No-Gos
                              </span>
                            </div>
                            <h4 className="mt-1 text-base font-black text-slate-900">
                              {animal.name}
                            </h4>
                            <p className="text-xs text-slate-500">{animal.subtitle}</p>
                            <p className="mt-2 line-clamp-2 text-xs text-slate-600">
                              {animal.summary}
                            </p>
                          </div>

                          <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                            <button
                              type="button"
                              onClick={() => setEditingAnimal(structuredClone(animal))}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                              <span>Leitfaden & No-Gos bearbeiten</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAnimal(animal.id, animal.name)}
                              className="rounded-xl border border-rose-200 bg-rose-50 p-1.5 text-rose-700 hover:bg-rose-100"
                              title="Löschen"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: NOTRUF-HOTLINES VERWALTEN */}
              {activeTab === 'hotlines' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-600">
                      Überregionale Notrufnummern für Deutschland (DE), Österreich (AT) und die
                      Schweiz (CH).
                    </p>
                    {!editingHotline && (
                      <button
                        type="button"
                        onClick={() =>
                          setEditingHotline({
                            id: `hotline-${Date.now()}`,
                            name: '',
                            country: 'DE',
                            regionLabel: 'Bundesweit',
                            phone: '',
                            phoneDisplay: '',
                            category: 'wildlife',
                            availability: '24/7 Notruf',
                            description: '',
                          })
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-3.5 py-2 text-xs font-extrabold text-white hover:bg-teal-800"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Neue Hotline anlegen</span>
                      </button>
                    )}
                  </div>

                  {editingHotline && (
                    <form
                      onSubmit={handleSaveHotline}
                      className="rounded-2xl border-2 border-teal-600 bg-teal-50/40 p-4 space-y-3"
                    >
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-700">
                            Bezeichnung *
                          </label>
                          <input
                            type="text"
                            required
                            value={editingHotline.name}
                            onChange={(e) =>
                              setEditingHotline({ ...editingHotline, name: e.target.value })
                            }
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700">Land</label>
                          <select
                            value={editingHotline.country}
                            onChange={(e) =>
                              setEditingHotline({
                                ...editingHotline,
                                country: e.target.value as CountryCode | 'DACH',
                              })
                            }
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                          >
                            <option value="DE">DE</option>
                            <option value="AT">AT</option>
                            <option value="CH">CH</option>
                            <option value="DACH">DACH</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700">
                            Telefonnummer *
                          </label>
                          <input
                            type="text"
                            required
                            value={editingHotline.phone}
                            onChange={(e) =>
                              setEditingHotline({
                                ...editingHotline,
                                phone: e.target.value,
                                phoneDisplay: editingHotline.phoneDisplay || e.target.value,
                              })
                            }
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-700">
                            Anzeige-Rufnummer & Erreichbarkeit
                          </label>
                          <input
                            type="text"
                            value={editingHotline.phoneDisplay}
                            onChange={(e) =>
                              setEditingHotline({
                                ...editingHotline,
                                phoneDisplay: e.target.value,
                              })
                            }
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700">
                            Beschreibung
                          </label>
                          <input
                            type="text"
                            value={editingHotline.description}
                            onChange={(e) =>
                              setEditingHotline({
                                ...editingHotline,
                                description: e.target.value,
                              })
                            }
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingHotline(null)}
                          className="rounded-xl border border-slate-300 bg-white px-4 py-1.5 text-xs font-bold"
                        >
                          Abbrechen
                        </button>
                        <button
                          type="submit"
                          className="rounded-xl bg-teal-700 px-4 py-1.5 text-xs font-extrabold text-white"
                        >
                          Speichern
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-2.5">
                    {hotlines.map((h) => (
                      <div
                        key={h.id}
                        className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 sm:flex-row sm:items-center"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-800">
                              {h.country}
                            </span>
                            <span className="text-xs font-extrabold text-slate-900">
                              {h.name}
                            </span>
                            <span className="text-xs font-bold text-teal-700">
                              ({h.phoneDisplay})
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">{h.description}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingHotline(h)}
                            className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                          >
                            Bearbeiten
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteHotline(h.id, h.name)}
                            className="rounded-xl border border-rose-200 bg-rose-50 p-1.5 text-rose-700 hover:bg-rose-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
