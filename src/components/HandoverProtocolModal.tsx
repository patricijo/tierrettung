import { useState } from 'react';
import {
  ClipboardCheck,
  Copy,
  FileText,
  MapPin,
  Printer,
  Share2,
  X,
} from 'lucide-react';
import type { AnimalProfile } from '../data/rescueData';
import type { LocationDetails } from '../services/locationService';

interface HandoverProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
  animal: AnimalProfile;
  location: LocationDetails;
  triageAnswers: Record<string, boolean>;
}

const SYMPTOM_TAGS = [
  'Katzenkontakt / Bissverdacht',
  'Kollision (Auto / Fensterscheibe)',
  'Kühl / Unterkühlt',
  'Sichtbare Wunde / Blutung',
  'Fliegeneier / Madenbefall',
  'Apathisch / Seitenlage',
  'Jungtier / Verwaist',
  'Flügel / Bein hängt herab',
];

const ACTION_TAGS = [
  'In abgedunkeltem Karton gesichert',
  'Handwarme Wärmequelle angelegt',
  'Kühl & schattig gelagert (SHT/Amphibie)',
  'Nichts eingeflößt (kein Wasser/Milch)',
  'Fliegeneier oberflächlich abgestreift',
  'Fundort nach Geschwistern abgesucht',
];

