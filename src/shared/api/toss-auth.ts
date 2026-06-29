import {
  buildTossLoginRequest,
  redactAuthorizationCode,
  type TossLoginResult,
} from '@/features/auth/model/toss-login-flow';

type AuthFetch = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

export interface PostTossLoginAuthorizationCodeOptions {
  endpoint: string;
  loginResult: TossLoginResult;
  fetcher?: AuthFetch;
}

export interface AuthServerExchangeResult {
  ok: boolean;
  status: number;
  body: string;
}

export async function postTossLoginAuthorizationCode({
  endpoint,
  loginResult,
  fetcher = fetch,
}: PostTossLoginAuthorizationCodeOptions): Promise<AuthServerExchangeResult> {
  const response = await fetcher(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildTossLoginRequest(loginResult)),
  });
  const responseBody = await response.text();
  const displayBody = formatResponseBody(responseBody);

  return {
    ok: response.ok,
    status: response.status,
    body: redactAuthorizationCode(displayBody, loginResult.authorizationCode),
  };
}

function formatResponseBody(value: string) {
  if (value.trim().length === 0) {
    return '(empty response)';
  }

  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}
