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
```

Next.js App Router를 사용하되, 기능 코드는 FSD 기준으로 `features`와 `shared` 아래에 둡니다.

## AppsInToss

AppsInToss WebView SDK 설정은 `granite.config.ts`에 둡니다.

Next.js는 WebView에서 실행할 정적 클라이언트 앱 빌드 도구로 사용합니다. 토큰 교환, mTLS, 서버 API 구현은 별도 backend 작업에서 진행합니다.
