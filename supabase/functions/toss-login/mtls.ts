import { LoginError } from './errors.ts';

export function createTossHttpClient() {
  if (typeof Deno.createHttpClient !== 'function') {
    throw new LoginError(
      500,
      'mtls_runtime_not_supported',
      '현재 Edge Runtime에서 mTLS HTTP client를 만들 수 없습니다.',
    );
  }

  const cert = decodeRequiredPem('TOSS_MTLS_CERT_PEM_B64');
  const key = decodeRequiredPem('TOSS_MTLS_KEY_PEM_B64');
  const caCert = decodeOptionalPem('TOSS_MTLS_CA_CERT_PEM_B64');

  return Deno.createHttpClient({
    cert,
    key,
    caCerts: caCert == null ? undefined : [caCert],
  });
}

function decodeRequiredPem(name: string) {
  const value = Deno.env.get(name);

  if (value == null || value.trim().length === 0) {
    throw new LoginError(
      500,
      'missing_mtls_secret',
      `${name} 환경 변수가 필요합니다.`,
    );
  }

  return decodeBase64Pem(value, name);
}

function decodeOptionalPem(name: string) {
  const value = Deno.env.get(name);

  if (value == null || value.trim().length === 0) {
    return null;
  }

  return decodeBase64Pem(value, name);
}

function decodeBase64Pem(value: string, name: string) {
  try {
    const binary = atob(value.trim());
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

    return new TextDecoder().decode(bytes);
  } catch {
    throw new LoginError(
      500,
      'invalid_mtls_secret',
      `${name} 환경 변수는 PEM 파일을 base64로 인코딩한 값이어야 합니다.`,
    );
  }
}
