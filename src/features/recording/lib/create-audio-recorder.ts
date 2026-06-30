import { MAX_RECORDING_DURATION_MS, selectAudioMimeType } from '../model/recording-state';

export interface AudioRecording {
  blob: Blob;
  durationMs: number;
  mimeType: string;
}

export interface AudioRecorderSession {
  stop: () => void;
  cancel: () => void;
}

interface CreateAudioRecorderOptions {
  onComplete: (recording: AudioRecording) => void;
  onError: (error: unknown) => void;
}

export async function createAudioRecorder({
  onComplete,
  onError,
}: CreateAudioRecorderOptions): Promise<AudioRecorderSession> {
  assertRecordingSupport();

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const chunks: Blob[] = [];
  const mimeType = selectAudioMimeType(MediaRecorder.isTypeSupported.bind(MediaRecorder));
  const recorder = new MediaRecorder(stream, mimeType.length > 0 ? { mimeType } : undefined);
  const startedAt = Date.now();
  const timeoutId = window.setTimeout(() => {
    if (recorder.state !== 'inactive') recorder.stop();
  }, MAX_RECORDING_DURATION_MS);

  recorder.addEventListener('dataavailable', (event) => {
    if (event.data.size > 0) {
      chunks.push(event.data);
    }
  });

  recorder.addEventListener('stop', () => {
    window.clearTimeout(timeoutId);
    stopStream(stream);
    onComplete({
      blob: new Blob(chunks, { type: recorder.mimeType || mimeType || 'audio/webm' }),
      durationMs: Date.now() - startedAt,
      mimeType: recorder.mimeType || mimeType || 'audio/webm',
    });
  });

  recorder.addEventListener('error', (event) => {
    window.clearTimeout(timeoutId);
    stopStream(stream);
    onError(event);
  });

  recorder.start();

  return {
    stop: () => {
      if (recorder.state !== 'inactive') {
        recorder.stop();
      }
    },
    cancel: () => {
      if (recorder.state !== 'inactive') {
        recorder.stop();
      }

      stopStream(stream);
    },
  };
}

export function isPermissionDeniedError(error: unknown) {
  return error instanceof DOMException && error.name === 'NotAllowedError';
}

export function isRecordingSupported() {
  return typeof navigator !== 'undefined'
    && navigator.mediaDevices?.getUserMedia != null
    && typeof MediaRecorder !== 'undefined';
}

function assertRecordingSupport() {
  if (!isRecordingSupported()) {
    throw new Error('Recording is not supported in this browser.');
  }
}

function stopStream(stream: MediaStream) {
  for (const track of stream.getTracks()) {
    track.stop();
  }
}
