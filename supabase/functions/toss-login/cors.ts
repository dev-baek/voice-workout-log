export function buildCorsHeaders(request: Request) {
  const origin = request.headers.get('Origin');
  const allowedOrigins = parseAllowedOrigins();
  const allowOrigin =
    allowedOrigins.length === 0
      ? '*'
      : origin != null && allowedOrigins.includes(origin)
        ? origin
        : allowedOrigins[0];

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function parseAllowedOrigins() {
  return (Deno.env.get('ALLOWED_ORIGINS') ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0 && origin !== '*');
}
