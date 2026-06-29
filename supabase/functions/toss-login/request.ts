import { LoginError } from './errors.ts';
import type { TossLoginRequest } from './types.ts';
import { getTrimmedString, isRecord } from './values.ts';

export async function parseLoginRequest(
  request: Request,
): Promise<TossLoginRequest> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    throw new LoginError(
      400,
      'invalid_json',
      '요청 body는 JSON 형식이어야 합니다.',
    );
  }

  if (!isRecord(body)) {
    throw new LoginError(
      400,
      'invalid_body',
      '요청 body 형식이 올바르지 않습니다.',
    );
  }

  const authorizationCode = getTrimmedString(body.authorizationCode);
  const referrer = body.referrer;

  if (authorizationCode == null) {
    throw new LoginError(
      400,
      'missing_authorization_code',
      'authorizationCode가 필요합니다.',
    );
  }

  if (referrer !== 'DEFAULT' && referrer !== 'SANDBOX') {
    throw new LoginError(
      400,
      'invalid_referrer',
      'referrer는 DEFAULT 또는 SANDBOX여야 합니다.',
    );
  }

  return {
    authorizationCode,
    referrer,
  };
}
