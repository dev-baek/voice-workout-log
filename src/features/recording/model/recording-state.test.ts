import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  canRequestRecording,
  formatRecordingDuration,
  getRecordingStatusText,
  selectAudioMimeType,
  type RecordingStatus,
} from './recording-state';

describe('getRecordingStatusText', () => {
  it('returns user-facing text for each recording status', () => {
    const cases: Array<[RecordingStatus, string]> = [
      ['idle', '녹음 대기 중'],
      ['unsupported', '녹음을 지원하지 않는 환경입니다.'],
      ['requestingPermission', '마이크 권한을 요청하는 중'],
      ['recording', '녹음 중'],
      ['recorded', '녹음 완료'],
      ['denied', '마이크 권한이 거부되었습니다.'],
      ['failed', '녹음 요청에 실패했습니다.'],
    ];

    for (const [status, text] of cases) {
      assert.equal(getRecordingStatusText(status), text);
    }
  });
});

describe('canRequestRecording', () => {
  it('allows a new recording only while idle or after a completed recording', () => {
    assert.equal(canRequestRecording('idle'), true);
    assert.equal(canRequestRecording('recorded'), true);
    assert.equal(canRequestRecording('recording'), false);
    assert.equal(canRequestRecording('requestingPermission'), false);
    assert.equal(canRequestRecording('unsupported'), false);
  });
});

describe('selectAudioMimeType', () => {
  it('uses the first browser-supported audio mime type', () => {
    const mimeType = selectAudioMimeType((candidate) => candidate === 'audio/webm');

    assert.equal(mimeType, 'audio/webm');
  });

  it('falls back to an empty string when no candidate is supported', () => {
    assert.equal(selectAudioMimeType(() => false), '');
  });
});

describe('formatRecordingDuration', () => {
  it('formats milliseconds as seconds with one decimal place', () => {
    assert.equal(formatRecordingDuration(0), '0.0초');
    assert.equal(formatRecordingDuration(1540), '1.5초');
    assert.equal(formatRecordingDuration(12690), '12.7초');
  });
});
