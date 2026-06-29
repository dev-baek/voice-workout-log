export const AUTH_SOURCE = 'apps-in-toss-webview-poc';
export const REDACTED_AUTHORIZATION_CODE = '[REDACTED_AUTHORIZATION_CODE]';

export type TossLoginReferrer = 'DEFAULT' | 'SANDBOX';

export interface TossLoginResult {
  authorizationCode: string;
  referrer: TossLoginReferrer;
}

export interface TossLoginExchangeRequest extends TossLoginResult {
  source: typeof AUTH_SOURCE;
}

export type AuthServerUrlValidation =
  | {
      ok: true;
      url: string;
    }
  | {
      ok: false;
      reason: string;
    };

export function buildTossLoginRequest(loginResult: TossLoginResult): TossLoginExchangeRequest {
  return {
    authorizationCode: loginResult.authorizationCode,
    referrer: loginResult.referrer,
    source: AUTH_SOURCE,
  };
}

export function redactAuthorizationCode(value: string, authorizationCode: string) {
  if (authorizationCode.length === 0) {
    return value;
  }

  return value.split(authorizationCode).join(REDACTED_AUTHORIZATION_CODE);
}

export function validateAuthServerUrl(value: string): AuthServerUrlValidation {
  const trimmedValue = value.trim();

  if (trimmedValue.length === 0) {
    return {
      ok: false,
      reason: '인증 서버 URL을 입력해 주세요.',
    };
  }

  try {
    const url = new URL(trimmedValue);
    const isSupportedProtocol = url.protocol === 'https:' || url.protocol === 'http:';

    if (!isSupportedProtocol) {
      return {
        ok: false,
        reason: 'http 또는 https URL만 사용할 수 있습니다.',
      };
    }

    return {
      ok: true,
      url: url.toString(),
    };
  } catch {
    return {
      ok: false,
      reason: '올바른 URL 형식이 아닙니다.',
    };
  }
}
