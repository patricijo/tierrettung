import type { AnimalProfile, EmergencyHotline } from '../data/rescueData';
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

const ADMIN_TOKEN_STORAGE_KEY = 'tierrettung-admin-token-v1';

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

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  const data = (await response.json().catch(() => ({}))) as T & { error?: string };

  if (!response.ok) {
    throw new Error(data.error || `Anfrage fehlgeschlagen (HTTP ${response.status})`);
  }

  return data;
}

export async function fetchBootstrapData(): Promise<BootstrapResponse> {
  return requestJson<BootstrapResponse>('/api/bootstrap');
}

export async function submitOrganizationRegistration(
  payload: OrganizationRegistrationPayload,
): Promise<{ message: string; organization: { id: string; name: string; status: string } }> {
  return requestJson('/api/organizations/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function loginAdmin(
  username: string,
  password: string,
): Promise<{ token: string; username: string }> {
  const result = await requestJson<{ token: string; username: string }>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  saveAdminToken(result.token);
  return result;
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
  const query = reconnect ? '?reconnect=1' : '';
  return requestJson<AdminOverviewResponse>(`/api/admin/overview${query}`, {
    headers: getAuthHeaders(token),
  });
}

export async function saveOrganizationAdminApi(
  token: string,
  org: Partial<RescueOrganization> & { name: string; phone: string },
): Promise<{ organization: RescueOrganization }> {
  return requestJson('/api/admin/organizations', {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(org),
  });
}

export async function updateOrganizationStatusAdminApi(
  token: string,
  id: string,
  status: OrganizationStatus,
  verifiedPartner?: boolean,
): Promise<{ organization: RescueOrganization }> {
  return requestJson(`/api/admin/organizations/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ status, verifiedPartner }),
  });
}

export async function deleteOrganizationAdminApi(
  token: string,
  id: string,
): Promise<{ deleted: boolean }> {
  return requestJson(`/api/admin/organizations/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
}

export async function saveAnimalProfileAdminApi(
  token: string,
  animal: AnimalProfile,
): Promise<{ animal: AnimalProfile }> {
  return requestJson('/api/admin/animals', {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(animal),
  });
}

export async function deleteAnimalProfileAdminApi(
  token: string,
  id: string,
): Promise<{ deleted: boolean }> {
  return requestJson(`/api/admin/animals/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
}

export async function saveHotlineAdminApi(
  token: string,
  hotline: EmergencyHotline,
): Promise<{ hotline: EmergencyHotline }> {
  return requestJson('/api/admin/hotlines', {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(hotline),
  });
}

export async function deleteHotlineAdminApi(
  token: string,
  id: string,
): Promise<{ deleted: boolean }> {
  return requestJson(`/api/admin/hotlines/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
}

export async function resetDatabaseAdminApi(token: string): Promise<AdminOverviewResponse> {
  return requestJson('/api/admin/reset', {
    method: 'POST',
    headers: getAuthHeaders(token),
  });
}
