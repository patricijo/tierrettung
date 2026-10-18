import {
  ANIMAL_PROFILES,
  DACH_EMERGENCY_HOTLINES,
  type AnimalProfile,
  type EmergencyHotline,
} from '../data/rescueData';
import { SEED_ORGANIZATIONS } from '../data/seedOrganizations';
import type {
  DatabaseStatusInfo,
  OrganizationRegistrationPayload,
  OrganizationStatus,
  RescueOrganization,
} from '../types/organization';

export interface BootstrapResponse {
  mode: 'mongodb' | 'local_fallback';
  organizations: RescueOrganization[];
  animals: AnimalProfile[];
  hotlines: EmergencyHotline[];
}

export interface AdminOverviewResponse {
  dbStatus: DatabaseStatusInfo;
  organizations: RescueOrganization[];
  animals: AnimalProfile[];
  hotlines: EmergencyHotline[];
}

interface ClientFallbackStore {
  organizations: RescueOrganization[];
  animals: AnimalProfile[];
  hotlines: EmergencyHotline[];
}

const ADMIN_TOKEN_STORAGE_KEY = 'tierrettung-admin-token-v1';
const CLIENT_DB_STORAGE_KEY = 'tierrettung-client-db-v1';
const STATIC_FALLBACK_TOKEN = 'static-fallback-admin-token';

export function getSavedAdminToken(): string | null {
  try {
    return sessionStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveAdminToken(token: string | null): void {
  try {
    if (token) {
      sessionStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
    } else {
      sessionStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

function readClientFallbackStore(): ClientFallbackStore {
  try {
    const raw = localStorage.getItem(CLIENT_DB_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ClientFallbackStore>;
      return {
        organizations:
          Array.isArray(parsed.organizations) && parsed.organizations.length > 0
            ? parsed.organizations
            : structuredClone(SEED_ORGANIZATIONS),
        animals:
          Array.isArray(parsed.animals) && parsed.animals.length > 0
            ? parsed.animals
            : structuredClone(ANIMAL_PROFILES),
        hotlines:
          Array.isArray(parsed.hotlines) && parsed.hotlines.length > 0
            ? parsed.hotlines
            : structuredClone(DACH_EMERGENCY_HOTLINES),
      };
    }
  } catch {
    // ignore storage errors
  }

  const initial: ClientFallbackStore = {
    organizations: structuredClone(SEED_ORGANIZATIONS),
    animals: structuredClone(ANIMAL_PROFILES),
    hotlines: structuredClone(DACH_EMERGENCY_HOTLINES),
  };
  writeClientFallbackStore(initial);
  return initial;
}

function writeClientFallbackStore(store: ClientFallbackStore): void {
  try {
    localStorage.setItem(CLIENT_DB_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore quota errors
  }
}

function buildClientOverview(store: ClientFallbackStore): AdminOverviewResponse {
  return {
    dbStatus: {
      mode: 'local_fallback',
      connected: false,
      uriMasked: 'Statisches Hosting / Browser-Persistenz (localStorage)',
      dbName: 'tierrettung_kompass',
      lastError:
        'Für echte Cloud-MongoDB auf Vercel: Neuesten Stand mit /api Ordner deployen & MONGODB_URI in den Vercel Environment Variables eintragen.',
      counts: {
        organizationsApproved: store.organizations.filter((o) => o.status === 'approved').length,
        organizationsPending: store.organizations.filter((o) => o.status === 'pending').length,
        organizationsRejected: store.organizations.filter((o) => o.status === 'rejected').length,
        animals: store.animals.length,
        hotlines: store.hotlines.length,
      },
    },
    organizations: store.organizations,
    animals: store.animals,
    hotlines: store.hotlines,
  };
}

class EndpointUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EndpointUnavailableError';
  }
}

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });
  } catch {
    throw new EndpointUnavailableError('Server-Endpunkt nicht erreichbar');
  }

  const contentType = response.headers.get('content-type') || '';
  if (
    response.status === 404 ||
    response.status === 405 ||
    contentType.includes('text/html')
  ) {
    throw new EndpointUnavailableError(`API nicht aktiv (HTTP ${response.status})`);
  }

  const data = (await response.json().catch(() => ({}))) as T & { error?: string };

  if (!response.ok) {
    throw new Error(data.error || `Anfrage fehlgeschlagen (HTTP ${response.status})`);
  }

  return data;
}

export async function fetchBootstrapData(): Promise<BootstrapResponse> {
  try {
    return await requestJson<BootstrapResponse>('/api/bootstrap');
  } catch {
    const store = readClientFallbackStore();
    return {
      mode: 'local_fallback',
      organizations: store.organizations.filter((o) => o.status === 'approved'),
      animals: store.animals,
      hotlines: store.hotlines,
    };
  }
}

