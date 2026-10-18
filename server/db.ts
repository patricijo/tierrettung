import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { MongoClient, type Db } from 'mongodb';
import {
  ANIMAL_PROFILES,
  DACH_EMERGENCY_HOTLINES,
  type AnimalProfile,
  type EmergencyHotline,
} from '../src/data/rescueData';
import { SEED_ORGANIZATIONS } from '../src/data/seedOrganizations';
import type {
  DatabaseStatusInfo,
  OrganizationRegistrationPayload,
  OrganizationStatus,
  RescueOrganization,
} from '../src/types/organization';

dotenv.config();

interface LocalMongoStore {
  organizations: RescueOrganization[];
  animals: AnimalProfile[];
  hotlines: EmergencyHotline[];
}

const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
const FALLBACK_FILE = path.join(DATA_DIR, 'mongodb-store.json');

let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let connectionAttempted = false;
let lastConnectionError: string | undefined;

function getMongoConfig() {
  dotenv.config();
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tierrettung_kompass';
  const dbName = process.env.MONGODB_DB_NAME || 'tierrettung_kompass';
  return { uri, dbName };
}

function maskMongoUri(uri: string): string {
  try {
    return uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
  } catch {
    return 'mongodb://***';
  }
}

function readLocalFallbackStore(): LocalMongoStore {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(FALLBACK_FILE)) {
    const initial: LocalMongoStore = {
      organizations: structuredClone(SEED_ORGANIZATIONS),
      animals: structuredClone(ANIMAL_PROFILES),
      hotlines: structuredClone(DACH_EMERGENCY_HOTLINES),
    };
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }

  try {
    const raw = fs.readFileSync(FALLBACK_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<LocalMongoStore>;
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
  } catch {
    return {
      organizations: structuredClone(SEED_ORGANIZATIONS),
      animals: structuredClone(ANIMAL_PROFILES),
      hotlines: structuredClone(DACH_EMERGENCY_HOTLINES),
    };
  }
}

function writeLocalFallbackStore(store: LocalMongoStore): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(FALLBACK_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

export async function getMongoDatabase(forceReconnect = false): Promise<Db | null> {
  if (mongoDb && !forceReconnect) {
    return mongoDb;
  }

  if (connectionAttempted && !forceReconnect) {
    return mongoDb;
  }

  connectionAttempted = true;
  const { uri, dbName } = getMongoConfig();

  try {
    if (mongoClient) {
      await mongoClient.close().catch(() => undefined);
    }

    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 1800,
      connectTimeoutMS: 1800,
    });

    await client.connect();
    const db = client.db(dbName);
    await db.command({ ping: 1 });

    mongoClient = client;
    mongoDb = db;
    lastConnectionError = undefined;

    // Seed initial collections if empty
    const orgCount = await db.collection<RescueOrganization>('organizations').countDocuments();
    if (orgCount === 0) {
      await db
        .collection<RescueOrganization>('organizations')
        .insertMany(structuredClone(SEED_ORGANIZATIONS));
    }

    const animalCount = await db.collection<AnimalProfile>('animals').countDocuments();
    if (animalCount === 0) {
      await db.collection<AnimalProfile>('animals').insertMany(structuredClone(ANIMAL_PROFILES));
    }

    const hotlineCount = await db.collection<EmergencyHotline>('hotlines').countDocuments();
    if (hotlineCount === 0) {
      await db
        .collection<EmergencyHotline>('hotlines')
        .insertMany(structuredClone(DACH_EMERGENCY_HOTLINES));
    }

    return db;
  } catch (err) {
    lastConnectionError =
      err instanceof Error ? err.message : 'Verbindung zu MongoDB fehlgeschlagen';
    mongoClient = null;
    mongoDb = null;
    // Ensure local fallback store is initialized
    readLocalFallbackStore();
    return null;
  }
}

function stripMongoId<T extends object>(doc: T & { _id?: unknown }): T {
  const clone = { ...doc };
  delete clone._id;
  return clone;
}

export async function getPublicBootstrapData(): Promise<{
  mode: 'mongodb' | 'local_fallback';
  organizations: RescueOrganization[];
  animals: AnimalProfile[];
  hotlines: EmergencyHotline[];
}> {
  const db = await getMongoDatabase();

  if (db) {
    const [orgs, animals, hotlines] = await Promise.all([
      db
        .collection<RescueOrganization>('organizations')
        .find({ status: 'approved' })
        .toArray(),
      db.collection<AnimalProfile>('animals').find({}).toArray(),
      db.collection<EmergencyHotline>('hotlines').find({}).toArray(),
    ]);

    return {
      mode: 'mongodb',
      organizations: orgs.map((org) => {
        const clean = stripMongoId(org);
        // Strip private contact fields for public API
        return {
          ...clean,
          contactName: undefined,
          contactEmail: undefined,
        };
      }),
      animals: animals.map(stripMongoId),
      hotlines: hotlines.map(stripMongoId),
    };
  }

  const store = readLocalFallbackStore();
  return {
    mode: 'local_fallback',
    organizations: store.organizations
      .filter((org) => org.status === 'approved')
      .map((org) => ({
        ...org,
        contactName: undefined,
        contactEmail: undefined,
      })),
    animals: store.animals,
    hotlines: store.hotlines,
  };
}

