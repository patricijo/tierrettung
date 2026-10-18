import { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Clock,
  Globe,
  LocateFixed,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  UserCheck,
  X,
} from 'lucide-react';
import type { AnimalProfile, CountryCode } from '../data/rescueData';
import { submitOrganizationRegistration } from '../services/apiService';
import { DACH_CITY_PRESETS, geocodeSearch } from '../services/locationService';
import type { OrganizationType } from '../types/organization';

interface RegisterOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  animals: AnimalProfile[];
  defaultCountry?: CountryCode;
  onRegistered?: () => void;
}

const ORG_TYPE_OPTIONS: {
  value: OrganizationType;
  label: string;
  defaultTypeLabel: string;
  desc: string;
}[] = [
  {
    value: 'wildlife_rescue',
    label: 'Wildtierstation / Auffangstation',
    defaultTypeLabel: 'Wildtierstation',
    desc: 'Igelhilfe, Wildvogelhilfe, Kitzrettung, Fledermausschutz etc.',
  },
  {
    value: 'veterinary',
    label: 'Tierarztpraxis / Tierklinik',
    defaultTypeLabel: 'Tierklinik',
    desc: 'Kleintierpraxis, Fachtierarzt oder 24h-Tierklinik',
  },
  {
    value: 'animal_shelter',
    label: 'Tierheim / Tierschutzverein',
    defaultTypeLabel: 'Tierheim / Tierschutz',
    desc: 'Fundtierannahme, mobiler Tiernotdienst oder Tierschutzverein',
  },
];

