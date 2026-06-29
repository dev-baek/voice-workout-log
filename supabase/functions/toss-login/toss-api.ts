import { LoginError } from './errors.ts';
import {
  assertTossOkResponse,
  getSuccessPayload,
  readJson,
} from './toss-response.ts';
import type { TossLoginMe, TossLoginRequest, TossToken } from './types.ts';
import {
  getNullableNumber,
  getNumber,
  getString,
  getStringArray,
  stripTrailingSlash,
} from './values.ts';

const tossApiBaseUrl = stripTrailingSlash(
  Deno.env.get('TOSS_API_BASE_URL') ?? 'https://apps-in-toss-api.toss.im',
);

export async function generateTossToken(
  loginRequest: TossLoginRequest,
  client: Deno.HttpClient,
): Promise<TossToken> {
  const response = await tossFetch(
    '/api-partner/v1/apps-in-toss/user/oauth2/generate-token',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginRequest),
    },
    client,
  );

  const body = await readJson(response);
  assertTossOkResponse(response, body, '토스 AccessToken 발급에 실패했습니다.');
  const success = getSuccessPayload(body);
  const accessToken = getString(success.accessToken);

  if (accessToken == null) {
    throw new LoginError(
      502,
      'invalid_toss_token_response',
      '토스 토큰 응답 형식이 올바르지 않습니다.',
    );
  }

  return {
    accessToken,
    scope: getString(success.scope) ?? '',
    expiresIn: getNullableNumber(success.expiresIn),
  };
}

export async function fetchTossLoginMe(
  accessToken: string,
  client: Deno.HttpClient,
): Promise<TossLoginMe> {
  const response = await tossFetch(
    '/api-partner/v1/apps-in-toss/user/oauth2/login-me',
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    },
    client,
  );

  const body = await readJson(response);
  assertTossOkResponse(response, body, '토스 사용자 정보 조회에 실패했습니다.');
  const success = getSuccessPayload(body);
  const userKey = getNumber(success.userKey);
  const scope = getString(success.scope);

  if (userKey == null || scope == null) {
    throw new LoginError(
      502,
      'invalid_toss_user_response',
      '토스 사용자 응답 형식이 올바르지 않습니다.',
    );
  }

  return {
    userKey,
    scope,
    agreedTerms: getStringArray(success.agreedTerms),
  };
}

function tossFetch(path: string, init: RequestInit, client: Deno.HttpClient) {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');

  return fetch(`${tossApiBaseUrl}${path}`, {
    ...init,
    headers,
    client,
  } as RequestInit & { client: Deno.HttpClient });
}
