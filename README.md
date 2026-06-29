# 말하는 운동기록

AppsInToss WebView 방식으로 개발하는 음성 기반 운동 기록 미니앱입니다.

현재 브랜치의 목표는 Next.js 기반 WebView 프론트엔드 초기 설정입니다.

## 실행

Node.js 20.9 이상을 사용합니다.

```bash
npm install
npm run dev
```

```txt
http://localhost:3000
```

토스 로그인 인증 서버 URL은 로컬 환경 파일에 설정합니다.

```bash
cp .env.example .env.local
```

```txt
NEXT_PUBLIC_TOSS_AUTH_API_URL=https://your-project-ref.supabase.co/functions/v1/toss-login
```

## Supabase Edge Function

토스 로그인 토큰 교환은 Supabase Edge Function에서 처리합니다.

```bash
cp supabase/functions/.env.example supabase/functions/.env.local
supabase functions serve toss-login --env-file supabase/functions/.env.local
```

배포:

```bash
supabase functions deploy toss-login
```

자세한 backend 스펙은 `docs/b01-supabase-toss-login-edge-function-spec.md`를 확인합니다.

## 검증

```bash
npm run lint
npm run typecheck
npm run build
```

## 구조

```txt
src/
  app/
  features/
  shared/
supabase/
  functions/
    toss-login/
```

Next.js App Router를 사용하되, 기능 코드는 FSD 기준으로 `features`와 `shared` 아래에 둡니다.

## AppsInToss

AppsInToss WebView SDK 설정은 `granite.config.ts`에 둡니다.

Next.js는 WebView에서 실행할 정적 클라이언트 앱 빌드 도구로 사용합니다. 토큰 교환, mTLS, 사용자 정보 조회는 Supabase Edge Function에서 처리합니다.
