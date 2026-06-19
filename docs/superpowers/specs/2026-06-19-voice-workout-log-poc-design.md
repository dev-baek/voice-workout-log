# Voice Workout Log 1st PoC Design

## Background

This project is an AppsInToss mini-app concept named "말하는 운동기록" / "Voice Workout Log".

The app lets users record workouts by speaking naturally instead of typing structured workout data. AI will eventually convert speech into organized workout records such as exercise name, weight, reps, sets, and totals.

Example user speech:

```txt
오늘 벤치프레스 60kg 10개씩 3세트, 스쿼트 80kg 5개씩 5세트 했어
```

Expected final structured result:

```txt
- 벤치프레스: 60kg / 10회 x 3세트 / 총 30회
- 스쿼트: 80kg / 5회 x 5세트 / 총 25회
```

## Product Direction

The app should not force users to follow strict speaking rules. Users should be able to describe their workout naturally, and AI should handle interpretation.

The UX principle is:

```txt
User speaks naturally.
The system records, transcribes, interprets, verifies, and asks for confirmation.
```

The app should be positioned as a workout logging tool, not as a medical, diagnosis, or exercise prescription service.

## AppsInToss Direction

The project should start with the WebView approach.

Reasons:

- The AppsInToss microphone permission is documented as planned for future support.
- The AppsInToss documentation says WebView apps can directly use standard Web APIs.
- Therefore, the first technical risk is whether `getUserMedia` and `MediaRecorder` work reliably in the target WebView environment.

Reference:

- AppsInToss permission documentation: https://developers-apps-in-toss.toss.im/bedrock/reference/framework/%EA%B6%8C%ED%95%9C/permission.md

## Agreed 1st PoC Scope

The first PoC should focus on speech recording and speech-to-text validation.

The selected scope is:

```txt
B. Minimal WebView PoC
Browser/WebView records audio
→ uploads audio to Oracle Always Free server
→ server transcribes audio
→ transcribed text returns to the WebView
→ WebView displays the text
```

The first priority is not workout JSON extraction. The first priority is proving that recording and transcription work.

## 1st PoC Success Criteria

The PoC is successful when all of the following are true:

1. The WebView or browser can request microphone access with `getUserMedia`.
2. The client can record audio with `MediaRecorder`.
3. The recorded audio can be uploaded to the Oracle Always Free server.
4. The Oracle server can run `whisper.cpp` with a small or base Whisper model.
5. Korean workout speech can be transcribed into readable text.
6. The transcribed text can be returned to the WebView and displayed to the user.

## 1st PoC Non-Goals

The following are intentionally excluded from the first PoC:

- Exercise JSON extraction with LLM
- Ollama `qwen3.5:4b` integration
- Workout record saving
- Daily workout history
- User authentication
- AppsInToss production review readiness
- Polished final UI

These should be handled after the recording and STT path is proven.

## Architecture

```txt
WebView client
→ microphone permission request
→ MediaRecorder audio capture
→ audio file upload
→ Oracle Always Free server
→ whisper.cpp STT
→ text response
→ WebView transcription result screen
```

## Server Direction

The server should use Oracle Cloud Always Free to keep infrastructure cost at 0 KRW during PoC.

The initial server responsibilities are:

- Receive audio uploads from the WebView.
- Convert uploaded audio into a format accepted by `whisper.cpp` if needed.
- Run `whisper.cpp` with a small or base model.
- Return transcription text as JSON.

Initial response shape:

```json
{
  "text": "오늘 벤치프레스 60키로 10개씩 3세트 했어",
  "language": "ko",
  "durationSec": 8.2
}
```

## What whisper.cpp Does

`whisper.cpp` is an open-source C/C++ runtime for running OpenAI Whisper speech recognition models efficiently.

In this project:

```txt
whisper.cpp = listens to the uploaded audio and transcribes it into text
```

It is separate from the LLM.

```txt
whisper.cpp: audio → text
qwen3.5:4b: text → structured workout JSON
```

Reference:

- whisper.cpp GitHub: https://github.com/ggml-org/whisper.cpp

## Future LLM Direction

After STT is validated, the second PoC should add LLM-based workout interpretation.

Preferred future stack:

```txt
Oracle Always Free
+ whisper.cpp small/base
+ Ollama
+ qwen3.5:4b
+ JSON schema enforcement
+ server-side validation and total-rep recalculation
```

The LLM should handle natural-language interpretation:

- Exercise name extraction
- Exercise alias normalization
- Weight extraction
- Reps and set extraction
- Ambiguous phrase interpretation
- User-review flagging when confidence is low

The server should not blindly trust the LLM. It should recalculate deterministic fields such as total reps.

Future structured response example:

```json
{
  "exercises": [
    {
      "name": "벤치프레스",
      "weightKg": 60,
      "sets": [
        { "reps": 10 },
        { "reps": 10 },
        { "reps": 10 }
      ],
      "totalReps": 30,
      "confidence": 0.92
    }
  ],
  "needsUserReview": true
}
```

## UX Principle for AI Output

Even if AI handles all interpretation, the app should show a confirmation screen before saving.

Recommended wording:

```txt
AI가 이렇게 이해했어요. 맞나요?
```

This protects trust and lets users correct AI mistakes before the workout record is saved.

## Key Risks

### WebView microphone compatibility

AppsInToss documents that WebView can use standard Web APIs, but actual microphone behavior must be tested in the real target environment.

Mitigation:

- Test in normal browser first.
- Test in mobile browser next.
- Test in AppsInToss WebView after the basic flow works.

### STT speed on Oracle Always Free

Oracle Always Free does not provide a GPU by default. `whisper.cpp` can run on CPU, but transcription speed may be slow depending on model size and audio length.

Mitigation:

- Start with Whisper `base` or `small`.
- Measure transcription time for short workout recordings.
- Keep the first PoC audio length short.

### Audio format compatibility

`MediaRecorder` output format can vary by browser.

Mitigation:

- Detect supported MIME types in the client.
- Prefer a common format supported by the browser.
- Convert server-side with FFmpeg if needed.

### LLM quality and latency

`qwen3.5:4b` is reserved for the second PoC. It should not block the first STT validation.

Mitigation:

- Do not add LLM until recording and STT are proven.
- Evaluate LLM quality with real transcribed workout sentences later.

## Recommended PoC Phases

### Phase 1: STT only

Goal:

```txt
Voice recording works, upload works, Korean transcription works.
```

Deliverable:

- Minimal WebView/browser page
- Upload API
- `whisper.cpp` transcription endpoint
- Result text display

### Phase 2: LLM structure extraction

Goal:

```txt
Natural workout speech becomes structured workout JSON.
```

Deliverable:

- Ollama `qwen3.5:4b` server integration
- JSON schema prompt
- Server-side validation
- Total-rep recalculation
- User confirmation response

### Phase 3: Workout logging

Goal:

```txt
Confirmed AI results can be saved and reviewed by date.
```

Deliverable:

- Save confirmed workout records
- Daily workout history
- Basic edit/correction flow

## Current Decision

The project should proceed with this first PoC:

```txt
Oracle Always Free
+ WebView microphone recording
+ audio upload
+ whisper.cpp small/base
+ transcription result display
```

The LLM stack is intentionally deferred:

```txt
Ollama qwen3.5:4b
+ JSON schema enforcement
+ server-side validation
```

The implementation should begin only after this spec is reviewed and accepted.
