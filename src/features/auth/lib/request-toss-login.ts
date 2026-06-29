import { appLogin } from '@apps-in-toss/web-framework';

import type { TossLoginResult } from '../model/toss-login-flow';

export async function requestTossLogin(): Promise<TossLoginResult> {
  const result = await appLogin();

  return {
    authorizationCode: result.authorizationCode,
    referrer: result.referrer,
  };
}