export async function registerPublicOrganization(
  payload: OrganizationRegistrationPayload,
): Promise<RescueOrganization> {
  const now = new Date().toISOString();
  const newOrg: RescueOrganization = {
    id: `org-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
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
    specialties: Array.isArray(payload.specialties) ? payload.specialties : [],
    description: payload.description?.trim() || undefined,
    contactName: payload.contactName.trim(),
    contactEmail: payload.contactEmail.trim(),
    status: 'pending',
    verifiedPartner: false,
    createdAt: now,
    updatedAt: now,
  };

  const db = await getMongoDatabase();
  if (db) {
    await db.collection<RescueOrganization>('organizations').insertOne({ ...newOrg });
  } else {
    const store = readLocalFallbackStore();
    store.organizations.unshift(newOrg);
    writeLocalFallbackStore(store);
  }

  return newOrg;
}

export async function getAdminOverviewData(forceReconnect = false): Promise<{
  dbStatus: DatabaseStatusInfo;
  organizations: RescueOrganization[];
  animals: AnimalProfile[];
  hotlines: EmergencyHotline[];
}> {
  const db = await getMongoDatabase(forceReconnect);
  const { uri, dbName } = getMongoConfig();

  if (db) {
    const [orgsRaw, animalsRaw, hotlinesRaw] = await Promise.all([
      db.collection<RescueOrganization>('organizations').find({}).toArray(),
      db.collection<AnimalProfile>('animals').find({}).toArray(),
      db.collection<EmergencyHotline>('hotlines').find({}).toArray(),
    ]);

    const organizations = orgsRaw.map(stripMongoId);
    const animals = animalsRaw.map(stripMongoId);
    const hotlines = hotlinesRaw.map(stripMongoId);

    return {
      dbStatus: {
        mode: 'mongodb',
        connected: true,
        uriMasked: maskMongoUri(uri),
        dbName,
        counts: {
          organizationsApproved: organizations.filter((o) => o.status === 'approved').length,
          organizationsPending: organizations.filter((o) => o.status === 'pending').length,
          organizationsRejected: organizations.filter((o) => o.status === 'rejected').length,
          animals: animals.length,
          hotlines: hotlines.length,
        },
      },
      organizations,
      animals,
      hotlines,
    };
  }

  const store = readLocalFallbackStore();
  return {
    dbStatus: {
      mode: 'local_fallback',
      connected: false,
      uriMasked: maskMongoUri(uri),
      dbName,
      lastError: lastConnectionError,
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

export async function upsertOrganizationAdmin(
  orgInput: Partial<RescueOrganization> & { name: string; phone: string },
): Promise<RescueOrganization> {
  const now = new Date().toISOString();
  const db = await getMongoDatabase();

  const id = orgInput.id?.trim() || `org-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const record: RescueOrganization = {
    id,
    name: orgInput.name.trim(),
    type: orgInput.type || 'wildlife_rescue',
    typeLabel: orgInput.typeLabel?.trim() || 'Wildtierstation',
    countryCode: orgInput.countryCode || 'DE',
    city: orgInput.city?.trim() || '',
    postcode: orgInput.postcode?.trim() || '',
    address: orgInput.address?.trim() || '',
    lat: Number(orgInput.lat) || 52.52,
    lon: Number(orgInput.lon) || 13.405,
    phone: orgInput.phone.trim(),
    website: orgInput.website?.trim() || undefined,
    openingHours: orgInput.openingHours?.trim() || undefined,
    emergency: Boolean(orgInput.emergency),
    specialties: Array.isArray(orgInput.specialties) ? orgInput.specialties : [],
    description: orgInput.description?.trim() || undefined,
    contactName: orgInput.contactName?.trim() || undefined,
    contactEmail: orgInput.contactEmail?.trim() || undefined,
    status: orgInput.status || 'approved',
    verifiedPartner: orgInput.verifiedPartner ?? true,
    createdAt: orgInput.createdAt || now,
    updatedAt: now,
  };

  if (db) {
    await db
      .collection<RescueOrganization>('organizations')
      .updateOne({ id }, { $set: record }, { upsert: true });
    return record;
  }

  const store = readLocalFallbackStore();
  const idx = store.organizations.findIndex((o) => o.id === id);
  if (idx >= 0) {
    store.organizations[idx] = {
      ...store.organizations[idx],
      ...record,
      createdAt: store.organizations[idx].createdAt,
    };
  } else {
    store.organizations.unshift(record);
  }
  writeLocalFallbackStore(store);
  return record;
}

export async function updateOrganizationStatusAdmin(
  id: string,
  status: OrganizationStatus,
  verifiedPartner?: boolean,
): Promise<RescueOrganization | null> {
  const now = new Date().toISOString();
  const db = await getMongoDatabase();

  if (db) {
    const updateFields: Partial<RescueOrganization> = {
      status,
      updatedAt: now,
    };
    if (typeof verifiedPartner === 'boolean') {
      updateFields.verifiedPartner = verifiedPartner;
    } else if (status === 'approved') {
      updateFields.verifiedPartner = true;
    }

    await db
      .collection<RescueOrganization>('organizations')
      .updateOne({ id }, { $set: updateFields });
    const updated = await db.collection<RescueOrganization>('organizations').findOne({ id });
    return updated ? stripMongoId(updated) : null;
  }

  const store = readLocalFallbackStore();
  const idx = store.organizations.findIndex((o) => o.id === id);
  if (idx < 0) return null;

  store.organizations[idx] = {
    ...store.organizations[idx],
    status,
    verifiedPartner:
      typeof verifiedPartner === 'boolean'
        ? verifiedPartner
        : status === 'approved'
          ? true
          : store.organizations[idx].verifiedPartner,
    updatedAt: now,
  };
  writeLocalFallbackStore(store);
  return store.organizations[idx];
}

export async function deleteOrganizationAdmin(id: string): Promise<boolean> {
  const db = await getMongoDatabase();
  if (db) {
    const res = await db.collection<RescueOrganization>('organizations').deleteOne({ id });
    return res.deletedCount > 0;
  }

  const store = readLocalFallbackStore();
  const before = store.organizations.length;
  store.organizations = store.organizations.filter((o) => o.id !== id);
  writeLocalFallbackStore(store);
  return store.organizations.length < before;
}

export async function upsertAnimalProfileAdmin(animal: AnimalProfile): Promise<AnimalProfile> {
  const db = await getMongoDatabase();
  if (db) {
    await db
      .collection<AnimalProfile>('animals')
      .updateOne({ id: animal.id }, { $set: animal }, { upsert: true });
    return animal;
  }

  const store = readLocalFallbackStore();
  const idx = store.animals.findIndex((a) => a.id === animal.id);
  if (idx >= 0) {
    store.animals[idx] = animal;
  } else {
    store.animals.push(animal);
  }
  writeLocalFallbackStore(store);
  return animal;
}

export async function deleteAnimalProfileAdmin(id: string): Promise<boolean> {
  const db = await getMongoDatabase();
  if (db) {
    const res = await db.collection<AnimalProfile>('animals').deleteOne({ id });
    return res.deletedCount > 0;
  }

  const store = readLocalFallbackStore();
  const before = store.animals.length;
  store.animals = store.animals.filter((a) => a.id !== id);
  writeLocalFallbackStore(store);
  return store.animals.length < before;
}

export async function upsertHotlineAdmin(hotline: EmergencyHotline): Promise<EmergencyHotline> {
  const db = await getMongoDatabase();
  if (db) {
    await db
      .collection<EmergencyHotline>('hotlines')
      .updateOne({ id: hotline.id }, { $set: hotline }, { upsert: true });
    return hotline;
  }

  const store = readLocalFallbackStore();
  const idx = store.hotlines.findIndex((h) => h.id === hotline.id);
  if (idx >= 0) {
    store.hotlines[idx] = hotline;
  } else {
    store.hotlines.push(hotline);
  }
  writeLocalFallbackStore(store);
  return hotline;
}

export async function deleteHotlineAdmin(id: string): Promise<boolean> {
  const db = await getMongoDatabase();
  if (db) {
    const res = await db.collection<EmergencyHotline>('hotlines').deleteOne({ id });
    return res.deletedCount > 0;
  }

  const store = readLocalFallbackStore();
  const before = store.hotlines.length;
  store.hotlines = store.hotlines.filter((h) => h.id !== id);
  writeLocalFallbackStore(store);
  return store.hotlines.length < before;
}

export async function resetDatabaseToSeedAdmin(): Promise<void> {
  const db = await getMongoDatabase();
  if (db) {
    await Promise.all([
      db.collection('organizations').deleteMany({}),
      db.collection('animals').deleteMany({}),
      db.collection('hotlines').deleteMany({}),
    ]);
    await Promise.all([
      db
        .collection<RescueOrganization>('organizations')
        .insertMany(structuredClone(SEED_ORGANIZATIONS)),
      db.collection<AnimalProfile>('animals').insertMany(structuredClone(ANIMAL_PROFILES)),
      db
        .collection<EmergencyHotline>('hotlines')
        .insertMany(structuredClone(DACH_EMERGENCY_HOTLINES)),
    ]);
  }

  writeLocalFallbackStore({
    organizations: structuredClone(SEED_ORGANIZATIONS),
    animals: structuredClone(ANIMAL_PROFILES),
    hotlines: structuredClone(DACH_EMERGENCY_HOTLINES),
  });
}
