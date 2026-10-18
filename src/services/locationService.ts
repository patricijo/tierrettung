import type { CountryCode } from '../data/rescueData';

export interface Coordinates {
  lat: number;
  lon: number;
  accuracy?: number;
}

export interface LocationDetails {
  coords: Coordinates;
  displayName: string;
  city?: string;
  postcode?: string;
  countryCode: CountryCode;
  source: 'gps' | 'manual' | 'preset';
}

import { SEED_ORGANIZATIONS } from '../data/seedOrganizations';
import type { RescueOrganization } from '../types/organization';

export interface NearbyHelper {
  id: string;
  name: string;
  type: 'veterinary' | 'animal_shelter' | 'wildlife_rescue';
  typeLabel: string;
  lat: number;
  lon: number;
  distanceKm: number;
  phone?: string;
  website?: string;
  address?: string;
  openingHours?: string;
  emergency?: boolean;
  verifiedPartner?: boolean;
  specialties?: string[];
}

const NOMINATIM_BASE_URL = (
  import.meta.env.VITE_OSM_NOMINATIM_URL || 'https://nominatim.openstreetmap.org'
).replace(/\/$/, '');

let activeDbOrganizations: RescueOrganization[] = SEED_ORGANIZATIONS.filter(
  (o) => o.status === 'approved',
);

export function setDatabaseOrganizations(orgs: RescueOrganization[]): void {
  activeDbOrganizations = orgs.filter((o) => o.status === 'approved');
}

export const DACH_CITY_PRESETS: LocationDetails[] = [
  {
    coords: { lat: 52.52, lon: 13.405 },
    displayName: 'Berlin, Deutschland',
    city: 'Berlin',
    postcode: '10115',
    countryCode: 'DE',
    source: 'preset',
  },
  {
    coords: { lat: 48.1351, lon: 11.582 },
    displayName: 'München, Deutschland',
    city: 'München',
    postcode: '80331',
    countryCode: 'DE',
    source: 'preset',
  },
  {
    coords: { lat: 53.5511, lon: 9.9937 },
    displayName: 'Hamburg, Deutschland',
    city: 'Hamburg',
    postcode: '20095',
    countryCode: 'DE',
    source: 'preset',
  },
  {
    coords: { lat: 50.9375, lon: 6.9603 },
    displayName: 'Köln, Deutschland',
    city: 'Köln',
    postcode: '50667',
    countryCode: 'DE',
    source: 'preset',
  },
  {
    coords: { lat: 50.1109, lon: 8.6821 },
    displayName: 'Frankfurt am Main, Deutschland',
    city: 'Frankfurt am Main',
    postcode: '60311',
    countryCode: 'DE',
    source: 'preset',
  },
  {
    coords: { lat: 48.2082, lon: 16.3738 },
    displayName: 'Wien, Österreich',
    city: 'Wien',
    postcode: '1010',
    countryCode: 'AT',
    source: 'preset',
  },
  {
    coords: { lat: 47.3769, lon: 8.5417 },
    displayName: 'Zürich, Schweiz',
    city: 'Zürich',
    postcode: '8001',
    countryCode: 'CH',
    source: 'preset',
  },
];

