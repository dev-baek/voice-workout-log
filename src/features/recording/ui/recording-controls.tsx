import {
  canRequestRecording,
  formatRecordingDuration,
  getRecordingStatusText,
  type RecordingStatus,
} from '../model/recording-state';
import { MicIcon, StopIcon } from './recording-icons';
import styles from './recording-controls.module.css';

interface RecordingControlsProps {
  status: RecordingStatus;
  audioUrl: string | null;
  durationMs: number;
  onStart: () => void;
  onStop: () => void;
}

export function RecordingControls({
  status,
  audioUrl,
  durationMs,
  onStart,
  onStop,
}: RecordingControlsProps) {
  return (
    <section className={styles.panel} aria-labelledby="recording-title">
      <div className={styles.micFrame} data-status={status}>
        <MicIcon />
      </div>

      <div className={styles.status} aria-live="polite">
        <h2 id="recording-title" className={styles.statusTitle}>
          {getRecordingStatusText(status)}
        </h2>
        <p className={styles.statusText}>운동명, 무게, 횟수, 세트 수를 자연스럽게 말해보세요.</p>
      </div>

      <div className={styles.actions}>
        <button className={styles.primaryButton} disabled={!canRequestRecording(status)} onClick={onStart}>
          <MicIcon />
          <span>녹음 시작</span>
        </button>
        <button className={styles.secondaryButton} disabled={status !== 'recording'} onClick={onStop}>
          <StopIcon />
          <span>녹음 중지</span>
        </button>
      </div>

      {audioUrl == null ? null : (
        <div className={styles.preview}>
          <div className={styles.previewMeta}>
            <span>방금 녹음</span>
            <strong>{formatRecordingDuration(durationMs)}</strong>
          </div>
          <audio className={styles.audio} src={audioUrl} controls />
        </div>
      )}
    </section>
  );
}
