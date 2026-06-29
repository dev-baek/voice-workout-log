import { LoginError } from './errors.ts';

export function jsonResponse(
  body: unknown,
  status: number,
  corsHeaders: HeadersInit,
) {
  const headers = new Headers(corsHeaders);
  headers.set('Content-Type', 'application/json; charset=utf-8');

  return new Response(JSON.stringify(body), {
    status,
    headers,
  });
}

export function errorResponse(error: unknown, corsHeaders: HeadersInit) {
  if (error instanceof LoginError) {
    return jsonResponse(
      {
        ok: false,
        error: {
          code: error.code,
          message: error.message,
          detail: error.detail,
        },
      },
      error.status,
      corsHeaders,
    );
  }

  console.error(
    'Unexpected toss-login error',
    error instanceof Error ? error.message : 'unknown error',
  );

  return jsonResponse(
    {
      ok: false,
      error: {
        code: 'internal_error',
        message: '로그인 처리 중 오류가 발생했습니다.',
      },
    },
    500,
    corsHeaders,
  );
}
