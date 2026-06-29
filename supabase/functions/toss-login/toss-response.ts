import { LoginError } from './errors.ts';
import { getString, isRecord } from './values.ts';

export async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();

  if (text.trim().length === 0) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new LoginError(
      502,
      'invalid_toss_json_response',
      '토스 응답을 JSON으로 해석할 수 없습니다.',
      `HTTP ${response.status}`,
    );
  }
}

export function assertTossOkResponse(
  response: Response,
  body: unknown,
  fallbackMessage: string,
) {
  if (isRecord(body) && body.error === 'invalid_grant') {
    throw new LoginError(
      401,
      'invalid_grant',
      '토스 인가 코드가 만료되었거나 이미 사용되었습니다.',
    );
  }

  if (isRecord(body) && body.resultType === 'FAIL') {
    const tossError = isRecord(body.error) ? body.error : {};
    throw new LoginError(
      502,
      'toss_api_error',
      fallbackMessage,
      getString(tossError.errorCode) ?? undefined,
    );
  }

  if (!response.ok) {
    throw new LoginError(
      502,
      'toss_http_error',
      fallbackMessage,
      `HTTP ${response.status}`,
    );
  }

  if (!isRecord(body) || body.resultType !== 'SUCCESS' || !isRecord(body.success)) {
    throw new LoginError(
      502,
      'invalid_toss_response',
      '토스 응답 형식이 올바르지 않습니다.',
    );
  }
}

export function getSuccessPayload(body: unknown): Record<string, unknown> {
  if (isRecord(body) && isRecord(body.success)) {
    return body.success;
  }

  throw new LoginError(
    502,
    'invalid_toss_response',
    '토스 응답 형식이 올바르지 않습니다.',
  );
}
