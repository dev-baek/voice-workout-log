# 말하는 운동기록

AppsInToss WebView 환경에서 음성 기반 운동 기록 앱을 만들기 위한 프로젝트입니다.

현재 목표는 전체 AI 기능이 아니라 **Phase 0: WebView 녹음 업로드 확인**입니다.

내부 개발용 기준 문서:

```txt
docs/technical-spec.md
```

## 현재 범위

- 브라우저/WebView에서 `getUserMedia`로 마이크 권한 요청
- `MediaRecorder`로 음성 녹음
- 녹음 Blob을 테스트 API로 `multipart/form-data` 업로드
- 테스트 API 응답을 화면에 표시

아직 Oracle 서버, `whisper.cpp`, LLM 구조화는 연결하지 않았습니다.

## 현재 제외 범위

- Oracle Always Free 서버
- whisper.cpp STT
- Ollama/qwen LLM
- 운동 기록 JSON 생성
- 저장 기능
- 로그인/사용자 식별

## 실행

```bash
python3 -m http.server 5173
```

브라우저에서 아래 주소를 엽니다.

```txt
http://localhost:5173
```

테스트 API URL은 화면의 입력칸에서 바꿀 수 있습니다. 기본값은 `https://httpbin.org/post`입니다.

## Phase 0 검증 기준

- 페이지가 정상 표시된다.
- 마이크 권한 요청이 뜬다.
- 5~15초 음성을 녹음할 수 있다.
- 녹음 후 오디오 미리듣기가 재생된다.
- 테스트 API로 업로드 요청이 전송된다.
- HTTP status와 response body가 화면에 표시된다.

## 주의

마이크 API는 보안 컨텍스트에서만 동작합니다. 로컬 개발에서는 `localhost`가 허용되지만, 실제 WebView 또는 모바일 브라우저 테스트에서는 HTTPS 배포 URL을 사용해야 합니다.

테스트 API로 실제 민감한 음성을 보내지 마세요. 실제 서버 연동 전까지는 녹음/업로드 동작 확인용 샘플 음성만 사용합니다.