export async function submitOrganizationRegistration(
  payload: OrganizationRegistrationPayload,
): Promise<{ message: string; organization: { id: string; name: string; status: string } }> {
  try {
    return await requestJson('/api/organizations/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (err) {
    if (err instanceof EndpointUnavailableError) {
      const store = readClientFallbackStore();
      const now = new Date().toISOString();
      const newOrg: RescueOrganization = {
        id: `org-${Date.now()}`,
        name: payload.name.trim(),
        type: payload.type,
        typeLabel: payload.typeLabel.trim() || 'Wildtierstation',
        countryCode: payload.countryCode,
        city: payload.city.trim(),
        postcode: payload.postcode.trim(),
        address: payload.address.trim(),
        lat: Number(payload.lat) || 51.1657,
        lon: Number(payload.lon) || 10.4515,
        phone: payload.phone.trim(),
        website: payload.website?.trim() || undefined,
        openingHours: payload.openingHours?.trim() || undefined,
        emergency: Boolean(payload.emergency),
        specialties: payload.specialties || [],
        description: payload.description?.trim() || undefined,
        contactName: payload.contactName.trim(),
        contactEmail: payload.contactEmail.trim(),
        status: 'pending',
        verifiedPartner: false,
        createdAt: now,
        updatedAt: now,
      };
      store.organizations.unshift(newOrg);
      writeClientFallbackStore(store);
      return {
        message:
          'Vielen Dank! Deine Organisation wurde gespeichert und wartet nun im Admin-Bereich auf die Freigabe.',
        organization: {
          id: newOrg.id,
          name: newOrg.name,
          status: newOrg.status,
        },
      };
    }
    throw err;
  }
}

export async function loginAdmin(
  username: string,
  password: string,
): Promise<{ token: string; username: string }> {
  try {
    const result = await requestJson<{ token: string; username: string }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username: username.trim(), password: password.trim() }),
    });
    saveAdminToken(result.token);
    return result;
  } catch (err) {
    if (err instanceof EndpointUnavailableError) {
      const expectedUser = (import.meta.env.VITE_ADMIN_USERNAME || 'admin').trim();
      const expectedPass = (
        import.meta.env.VITE_ADMIN_PASSWORD || 'TierRettung!Admin2026'
      ).trim();

      if (username.trim() === expectedUser && password.trim() === expectedPass) {
        saveAdminToken(STATIC_FALLBACK_TOKEN);
        return { token: STATIC_FALLBACK_TOKEN, username: expectedUser };
      }
      throw new Error('Ungültiger Benutzername oder Passwort.');
    }
    throw err;
  }
}

function getAuthHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchAdminOverview(
  token: string,
  reconnect = false,
): Promise<AdminOverviewResponse> {
  if (token === STATIC_FALLBACK_TOKEN) {
    return buildClientOverview(readClientFallbackStore());
  }
  try {
    const query = reconnect ? '?reconnect=1' : '';
    return await requestJson<AdminOverviewResponse>(`/api/admin/overview${query}`, {
      headers: getAuthHeaders(token),
    });
  } catch (err) {
    if (err instanceof EndpointUnavailableError) {
      return buildClientOverview(readClientFallbackStore());
    }
    throw err;
  }
}

export async function saveOrganizationAdminApi(
  token: string,
  org: Partial<RescueOrganization> & { name: string; phone: string },
): Promise<{ organization: RescueOrganization }> {
  try {
    if (token === STATIC_FALLBACK_TOKEN) {
      throw new EndpointUnavailableError('Static fallback');
    }
    return await requestJson('/api/admin/organizations', {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(org),
    });
  } catch (err) {
    if (err instanceof EndpointUnavailableError) {
      const store = readClientFallbackStore();
      const now = new Date().toISOString();
      const id = org.id?.trim() || `org-${Date.now()}`;
      const record: RescueOrganization = {
        id,
        name: org.name.trim(),
        type: org.type || 'wildlife_rescue',
        typeLabel: org.typeLabel || 'Wildtierstation',
        countryCode: org.countryCode || 'DE',
        city: org.city || '',
        postcode: org.postcode || '',
        address: org.address || '',
        lat: Number(org.lat) || 52.52,
        lon: Number(org.lon) || 13.405,
        phone: org.phone.trim(),
        website: org.website,
        openingHours: org.openingHours,
        emergency: Boolean(org.emergency),
        specialties: org.specialties || [],
        description: org.description,
        contactName: org.contactName,
        contactEmail: org.contactEmail,
        status: org.status || 'approved',
        verifiedPartner: org.verifiedPartner ?? true,
        createdAt: org.createdAt || now,
        updatedAt: now,
      };
      const idx = store.organizations.findIndex((o) => o.id === id);
      if (idx >= 0) store.organizations[idx] = record;
      else store.organizations.unshift(record);
      writeClientFallbackStore(store);
      return { organization: record };
    }
    throw err;
  }
}

