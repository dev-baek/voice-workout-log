import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildTossLoginRequest,
  redactAuthorizationCode,
  validateAuthServerUrl,
} from './toss-login-flow';
import { postTossLoginAuthorizationCode } from '../../../shared/api/toss-auth';

describe('buildTossLoginRequest', () => {
  it('creates the server payload without adding token fields', () => {
    const payload = buildTossLoginRequest({
      authorizationCode: 'AUTH_CODE',
      referrer: 'SANDBOX',
    });

    assert.deepEqual(payload, {
      authorizationCode: 'AUTH_CODE',
      referrer: 'SANDBOX',
      source: 'apps-in-toss-webview-poc',
    });
    assert.equal('accessToken' in payload, false);
    assert.equal('refreshToken' in payload, false);
  });
});

describe('redactAuthorizationCode', () => {
  it('masks authorization codes in nested response text', () => {
    const redacted = redactAuthorizationCode(
      '{"authorizationCode":"AUTH_CODE","nested":{"value":"AUTH_CODE"}}',
      'AUTH_CODE',
    );

    assert.equal(
      redacted,
      '{"authorizationCode":"[REDACTED_AUTHORIZATION_CODE]","nested":{"value":"[REDACTED_AUTHORIZATION_CODE]"}}',
    );
  });
});

describe('validateAuthServerUrl', () => {
  it('accepts http and https URLs only', () => {
    assert.equal(validateAuthServerUrl('https://api.example.com/auth/toss/login').ok, true);
    assert.equal(validateAuthServerUrl('http://localhost:3001/auth/toss/login').ok, true);
    assert.equal(validateAuthServerUrl('ftp://api.example.com/auth').ok, false);
    assert.equal(validateAuthServerUrl('').ok, false);
  });
});

describe('postTossLoginAuthorizationCode', () => {
  it('posts login payload and redacts response body', async () => {
    const calls: Array<{ input: string | URL | Request; init?: RequestInit }> = [];

    const response = await postTossLoginAuthorizationCode({
      endpoint: 'https://api.example.com/auth/toss/login',
      loginResult: {
        authorizationCode: 'AUTH_CODE',
        referrer: 'DEFAULT',
      },
      fetcher: async (input, init) => {
        calls.push({ input, init });

        return new Response(JSON.stringify({ echoed: 'AUTH_CODE' }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      },
    });

    assert.equal(calls.length, 1);
    assert.equal(calls[0]?.input, 'https://api.example.com/auth/toss/login');
    assert.equal(calls[0]?.init?.method, 'POST');
    assert.equal(new Headers(calls[0]?.init?.headers).get('Content-Type'), 'application/json');
    assert.equal(
      calls[0]?.init?.body,
      JSON.stringify({
        authorizationCode: 'AUTH_CODE',
        referrer: 'DEFAULT',
        source: 'apps-in-toss-webview-poc',
      }),
    );
    assert.equal(response.ok, true);
    assert.equal(response.status, 200);
    assert.equal(response.body.includes('AUTH_CODE'), false);
    assert.equal(response.body.includes('[REDACTED_AUTHORIZATION_CODE]'), true);
  });
});