export function RegisterOrganizationModal({
  isOpen,
  onClose,
  animals,
  defaultCountry = 'DE',
  onRegistered,
}: RegisterOrganizationModalProps) {
  const [name, setName] = useState('');
  const [orgType, setOrgType] = useState<OrganizationType>('wildlife_rescue');
  const [typeLabel, setTypeLabel] = useState('Wildtierstation');
  const [countryCode, setCountryCode] = useState<CountryCode>(defaultCountry);
  const [postcode, setPostcode] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('52.5200');
  const [lon, setLon] = useState('13.4050');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [openingHours, setOpeningHours] = useState('Täglich 08:00–20:00 Uhr');
  const [emergency, setEmergency] = useState(true);
  const [specialties, setSpecialties] = useState<string[]>(['igel', 'vogel']);
  const [description, setDescription] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeHint, setGeocodeHint] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleSpecialty = (animalId: string) => {
    setSpecialties((prev) =>
      prev.includes(animalId) ? prev.filter((id) => id !== animalId) : [...prev, animalId],
    );
  };

  const handleAutoCoordinates = async () => {
    const query = [address, postcode, city].filter(Boolean).join(', ').trim();
    if (!query) {
      setGeocodeHint('Bitte zuerst Ort oder Straße + PLZ eingeben.');
      return;
    }

    setIsGeocoding(true);
    setGeocodeHint(null);
    try {
      const results = await geocodeSearch(query);
      if (results.length > 0) {
        const best = results[0];
        setLat(best.coords.lat.toFixed(4));
        setLon(best.coords.lon.toFixed(4));
        if (!city && best.city) setCity(best.city);
        if (!postcode && best.postcode) setPostcode(best.postcode);
        setCountryCode(best.countryCode);
        setGeocodeHint(`Koordinaten gefunden: ${best.displayName}`);
      } else {
        const preset = DACH_CITY_PRESETS.find(
          (p) => p.city?.toLowerCase() === city.trim().toLowerCase(),
        );
        if (preset) {
          setLat(preset.coords.lat.toFixed(4));
          setLon(preset.coords.lon.toFixed(4));
          setGeocodeHint(`Stadt-Koordinaten übernommen (${preset.city}).`);
        } else {
          setGeocodeHint(
            'Adresse konnte nicht automatisch aufgelöst werden. Du kannst die Koordinaten direkt eingeben.',
          );
        }
      }
    } catch {
      setGeocodeHint('Automatische Koordinatensuche derzeit nicht erreichbar.');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const result = await submitOrganizationRegistration({
        name,
        type: orgType,
        typeLabel,
        countryCode,
        city,
        postcode,
        address: address || `${postcode} ${city}`.trim(),
        lat: parseFloat(lat) || 52.52,
        lon: parseFloat(lon) || 13.405,
        phone,
        website,
        openingHours,
        emergency,
        specialties,
        description,
        contactName,
        contactEmail,
        privacyAccepted,
      });

      setSuccessMessage(result.message);
      onRegistered?.();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Fehler beim Speichern in der Datenbank.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSuccessMessage(null);
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-3 backdrop-blur-xs sm:p-5">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-teal-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-700/80 text-teal-100">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-wider text-teal-200 uppercase">
                Partner-Verzeichnis (MongoDB)
              </span>
              <h2 className="text-base font-extrabold sm:text-lg">
                Tierrettung / Auffangstation eintragen
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="rounded-xl bg-teal-800/80 p-2 text-teal-100 hover:bg-teal-700 hover:text-white"
            aria-label="Schließen"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6">
          {successMessage ? (
            <div className="space-y-5 py-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900">
                  Eintrag erfolgreich übermittelt!
                </h3>
                <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-600">
                  {successMessage}
                </p>
              </div>
              <div className="mx-auto max-w-md rounded-2xl border border-teal-200 bg-teal-50/70 p-4 text-left text-xs text-teal-950">
                <p className="font-bold">Was passiert als Nächstes?</p>
                <p className="mt-1 leading-relaxed">
                  Zum Schutz vor Falschmeldungen prüft ein Administrator deinen Eintrag im{' '}
                  <strong>Admin-Bereich</strong>. Nach 1-Klick-Freigabe erscheint deine Station
                  sofort mit grünem <strong>„Geprüfte Partner-Station“</strong>-Siegel in der
                  Umkreissuche und auf der Notfallkarte.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetAndClose}
                className="rounded-2xl bg-teal-700 px-6 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-teal-800"
              >
                Zurück zur Übersicht
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="rounded-2xl border border-teal-200 bg-teal-50/70 p-3.5 text-xs text-teal-950">
                Trage deine <strong>Wildtierstation, Tierrettung, Pflegestelle oder Tierklinik</strong>{' '}
                kostenlos in unsere Datenbank ein, damit Finder verletzter Tiere in deiner Region
                sofort die richtige Anlaufstelle finden.
              </div>

              {errorMsg && (
                <div className="rounded-2xl border border-rose-300 bg-rose-50 p-3.5 text-xs font-bold text-rose-900">
                  {errorMsg}
                </div>
              )}

              {/* 1. Art der Einrichtung */}
              <div>
                <label className="block text-xs font-extrabold tracking-wide text-slate-700 uppercase">
                  1. Art der Einrichtung
                </label>
                <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  {ORG_TYPE_OPTIONS.map((opt) => {
                    const active = orgType === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setOrgType(opt.value);
                          setTypeLabel(opt.defaultTypeLabel);
                        }}
                        className={`flex flex-col items-start rounded-2xl border p-3 text-left transition ${
                          active
                            ? 'border-teal-600 bg-teal-50/80 ring-2 ring-teal-600/20'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-xs font-extrabold text-slate-900">
                          {opt.label}
                        </span>
                        <span className="mt-1 text-[11px] text-slate-500">{opt.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Name & Kurzbezeichnung */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Name der Organisation / Station / Praxis *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="z.B. Wildtierhilfe & Igelstation Musterstadt e.V."
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-teal-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    Anzeige-Badge
                  </label>
                  <input
                    type="text"
                    value={typeLabel}
                    onChange={(e) => setTypeLabel(e.target.value)}
                    placeholder="z.B. Igelstation"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-teal-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* 3. Standort & Adresse */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800 uppercase">
                    <MapPin className="h-4 w-4 text-teal-700" />
                    2. Standort & Einsatzgebiet
                  </span>
                  <button
                    type="button"
                    onClick={handleAutoCoordinates}
                    disabled={isGeocoding}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-800 disabled:opacity-50"
                  >
                    <LocateFixed className="h-3.5 w-3.5" />
                    <span>
                      {isGeocoding
                        ? 'Ermittle Koordinaten...'
                        : 'Koordinaten aus Adresse ermitteln'}
                    </span>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700">Land *</label>
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value as CountryCode)}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold focus:border-teal-600 focus:outline-hidden"
                    >
                      <option value="DE">Deutschland (DE)</option>
                      <option value="AT">Österreich (AT)</option>
                      <option value="CH">Schweiz (CH)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700">PLZ *</label>
                    <input
                      type="text"
                      required
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value)}
                      placeholder="10115"
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-teal-600 focus:outline-hidden"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Stadt / Landkreis *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="z.B. Berlin"
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-teal-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Straße & Hausnummer (oder Region)
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="z.B. Musterweg 4, 10115 Berlin"
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-teal-600 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700">
                      Breitengrad (Lat)
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-mono focus:border-teal-600 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700">
                      Längengrad (Lon)
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={lon}
                      onChange={(e) => setLon(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-mono focus:border-teal-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                {geocodeHint && (
                  <p className="text-xs font-medium text-teal-800">{geocodeHint}</p>
                )}
              </div>

              {/* 4. Notrufnummer, Zeiten & Webseite */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="flex items-center gap-1 text-xs font-bold text-slate-700">
                    <Phone className="h-3.5 w-3.5 text-teal-700" />
                    Notfall-Telefonnummer *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+49 170 1234567"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-teal-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1 text-xs font-bold text-slate-700">
                    <Clock className="h-3.5 w-3.5 text-teal-700" />
                    Erreichbarkeit / Zeiten
                  </label>
                  <input
                    type="text"
                    value={openingHours}
                    onChange={(e) => setOpeningHours(e.target.value)}
                    placeholder="z.B. 24/7 Nottelefon"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-teal-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1 text-xs font-bold text-slate-700">
                    <Globe className="h-3.5 w-3.5 text-teal-700" />
                    Webseite (optional)
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://..."
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-teal-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-2.5 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <input
                  type="checkbox"
                  checked={emergency}
                  onChange={(e) => setEmergency(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-teal-700"
                />
                <span className="text-xs font-bold text-slate-800">
                  Akuter Notdienst / Notfallaufnahme verfügbar (wird bei Notfällen bevorzugt gelistet)
                </span>
              </label>

              {/* 5. Tierarten-Spezialisierung */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700 uppercase">
                  <Sparkles className="h-4 w-4 text-teal-700" />
                  3. Welche Tierarten nehmt ihr auf / betreut ihr?
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {animals.map((animal) => {
                    const selected = specialties.includes(animal.id);
                    return (
                      <button
                        key={animal.id}
                        type="button"
                        onClick={() => toggleSpecialty(animal.id)}
                        className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                          selected
                            ? 'border-teal-700 bg-teal-700 text-white shadow-2xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {animal.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Hinweise für Finder (z.B. „Bitte vorab per WhatsApp Foto senden“ oder „Aufnahme nur nach Anruf“)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Kurze Beschreibung für Ersthelfer..."
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-teal-600 focus:outline-hidden"
                />
              </div>

              {/* 6. Interner Verifizierungs-Kontakt (nur für Admin) */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-amber-950">
                  <UserCheck className="h-4 w-4 text-amber-700" />
                  <span>
                    4. Ansprechpartner für Rückfragen (Wird NICHT öffentlich angezeigt)
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700">
                      Dein Vor- und Nachname *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Sabine Mustermann"
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm focus:border-teal-600 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1 text-xs font-bold text-slate-700">
                      <Mail className="h-3.5 w-3.5 text-amber-700" />
                      E-Mail für Rückfragen / Freigabe *
                    </label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="kontakt@station.de"
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm focus:border-teal-600 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* DSGVO Einwilligung */}
              <label className="flex cursor-pointer items-start gap-2.5 rounded-2xl border border-slate-200 p-3.5 text-xs text-slate-600">
                <input
                  type="checkbox"
                  required
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-700"
                />
                <span>
                  <strong className="text-slate-900">DSGVO-Einwilligung:</strong> Ich bestätige,
                  dass ich berechtigt bin, diese Einrichtung einzutragen, und willige ein, dass die
                  oben genannten Stationsdaten (Name, Adresse, Notrufnummer, Zeiten) nach
                  Admin-Prüfung öffentlich im TierRettung-Kompass angezeigt werden. Widerruf
                  jederzeit per E-Mail möglich.
                </span>
              </label>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-teal-800 disabled:opacity-50"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>
                    {isSubmitting ? 'Wird gespeichert...' : 'Organisation jetzt eintragen'}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
