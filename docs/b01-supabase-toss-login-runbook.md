# B01 Supabase 토스 로그인 실행 메모

## Secrets

Supabase Secrets 또는 로컬 env 파일에 아래 값을 둔다.

```txt
TOSS_API_BASE_URL=https://apps-in-toss-api.toss.im
TOSS_MTLS_CERT_PEM_B64=base64-encoded-client-cert-pem
TOSS_MTLS_KEY_PEM_B64=base64-encoded-client-key-pem
TOSS_MTLS_CA_CERT_PEM_B64=
ALLOWED_ORIGINS=http://localhost:3000,https://your-mini-app-domain.example
```

인증서 파일은 줄바꿈 문제를 피하기 위해 base64로 인코딩해서 저장한다.

```bash
base64 -i client-cert.pem | tr -d '\n'
base64 -i client-key.pem | tr -d '\n'
```

운영 secret 설정 예시:

```bash
supabase secrets set TOSS_API_BASE_URL="https://apps-in-toss-api.toss.im"
supabase secrets set TOSS_MTLS_CERT_PEM_B64="$(base64 -i client-cert.pem | tr -d '\n')"
supabase secrets set TOSS_MTLS_KEY_PEM_B64="$(base64 -i client-key.pem | tr -d '\n')"
supabase secrets set ALLOWED_ORIGINS="https://your-mini-app-domain.example"
```

## Local Run

```bash
cp supabase/functions/.env.example supabase/functions/.env.local
supabase functions serve toss-login --env-file supabase/functions/.env.local
```

프론트엔드에서 로컬 함수를 바라보려면:

```bash
cp .env.example .env.local
```

```txt
NEXT_PUBLIC_TOSS_AUTH_API_URL=http://127.0.0.1:54321/functions/v1/toss-login
```

## Deploy

```bash
supabase functions deploy toss-login
```

배포 후 프론트엔드 인증 서버 URL:

```txt
https://<project-ref>.supabase.co/functions/v1/toss-login
```

## 보안 메모

- `authorizationCode`는 일회성이고 10분 안에 사용해야 한다.
- AccessToken은 Toss API 사용자 정보 조회에만 쓰고 클라이언트로 반환하지 않는다.
- RefreshToken은 이번 Phase 0.5에서는 저장하지 않는다.
- mTLS 인증서와 private key는 Supabase Secrets에만 둔다.
- 로그에 인증 코드, 토큰, 인증서 원문을 남기지 않는다.
- CORS 허용 도메인은 운영 배포 시 실제 WebView 도메인으로 제한한다.

## 이번 범위에서 안 하는 것

- Supabase DB 사용자 테이블 저장
- 서비스 세션 발급
- RefreshToken 저장 및 재발급
- 암호화된 개인정보 복호화
- 연결 끊기 API 구현
- 운동 기록 데이터 모델 설계

## 참고

- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Supabase Edge Functions CORS: https://supabase.com/docs/guides/functions/cors
- Supabase Edge Functions Secrets: https://supabase.com/docs/guides/functions/secrets
