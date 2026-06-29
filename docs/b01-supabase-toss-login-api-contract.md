# B01 Supabase 토스 로그인 API 계약

## Endpoint

```txt
POST https://<project-ref>.supabase.co/functions/v1/toss-login
Content-Type: application/json
```

로컬 실행 시:

```txt
POST http://127.0.0.1:54321/functions/v1/toss-login
Content-Type: application/json
```

## Request

```json
{
  "authorizationCode": "AUTHORIZATION_CODE_FROM_TOSS",
  "referrer": "DEFAULT",
  "source": "apps-in-toss-webview-poc"
}
```

| field | required | note |
| --- | --- | --- |
| `authorizationCode` | yes | AppsInToss `appLogin()`에서 받은 일회성 인가 코드 |
| `referrer` | yes | `DEFAULT` 또는 `SANDBOX` |
| `source` | no | 프론트엔드 식별용 값. 서버 로직에는 사용하지 않음 |

## Success Response

```json
{
  "ok": true,
  "userKey": 123456789,
  "scope": "user_key",
  "agreedTerms": ["terms_tag1"],
  "tokenExpiresInSeconds": 3599
}
```

클라이언트에는 `AccessToken`, `RefreshToken`, mTLS 인증서, 암호화된 개인정보를 반환하지 않는다.

## Error Response

```json
{
  "ok": false,
  "error": {
    "code": "invalid_grant",
    "message": "토스 인가 코드가 만료되었거나 이미 사용되었습니다."
  }
}
```

| case | status | code |
| --- | --- | --- |
| JSON 파싱 실패 | 400 | `invalid_json` |
| `authorizationCode` 누락 | 400 | `missing_authorization_code` |
| `referrer` 형식 오류 | 400 | `invalid_referrer` |
| 인가 코드 만료 / 재사용 | 401 | `invalid_grant` |
| Toss API 실패 | 502 | `toss_api_error`, `toss_http_error` |
| mTLS secret 누락 | 500 | `missing_mtls_secret` |
| mTLS secret 형식 오류 | 500 | `invalid_mtls_secret` |

## 참고

- Toss Login docs: https://developers-apps-in-toss.toss.im/login/develop.md