export function HandoverProtocolModal({
  isOpen,
  onClose,
  animal,
  location,
  triageAnswers,
}: HandoverProtocolModalProps) {
  const [foundTime, setFoundTime] = useState(() => {
    const now = new Date();
    return now.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  });

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedActions, setSelectedActions] = useState<string[]>([
    'In abgedunkeltem Karton gesichert',
    'Nichts eingeflößt (kein Wasser/Milch)',
  ]);
  const [customNotes, setCustomNotes] = useState('');
  const [finderNamePhone, setFinderNamePhone] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const toggleItem = (
    list: string[],
    setList: (v: string[]) => void,
    item: string
  ) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const triageSummary = animal.triageQuestions
    .filter((q) => triageAnswers[q.id] !== undefined)
    .map(
      (q) =>
        `- ${q.question} -> ${triageAnswers[q.id] ? 'JA (Notfall-Indikator)' : 'NEIN'}`
    )
    .join('\n');

  const mapsUrl = `https://www.openstreetmap.org/?mlat=${location.coords.lat.toFixed(5)}&mlon=${location.coords.lon.toFixed(5)}#map=17/${location.coords.lat.toFixed(5)}/${location.coords.lon.toFixed(5)}`;

  const protocolText = [
    `=== FUNDTIER-ÜBERGABEPROTOKOLL ===`,
    `Tierart: ${animal.name} (${animal.subtitle})`,
    `Fundzeitpunkt: ${foundTime}`,
    `Fundort: ${location.displayName}`,
    `GPS-Koordinaten: ${location.coords.lat.toFixed(5)}, ${location.coords.lon.toFixed(5)}`,
    `Kartenlink: ${mapsUrl}`,
    ``,
    `BEOBACHTETE SYMPTOME / ZUSTAND:`,
    selectedSymptoms.length > 0
      ? selectedSymptoms.map((s) => `• ${s}`).join('\n')
      : '• Keine spezifischen Tags ausgewählt',
    triageSummary ? `\nVorab-Check:\n${triageSummary}` : '',
    ``,
    `DURCHGEFÜHRTE ERSTE-HILFE-MASSNAHMEN:`,
    selectedActions.length > 0
      ? selectedActions.map((a) => `✓ ${a}`).join('\n')
      : '• Noch keine Maßnahmen markiert',
    customNotes ? `\nZUSATZNOTIZEN (z. B. genaue Fundumstände):\n${customNotes}` : '',
    finderNamePhone ? `\nFINDER-KONTAKT (für Rückfragen):\n${finderNamePhone}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(protocolText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Fundtier-Protokoll: ${animal.name}`,
          text: protocolText,
        });
      } catch {
        // user cancelled share
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 backdrop-blur-xs sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="protocol-modal-title"
    >
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-teal-900 px-5 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <FileText className="h-5 w-5 text-teal-300" />
            <div>
              <h2 id="protocol-modal-title" className="text-base font-bold sm:text-lg">
                Fundtier-Übergabeprotokoll
              </h2>
              <p className="text-xs text-teal-200">
                Für Tierarzt, Wildtierstation, Polizei oder Jagdpächter
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-teal-100 transition hover:bg-teal-800 hover:text-white"
            aria-label="Protokoll schließen"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 overflow-y-auto p-5 text-sm">
          {/* Auto-filled Location & Animal Summary */}
          <div className="grid gap-3 rounded-xl border border-teal-200 bg-teal-50/70 p-4 sm:grid-cols-2">
            <div>
              <span className="text-xs font-semibold tracking-wide text-teal-800 uppercase">
                Tierart & Kategorie
              </span>
              <p className="mt-0.5 font-bold text-slate-900">{animal.name}</p>
              <p className="text-xs text-slate-600">{animal.specialistType}</p>
            </div>
            <div>
              <label
                htmlFor="found-time-input"
                className="block text-xs font-semibold tracking-wide text-teal-800 uppercase"
              >
                Fundzeitpunkt
              </label>
              <input
                id="found-time-input"
                type="text"
                value={foundTime}
                onChange={(e) => setFoundTime(e.target.value)}
                className="mt-1 w-full rounded-lg border border-teal-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-900"
              />
            </div>
            <div className="sm:col-span-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-teal-800 uppercase">
                <MapPin className="h-3.5 w-3.5" />
                Exakter Fundort (wichtig für spätere Auswilderung oder Nachsuche!)
              </div>
              <p className="mt-0.5 font-semibold text-slate-900">
                {location.displayName}
              </p>
              <p className="font-mono text-xs text-slate-600">
                GPS: {location.coords.lat.toFixed(5)}, {location.coords.lon.toFixed(5)}
              </p>
            </div>
          </div>

          {/* Symptoms */}
          <div>
            <p className="font-semibold text-slate-900">
              1. Beobachtete Symptome & Fundumstände (bitte antippen):
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {SYMPTOM_TAGS.map((tag) => {
                const active = selectedSymptoms.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() =>
                      toggleItem(selectedSymptoms, setSelectedSymptoms, tag)
                    }
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      active
                        ? 'border-rose-600 bg-rose-600 text-white shadow-xs'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    {active ? '✓ ' : '+ '}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* First Aid Actions Done */}
          <div>
            <p className="font-semibold text-slate-900">
              2. Bereits durchgeführte Maßnahmen durch Finder/in:
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {ACTION_TAGS.map((tag) => {
                const active = selectedActions.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() =>
                      toggleItem(selectedActions, setSelectedActions, tag)
                    }
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      active
                        ? 'border-teal-700 bg-teal-700 text-white shadow-xs'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    {active ? '✓ ' : '+ '}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes & Finder Contact */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="protocol-notes"
                className="block text-xs font-semibold text-slate-700"
              >
                Genaue Fundstelle / Besonderheiten (optional)
              </label>
              <textarea
                id="protocol-notes"
                rows={2}
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="z.B. Unter Hecke an Hausnummer 12 gefunden, Katze saß daneben..."
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="protocol-finder"
                className="block text-xs font-semibold text-slate-700"
              >
                Dein Name & Telefon für Rückfragen (optional)
              </label>
              <textarea
                id="protocol-finder"
                rows={2}
                value={finderNamePhone}
                onChange={(e) => setFinderNamePhone(e.target.value)}
                placeholder="z.B. Max Mustermann, 0170 1234567"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Text Preview */}
          <div>
            <span className="text-xs font-semibold text-slate-600">
              Vorschau (fertig zum Versenden per WhatsApp/SMS oder Vorzeigen):
            </span>
            <pre className="mt-1.5 max-h-40 overflow-y-auto rounded-xl border border-slate-200 bg-slate-900 p-3 font-mono text-xs whitespace-pre-wrap text-slate-100">
              {protocolText}
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-teal-800"
            >
              {copied ? (
                <>
                  <ClipboardCheck className="h-4 w-4" />
                  In Zwischenablage kopiert!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Protokoll kopieren (WhatsApp / SMS)
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <Share2 className="h-4 w-4" />
              Teilen
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <Printer className="h-4 w-4" />
              Drucken
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}
