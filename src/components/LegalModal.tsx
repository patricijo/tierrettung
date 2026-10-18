import { Scale, ShieldCheck, AlertTriangle, X } from 'lucide-react';

export type LegalTab = 'impressum' | 'datenschutz' | 'haftung';

interface LegalModalProps {
  isOpen: boolean;
  activeTab: LegalTab;
  onTabChange: (tab: LegalTab) => void;
  onClose: () => void;
}

export function LegalModal({
  isOpen,
  activeTab,
  onTabChange,
  onClose,
}: LegalModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 backdrop-blur-xs sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-5 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <Scale className="h-5 w-5 text-teal-400" />
            <div>
              <h2 id="legal-modal-title" className="text-base font-bold sm:text-lg">
                Rechtliche Angaben & Datenschutz
              </h2>
              <p className="text-xs text-slate-300">
                Muster-Vorlage nach aktuellem deutschem Recht (DDG, MStV, DSGVO, TDDDG)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-300 transition hover:bg-slate-800 hover:text-white"
            aria-label="Rechtliche Angaben schließen"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-100 p-1.5 text-xs font-bold">
          <button
            type="button"
            onClick={() => onTabChange('impressum')}
            className={`rounded-xl py-2 transition ${
              activeTab === 'impressum'
                ? 'bg-white text-teal-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Impressum (§ 5 DDG)
          </button>
          <button
            type="button"
            onClick={() => onTabChange('datenschutz')}
            className={`rounded-xl py-2 transition ${
              activeTab === 'datenschutz'
                ? 'bg-white text-teal-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Datenschutz (DSGVO)
          </button>
          <button
            type="button"
            onClick={() => onTabChange('haftung')}
            className={`rounded-xl py-2 transition ${
              activeTab === 'haftung'
                ? 'bg-white text-teal-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Notfall-Haftung
          </button>
        </div>

        {/* Content */}
        <div className="space-y-5 overflow-y-auto p-6 text-xs leading-relaxed text-slate-700 sm:text-sm">
          {/* Hinweis auf zentrale .env Konfiguration */}
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-950">
            <span className="font-extrabold">Zentrale Konfiguration über .env: </span>
            Die unten angezeigten Betreiberdaten werden automatisch aus der Datei{' '}
            <mark className="rounded bg-amber-200 px-1 font-mono font-bold">
              .env
            </mark>{' '}
            (<code className="font-mono">VITE_OPERATOR_*</code>) geladen. Trage dort vor Veröffentlichung deine echten Kontaktdaten ein.
          </div>

          {activeTab === 'impressum' && (
            <div className="space-y-4">
              <h3 className="text-base font-extrabold text-slate-900">
                Impressum
              </h3>

              <div>
                <h4 className="font-bold text-slate-900">
                  Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG)
                </h4>
                <p className="mt-1">
                  <mark className="rounded bg-amber-100 px-1 font-semibold">
                    {import.meta.env.VITE_OPERATOR_NAME || '[Vorname Nachname / Vereinsname]'}
                  </mark>
                  <br />
                  <mark className="rounded bg-amber-100 px-1 font-semibold">
                    {import.meta.env.VITE_OPERATOR_STREET || '[Straße und Hausnummer]'}
                  </mark>
                  <br />
                  <mark className="rounded bg-amber-100 px-1 font-semibold">
                    {import.meta.env.VITE_OPERATOR_CITY || '[PLZ und Ort, Land]'}
                  </mark>
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900">
                  Kontakt (zwei unmittelbare Kommunikationswege erforderlich)
                </h4>
                <p className="mt-1">
                  Telefon:{' '}
                  <mark className="rounded bg-amber-100 px-1 font-semibold">
                    {import.meta.env.VITE_OPERATOR_PHONE || '[+49 (0) XXX XXXXXXX]'}
                  </mark>
                  <br />
                  E-Mail:{' '}
                  <mark className="rounded bg-amber-100 px-1 font-semibold">
                    {import.meta.env.VITE_OPERATOR_EMAIL || '[kontakt@deine-domain.de]'}
                  </mark>
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900">
                  Redaktionell verantwortlich gemäß § 18 Abs. 2 Medienstaatsvertrag (MStV)
                </h4>
                <p className="mt-1">
                  <mark className="rounded bg-amber-100 px-1 font-semibold">
                    {import.meta.env.VITE_RESPONSIBLE_PERSON || '[Vorname Nachname]'}
                  </mark>
                  <br />
                  <mark className="rounded bg-amber-100 px-1 font-semibold">
                    {import.meta.env.VITE_OPERATOR_STREET || '[Straße Hausnr.]'},{' '}
                    {import.meta.env.VITE_OPERATOR_CITY || '[PLZ Ort]'}
                  </mark>
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900">
                  Optional (nur falls Verein oder Unternehmen):
                </h4>
                <p className="mt-1 text-xs text-slate-600">
                  Vereinsregister / Handelsregister:{' '}
                  <mark className="rounded bg-amber-100 px-1">
                    [Registergericht & Registernummer, z.B. VR 12345]
                  </mark>
                  <br />
                  Vertretungsberechtigter Vorstand / Geschäftsführer:{' '}
                  <mark className="rounded bg-amber-100 px-1">
                    {import.meta.env.VITE_RESPONSIBLE_PERSON || '[Vorname Nachname]'}
                  </mark>
                  <br />
                  Umsatzsteuer-ID (falls vorhanden gem. § 27a UStG):{' '}
                  <mark className="rounded bg-amber-100 px-1">[DE123456789]</mark>
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900">
                  Verbraucherstreitbeilegung / Universalschlichtungsstelle
                </h4>
                <p className="mt-1 text-xs text-slate-600">
                  Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen (§ 36 VSBG).
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900">
                  Quellenangaben für Kartendaten
                </h4>
                <p className="mt-1 text-xs text-slate-600">
                  Kartenmaterial und Umkreissuche: ©{' '}
                  <a
                    href="https://www.openstreetmap.org/copyright"
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-teal-700 underline"
                  >
                    OpenStreetMap-Mitwirkende
                  </a>{' '}
                  (unter der Open Database License – ODbL).
                </p>
              </div>
            </div>
          )}

          {activeTab === 'datenschutz' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-teal-700" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Datenschutzerklärung (DSGVO & TDDDG)
                </h3>
              </div>

              <div>
                <h4 className="font-bold text-slate-900">
                  1. Verantwortlicher im Sinne der DSGVO
                </h4>
                <p className="mt-1">
                  Verantwortlich für die Datenverarbeitung auf dieser Website ist:
                  <br />
                  <mark className="rounded bg-amber-100 px-1 font-semibold">
                    {import.meta.env.VITE_OPERATOR_NAME || '[Name / Organisation]'},{' '}
                    {import.meta.env.VITE_OPERATOR_STREET || '[Straße]'},{' '}
                    {import.meta.env.VITE_OPERATOR_CITY || '[PLZ Ort]'} – E-Mail:{' '}
                    {import.meta.env.VITE_OPERATOR_EMAIL || '[E-Mail]'}, Tel.:{' '}
                    {import.meta.env.VITE_OPERATOR_PHONE || '[Telefon]'}
                  </mark>
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900">
                  2. Hosting und Server-Log-Dateien
                </h4>
                <p className="mt-1">
                  Diese Web-App wird gehostet bei{' '}
                  <mark className="rounded bg-amber-100 px-1 font-semibold">
                    [Name und Anschrift deines Hosters, z.B. Hetzner Online GmbH, Industriestr. 25, 91710 Gunzenhausen]
                  </mark>
                  . Mit dem Hosting-Anbieter wurde ein Vertrag über Auftragsverarbeitung (AVV) gemäß Art. 28 DSGVO geschlossen. Beim Aufruf der Website erfasst der Webserver technisch notwendige Zugriffsdaten (IP-Adresse, Zeitpunkt, Browsertyp) zur Gewährleistung der Systemsicherheit (Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO).
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900">
                  3. Lokale Speicherung im Browser (LocalStorage nach § 25 TDDDG)
                </h4>
                <p className="mt-1">
                  Diese Anwendung setzt <strong>keine Tracking- oder Werbe-Cookies</strong> ein. Lediglich wenn du aktiv die Funktion „Auto-Notfallbox Checkliste“ oder die Freigabe für die OpenStreetMap-Umkreissuche nutzt, wird der Status lokal im <code>localStorage</code> deines Endgeräts gespeichert. Eine Übertragung dieser Daten an unsere Server findet nicht statt (Rechtsgrundlage: § 25 Abs. 2 Nr. 2 TDDDG, Art. 6 Abs. 1 lit. b/f DSGVO).
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900">
                  4. Standortbestimmung (Browser Geolocation API)
                </h4>
                <p className="mt-1">
                  Wenn du auf den Button „GPS nutzen“ tippst, fragt dein Browser deine ausdrückliche Einwilligung zur Standortfreigabe ab. Deine GPS-Koordinaten werden ausschließlich genutzt, um dir Tierärzte, Tierkliniken und Tierheime im Umkreis anzuzeigen sowie auf deinen Wunsch das Fundtier-Übergabeprotokoll auf deinem Gerät auszufüllen (Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO – Einwilligung).
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900">
                  5. OpenStreetMap & Nominatim (2-Klick-Lösung)
                </h4>
                <p className="mt-1">
                  Zum Schutz deiner Privatsphäre lädt diese Web-App beim Start <strong>keine</strong> externen Kartendaten. Erst wenn du die Live-Umkreissuche oder die interaktive Karte aktivierst, stellt dein Browser eine Verbindung zu den Servern der <strong>OpenStreetMap Foundation (OSMF)</strong>, St John’s Innovation Centre, Cowley Road, Cambridge, CB4 0WS, Vereinigtes Königreich, her (<code>nominatim.openstreetmap.org</code> und <code>tile.openstreetmap.org</code>). Hierbei werden deine IP-Adresse sowie der gewählte Suchort bzw. die Koordinaten an die OSMF übermittelt. Für das Vereinigte Königreich besteht ein Angemessenheitsbeschluss der EU-Kommission gemäß Art. 45 DSGVO. Rechtsgrundlage ist deine Einwilligung (Art. 6 Abs. 1 lit. a DSGVO, § 25 Abs. 1 TDDDG). Weitere Infos:{' '}
                  <a
                    href="https://osmfoundation.org/wiki/Privacy_Policy"
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-teal-700 underline"
                  >
                    OSMF Privacy Policy
                  </a>
                  .
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900">
                  6. Deine Betroffenenrechte
                </h4>
                <p className="mt-1">
                  Du hast jederzeit das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16 DSGVO), Löschung (Art. 17 DSGVO), Einschränkung der Verarbeitung (Art. 18 DSGVO), Widerruf erteilter Einwilligungen (Art. 7 Abs. 3 DSGVO) sowie ein Beschwerderecht bei einer Datenschutz-Aufsichtsbehörde (Art. 77 DSGVO).
                </p>
              </div>
            </div>
          )}

          {activeTab === 'haftung' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Wichtige Hinweise zu Erste Hilfe, Jagdrecht & Kosten
                </h3>
              </div>

              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-950">
                <h4 className="font-extrabold">
                  1. Kein Ersatz für tierärztliche Behandlung (Medizinischer Disclaimer)
                </h4>
                <p className="mt-1 text-xs leading-relaxed">
                  Die Inhalte dieser Web-App dienen ausschließlich der ersten Orientierung für Laien-Ersthelfer in akuten Fund- und Notsituationen. Sie stellen <strong>keine tiermedizinische Diagnose, Beratung oder Behandlung</strong> dar und ersetzen keinesfalls die Untersuchung durch eine Tierärztin oder einen Tierarzt.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900">
                  2. Eigenschutz & Gefahrenabwehr haben Vorrang
                </h4>
                <p className="mt-1">
                  Jede Hilfeleistung erfolgt auf eigene Gefahr. Achte im Straßenverkehr zwingend auf deine eigene Sicherheit (Warnblinker, Warnweste, Warndreieck). Berühre Wildtiere – insbesondere Fledermäuse (Risiko der Europäischen Fledermaustollwut EBLV), Greifvögel, Füchse oder Schwarzwild – niemals ohne geeignete Schutzausrüstung bzw. halte bei größeren Wildtieren strikten Sicherheitsabstand. Im Falle eines Bisses oder Kratzers suche umgehend einen Humanmediziner / ein Krankenhaus auf.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900">
                  3. Jagdrecht & Verbot der Wilderei (§ 292 StGB)
                </h4>
                <p className="mt-1">
                  Wildtiere, die dem Jagdrecht unterliegen (insbesondere Rehe, Hirsche, Wildschweine, Feldhasen, Füchse, Dachse etc.), dürfen von Privatpersonen <strong>nicht ohne Zustimmung des Jagdausübungsberechtigten mitgenommen oder transportiert</strong> werden. Verständige bei verletztem Jagdwild immer die Polizei (110 in DE, 133 in AT, 117 in CH), die den zuständigen Jagdpächter oder Wildhüter informiert.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900">
                  4. Hinweis zu Tierarztkosten & Fundtierrecht (§ 965 BGB)
                </h4>
                <p className="mt-1">
                  Wer ein verletztes Tier ohne vorherige Rücksprache bei einer privaten Tierarztpraxis in Behandlung gibt, kann nach dem Zivilrecht als Auftraggeber für die Behandlungskosten herangezogen werden, sofern keine kommunale Kostenübernahme (Fundbüro / Ordnungsamt / Tierheim) greift oder die Praxis nicht ausdrücklich auf ein Honorar bei Wildtieren verzichtet. Kläre die Kostenfrage daher immer direkt beim ersten Anruf mit der Praxis oder dem zuständigen Tierheim/Ordnungsamt ab.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-slate-200 bg-slate-50 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-teal-700 px-5 py-2 text-xs font-bold text-white hover:bg-teal-800"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}