// Kuratierte Offline-Rückfall-Datenbank bekannter 24h-Tierkliniken, Tierheime & Wildtierzentren im DACH-Raum
const CURATED_DACH_CLINICS: Omit<NearbyHelper, 'distanceKm'>[] = [
  {
    id: 'curated-berlin-fu',
    name: 'Klein- und Heimtierklinik der FU Berlin (24h Notdienst)',
    type: 'veterinary',
    typeLabel: 'Tierklinik',
    lat: 52.4293,
    lon: 13.2371,
    phone: '+49 30 83862356',
    website: 'https://www.vetmed.fu-berlin.de',
    address: 'Oertzenweg 19b, 14163 Berlin',
    openingHours: '24/7 Notfalldienst nach tel. Anmeldung',
    emergency: true,
  },
  {
    id: 'curated-berlin-bopp',
    name: 'Kleintierspezialisten Berlin – Tierklinik',
    type: 'veterinary',
    typeLabel: 'Tierklinik',
    lat: 52.4662,
    lon: 13.3284,
    phone: '+49 30 8599590',
    address: 'Begasstraße 10, 12157 Berlin',
    emergency: true,
  },
  {
    id: 'curated-berlin-tierheim',
    name: 'Tierheim Berlin (Tierschutzverein für Berlin)',
    type: 'animal_shelter',
    typeLabel: 'Tierheim / Tierschutz',
    lat: 52.5784,
    lon: 13.5469,
    phone: '+49 30 768880',
    website: 'https://tierschutz-berlin.de',
    address: 'Hausvaterweg 39, 13057 Berlin',
  },
  {
    id: 'curated-muenchen-lmu',
    name: 'Medizinische Kleintierklinik LMU München (24h Notfall)',
    type: 'veterinary',
    typeLabel: 'Tierklinik',
    lat: 48.1546,
    lon: 11.5844,
    phone: '+49 89 21802650',
    website: 'https://www.kleintierklinik.uni-muenchen.de',
    address: 'Veterinärstraße 13, 80539 München',
    openingHours: '24/7 Notdienst',
    emergency: true,
  },
  {
    id: 'curated-muenchen-ismaning',
    name: 'Tierklinik Ismaning (24h Notdienst)',
    type: 'veterinary',
    typeLabel: 'Tierklinik',
    lat: 48.2219,
    lon: 11.6815,
    phone: '+49 89 54045640',
    website: 'https://www.tierklinik-ismaning.de',
    address: 'Oskar-Messter-Straße 6, 85737 Ismaning',
    openingHours: '24/7 Notdienst',
    emergency: true,
  },
  {
    id: 'curated-muenchen-tierheim',
    name: 'Tierheim München Riem (Wildtier- & Fundtieraufnahme)',
    type: 'animal_shelter',
    typeLabel: 'Tierheim / Tierschutz',
    lat: 48.1384,
    lon: 11.7031,
    phone: '+49 89 9210000',
    address: 'Riemer Straße 270, 81829 München',
  },
  {
    id: 'curated-hamburg-lademannbogen',
    name: 'Tierklinik Lademannbogen Hamburg',
    type: 'veterinary',
    typeLabel: 'Tierklinik',
    lat: 53.6331,
    lon: 10.0442,
    phone: '+49 40 5209096',
    address: 'Wilhelm-Stein-Weg 2, 22339 Hamburg',
    emergency: true,
  },
  {
    id: 'curated-hamburg-suederstrasse',
    name: 'HTV Tierheim Süderstraße Hamburg (24h Notruf)',
    type: 'animal_shelter',
    typeLabel: 'Tierheim / Wildtiernotruf',
    lat: 53.5429,
    lon: 10.0422,
    phone: '+49 40 222277',
    address: 'Süderstraße 399, 20537 Hamburg',
    openingHours: '24/7 Tierrettungs-Notdienst',
    emergency: true,
  },
  {
    id: 'curated-koeln-stommeln',
    name: 'Tierklinik Stommeln / Raum Köln',
    type: 'veterinary',
    typeLabel: 'Tierklinik',
    lat: 51.0156,
    lon: 6.7623,
    phone: '+49 2238 3435',
    address: 'Nettegasse 122, 50259 Pulheim',
    emergency: true,
  },
  {
    id: 'curated-frankfurt-kalbach',
    name: 'Tierklinik Kalbach (Frankfurt am Main)',
    type: 'veterinary',
    typeLabel: 'Tierklinik',
    lat: 50.1869,
    lon: 8.6479,
    phone: '+49 69 300651550',
    address: 'Max-Holder-Straße 37, 60437 Frankfurt am Main',
    emergency: true,
  },
  {
    id: 'curated-wien-vetmed',
    name: 'Tierspital der Vetmeduni Wien (24h Notambulanz)',
    type: 'veterinary',
    typeLabel: 'Tierklinik',
    lat: 48.2547,
    lon: 16.4301,
    phone: '+43 1 250775555',
    website: 'https://www.vetmeduni.ac.at/tierspital',
    address: 'Veterinärplatz 1, 1210 Wien',
    openingHours: '24/7 Notfallambulanz',
    emergency: true,
  },
  {
    id: 'curated-wien-wildtier',
    name: 'Wildtierservice Stadt Wien (MA 49)',
    type: 'wildlife_rescue',
    typeLabel: 'Wildtierstation',
    lat: 48.2168,
    lon: 16.3731,
    phone: '+43 1 400049090',
    address: 'Täglich 07:30–22:00 Uhr, Wien',
    emergency: true,
  },
  {
    id: 'curated-zuerich-tierspital',
    name: 'Tierspital Zürich – Universität Zürich (24h Notfall)',
    type: 'veterinary',
    typeLabel: 'Tierklinik',
    lat: 47.3987,
    lon: 8.5529,
    phone: '+41 44 6358112',
    website: 'https://www.tierspital.uzh.ch',
    address: 'Winterthurerstrasse 260, 8057 Zürich',
    openingHours: '24/7 Notfalldienst',
    emergency: true,
  },
  {
    id: 'curated-zuerich-voliere',
    name: 'Voliere-Gesellschaft Zürich (Wildvogel-Notfallstation)',
    type: 'wildlife_rescue',
    typeLabel: 'Wildtierstation',
    lat: 47.3621,
    lon: 8.5338,
    phone: '+41 44 2010544',
    address: 'Mythenquai 1, 8002 Zürich',
  },
];

