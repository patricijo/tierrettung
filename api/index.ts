import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleApiRequest } from '../server/apiPlugin.ts';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const handled = await handleApiRequest(req, res);
    if (!handled) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'API route not found' }));
    }
  } catch (err) {
    console.error('Vercel serverless function error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(
      JSON.stringify({
        error: err instanceof Error ? err.message : 'Interner Serverfehler',
      }),
    );
  }
}
