import { useState, useEffect, useCallback } from 'react';
import {
  AlertOctagon,
  ArrowLeft,
  ArrowRight,
  BriefcaseMedical,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  FileText,
  HeartPulse,
  LocateFixed,
  Map as MapIcon,
  MapPin,
  Navigation,
  PhoneCall,
  Search,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import {
  ANIMAL_PROFILES,
  DACH_EMERGENCY_HOTLINES,
  type AnimalProfile,
  type CountryCode,
  type EmergencyHotline,
} from './data/rescueData';
import {
  DACH_CITY_PRESETS,
  fetchNearbyHelpers,
  geocodeSearch,
  getOfflineNearbyHelpers,
  reverseGeocode,
  setDatabaseOrganizations,
  type LocationDetails,
  type NearbyHelper,
} from './services/locationService';
import { fetchBootstrapData } from './services/apiService';
import { RescueMap } from './components/RescueMap';
import { HandoverProtocolModal } from './components/HandoverProtocolModal';
import { CarKitModal } from './components/CarKitModal';
import { LegalModal, type LegalTab } from './components/LegalModal';
import { InstallAppModal } from './components/InstallAppModal';
import { RegisterOrganizationModal } from './components/RegisterOrganizationModal';
import { AdminModal } from './components/AdminModal';
import { AnimalIcon } from './components/AnimalIcon';

type WizardStep = 1 | 2 | 3 | 4;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const OSM_CONSENT_KEY = 'tierrettung_osm_consent_v1';
const BIRD_GROUP_IDS = ['vogel', 'wasservogel', 'greifvogel'];

export function App() {
  // MongoDB-gestützte Datenbestände (mit sofortigem lokalem Initial-Fallback)
  const [animalProfiles, setAnimalProfiles] = useState<AnimalProfile[]>(ANIMAL_PROFILES);
  const [hotlines, setHotlines] = useState<EmergencyHotline[]>(DACH_EMERGENCY_HOTLINES);
  const [partnerCount, setPartnerCount] = useState<number>(11);

  // null = Startscreen (Tier auswählen); string = Fokus-Assistent für dieses Tier
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);

  // Triage & Checklisten-State
  const [questionIndex, setQuestionIndex] = useState(0);
  const [triageAnswers, setTriageAnswers] = useState<Record<string, boolean>>({});
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [showNoGoReasons, setShowNoGoReasons] = useState(false);

  // Standort & DACH Land
  const [location, setLocation] = useState<LocationDetails>(DACH_CITY_PRESETS[0]);
  const [countryFilter, setCountryFilter] = useState<CountryCode>('DE');
  const [searchInput, setSearchInput] = useState('');
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [showManualLocation, setShowManualLocation] = useState(false);

  // DSGVO 2-Klick-Einwilligung für externe OpenStreetMap-Verbindungen
  const [osmConsent, setOsmConsent] = useState<boolean>(() => {
    try {
      return localStorage.getItem(OSM_CONSENT_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Helfer im Umkreis
  const [nearbyHelpers, setNearbyHelpers] = useState<NearbyHelper[]>(() =>
    getOfflineNearbyHelpers(DACH_CITY_PRESETS[0].coords)
  );
  const [isLoadingHelpers, setIsLoadingHelpers] = useState(false);
  const [selectedHelperId, setSelectedHelperId] = useState<string | null>(null);
  const [showMapAndAllHelpers, setShowMapAndAllHelpers] = useState(false);

  // Modals, PWA Install & Zwischenablage
  const [isProtocolOpen, setIsProtocolOpen] = useState(false);
  const [isCarKitOpen, setIsCarKitOpen] = useState(false);
  const [isRegisterOrgOpen, setIsRegisterOrgOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [deferredInstallPrompt, setDeferredInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalledStandalone, setIsInstalledStandalone] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalTab | null>(null);
  const [copiedLocation, setCopiedLocation] = useState(false);

  const selectedAnimal: AnimalProfile =
    animalProfiles.find((a) => a.id === selectedAnimalId) || animalProfiles[0];

  const loadHelpers = useCallback(
    async (loc: LocationDetails, allowExternalOsm: boolean, animalId?: string) => {
      if (!allowExternalOsm) {
        setNearbyHelpers(getOfflineNearbyHelpers(loc.coords, animalId));
        return;
      }
      setIsLoadingHelpers(true);
      try {
        const results = await fetchNearbyHelpers(loc.coords, 20000, animalId);
        setNearbyHelpers(results);
      } finally {
        setIsLoadingHelpers(false);
      }
    },
    []
  );

  const refreshBootstrapData = useCallback(async () => {
    try {
      const data = await fetchBootstrapData();
      if (Array.isArray(data.animals) && data.animals.length > 0) {
        setAnimalProfiles(data.animals);
      }
      if (Array.isArray(data.hotlines) && data.hotlines.length > 0) {
        setHotlines(data.hotlines);
      }
      if (Array.isArray(data.organizations)) {
        setDatabaseOrganizations(data.organizations);
        setPartnerCount(data.organizations.length);
        loadHelpers(location, osmConsent, selectedAnimalId || undefined);
      }
    } catch {
      // Offline / static fallback remains active
    }
  }, [loadHelpers, location, osmConsent, selectedAnimalId]);

  useEffect(() => {
    refreshBootstrapData();
  }, [refreshBootstrapData]);

  useEffect(() => {
    const checkStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsInstalledStandalone(checkStandalone);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalledStandalone(true);
      setDeferredInstallPrompt(null);
      setIsInstallModalOpen(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallButtonClick = async () => {
    if (deferredInstallPrompt) {
      await deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredInstallPrompt(null);
      }
    } else {
      setIsInstallModalOpen(true);
    }
  };

  const enableOsmConsent = () => {
    setOsmConsent(true);
    try {
      localStorage.setItem(OSM_CONSENT_KEY, 'true');
    } catch {
      // ignore
    }
  };

  const revokeOsmConsent = () => {
    setOsmConsent(false);
    setShowMapAndAllHelpers(false);
    try {
      localStorage.removeItem(OSM_CONSENT_KEY);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadHelpers(location, osmConsent, selectedAnimalId || undefined);
  }, [location, osmConsent, selectedAnimalId, loadHelpers]);

  const handleChooseAnimal = (id: string, startStep: WizardStep = 1) => {
    setSelectedAnimalId(id);
    setWizardStep(startStep);
    setQuestionIndex(0);
    setShowNoGoReasons(false);
    setShowMapAndAllHelpers(false);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleBackToStart = () => {
    setSelectedAnimalId(null);
    setWizardStep(1);
    setQuestionIndex(0);
  };

  const handleUseGps = () => {
    enableOsmConsent();
    if (!navigator.geolocation) {
      setGpsError('GPS wird vom Browser nicht unterstützt. Bitte PLZ eingeben.');
      setShowManualLocation(true);
      return;
    }
    setIsLocatingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
        };
        const details = await reverseGeocode(coords);
        setLocation(details);
        setCountryFilter(details.countryCode);
        setIsLocatingGps(false);
        setShowManualLocation(false);
      },
      () => {
        setIsLocatingGps(false);
        setGpsError('Standortzugriff nicht möglich. Bitte PLZ oder Ort eingeben:');
        setShowManualLocation(true);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleManualLocationSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    enableOsmConsent();
    setIsLocatingGps(true);
    setGpsError(null);
    try {
      const results = await geocodeSearch(searchInput);
      if (results.length > 0) {
        const first = results[0];
        setLocation(first);
        setCountryFilter(first.countryCode);
        setShowManualLocation(false);
        setSearchInput('');
      } else {
        setGpsError('Ort nicht gefunden. Bitte andere PLZ oder Stadt versuchen.');
      }
    } catch {
      setGpsError('Suche fehlgeschlagen.');
    } finally {
      setIsLocatingGps(false);
    }
  };

  const handleCopyFundort = async () => {
    const mapsLink = `https://www.openstreetmap.org/?mlat=${location.coords.lat.toFixed(5)}&mlon=${location.coords.lon.toFixed(5)}#map=17/${location.coords.lat.toFixed(5)}/${location.coords.lon.toFixed(5)}`;
    const shareString = `TIER-NOTFALL FUNDORT:\nTierart: ${selectedAnimal.name}\nOrt: ${location.displayName}\nGPS: ${location.coords.lat.toFixed(5)}, ${location.coords.lon.toFixed(5)}\nKarte: ${mapsLink}`;

    try {
      await navigator.clipboard.writeText(shareString);
      setCopiedLocation(true);
      setTimeout(() => setCopiedLocation(false), 2500);
    } catch {
      // ignore
    }
  };

  const toggleChecklistStep = (stepKey: string) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepKey]: !prev[stepKey],
    }));
  };

  // Passende Notrufnummern für das gewählte Tier & Land (aus MongoDB)
  const relevantHotlines = hotlines
    .filter((h) => {
      const matchesCountry = h.country === countryFilter || h.country === 'DACH';
      const matchesAnimal =
        !h.animalIds ||
        h.animalIds.length === 0 ||
        h.animalIds.includes(selectedAnimal.id);
      return matchesCountry && matchesAnimal;
    })
    .sort((a, b) => {
      const aSpecific = a.animalIds?.includes(selectedAnimal.id) ? 1 : 0;
      const bSpecific = b.animalIds?.includes(selectedAnimal.id) ? 1 : 0;
      return bSpecific - aSpecific;
    });

  const policeEmergencyNumber =
    countryFilter === 'AT' ? '133' : countryFilter === 'CH' ? '117' : '110';

  const currentQuestion =
    selectedAnimal.triageQuestions[questionIndex] ||
    selectedAnimal.triageQuestions[0];
  const currentAnswer = currentQuestion
    ? triageAnswers[currentQuestion.id]
    : undefined;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 text-slate-900">
      {/* Ruhiger, aufgeräumter Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xs">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={handleBackToStart}
            className="flex items-center gap-2.5 text-left"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-700 text-white">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-base font-extrabold tracking-tight text-slate-900">
                TierRettung
              </span>
              <span className="block text-[11px] font-medium text-slate-500">
                Soforthilfe ({countryFilter})
              </span>
            </div>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Länderauswahl DE / AT / CH */}
            <div
              className="inline-flex rounded-xl bg-slate-100 p-0.5"
              role="group"
              aria-label="Land wählen"
            >
              {(['DE', 'AT', 'CH'] as CountryCode[]).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setCountryFilter(code)}
                  className={`rounded-lg px-2 py-1 text-xs font-bold transition ${
                    countryFilter === code
                      ? 'bg-white text-teal-800 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>

            {!isInstalledStandalone && (
              <button
                type="button"
                onClick={handleInstallButtonClick}
                className="inline-flex items-center gap-1.5 rounded-xl bg-teal-50 px-2.5 py-1.5 text-xs font-bold text-teal-800 ring-1 ring-teal-200 transition hover:bg-teal-100"
                title="App zum Startbildschirm hinzufügen"
              >
                <Smartphone className="h-4 w-4 text-teal-700" />
                <span className="hidden sm:inline">Zum Startbildschirm</span>
                <span className="sm:hidden">App speichern</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsCarKitOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              title="Auto-Notfallset Checkliste"
            >
              <BriefcaseMedical className="h-4 w-4 text-teal-700" />
              <span className="hidden sm:inline">Auto-Box</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-6">
        {/* =========================================================
            ANSICHT A: STARTBILDSCHIRM (NUR TIERAUSWAHL)
           ========================================================= */}
        {!selectedAnimalId && (
          <div className="space-y-6">
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-teal-900">
                Ruhig bleiben • Schritt für Schritt
              </span>
              <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Welches Tier hast du gefunden?
              </h1>
              <p className="mt-1.5 text-sm text-slate-600">
                Tippe einfach auf das Tier. Wir zeigen dir immer nur einen einfachen Schritt.
              </p>
            </div>

            {/* Große, kinderleichte Tier-Kacheln (aus MongoDB geladen) */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {animalProfiles
                .filter((a) => a.id !== 'wasservogel' && a.id !== 'greifvogel')
                .map((animal) => {
                  const shortName =
                    animal.id === 'vogel'
                      ? 'Vogel (Alle)'
                      : animal.id === 'hase_kaninchen'
                        ? 'Hase / Kaninchen'
                        : animal.id === 'fuchs_marder'
                          ? 'Fuchs / Marder'
                          : animal.name.split('/')[0].trim();
                  return (
                    <button
                      key={animal.id}
                      type="button"
                      onClick={() => handleChooseAnimal(animal.id, 1)}
                      className="group flex flex-col items-center justify-center rounded-2xl border-2 border-slate-200 bg-white p-4 text-center shadow-2xs transition hover:border-teal-600 hover:bg-teal-50/40 active:scale-[0.98]"
                    >
                      <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 transition group-hover:bg-teal-600 group-hover:text-white">
                        <AnimalIcon name={animal.iconName} className="h-7 w-7" />
                      </div>
                      <span className="mt-2.5 text-sm font-extrabold text-slate-900 sm:text-base">
                        {shortName}
                      </span>
                      <span className="mt-0.5 text-[11px] font-medium text-slate-500">
                        {animal.id === 'vogel'
                          ? 'Sing-, Wasser- & Greifvögel'
                          : animal.category === 'wildtier'
                            ? 'Wildtier'
                            : 'Haustier'}
                      </span>
                    </button>
                  );
                })}
            </div>

            {/* Dezente Notfall-Abkürzung unten */}
            <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-center">
              <p className="text-xs font-bold text-rose-950 sm:text-sm">
                Akuter Verkehrsunfall mit einem Tier?
              </p>
              <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2.5">
                <a
                  href={`tel:${policeEmergencyNumber}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-xs transition hover:bg-rose-700"
                >
                  <PhoneCall className="h-4 w-4" />
                  <span>Polizei rufen ({policeEmergencyNumber})</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleChooseAnimal('reh_wild', 4)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-white px-4 py-2.5 text-xs font-bold text-rose-900 hover:bg-rose-100"
                >
                  <MapPin className="h-4 w-4 text-rose-600" />
                  <span>Tierärzte in meiner Nähe zeigen</span>
                </button>
              </div>
            </div>

            {/* dezenter Partner-Banner für Tierrettungs-Organisationen */}
            <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-teal-200 bg-white p-4 sm:flex-row">
              <div className="flex items-center gap-3 text-left">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xs font-extrabold text-slate-900 sm:text-sm">
                    Du betreibst eine Wildtierstation, Tierrettung oder Praxis?
                  </h2>
                  <p className="text-xs text-slate-500">
                    Bereits {partnerCount} geprüfte Stationen in der Datenbank – trage deine Einrichtung kostenlos ein.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRegisterOrgOpen(true)}
                className="shrink-0 rounded-xl bg-teal-700 px-4 py-2 text-xs font-extrabold text-white hover:bg-teal-800"
              >
                Organisation eintragen
              </button>
            </div>
          </div>
        )}

        {/* =========================================================
            ANSICHT B: FOKUS-ASSISTENT (IMMER NUR 1 KARTE SICHTBAR)
           ========================================================= */}
        {selectedAnimalId && (
          <div className="space-y-4">
            {/* Obere Navigationsleiste: Zurück + Tiername + Direkt zu Kontakten */}
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleBackToStart}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Anderes Tier</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-teal-900">
                  {selectedAnimal.name.split('/')[0].trim()}
                </span>
              </div>

              {wizardStep !== 4 ? (
                <button
                  type="button"
                  onClick={() => setWizardStep(4)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-xs font-extrabold text-white shadow-2xs hover:bg-rose-700"
                >
                  <PhoneCall className="h-3.5 w-3.5" />
                  <span>Sofort-Nummern</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsProtocolOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-3 py-2 text-xs font-bold text-white shadow-2xs hover:bg-teal-800"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Protokoll</span>
                </button>
              )}
            </div>

            {/* Kinderleichte Vogel-Unterauswahl (nur sichtbar, wenn "Vogel" gewählt wurde) */}
            {BIRD_GROUP_IDS.includes(selectedAnimalId) && (
              <div className="rounded-2xl border border-teal-200 bg-teal-50/60 p-2.5">
                <span className="block px-1 text-[11px] font-bold text-teal-900 uppercase">
                  Um was für einen Vogel handelt es sich?
                </span>
                <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                  {[
                    {
                      id: 'vogel',
                      label: 'Singvogel / Taube / Mauersegler',
                      icon: 'Bird',
                    },
                    {
                      id: 'wasservogel',
                      label: 'Schwan / Ente / Gans',
                      icon: 'Waves',
                    },
                    {
                      id: 'greifvogel',
                      label: 'Greifvogel & Eule',
                      icon: 'Feather',
                    },
                  ].map((birdOpt) => {
                    const isCurrentBird = selectedAnimalId === birdOpt.id;
                    return (
                      <button
                        key={birdOpt.id}
                        type="button"
                        onClick={() => handleChooseAnimal(birdOpt.id, wizardStep)}
                        className={`flex flex-col items-center justify-center rounded-xl p-2 text-center text-xs font-bold transition sm:flex-row sm:gap-1.5 ${
                          isCurrentBird
                            ? 'bg-teal-800 text-white shadow-xs'
                            : 'bg-white text-slate-700 hover:bg-teal-100/70'
                        }`}
                      >
                        <AnimalIcon name={birdOpt.icon} className="h-4 w-4 shrink-0" />
                        <span className="mt-1 leading-tight sm:mt-0">
                          {birdOpt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Kinderleichte 4-Punkte-Schrittanzeige */}
            <div className="grid grid-cols-4 gap-1.5" role="navigation" aria-label="Schritte">
              {[
                { step: 1 as WizardStep, label: '1. STOPP & Check' },
                { step: 2 as WizardStep, label: '2. Sichern' },
                { step: 3 as WizardStep, label: '3. Erste Hilfe' },
                { step: 4 as WizardStep, label: '4. Anrufen' },
              ].map((item) => {
                const active = wizardStep === item.step;
                const passed = wizardStep > item.step;
                return (
                  <button
                    key={item.step}
                    type="button"
                    onClick={() => setWizardStep(item.step)}
                    className={`rounded-xl py-2 text-center text-xs font-bold transition ${
                      active
                        ? 'bg-teal-700 text-white shadow-xs'
                        : passed
                          ? 'bg-teal-100 text-teal-900'
                          : 'bg-slate-200/80 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* ---------------------------------------------------------
                SCHRITT 1: SOFORTIGE NO-GOS (BEVOR MAN HANDELT!) + CHECK
               --------------------------------------------------------- */}
            {wizardStep === 1 && currentQuestion && (
              <div className="space-y-4">
                {/* ZUERST: Kritische No-Gos sofort sichtbar, bevor das Tier angefasst wird */}
                <div className="rounded-3xl border-2 border-rose-500 bg-rose-50 p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm font-extrabold text-rose-950 sm:text-base">
                      <AlertOctagon className="h-5 w-5 shrink-0 text-rose-600" />
                      <span>STOPP – Bevor du handelst, NIEMALS tun:</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowNoGoReasons((v) => !v)}
                      className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-white px-2.5 py-1 text-xs font-bold text-rose-800 ring-1 ring-rose-300 hover:bg-rose-100"
                    >
                      <span>{showNoGoReasons ? 'Kurz' : 'Warum?'}</span>
                      {showNoGoReasons ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  <ul className="mt-3 space-y-2">
                    {selectedAnimal.criticalNoGos.map((noGo, idx) => (
                      <li
                        key={idx}
                        className="rounded-2xl bg-white px-3.5 py-2.5 text-xs shadow-2xs ring-1 ring-rose-200 sm:text-sm"
                      >
                        <div className="font-extrabold text-rose-700">
                          ✕ {noGo.title}
                        </div>
                        {showNoGoReasons && (
                          <p className="mt-1 text-xs leading-relaxed text-slate-600">
                            {noGo.reason}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* DANACH: Kurze Entscheidungsfrage (Braucht das Tier Hilfe?) */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800">
                      Schritt 1 von 4 • Braucht das Tier Hilfe?
                    </span>
                    {selectedAnimal.triageQuestions.length > 1 && (
                      <span className="text-xs font-semibold text-slate-400">
                        Frage {questionIndex + 1} von {selectedAnimal.triageQuestions.length}
                      </span>
                    )}
                  </div>

                  <h2 className="mt-4 text-lg font-extrabold leading-snug text-slate-900 sm:text-xl">
                    {currentQuestion.question}
                  </h2>

                  {/* Zwei große, unmissverständliche Antwort-Buttons */}
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setTriageAnswers((prev) => ({
                          ...prev,
                          [currentQuestion.id]: true,
                        }))
                      }
                      className={`flex items-center justify-center gap-2 rounded-2xl border-2 py-4 text-base font-extrabold transition ${
                        currentAnswer === true
                          ? currentQuestion.yesVerdict === 'safe'
                            ? 'border-emerald-600 bg-emerald-600 text-white shadow-md'
                            : 'border-rose-600 bg-rose-600 text-white shadow-md'
                          : 'border-slate-200 bg-slate-50 text-slate-900 hover:border-teal-600 hover:bg-white'
                      }`}
                    >
                      <span>JA</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setTriageAnswers((prev) => ({
                          ...prev,
                          [currentQuestion.id]: false,
                        }))
                      }
                      className={`flex items-center justify-center gap-2 rounded-2xl border-2 py-4 text-base font-extrabold transition ${
                        currentAnswer === false
                          ? 'border-teal-700 bg-teal-700 text-white shadow-md'
                          : 'border-slate-200 bg-slate-50 text-slate-900 hover:border-teal-600 hover:bg-white'
                      }`}
                    >
                      <span>NEIN</span>
                    </button>
                  </div>

                  {/* Klare, einfache Auswertung nach Klick */}
                  {currentAnswer !== undefined && (
                    <div
                      className={`mt-5 rounded-2xl border-2 p-4 ${
                        currentAnswer === true
                          ? currentQuestion.yesVerdict === 'safe'
                            ? 'border-emerald-400 bg-emerald-50 text-emerald-950'
                            : 'border-rose-400 bg-rose-50 text-rose-950'
                          : 'border-teal-300 bg-teal-50 text-teal-950'
                      }`}
                    >
                      <p className="text-sm font-bold leading-relaxed">
                        {currentAnswer === true
                          ? currentQuestion.yesMessage
                          : currentQuestion.noMessage}
                      </p>
                    </div>
                  )}

                  {/* Weiter-Button */}
                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                    {selectedAnimal.triageQuestions.length > 1 &&
                    questionIndex < selectedAnimal.triageQuestions.length - 1 &&
                    currentAnswer === false ? (
                      <button
                        type="button"
                        onClick={() => setQuestionIndex((i) => i + 1)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-700 px-6 py-4 text-sm font-extrabold text-white shadow-sm hover:bg-teal-800"
                      >
                        <span>Nächste Prüf-Frage</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setWizardStep(2)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-700 px-6 py-4 text-sm font-extrabold text-white shadow-sm hover:bg-teal-800"
                      >
                        <span>Weiter: Wie sichere ich das Tier?</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------------
                SCHRITT 2: EIGENSCHUTZ & SICHERUNG (MAX. 3 SCHRITTE)
               --------------------------------------------------------- */}
            {wizardStep === 2 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
                  Schritt 2 von 4 • Eigenschutz & Sicherung
                </span>

                <h2 className="mt-3 text-xl font-extrabold text-slate-900">
                  So sicherst du das Tier gefahrlos
                </h2>

                {/* 1 kompakter gelber Eigenschutz-Kasten */}
                <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950">
                  <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                  <div className="text-xs leading-relaxed font-semibold sm:text-sm">
                    <span className="font-extrabold uppercase">Dein Eigenschutz: </span>
                    {selectedAnimal.selfProtection[0]}
                  </div>
                </div>

                {/* Große, abhakbare Schritte */}
                <p className="mt-5 text-xs font-bold tracking-wide text-slate-500 uppercase">
                  Tippe jeden erledigten Schritt an:
                </p>
                <div className="mt-2.5 space-y-2.5">
                  {selectedAnimal.securingSteps.map((step, idx) => {
                    const key = `${selectedAnimal.id}-sec-${idx}`;
                    const done = !!completedSteps[key];
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleChecklistStep(key)}
                        className={`flex w-full items-start gap-3.5 rounded-2xl border-2 p-4 text-left transition ${
                          done
                            ? 'border-teal-500 bg-teal-50/70 text-teal-950'
                            : 'border-slate-200 bg-white text-slate-900 hover:border-teal-400'
                        }`}
                      >
                        <div
                          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
                            done
                              ? 'bg-teal-700 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {done ? <Check className="h-4 w-4" /> : idx + 1}
                        </div>
                        <span
                          className={`text-sm leading-relaxed ${
                            done ? 'line-through opacity-70' : 'font-semibold'
                          }`}
                        >
                          {step}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Vor / Zurück */}
                <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="rounded-2xl border border-slate-300 px-4 py-3.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                  >
                    Zurück
                  </button>
                  <button
                    type="button"
                    onClick={() => setWizardStep(3)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-teal-700 px-5 py-3.5 text-sm font-extrabold text-white shadow-sm hover:bg-teal-800"
                  >
                    <span>Weiter zu Erste Hilfe</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------------
                SCHRITT 3: ERSTE-HILFE-SOFORTMASSNAHMEN
               --------------------------------------------------------- */}
            {wizardStep === 3 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900">
                  Schritt 3 von 4 • Erste Hilfe
                </span>

                <h2 className="mt-3 text-xl font-extrabold text-slate-900">
                  Das hilft dem Tier jetzt sofort
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Tippe die Maßnahmen an, die du bereits umgesetzt hast:
                </p>

                <div className="mt-4 space-y-2.5">
                  {selectedAnimal.firstAidSteps.map((step, idx) => {
                    const key = `${selectedAnimal.id}-aid-${idx}`;
                    const done = !!completedSteps[key];
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleChecklistStep(key)}
                        className={`flex w-full items-start gap-3.5 rounded-2xl border-2 p-4 text-left transition ${
                          done
                            ? 'border-emerald-500 bg-emerald-50/70 text-teal-950'
                            : 'border-slate-200 bg-white text-slate-900 hover:border-emerald-400'
                        }`}
                      >
                        <CheckCircle2
                          className={`mt-0.5 h-5 w-5 shrink-0 ${
                            done ? 'text-emerald-600' : 'text-slate-300'
                          }`}
                        />
                        <span
                          className={`text-sm leading-relaxed ${
                            done ? 'line-through opacity-70' : 'font-semibold'
                          }`}
                        >
                          {step}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Kurze Erinnerung an das wichtigste Verbot */}
                <div className="mt-4 flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-xs font-bold text-rose-900 ring-1 ring-rose-200">
                  <AlertOctagon className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>
                    Denk daran: {selectedAnimal.criticalNoGos[0]?.title}
                  </span>
                </div>

                {/* Vor / Zurück */}
                <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="rounded-2xl border border-slate-300 px-4 py-3.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                  >
                    Zurück
                  </button>
                  <button
                    type="button"
                    onClick={() => setWizardStep(4)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-teal-700 px-5 py-3.5 text-sm font-extrabold text-white shadow-sm hover:bg-teal-800"
                  >
                    <span>Jetzt Helfer in deiner Nähe anrufen</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------------
                SCHRITT 4: NOTRUFNUMMERN & NÄCHSTE HELFER AM STANDORT
               --------------------------------------------------------- */}
            {wizardStep === 4 && (
              <div className="space-y-4">
                {/* 1. Kompakte Standort-Box */}
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase">
                          Dein Standort für die Umkreissuche
                        </span>
                        <p className="text-sm font-extrabold text-slate-900">
                          {location.displayName}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleUseGps}
                        disabled={isLocatingGps}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-3.5 py-2 text-xs font-extrabold text-white hover:bg-teal-800 disabled:opacity-60"
                      >
                        <LocateFixed className="h-4 w-4" />
                        <span>{isLocatingGps ? 'Suche GPS...' : 'GPS nutzen'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowManualLocation((v) => !v)}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        Ort ändern
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyFundort}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-bold text-teal-900 hover:bg-teal-100"
                      >
                        {copiedLocation ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Kopiert!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>GPS kopieren</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {gpsError && (
                    <p className="mt-2 text-xs font-semibold text-rose-600">
                      {gpsError}
                    </p>
                  )}

                  {/* Aufklappbare Orts-/PLZ-Suche */}
                  {showManualLocation && (
                    <div className="mt-4 border-t border-slate-100 pt-3">
                      <form
                        onSubmit={handleManualLocationSearch}
                        className="flex gap-2"
                      >
                        <div className="relative flex-1">
                          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Postleitzahl oder Stadt eingeben..."
                            className="w-full rounded-xl border border-slate-300 py-2.5 pr-3 pl-9 text-sm text-slate-900 focus:border-teal-600 focus:outline-none"
                          />
                        </div>
                        <button
                          type="submit"
                          className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
                        >
                          Suchen
                        </button>
                      </form>

                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {DACH_CITY_PRESETS.map((preset) => (
                          <button
                            key={preset.city}
                            type="button"
                            onClick={() => {
                              setLocation(preset);
                              setCountryFilter(preset.countryCode);
                              setShowManualLocation(false);
                              setGpsError(null);
                            }}
                            className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-teal-100 hover:text-teal-900"
                          >
                            {preset.city}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Wichtige Fach-Notrufe für genau dieses Tier */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-900">
                    Wichtigste Notrufnummern ({countryFilter})
                  </span>
                  <h2 className="mt-2.5 text-lg font-extrabold text-slate-900">
                    Spezial-Hotlines für {selectedAnimal.name.split('/')[0].trim()}
                  </h2>

                  <div className="mt-4 space-y-3">
                    {relevantHotlines.slice(0, 3).map((hotline) => (
                      <div
                        key={hotline.id}
                        className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:flex-row sm:items-center"
                      >
                        <div>
                          <div className="text-sm font-extrabold text-slate-900">
                            {hotline.name}
                          </div>
                          <p className="mt-0.5 text-xs text-slate-600">
                            {hotline.description}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <a
                            href={`tel:${hotline.phone}`}
                            className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-xs font-extrabold text-white shadow-xs transition hover:bg-teal-800"
                          >
                            <PhoneCall className="h-4 w-4" />
                            <span>{hotline.phoneDisplay}</span>
                          </a>
                          {hotline.website && (
                            <a
                              href={hotline.website}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-xl border border-slate-300 bg-white p-3 text-slate-700 hover:bg-slate-100"
                              title="Webseite öffnen"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Nächstgelegene Tierärzte & Tierheime im Umkreis */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-teal-900">
                        {osmConsent ? 'Live-Umkreissuche aktiv' : 'Geprüfte 24h-Notfallkliniken (Offline)'}
                      </span>
                      <h3 className="mt-2 text-lg font-extrabold text-slate-900">
                        Nächste Tierärzte & Tierheime vor Ort
                      </h3>
                    </div>

                    {isLoadingHelpers && (
                      <div className="flex items-center gap-2 text-xs font-bold text-teal-700">
                        <progress
                          aria-label="Suche Tierärzte im Umkreis"
                          className="loading-spinner"
                        />
                        <span>Suche...</span>
                      </div>
                    )}
                  </div>

                  {/* DSGVO 2-Klick-Freigabe für Live-OpenStreetMap-Abfrage */}
                  {!osmConsent && (
                    <div className="mt-3 rounded-2xl border border-teal-200 bg-teal-50/70 p-3.5 text-xs text-teal-950">
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <p className="leading-relaxed">
                          <strong>Datenschutz-Schutzschild aktiv:</strong> Aktuell siehst du unsere lokal gespeicherten 24h-Kliniken (keine Datenübertragung an Dritte). Möchtest du alle lokalen Tierarztpraxen & die Karte live über <strong>OpenStreetMap</strong> laden?
                        </p>
                        <button
                          type="button"
                          onClick={() => enableOsmConsent()}
                          className="shrink-0 rounded-xl bg-teal-700 px-3.5 py-2 text-xs font-extrabold text-white shadow-2xs hover:bg-teal-800"
                        >
                          Live-Suche & Karte laden
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Top 3 Praxen direkt sichtbar (Übersichtlich!) */}
                  <div className="mt-4 space-y-2.5">
                    {!isLoadingHelpers && nearbyHelpers.length === 0 && (
                      <p className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-600">
                        Für diesen Ort sind offline keine Kliniken im 50-km-Radius hinterlegt. Klicke oben auf „Live-Suche & Karte laden“, um Praxen über OpenStreetMap abzurufen.
                      </p>
                    )}

                    {(showMapAndAllHelpers
                      ? nearbyHelpers.slice(0, 12)
                      : nearbyHelpers.slice(0, 3)
                    ).map((helper) => {
                      const routeUrl = `https://www.openstreetmap.org/directions?to=${helper.lat},${helper.lon}`;
                      return (
                        <div
                          key={helper.id}
                          className={`flex flex-col justify-between gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center ${
                            helper.verifiedPartner
                              ? 'border-teal-300 bg-teal-50/25'
                              : 'border-slate-200 bg-white'
                          }`}
                        >
                          <div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {helper.verifiedPartner && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-extrabold text-white">
                                  <ShieldCheck className="h-3 w-3" />
                                  Geprüfte Partner-Station
                                </span>
                              )}
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                                {helper.typeLabel} • {helper.distanceKm} km
                              </span>
                              {helper.emergency && (
                                <span className="rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white">
                                  Notdienst / Klinik
                                </span>
                              )}
                            </div>
                            <div className="mt-1 text-sm font-extrabold text-slate-900">
                              {helper.name}
                            </div>
                            {helper.address && (
                              <p className="text-xs text-slate-500">
                                {helper.address}
                              </p>
                            )}
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            {helper.phone && (
                              <a
                                href={`tel:${helper.phone}`}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-3.5 py-2.5 text-xs font-extrabold text-white hover:bg-teal-800"
                              >
                                <PhoneCall className="h-3.5 w-3.5" />
                                <span>Anrufen</span>
                              </a>
                            )}
                            <a
                              href={routeUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                            >
                              <Navigation className="h-3.5 w-3.5 text-teal-700" />
                              <span>Route (OSM)</span>
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {osmConsent && (
                    <p className="mt-2.5 text-[11px] text-slate-400">
                      Adress- & Umkreisdaten:{' '}
                      <a
                        href="https://www.openstreetmap.org/copyright"
                        target="_blank"
                        rel="noreferrer"
                        className="underline hover:text-slate-600"
                      >
                        © OpenStreetMap-Mitwirkende (ODbL)
                      </a>
                    </p>
                  )}

                  {/* Karte & restliche Praxen erst auf Klick aufklappen */}
                  {nearbyHelpers.length > 0 && (
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          if (!osmConsent) enableOsmConsent();
                          setShowMapAndAllHelpers((v) => !v);
                        }}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 py-3 text-xs font-extrabold text-slate-700 hover:bg-slate-100"
                      >
                        <MapIcon className="h-4 w-4 text-teal-700" />
                        <span>
                          {showMapAndAllHelpers
                            ? 'Karte & weitere Einträge ausblenden'
                            : `Interaktive Karte & alle ${nearbyHelpers.length} Helfer zeigen`}
                        </span>
                      </button>

                      {showMapAndAllHelpers && osmConsent && (
                        <div className="mt-4">
                          <RescueMap
                            center={location.coords}
                            helpers={nearbyHelpers}
                            selectedHelperId={selectedHelperId}
                            onSelectHelper={(id) => setSelectedHelperId(id)}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Hinweis zum Eintragen eigener Organisationen */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                    <span>
                      Kennst du eine Wildtierstation oder Tierrettung, die hier noch fehlt?
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsRegisterOrgOpen(true)}
                      className="font-extrabold text-teal-800 underline hover:text-teal-950"
                    >
                      + Organisation in Datenbank eintragen
                    </button>
                  </div>
                </div>

                {/* Übergabeprotokoll-Button unten */}
                <button
                  type="button"
                  onClick={() => setIsProtocolOpen(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-teal-700 bg-teal-50/70 py-4 text-sm font-extrabold text-teal-950 transition hover:bg-teal-100"
                >
                  <FileText className="h-5 w-5 text-teal-700" />
                  <span>Fundtier-Übergabeprotokoll für Station erstellen</span>
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Rechtssicherer Footer (1-Klick-Erreichbarkeit nach DDG / BGH-Rechtsprechung) */}
      <footer className="mx-auto mt-12 max-w-2xl border-t border-slate-200 px-4 pt-6 text-center text-xs text-slate-500">
        <p className="font-medium text-slate-600">
          Wichtiger Hinweis: Erste-Hilfe-Tipps ersetzen keine tierärztliche Behandlung. Eigenschutz & Jagdrecht (§ 292 StGB) beachten!
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-4 font-semibold text-slate-700">
          <button
            type="button"
            onClick={() => setLegalModalTab('impressum')}
            className="hover:text-teal-700 hover:underline"
          >
            Impressum (§ 5 DDG)
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setLegalModalTab('datenschutz')}
            className="hover:text-teal-700 hover:underline"
          >
            Datenschutzerklärung (DSGVO)
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setLegalModalTab('haftung')}
            className="hover:text-teal-700 hover:underline"
          >
            Notfall-Haftung & Jagdrecht
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setIsRegisterOrgOpen(true)}
            className="text-teal-800 hover:underline"
          >
            Organisation eintragen
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setIsAdminOpen(true)}
            className="text-slate-600 hover:text-slate-900 hover:underline"
          >
            Admin-Bereich
          </button>
          {osmConsent && (
            <>
              <span>•</span>
              <button
                type="button"
                onClick={revokeOsmConsent}
                className="text-rose-700 hover:underline"
              >
                OpenStreetMap-Freigabe widerrufen
              </button>
            </>
          )}
        </div>
      </footer>

      {/* Modals */}
      <HandoverProtocolModal
        isOpen={isProtocolOpen}
        onClose={() => setIsProtocolOpen(false)}
        animal={selectedAnimal}
        location={location}
        triageAnswers={triageAnswers}
      />

      <CarKitModal
        isOpen={isCarKitOpen}
        onClose={() => setIsCarKitOpen(false)}
      />

      <LegalModal
        isOpen={legalModalTab !== null}
        activeTab={legalModalTab || 'impressum'}
        onTabChange={(tab) => setLegalModalTab(tab)}
        onClose={() => setLegalModalTab(null)}
      />

      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        canPromptNatively={deferredInstallPrompt !== null}
        onTriggerNativeInstall={handleInstallButtonClick}
      />

      <RegisterOrganizationModal
        isOpen={isRegisterOrgOpen}
        onClose={() => setIsRegisterOrgOpen(false)}
        animals={animalProfiles}
        defaultCountry={countryFilter}
        onRegistered={refreshBootstrapData}
      />

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onDataChanged={refreshBootstrapData}
      />
    </div>
  );
}

export default App;
