# 말하는 운동기록 Internal Technical Spec

## Document Status

- 문서 목적: 내부 개발용 기술 스펙
- 현재 목표 단계: Phase 0
- 마지막 업데이트: 2026-06-29
- 제품명: 말하는 운동기록
- 영문명: Voice Workout Log

## 1. Background

말하는 운동기록은 사용자가 운동 내용을 타이핑하지 않고 음성으로 말하면, 이후 AI가 운동 기록으로 정리해주는 AppsInToss WebView 미니앱이다.

최종 제품 방향은 다음과 같다.

```txt
사용자 자연어 음성
→ 음성 녹음
→ STT
→ LLM 운동 기록 구조화
→ 사용자 확인
→ 저장
→ 일별 운동 기록 조회
```

다만 현재 개발 목표는 전체 AI 흐름이 아니라, 가장 앞단의 WebView 녹음과 업로드 가능성 검증이다.

## 2. Current Decision

Phase 0의 목표는 다음으로 고정한다.

```txt
Phase 0: WebView 녹음 업로드 확인
```

Phase 0에서는 Oracle Always Free, whisper.cpp, Ollama, qwen3.5:4b, 운동 기록 JSON 구조화는 구현하지 않는다.

이유:

- AppsInToss WebView에서 `getUserMedia`와 `MediaRecorder`가 실제로 동작하는지 먼저 확인해야 한다.
- 마이크 녹음이 되지 않으면 이후 STT/LLM 서버 작업은 의미가 없다.
- 무료 서버 기반 AI 추론은 느릴 수 있으므로, 프론트 녹음/업로드 리스크와 서버 AI 리스크를 분리해서 검증한다.

## 3. Phase Plan

### Phase 0: WebView Recording Upload Smoke Test

목표:

```txt
AppsInToss WebView 또는 브라우저에서 마이크 녹음 후 테스트 API로 오디오 파일을 업로드할 수 있는지 검증한다.
```

포함 범위:

- 마이크 권한 요청
- `MediaRecorder` 기반 오디오 녹음
- 녹음 파일 미리듣기
- 테스트 API URL 입력
- `multipart/form-data` 업로드
- API 응답 화면 표시

제외 범위:

- Oracle Always Free 서버
- whisper.cpp STT
- Ollama/qwen LLM
- 운동 기록 JSON 생성
- 저장 기능
- 로그인/사용자 식별
- AppsInToss 심사 대응용 UI polish

### Phase 1: Oracle STT Server

목표:

```txt
Phase 0에서 생성한 오디오 파일을 Oracle Always Free 서버로 보내고, whisper.cpp로 한국어 텍스트를 반환한다.
```

예정 구성:

- Oracle Always Free
- upload/transcribe API
- FFmpeg audio normalization
- whisper.cpp base 또는 small
- STT 결과 반환

### Phase 2: LLM Workout Structuring

목표:

```txt
STT 텍스트를 운동 기록 JSON으로 구조화하고, 사용자가 최종 확인할 수 있게 한다.
```

예정 구성:

- Ollama
- qwen3.5:4b 기본 후보
- qwen3.5:9b 품질 비교 후보
- JSON schema 강제
- 서버 검산
- 사용자 최종 확인

Qwen3.6은 현재 27B/35B급 큰 모델 중심이라 Oracle Always Free 기본 스펙에는 부적합한 후보로 둔다.

## 4. Phase 0 Architecture

```txt
Static WebView client
→ navigator.mediaDevices.getUserMedia({ audio: true })
→ MediaRecorder
→ Blob 생성
→ FormData 생성
→ 테스트 API URL로 POST
→ 응답 상태/본문 표시
```

현재 구현은 빌드 도구 없는 정적 HTML/CSS/JavaScript로 유지한다.

이유:

- Phase 0은 프레임워크 기능 검증이 아니라 WebView 표준 API 검증이다.
- 배포/호스팅이 단순하다.
- AppsInToss WebView나 모바일 브라우저에서 빠르게 실험할 수 있다.

## 5. Phase 0 Client Requirements

클라이언트는 다음을 만족해야 한다.

- HTTPS 또는 localhost 보안 컨텍스트에서 실행된다.
- `getUserMedia` 지원 여부를 화면에서 감지한다.
- `MediaRecorder` 지원 여부를 화면에서 감지한다.
- 사용자가 녹음을 시작하고 중지할 수 있다.
- 녹음 완료 후 오디오 미리듣기를 제공한다.
- 사용자가 업로드 대상 URL을 직접 입력할 수 있다.
- 업로드 요청은 `multipart/form-data` 형식이어야 한다.
- 업로드 성공/실패 상태와 API 응답 본문을 화면에 표시한다.

