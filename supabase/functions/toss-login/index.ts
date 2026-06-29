import { buildCorsHeaders } from './cors.ts';
import { createTossHttpClient } from './mtls.ts';
import { parseLoginRequest } from './request.ts';
import { errorResponse, jsonResponse } from './response.ts';
import { fetchTossLoginMe, generateTossToken } from './toss-api.ts';

Deno.serve(async (request) => {
  const corsHeaders = buildCorsHeaders(request);

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  if (request.method !== 'POST') {
    return jsonResponse(
      {
        ok: false,
        error: {
          code: 'method_not_allowed',
          message: 'POST 요청만 사용할 수 있습니다.',
        },
      },
      405,
      corsHeaders,
    );
  }

  let client: Deno.HttpClient | null = null;

  try {
    const loginRequest = await parseLoginRequest(request);
    client = createTossHttpClient();

    const token = await generateTossToken(loginRequest, client);
    const loginMe = await fetchTossLoginMe(token.accessToken, client);

    return jsonResponse(
      {
        ok: true,
        userKey: loginMe.userKey,
        scope: loginMe.scope,
        agreedTerms: loginMe.agreedTerms,
        tokenExpiresInSeconds: token.expiresIn,
      },
      200,
      corsHeaders,
    );
  } catch (error) {
    return errorResponse(error, corsHeaders);
  } finally {
    client?.close();
  }
});
