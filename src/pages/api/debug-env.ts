import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const hasUrl = !!import.meta.env.WOO_URL;
  const hasKey = !!import.meta.env.WOO_CONSUMER_KEY;
  const hasSecret = !!import.meta.env.WOO_CONSUMER_SECRET;

  return new Response(JSON.stringify({
    WOO_URL: hasUrl ? 'SET' : 'MISSING',
    WOO_CONSUMER_KEY: hasKey ? 'SET' : 'MISSING',
    WOO_CONSUMER_SECRET: hasSecret ? 'SET' : 'MISSING',
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