## 6. Phase 0 Upload Contract

Phase 0은 테스트 API를 대상으로 하므로 서버 응답 스키마를 강제하지 않는다. 단, 프론트에서 보내는 요청 형식은 고정한다.

### Request

```txt
POST {uploadUrl}
Content-Type: multipart/form-data
```

Form fields:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `audio` | File | Yes | 녹음된 오디오 파일 |
| `mimeType` | string | Yes | 브라우저가 생성한 Blob MIME type |
| `durationMs` | string | Yes | 녹음 길이(ms) |
| `source` | string | Yes | `apps-in-toss-webview-poc` |

파일명 형식:

```txt
voice-workout-{timestamp}.{extension}
```

허용 MIME type 후보:

- `audio/webm;codecs=opus`
- `audio/webm`
- `audio/mp4`
- `audio/mpeg`
- `audio/wav`

### Response Handling

프론트는 응답을 다음 기준으로 표시한다.

- HTTP status code 표시
- `application/json` 응답은 pretty JSON으로 표시
- 그 외 응답은 plain text로 표시
- non-2xx 응답은 업로드 실패로 표시

## 7. Phase 0 Success Criteria

Phase 0은 다음 조건을 모두 만족하면 완료로 본다.

1. 로컬 브라우저에서 마이크 권한 요청이 뜬다.
2. 로컬 브라우저에서 5~15초 음성을 녹음할 수 있다.
3. 녹음 후 오디오 미리듣기가 재생된다.
4. 기본 테스트 API(`https://httpbin.org/post`) 또는 지정 테스트 API로 업로드 요청이 전송된다.
5. API 응답 status code와 response body가 화면에 표시된다.
6. 모바일 브라우저 또는 AppsInToss WebView에서 같은 흐름을 최소 1회 검증한다.

Phase 0은 STT 품질이나 LLM 구조화 품질을 평가하지 않는다.

## 8. Validation Checklist

개발자가 Phase 0을 검증할 때 다음을 기록한다.

| Check | Expected |
| --- | --- |
| Page loads | 화면이 빈 페이지 없이 표시된다 |
| Capability detection | 미지원 환경에서 안내 문구가 표시된다 |
| Microphone permission | 권한 요청이 표시된다 |
| Recording | 녹음 시작/중지 버튼 상태가 정상 변경된다 |
| Audio preview | 녹음 파일을 재생할 수 있다 |
| Upload | API 요청이 전송된다 |
| Response display | HTTP status와 body가 표시된다 |
| Error handling | 권한 거부/업로드 실패가 화면에 표시된다 |

## 9. Security and Privacy Notes

Phase 0에서도 다음 원칙을 지킨다.

- AI API key 또는 서버 secret을 WebView 클라이언트에 넣지 않는다.
- Phase 0 클라이언트는 오디오를 로컬에 영구 저장하지 않는다.
- 테스트 API로 실제 민감한 음성을 보내지 않는다.
- 실제 서버 연동 시 HTTPS를 필수로 한다.
- 실제 서비스 단계에서는 음성 데이터 보관 여부와 삭제 정책을 사용자에게 고지한다.
- 최종 제품은 의료/운동 처방 서비스가 아니라 운동 기록 도구로 포지셔닝한다.

## 10. Known Risks

### AppsInToss WebView microphone behavior

문서상 WebView 표준 API 사용은 가능하다고 되어 있으나, 실제 마이크 권한 동작은 대상 환경에서 확인해야 한다.

대응:

- 로컬 브라우저에서 먼저 확인한다.
- 모바일 브라우저에서 확인한다.
- AppsInToss WebView에서 최종 확인한다.

### Browser-specific audio format

`MediaRecorder`가 생성하는 MIME type은 브라우저마다 다를 수 있다.

대응:

- 지원 MIME type을 런타임에 탐색한다.
- Phase 1 서버에서는 FFmpeg 변환을 준비한다.

### Test API CORS

테스트 API가 CORS를 허용하지 않으면 업로드 자체는 서버에 도달해도 브라우저에서 응답을 읽지 못할 수 있다.

대응:

- Phase 0 테스트 API는 CORS 허용 엔드포인트를 사용한다.
- Phase 1 서버는 WebView origin을 허용하는 CORS 정책을 명시한다.

## 11. Current Implementation Files

```txt
index.html
src/app.js
src/styles.css
README.md
```

현재 구현은 정적 파일 기반이다. 실행 방법은 `README.md`를 따른다.

## 12. References

- AppsInToss permission documentation: https://developers-apps-in-toss.toss.im/bedrock/reference/framework/%EA%B6%8C%ED%95%9C/permission.md
- whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Ollama qwen3.5: https://ollama.com/library/qwen3.5
