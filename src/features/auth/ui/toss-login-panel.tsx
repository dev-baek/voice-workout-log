'use client';

import { Button, TextField } from '@toss/tds-mobile';
import { useMemo, useState } from 'react';

import { postTossLoginAuthorizationCode } from '@/shared/api/toss-auth';

import { requestTossLogin } from '../lib/request-toss-login';
import { validateAuthServerUrl } from '../model/toss-login-flow';
import styles from './toss-login-panel.module.css';

type LoginStatus = 'idle' | 'loggingIn' | 'posting' | 'succeeded' | 'failed';

interface LoginResultView {
  title: string;
  detail: string;
  body?: string;
}

const initialAuthServerUrl = process.env.NEXT_PUBLIC_TOSS_AUTH_API_URL ?? '';

const statusText: Record<LoginStatus, string> = {
  idle: '로그인 대기 중',
  loggingIn: '토스 로그인 진행 중',
  posting: '인가 코드 전달 중',
  succeeded: '서버 전달 완료',
  failed: '서버 전달 실패',
};

export function TossLoginPanel() {
  const [authServerUrl, setAuthServerUrl] = useState(initialAuthServerUrl);
  const [status, setStatus] = useState<LoginStatus>('idle');
  const [resultView, setResultView] = useState<LoginResultView | null>(null);
  const urlValidation = useMemo(
    () => validateAuthServerUrl(authServerUrl),
    [authServerUrl],
  );
  const isBusy = status === 'loggingIn' || status === 'posting';

  async function handleLogin() {
    if (!urlValidation.ok) {
      setStatus('failed');
      setResultView({
        title: '인증 서버 URL 확인 필요',
        detail: urlValidation.reason,
      });
      return;
    }

    try {
      setStatus('loggingIn');
      setResultView(null);

      const loginResult = await requestTossLogin();

      setStatus('posting');

      const exchangeResult = await postTossLoginAuthorizationCode({
        endpoint: urlValidation.url,
        loginResult,
      });

      setStatus(exchangeResult.ok ? 'succeeded' : 'failed');
      setResultView({
        title: exchangeResult.ok ? '서버 전달 완료' : '서버 응답 확인 필요',
        detail: `HTTP ${exchangeResult.status}`,
        body: exchangeResult.body,
      });
    } catch (error) {
      setStatus('failed');
      setResultView({
        title: '토스 로그인 확인 필요',
        detail: getErrorMessage(error),
      });
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.panel} aria-labelledby="page-title">
        <div className={styles.header}>
          <p className={styles.kicker}>Toss Login PoC</p>
          <h1 id="page-title" className={styles.title}>
            말하는 운동기록
          </h1>
        </div>

        <div className={styles.form}>
          <TextField
            variant="box"
            label="인증 서버 URL"
            aria-label="인증 서버 URL"
            labelOption="sustain"
            placeholder="https://api.example.com/auth/toss/login"
            value={authServerUrl}
            onChange={(event) => setAuthServerUrl(event.target.value)}
            disabled={isBusy}
            hasError={authServerUrl.length > 0 && !urlValidation.ok}
            help={authServerUrl.length > 0 && !urlValidation.ok ? urlValidation.reason : null}
          />

          <Button
            display="full"
            size="large"
            onClick={handleLogin}
            disabled={isBusy}
          >
            {isBusy ? statusText[status] : '토스 로그인'}
          </Button>
        </div>

        <div className={styles.status} aria-live="polite">
          <span className={styles.statusDot} data-status={status} aria-hidden="true" />
          <span>{statusText[status]}</span>
        </div>

        {resultView == null ? null : (
          <section className={styles.result} aria-labelledby="login-result-title">
            <div className={styles.resultHeader}>
              <h2 id="login-result-title" className={styles.resultTitle}>
                {resultView.title}
              </h2>
              <p className={styles.resultDetail}>{resultView.detail}</p>
            </div>

            {resultView.body == null ? null : (
              <pre className={styles.resultBody}>{resultView.body}</pre>
            )}
          </section>
        )}
      </section>
    </main>
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }

  return '토스 앱 WebView 환경에서 다시 시도해 주세요.';
}