export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// OSMF Nominatim Usage Policy Compliance:
// 1. Maximal 1 Anfrage pro Sekunde (Rate-Limiter: >= 1100 ms Abstand)
// 2. Clientseitiges Caching aller Suchergebnisse (in-memory + sessionStorage)
let lastNominatimCallTimestamp = 0;
const memoryCache = new Map<string, any>();

async function throttledNominatimFetch(url: string, cacheKey: string): Promise<any> {
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey);
  }
  try {
    const cachedStr = sessionStorage.getItem(cacheKey);
    if (cachedStr) {
      const parsed = JSON.parse(cachedStr);
      memoryCache.set(cacheKey, parsed);
      return parsed;
    }
  } catch {
    // ignore storage access issues
  }

  const now = Date.now();
  const elapsed = now - lastNominatimCallTimestamp;
  if (elapsed < 1100) {
    await new Promise((resolve) => setTimeout(resolve, 1100 - elapsed));
  }
  lastNominatimCallTimestamp = Date.now();

  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  });
  if (!res.ok) throw new Error(`Nominatim HTTP ${res.status}`);
  const data = await res.json();

  memoryCache.set(cacheKey, data);
  try {
    sessionStorage.setItem(cacheKey, JSON.stringify(data));
  } catch {
    // ignore quota errors
  }
  return data;
}

export async function reverseGeocode(coords: Coordinates): Promise<LocationDetails> {
  const roundedKey = `nom_rev_${coords.lat.toFixed(3)}_${coords.lon.toFixed(3)}`;
  try {
    const url = `${NOMINATIM_BASE_URL}/reverse?format=jsonv2&lat=${coords.lat}&lon=${coords.lon}&accept-language=de`;
    const data = await throttledNominatimFetch(url, roundedKey);
    const addr = data.address || {};
    const rawCountry = (addr.country_code || 'de').toUpperCase();
    const countryCode: CountryCode =
      rawCountry === 'AT' ? 'AT' : rawCountry === 'CH' ? 'CH' : 'DE';
    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.municipality ||
      addr.county ||
      'Standort';
    const road = addr.road
      ? `${addr.road}${addr.house_number ? ' ' + addr.house_number : ''}, `
      : '';
    const postcode = addr.postcode || '';

    return {
      coords,
      displayName: `${road}${postcode ? postcode + ' ' : ''}${city}`.trim(),
      city,
      postcode,
      countryCode,
      source: 'gps',
    };
  } catch {
    return {
      coords,
      displayName: `GPS (${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)})`,
      countryCode: 'DE',
      source: 'gps',
    };
  }
}