export async function updateOrganizationStatusAdminApi(
  token: string,
  id: string,
  status: OrganizationStatus,
  verifiedPartner?: boolean,
): Promise<{ organization: RescueOrganization }> {
  try {
    if (token === STATIC_FALLBACK_TOKEN) {
      throw new EndpointUnavailableError('Static fallback');
    }
    return await requestJson(`/api/admin/organizations/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ status, verifiedPartner }),
    });
  } catch (err) {
    if (err instanceof EndpointUnavailableError) {
      const store = readClientFallbackStore();
      const idx = store.organizations.findIndex((o) => o.id === id);
      if (idx < 0) throw new Error('Organisation nicht gefunden.');
      store.organizations[idx] = {
        ...store.organizations[idx],
        status,
        verifiedPartner: verifiedPartner ?? status === 'approved',
        updatedAt: new Date().toISOString(),
      };
      writeClientFallbackStore(store);
      return { organization: store.organizations[idx] };
    }
    throw err;
  }
}

export async function deleteOrganizationAdminApi(
  token: string,
  id: string,
): Promise<{ deleted: boolean }> {
  try {
    if (token === STATIC_FALLBACK_TOKEN) {
      throw new EndpointUnavailableError('Static fallback');
    }
    return await requestJson(`/api/admin/organizations/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
  } catch (err) {
    if (err instanceof EndpointUnavailableError) {
      const store = readClientFallbackStore();
      store.organizations = store.organizations.filter((o) => o.id !== id);
      writeClientFallbackStore(store);
      return { deleted: true };
    }
    throw err;
  }
}

export async function saveAnimalProfileAdminApi(
  token: string,
  animal: AnimalProfile,
): Promise<{ animal: AnimalProfile }> {
  try {
    if (token === STATIC_FALLBACK_TOKEN) {
      throw new EndpointUnavailableError('Static fallback');
    }
    return await requestJson('/api/admin/animals', {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(animal),
    });
  } catch (err) {
    if (err instanceof EndpointUnavailableError) {
      const store = readClientFallbackStore();
      const idx = store.animals.findIndex((a) => a.id === animal.id);
      if (idx >= 0) store.animals[idx] = animal;
      else store.animals.push(animal);
      writeClientFallbackStore(store);
      return { animal };
    }
    throw err;
  }
}

export async function deleteAnimalProfileAdminApi(
  token: string,
  id: string,
): Promise<{ deleted: boolean }> {
  try {
    if (token === STATIC_FALLBACK_TOKEN) {
      throw new EndpointUnavailableError('Static fallback');
    }
    return await requestJson(`/api/admin/animals/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
  } catch (err) {
    if (err instanceof EndpointUnavailableError) {
      const store = readClientFallbackStore();
      store.animals = store.animals.filter((a) => a.id !== id);
      writeClientFallbackStore(store);
      return { deleted: true };
    }
    throw err;
  }
}

export async function saveHotlineAdminApi(
  token: string,
  hotline: EmergencyHotline,
): Promise<{ hotline: EmergencyHotline }> {
  try {
    if (token === STATIC_FALLBACK_TOKEN) {
      throw new EndpointUnavailableError('Static fallback');
    }
    return await requestJson('/api/admin/hotlines', {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(hotline),
    });
  } catch (err) {
    if (err instanceof EndpointUnavailableError) {
      const store = readClientFallbackStore();
      const idx = store.hotlines.findIndex((h) => h.id === hotline.id);
      if (idx >= 0) store.hotlines[idx] = hotline;
      else store.hotlines.push(hotline);
      writeClientFallbackStore(store);
      return { hotline };
    }
    throw err;
  }
}

export async function deleteHotlineAdminApi(
  token: string,
  id: string,
): Promise<{ deleted: boolean }> {
  try {
    if (token === STATIC_FALLBACK_TOKEN) {
      throw new EndpointUnavailableError('Static fallback');
    }
    return await requestJson(`/api/admin/hotlines/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
  } catch (err) {
    if (err instanceof EndpointUnavailableError) {
      const store = readClientFallbackStore();
      store.hotlines = store.hotlines.filter((h) => h.id !== id);
      writeClientFallbackStore(store);
      return { deleted: true };
    }
    throw err;
  }
}

export async function resetDatabaseAdminApi(token: string): Promise<AdminOverviewResponse> {
  try {
    if (token === STATIC_FALLBACK_TOKEN) {
      throw new EndpointUnavailableError('Static fallback');
    }
    return await requestJson('/api/admin/reset', {
      method: 'POST',
      headers: getAuthHeaders(token),
    });
  } catch (err) {
    if (err instanceof EndpointUnavailableError) {
      const resetStore: ClientFallbackStore = {
        organizations: structuredClone(SEED_ORGANIZATIONS),
        animals: structuredClone(ANIMAL_PROFILES),
        hotlines: structuredClone(DACH_EMERGENCY_HOTLINES),
      };
      writeClientFallbackStore(resetStore);
      return buildClientOverview(resetStore);
    }
    throw err;
  }
}
