import crypto from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import dotenv from 'dotenv';
import type { Plugin } from 'vite';
import type { AnimalProfile, EmergencyHotline } from '../src/data/rescueData.ts';
import type {
  OrganizationRegistrationPayload,
  OrganizationStatus,
  RescueOrganization,
} from '../src/types/organization.ts';
import {
  deleteAnimalProfileAdmin,
  deleteHotlineAdmin,
  deleteOrganizationAdmin,
  getAdminOverviewData,
  getPublicBootstrapData,
  registerPublicOrganization,
  resetDatabaseToSeedAdmin,
  updateOrganizationStatusAdmin,
  upsertAnimalProfileAdmin,
  upsertHotlineAdmin,
  upsertOrganizationAdmin,
} from './db.ts';

dotenv.config();

function cleanEnv(val: string | undefined, fallback: string): string {
  if (!val) return fallback;
  return val.trim().replace(/^["']|["']$/g, '') || fallback;
}

function getAdminCredentials() {
  dotenv.config();
  return {
    username: cleanEnv(process.env.ADMIN_USERNAME, 'admin'),
    password: cleanEnv(process.env.ADMIN_PASSWORD, 'TierRettung!Admin2026'),
    secret: cleanEnv(
      process.env.ADMIN_TOKEN_SECRET,
      '9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e',
    ),
  };
}

function createAdminToken(username: string): string {
  const { secret } = getAdminCredentials();
  const exp = Date.now() + 1000 * 60 * 60 * 12; // 12 hours
  const payload = Buffer.from(JSON.stringify({ sub: username, exp })).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function verifyAdminToken(authHeader?: string): boolean {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.slice(7).trim();
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [payload, signature] = parts;
  const { secret } = getAdminCredentials();
  const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');

  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return false;
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as {
      sub: string;
      exp: number;
    };
    return typeof decoded.exp === 'number' && decoded.exp > Date.now();
  } catch {
    return false;
  }
}

async function readJsonBody<T>(req: IncomingMessage): Promise<T> {
  // Vercel Serverless Functions (@vercel/node) pre-parse req.body before invoking the handler
  const preParsedBody = (req as IncomingMessage & { body?: unknown }).body;
  if (preParsedBody !== undefined && preParsedBody !== null) {
    if (typeof preParsedBody === 'string') {
      try {
        return (preParsedBody.trim() ? JSON.parse(preParsedBody) : {}) as T;
      } catch {
        return {} as T;
      }
    }
    if (Buffer.isBuffer(preParsedBody)) {
      try {
        const str = preParsedBody.toString('utf-8');
        return (str.trim() ? JSON.parse(str) : {}) as T;
      } catch {
        return {} as T;
      }
    }
    if (typeof preParsedBody === 'object') {
      return preParsedBody as T;
    }
  }

  // If stream already completed/ended, avoid hanging on data/end
  if ((req as IncomingMessage & { readableEnded?: boolean }).readableEnded) {
    return {} as T;
  }

  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    let totalBytes = 0;
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve({} as T);
      }
    }, 4000);

    req.on('data', (chunk: Buffer) => {
      totalBytes += chunk.length;
      if (totalBytes > 2 * 1024 * 1024) {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          req.destroy();
          resolve({} as T);
        }
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        try {
          const raw = Buffer.concat(chunks).toString('utf-8').trim();
          resolve((raw ? JSON.parse(raw) : {}) as T);
        } catch {
          resolve({} as T);
        }
      }
    });

    req.on('error', () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve({} as T);
      }
    });
  });
}