export async function geocodeSearch(query: string): Promise<LocationDetails[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const cacheKey = `nom_search_${trimmed.toLowerCase()}`;
  const url = `${NOMINATIM_BASE_URL}/search?format=jsonv2&q=${encodeURIComponent(
    trimmed
  )}&countrycodes=de,at,ch&limit=5&addressdetails=1&accept-language=de`;

  const items = await throttledNominatimFetch(url, cacheKey);
  if (!Array.isArray(items)) return [];

  return items.map((item: Record<string, any>) => {
    const addr = item.address || {};
    const rawCountry = (addr.country_code || 'de').toUpperCase();
    const countryCode: CountryCode =
      rawCountry === 'AT' ? 'AT' : rawCountry === 'CH' ? 'CH' : 'DE';
    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.municipality ||
      item.name ||
      trimmed;
    const postcode = addr.postcode || '';

    return {
      coords: {
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
      },
      displayName: item.display_name,
      city,
      postcode,
      countryCode,
      source: 'manual' as const,
    };
  });
}

function getDatabaseHelpersWithinRadius(
  coords: Coordinates,
  maxRadiusKm: number,
  animalId?: string,
): NearbyHelper[] {
  const results: NearbyHelper[] = [];
  const seenIds = new Set<string>();

  for (const org of activeDbOrganizations) {
    if (org.status !== 'approved') continue;
    const dist = calculateDistanceKm(coords.lat, coords.lon, org.lat, org.lon);
    if (dist <= maxRadiusKm) {
      seenIds.add(org.id);
      results.push({
        id: org.id,
        name: org.name,
        type: org.type,
        typeLabel: org.typeLabel,
        lat: org.lat,
        lon: org.lon,
        distanceKm: dist,
        phone: org.phone,
        website: org.website,
        address: org.address || `${org.postcode} ${org.city}`.trim(),
        openingHours: org.openingHours,
        emergency: org.emergency,
        verifiedPartner: org.verifiedPartner,
        specialties: org.specialties,
      });
    }
  }

  for (const clinic of CURATED_DACH_CLINICS) {
    if (seenIds.has(clinic.id)) continue;
    const dist = calculateDistanceKm(coords.lat, coords.lon, clinic.lat, clinic.lon);
    if (dist <= maxRadiusKm) {
      results.push({
        ...clinic,
        distanceKm: dist,
      });
    }
  }

  results.sort((a, b) => {
    const aMatchesAnimal =
      animalId && a.specialties?.includes(animalId) && a.distanceKm <= 35 ? 1 : 0;
    const bMatchesAnimal =
      animalId && b.specialties?.includes(animalId) && b.distanceKm <= 35 ? 1 : 0;
    if (aMatchesAnimal !== bMatchesAnimal) return bMatchesAnimal - aMatchesAnimal;

    const aVerified = a.verifiedPartner && a.distanceKm <= 25 ? 1 : 0;
    const bVerified = b.verifiedPartner && b.distanceKm <= 25 ? 1 : 0;
    if (aVerified !== bVerified) return bVerified - aVerified;

    return a.distanceKm - b.distanceKm;
  });

  return results;
}

export function getOfflineNearbyHelpers(
  coords: Coordinates,
  animalId?: string,
): NearbyHelper[] {
  return getDatabaseHelpersWithinRadius(coords, 60, animalId);
}

