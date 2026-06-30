'use client';

import { useEffect, useRef, useState } from 'react';

import { createAudioRecorder, isPermissionDeniedError, isRecordingSupported, type AudioRecorderSession } from '../lib/create-audio-recorder';
import type { RecordingStatus } from '../model/recording-state';
import { RecordingControls } from './recording-controls';
import styles from './recording-panel.module.css';
import { WorkoutDashboard } from './workout-dashboard';

export function RecordingPanel() {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState(0);
  const [mimeType, setMimeType] = useState('');
  const [sizeBytes, setSizeBytes] = useState(0);
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
          setMimeType(recording.mimeType);
          setSizeBytes(recording.blob.size);
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
    setMimeType('');
    setSizeBytes(0);
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <h1 className={styles.title}>말하는 운동기록</h1>
          <p className={styles.description}>오늘 운동을 말로 남겨보세요.</p>
        </header>

        <div className={styles.sectionStack}>
          <RecordingControls
            status={status}
            audioUrl={audioUrl}
            durationMs={durationMs}
            mimeType={mimeType}
            sizeBytes={sizeBytes}
            onStart={handleStart}
            onStop={handleStop}
          />
          <WorkoutDashboard />
        </div>
      </div>
    </main>
  );
}
