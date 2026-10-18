import { Bird, Cat, Dog, HeartPulse, Rabbit, Squirrel } from 'lucide-react';

interface AnimalIconProps {
  name: string;
  className?: string;
}

/**
 * Custom SVG Animal Icons im einheitlichen 24x24 Stroke-Design (passend zu Lucide),
 * damit Igel, Rehkitz, Fledermaus, Fuchs, Frosch, Schwan und Eule sofort als Tier erkennbar sind.
 */
export function AnimalIcon({ name, className = 'h-6 w-6' }: AnimalIconProps) {
  switch (name) {
    // IGEL (Hedgehog mit Stachelkleid, spitzer Schnauze & Pfötchen)
    case 'Sparkles':
    case 'Hedgehog':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          {/* Stachel-Kontur oben */}
          <path d="M3 15c0-5 3.5-9 9-9 4.5 0 7.5 2.5 8.5 6l2.5 2-2.5 2H3Z" />
          {/* Stachel-Zacken */}
          <path d="m5 10-1.5-2" />
          <path d="m8.5 7.5-1-2.5" />
          <path d="m12.5 6.5-.5-2.5" />
          <path d="m16.5 7.5 1-2" />
          {/* Abtrennung Gesicht */}
          <path d="M16 11c-.5 2-1 3.5-1 5" />
          {/* Auge & Nasenspitze */}
          <circle cx="18.5" cy="12.5" r="0.8" fill="currentColor" />
          <circle cx="22.5" cy="14" r="0.9" fill="currentColor" />
          {/* Füßchen */}
          <path d="M6 16v2.5" />
          <path d="M13 16v2.5" />
        </svg>
      );

    // REHKITZ / REH (Rehkopf mit großen Lauscher-Ohren, feiner Schnauze & Kitz-Punkten)
    case 'Trees':
    case 'Deer':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          {/* Linkes & rechtes großes Reh-Ohr (Lauscher) */}
          <path d="M8.5 9C6 6.5 3.5 5.5 3 7c-.5 1.8 1.5 4.2 4.5 5" />
          <path d="M15.5 9c2.5-2.5 5-3.5 5.5-2 .5 1.8-1.5 4.2-4.5 5" />
          {/* Kleines Geweih / Stirnschopf */}
          <path d="M9.5 8V4.5L7.5 3" />
          <path d="M14.5 8V4.5L16.5 3" />
          {/* Kopfform & schmale Schnauze */}
          <path d="M7.5 11.5c0-2 2-3.5 4.5-3.5s4.5 1.5 4.5 3.5c0 3-2 7.5-4.5 7.5s-4.5-4.5-4.5-7.5Z" />
          {/* Nase & Augen */}
          <ellipse cx="12" cy="17.2" rx="1.2" ry="0.8" fill="currentColor" />
          <circle cx="9.8" cy="12.5" r="0.7" fill="currentColor" />
          <circle cx="14.2" cy="12.5" r="0.7" fill="currentColor" />
          {/* Halsansatz */}
          <path d="M9.5 18.2 8 21" />
          <path d="m14.5 18.2 1.5 2.8" />
        </svg>
      );

    // FLEDERMAUS (Ausgebreitete Schwingen & spitze Ohren)
    case 'Moon':
    case 'Bat':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          {/* Kopf mit spitzen Fledermaus-Ohren */}
          <path d="m9.5 9 1-3.5L12 7.5l1.5-2 1 3.5" />
          {/* Linker & rechter Flügel mit typischen Flughaut-Bögen */}
          <path d="M9.5 9C6.5 6.5 3 7 2 10c2.2 0 3.5 1.2 4 3 1.8-.8 3.3-.3 4.2 1.5L12 17l1.8-2.5c.9-1.8 2.4-2.3 4.2-1.5.5-1.8 1.8-3 4-3-1-3-4.5-3.5-7.5-1" />
        </svg>
      );

    // FUCHS / MARDER (Markanter Fuchskopf mit großen Dreiecksohren & Wangenzeichnung)
    case 'ShieldAlert':
    case 'Fox':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          {/* Äußerer Fuchskopf + spitze Ohren */}
          <path d="M4 4 8.5 8h7L20 4l-1.2 8.5L12 20l-6.8-7.5L4 4Z" />
          {/* Typische Fuchs-Wangenzeichnung zur Schnauzenspitze */}
          <path d="M5.2 12.5c3 0 5.2 2.5 6.8 7.5 1.6-5 3.8-7.5 6.8-7.5" />
          {/* Nasenspitze & Augen */}
          <circle cx="12" cy="19.2" r="1" fill="currentColor" />
          <circle cx="9.2" cy="11.5" r="0.8" fill="currentColor" />
          <circle cx="14.8" cy="11.5" r="0.8" fill="currentColor" />
        </svg>
      );

    // FROSCH / AMPHIBIEN (Sitzender Frosch mit typischen großen Augen)
    case 'Bug':
    case 'Frog':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          {/* Hervorstehende Froschaugen */}
          <circle cx="8.5" cy="7.5" r="2.2" />
          <circle cx="15.5" cy="7.5" r="2.2" />
          <circle cx="8.5" cy="7.5" r="0.6" fill="currentColor" />
          <circle cx="15.5" cy="7.5" r="0.6" fill="currentColor" />
          {/* Froschkörper & breites Maul */}
          <path d="M6.3 8.5C4.5 10 4 12.2 4 14.5 4 17.5 7.5 19 12 19s8-1.5 8-4.5c0-2.3-.5-4.5-2.3-6" />
          <path d="M10.7 7.5h2.6" />
          <path d="M7 13c1.8 1 3.5 1.3 5 1.3s3.2-.3 5-1.3" />
          {/* Angeinkelte Sprungbeine */}
          <path d="M5 17.5 3 20h3.5" />
          <path d="m19 17.5 2 2.5h-3.5" />
        </svg>
      );

    // WASSERVOGEL (Schwimmender Schwan / Ente)
    case 'Waves':
    case 'Swan':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          {/* Schwanenhals, Kopf, Schnabel & Körper */}
          <path d="M7 7.5 5 8.5l2 .5" />
          <path d="M10 15c-2.5-1.5-3-4-2-6.5.6-1.5 0-3-1-3-1.2 0-2 1-2 2.5 0 2.5 2 4.5 2 6.5 0 1.5-1.5 2.5-1.5 2.5h11.5c2 0 3.5-1.5 3.5-3.5 0-2.5-2.5-4-6-3.5-1.8.2-3.2 1.5-4.5 4.5Z" />
          {/* Wasserwelle darunter */}
          <path d="M3 20c2 .8 4 .8 6 0s4-.8 6 0 4 .8 6 0" />
        </svg>
      );

    // GREIFVOGEL & EULE (Eule mit Federohren & großen Augenringen)
    case 'Feather':
    case 'Owl':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          {/* Eulen-Umriss & Federohren */}
          <path d="m6 4 2.5 2.2c2.2-.8 4.8-.8 7 0L18 4l-.5 4.2c1 1.6 1.5 3.6 1.5 5.8 0 4-3 7-7 7s-7-3-7-7c0-2.2.5-4.2 1.5-5.8L6 4Z" />
          {/* Große Eulenaugen & Krummschnabel */}
          <circle cx="9.2" cy="10.5" r="2" />
          <circle cx="14.8" cy="10.5" r="2" />
          <circle cx="9.2" cy="10.5" r="0.6" fill="currentColor" />
          <circle cx="14.8" cy="10.5" r="0.6" fill="currentColor" />
          <path d="m11.2 12.5.8 1.5.8-1.5" />
        </svg>
      );

    case 'Bird':
      return <Bird className={className} />;
    case 'Squirrel':
      return <Squirrel className={className} />;
    case 'Rabbit':
      return <Rabbit className={className} />;
    case 'Dog':
      return <Dog className={className} />;
    case 'Cat':
      return <Cat className={className} />;
    default:
      return <HeartPulse className={className} />;
  }
}