export async function fetchNearbyHelpers(
  coords: Coordinates,
  radiusMeters = 20000,
  animalId?: string,
): Promise<NearbyHelper[]> {
  const latDelta = (radiusMeters / 1000) / 111;
  const lonDelta = (radiusMeters / 1000) / 71;

  const left = (coords.lon - lonDelta).toFixed(3);
  const top = (coords.lat + latDelta).toFixed(3);
  const right = (coords.lon + lonDelta).toFixed(3);
  const bottom = (coords.lat - latDelta).toFixed(3);
  const viewbox = `${left},${top},${right},${bottom}`;
  const cacheKey = `nom_helpers_${viewbox}`;

  const byId = new Map<string, NearbyHelper>();

  // 1. Zuerst alle freigegebenen Partner-Organisationen aus der MongoDB-Datenbank laden (bis 55 km)
  for (const dbHelper of getDatabaseHelpersWithinRadius(coords, 55, animalId)) {
    byId.set(dbHelper.id, dbHelper);
  }

  // 2. Einzelne gedrosselte & gecachte Nominatim Viewbox-Abfrage (OSMF-Richtlinien-konform: <= 1 Req/s)
  try {
    const url = `${NOMINATIM_BASE_URL}/search?format=jsonv2&q=Tierarzt&viewbox=${viewbox}&bounded=1&limit=25&addressdetails=1&extratags=1&accept-language=de`;
    const items = await throttledNominatimFetch(url, cacheKey);

    if (Array.isArray(items)) {
      for (const item of items) {
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);
        if (Number.isNaN(lat) || Number.isNaN(lon)) continue;

        const id = `osm-${item.osm_type || 'n'}-${item.osm_id || item.place_id}`;
        if (byId.has(id)) continue;

        const addr = item.address || {};
        const extratags = item.extratags || {};
        const name = item.name || addr.amenity || 'Tierarztpraxis';

        const lowerName = name.toLowerCase();
        const isWildlife =
          lowerName.includes('wildtier') ||
          lowerName.includes('igel') ||
          lowerName.includes('vogel') ||
          lowerName.includes('auffangstation');
        const isShelter =
          item.type === 'animal_shelter' ||
          lowerName.includes('tierheim') ||
          lowerName.includes('tierschutz');

        const type: NearbyHelper['type'] = isWildlife
          ? 'wildlife_rescue'
          : isShelter
            ? 'animal_shelter'
            : 'veterinary';

        const isClinic =
          lowerName.includes('klinik') ||
          lowerName.includes('tierspital') ||
          lowerName.includes('notdienst') ||
          extratags.emergency === 'yes';

        const typeLabel =
          type === 'wildlife_rescue'
            ? 'Wildtierstation'
            : type === 'animal_shelter'
              ? 'Tierheim / Tierschutz'
              : isClinic
                ? 'Tierklinik'
                : 'Tierarztpraxis';

        const phone =
          extratags.phone ||
          extratags['contact:phone'] ||
          extratags['phone:mobile'] ||
          extratags['contact:mobile'] ||
          extratags['emergency:phone'];

        const website = extratags.website || extratags['contact:website'];
        const street = addr.road
          ? `${addr.road}${addr.house_number ? ' ' + addr.house_number : ''}`
          : '';
        const cityPart =
          addr.postcode || addr.city || addr.town || addr.village
            ? `${addr.postcode || ''} ${addr.city || addr.town || addr.village || ''}`.trim()
            : '';
        const address = [street, cityPart].filter(Boolean).join(', ');
        const openingHours = extratags.opening_hours;

        byId.set(id, {
          id,
          name,
          type,
          typeLabel,
          lat,
          lon,
          distanceKm: calculateDistanceKm(coords.lat, coords.lon, lat, lon),
          phone,
          website,
          address: address || undefined,
          openingHours,
          emergency: isClinic,
        });
      }
    }
  } catch {
    // Fallback to MongoDB & curated clinics already in byId
  }

  const helpers = Array.from(byId.values());

  helpers.sort((a, b) => {
    const aMatchesAnimal =
      animalId && a.specialties?.includes(animalId) && a.distanceKm <= 30 ? 1 : 0;
    const bMatchesAnimal =
      animalId && b.specialties?.includes(animalId) && b.distanceKm <= 30 ? 1 : 0;
    if (aMatchesAnimal !== bMatchesAnimal) return bMatchesAnimal - aMatchesAnimal;

    const aPriority = (a.verifiedPartner || a.emergency) && a.distanceKm <= 20 ? 1 : 0;
    const bPriority = (b.verifiedPartner || b.emergency) && b.distanceKm <= 20 ? 1 : 0;
    if (aPriority !== bPriority) return bPriority - aPriority;
    return a.distanceKm - b.distanceKm;
  });

  return helpers.slice(0, 25);
}
