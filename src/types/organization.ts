import type { CountryCode } from '../data/rescueData';

export type OrganizationType = 'veterinary' | 'animal_shelter' | 'wildlife_rescue';
export type OrganizationStatus = 'approved' | 'pending' | 'rejected';

export interface RescueOrganization {
  id: string;
  name: string;
  type: OrganizationType;
  typeLabel: string;
  countryCode: CountryCode;
  city: string;
  postcode: string;
  address: string;
  lat: number;
  lon: number;
  phone: string;
  website?: string;
  openingHours?: string;
  emergency: boolean;
  specialties: string[]; // animal profile IDs, e.g. ['igel', 'vogel', 'fledermaus']
  description?: string;
  contactName?: string; // Nur für Admin sichtbar
  contactEmail?: string; // Nur für Admin sichtbar
  status: OrganizationStatus;
  verifiedPartner: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationRegistrationPayload {
  name: string;
  type: OrganizationType;
  typeLabel: string;
  countryCode: CountryCode;
  city: string;
  postcode: string;
  address: string;
  lat: number;
  lon: number;
  phone: string;
  website?: string;
  openingHours?: string;
  emergency: boolean;
  specialties: string[];
  description?: string;
  contactName: string;
  contactEmail: string;
  privacyAccepted: boolean;
}

export interface DatabaseStatusInfo {
  mode: 'mongodb' | 'local_fallback';
  connected: boolean;
  uriMasked: string;
  dbName: string;
  lastError?: string;
  counts: {
    organizationsApproved: number;
    organizationsPending: number;
    organizationsRejected: number;
    animals: number;
    hotlines: number;
  };
}
