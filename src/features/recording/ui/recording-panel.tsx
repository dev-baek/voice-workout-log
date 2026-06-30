'use client';

import { Button } from '@toss/tds-mobile';
import { useEffect, useRef, useState } from 'react';

import { createAudioRecorder, isPermissionDeniedError, isRecordingSupported, type AudioRecorderSession } from '../lib/create-audio-recorder';
import {
  canRequestRecording,
  formatRecordingDuration,
  getRecordingStatusText,
  type RecordingStatus,
} from '../model/recording-state';
import styles from './recording-panel.module.css';

export function RecordingPanel() {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState(0);
  const recorderRef = useRef<AudioRecorderSession | null>(null);

  useEffect(() => () => {
    recorderRef.current?.cancel();
    if (audioUrl != null) URL.revokeObjectURL(audioUrl);
  }, [audioUrl]);

  async function handleStart() {
    if (!isRecordingSupported()) {
      setStatus('unsupported');
      return;
    }

    setStatus('requestingPermission');
    clearPreview();

    try {
      recorderRef.current = await createAudioRecorder({
        onComplete: (recording) => {
          const nextUrl = URL.createObjectURL(recording.blob);
          setAudioUrl(nextUrl);
          setDurationMs(recording.durationMs);
          setStatus('recorded');
          recorderRef.current = null;
        },
        onError: () => setStatus('failed'),
      });
      setStatus('recording');
    } catch (error) {
      setStatus(isPermissionDeniedError(error) ? 'denied' : 'failed');
    }
  }

  function handleStop() {
    recorderRef.current?.stop();
  }

  function clearPreview() {
    if (audioUrl != null) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setDurationMs(0);
  }

  return (
    <main className={styles.page}>
      <section className={styles.panel} aria-labelledby="page-title">
        <header className={styles.header}>
          <p className={styles.kicker}>Recording PoC</p>
          <h1 id="page-title" className={styles.title}>말하는 운동기록</h1>
          <p className={styles.description}>운동 내용을 말로 남겨보세요.</p>
        </header>

        <div className={styles.status} data-status={status} aria-live="polite">
          <span className={styles.statusDot} aria-hidden="true" />
          <span>{getRecordingStatusText(status)}</span>
        </div>

        <div className={styles.actions}>
          <Button
            display="full"
            size="large"
            disabled={!canRequestRecording(status)}
            onClick={handleStart}
          >
            녹음 시작
          </Button>
          <Button display="full" size="large" disabled={status !== 'recording'} onClick={handleStop}>
            녹음 중지
          </Button>
        </div>

        {audioUrl == null ? null : (
          <section className={styles.preview} aria-labelledby="recording-preview-title">
            <h2 id="recording-preview-title" className={styles.previewTitle}>미리듣기</h2>
            <p className={styles.previewMeta}>{formatRecordingDuration(durationMs)}</p>
            <audio className={styles.audio} src={audioUrl} controls />
          </section>
        )}
      </section>
    </main>
  );
}