function sendJson(res: ServerResponse, statusCode: number, data: unknown): void {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

export async function handleApiRequest(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<boolean> {
  const rawUrl = req.url || '';
  if (!rawUrl.startsWith('/api')) {
    return false;
  }

  const parsedUrl = new URL(rawUrl, 'http://localhost');
  const rewrittenPath = parsedUrl.searchParams.get('__path');
  const pathname =
    rewrittenPath && (parsedUrl.pathname === '/api' || parsedUrl.pathname === '/api/index')
      ? `/api/${rewrittenPath.replace(/^\/+/, '')}`
      : parsedUrl.pathname;
  const method = req.method || 'GET';

  try {
    // 1. Public bootstrap data (approved organizations, animals, hotlines)
    if (pathname === '/api/bootstrap' && method === 'GET') {
      const data = await getPublicBootstrapData();
      sendJson(res, 200, data);
      return true;
    }

    // 2. Public registration of a new animal rescue organization
    if (pathname === '/api/organizations/register' && method === 'POST') {
      const body = await readJsonBody<OrganizationRegistrationPayload>(req);

      if (!body.name?.trim() || !body.phone?.trim() || !body.city?.trim()) {
        sendJson(res, 400, {
          error: 'Bitte Name der Organisation, Ort und Notfall-Telefonnummer angeben.',
        });
        return true;
      }

      if (!body.contactName?.trim() || !body.contactEmail?.trim()) {
        sendJson(res, 400, {
          error: 'Bitte Ansprechpartner und E-Mail-Adresse für die Verifizierung angeben.',
        });
        return true;
      }

      if (!body.privacyAccepted) {
        sendJson(res, 400, {
          error: 'Bitte der Veröffentlichung der Stationsdaten im Notfallverzeichnis zustimmen.',
        });
        return true;
      }

      const created = await registerPublicOrganization(body);
      sendJson(res, 201, {
        message:
          'Vielen Dank! Deine Organisation wurde in der Datenbank gespeichert und wartet nun auf die Freigabe durch den Administrator.',
        organization: {
          id: created.id,
          name: created.name,
          status: created.status,
        },
      });
      return true;
    }

    // 3. Admin Login
    if (pathname === '/api/admin/login' && method === 'POST') {
      const body = await readJsonBody<{ username?: string; password?: string }>(req);
      const creds = getAdminCredentials();
      const inputUser = (body.username || '').trim();
      const inputPass = (body.password || '').trim();

      if (inputUser === creds.username && inputPass === creds.password) {
        const token = createAdminToken(creds.username);
        sendJson(res, 200, {
          token,
          username: creds.username,
        });
      } else {
        sendJson(res, 401, {
          error: 'Ungültiger Benutzername oder Passwort.',
        });
      }
      return true;
    }

    // All /api/admin/* routes below require a valid Bearer token
    if (pathname.startsWith('/api/admin/')) {
      const isAuthed = verifyAdminToken(req.headers.authorization);
      if (!isAuthed) {
        sendJson(res, 401, {
          error: 'Nicht autorisiert. Bitte im Admin-Bereich neu anmelden.',
        });
        return true;
      }

      if (pathname === '/api/admin/overview' && method === 'GET') {
        const forceReconnect = parsedUrl.searchParams.get('reconnect') === '1';
        const overview = await getAdminOverviewData(forceReconnect);
        sendJson(res, 200, overview);
        return true;
      }

      if (pathname === '/api/admin/organizations' && method === 'POST') {
        const body = await readJsonBody<
          Partial<RescueOrganization> & { name: string; phone: string }
        >(req);
        if (!body.name?.trim() || !body.phone?.trim()) {
          sendJson(res, 400, { error: 'Name und Telefonnummer sind Pflichtfelder.' });
          return true;
        }
        const saved = await upsertOrganizationAdmin(body);
        sendJson(res, 200, { organization: saved });
        return true;
      }

      const orgStatusMatch = pathname.match(/^\/api\/admin\/organizations\/([^/]+)\/status$/);
      if (orgStatusMatch && method === 'PATCH') {
        const orgId = decodeURIComponent(orgStatusMatch[1]);
        const body = await readJsonBody<{
          status: OrganizationStatus;
          verifiedPartner?: boolean;
        }>(req);
        const updated = await updateOrganizationStatusAdmin(
          orgId,
          body.status,
          body.verifiedPartner,
        );
        if (!updated) {
          sendJson(res, 404, { error: 'Organisation nicht gefunden.' });
          return true;
        }
        sendJson(res, 200, { organization: updated });
        return true;
      }

      const orgDeleteMatch = pathname.match(/^\/api\/admin\/organizations\/([^/]+)$/);
      if (orgDeleteMatch && method === 'DELETE') {
        const orgId = decodeURIComponent(orgDeleteMatch[1]);
        const ok = await deleteOrganizationAdmin(orgId);
        sendJson(res, 200, { deleted: ok });
        return true;
      }

      if (pathname === '/api/admin/animals' && method === 'POST') {
        const body = await readJsonBody<AnimalProfile>(req);
        if (!body.id?.trim() || !body.name?.trim()) {
          sendJson(res, 400, { error: 'Tier-ID und Name sind Pflichtfelder.' });
          return true;
        }
        const saved = await upsertAnimalProfileAdmin(body);
        sendJson(res, 200, { animal: saved });
        return true;
      }

      const animalDeleteMatch = pathname.match(/^\/api\/admin\/animals\/([^/]+)$/);
      if (animalDeleteMatch && method === 'DELETE') {
        const animalId = decodeURIComponent(animalDeleteMatch[1]);
        const ok = await deleteAnimalProfileAdmin(animalId);
        sendJson(res, 200, { deleted: ok });
        return true;
      }

      if (pathname === '/api/admin/hotlines' && method === 'POST') {
        const body = await readJsonBody<EmergencyHotline>(req);
        if (!body.id?.trim() || !body.name?.trim() || !body.phone?.trim()) {
          sendJson(res, 400, { error: 'ID, Name und Telefonnummer sind Pflichtfelder.' });
          return true;
        }
        const saved = await upsertHotlineAdmin(body);
        sendJson(res, 200, { hotline: saved });
        return true;
      }

      const hotlineDeleteMatch = pathname.match(/^\/api\/admin\/hotlines\/([^/]+)$/);
      if (hotlineDeleteMatch && method === 'DELETE') {
        const hotlineId = decodeURIComponent(hotlineDeleteMatch[1]);
        const ok = await deleteHotlineAdmin(hotlineId);
        sendJson(res, 200, { deleted: ok });
        return true;
      }

      if (pathname === '/api/admin/reset' && method === 'POST') {
        await resetDatabaseToSeedAdmin();
        const overview = await getAdminOverviewData(false);
        sendJson(res, 200, overview);
        return true;
      }
    }

    sendJson(res, 404, { error: `API-Endpunkt nicht gefunden: ${method} ${pathname}` });
    return true;
  } catch (err) {
    sendJson(res, 500, {
      error: err instanceof Error ? err.message : 'Interner Serverfehler',
    });
    return true;
  }
}

export function tierrettungApiPlugin(): Plugin {
  return {
    name: 'tierrettung-mongodb-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const handled = await handleApiRequest(req, res);
        if (!handled) {
          next();
        }
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const handled = await handleApiRequest(req, res);
        if (!handled) {
          next();
        }
      });
    },
  };
}
