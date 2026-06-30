export type RecordingStatus =
  | 'idle'
  | 'unsupported'
  | 'requestingPermission'
  | 'recording'
  | 'recorded'
  | 'denied'
  | 'failed';

export const MAX_RECORDING_DURATION_MS = 120_000;

const statusText: Record<RecordingStatus, string> = {
  idle: '녹음 대기 중',
  unsupported: '녹음을 지원하지 않는 환경입니다.',
  requestingPermission: '마이크 권한을 요청하는 중',
  recording: '녹음 중',
  recorded: '녹음 완료',
  denied: '마이크 권한이 거부되었습니다.',
  failed: '녹음 요청에 실패했습니다.',
};

export function getRecordingStatusText(status: RecordingStatus) {
  return statusText[status];
}

export function canRequestRecording(status: RecordingStatus) {
  return status === 'idle' || status === 'recorded';
}

export function selectAudioMimeType(isSupported: (mimeType: string) => boolean) {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/mpeg',
    'audio/wav',
  ];

  return candidates.find(isSupported) ?? '';
}

export function formatRecordingDuration(durationMs: number) {
  return `${(Math.max(0, durationMs) / 1000).toFixed(1)}초`;
}

export function formatAudioFileSize(sizeBytes: number) {
  const safeSize = Math.max(0, sizeBytes);

  if (safeSize < 1024) {
    return `${safeSize} B`;
  }

  if (safeSize < 1024 * 1024) {
    return `${(safeSize / 1024).toFixed(1)} KB`;
  }

  return `${(safeSize / 1024 / 1024).toFixed(1)} MB`;
}
