'use client';

import { Button } from '@toss/tds-mobile';

import styles from './setup-ready-card.module.css';

const setupItems = [
  'Next.js static export',
  'AppsInToss WebView config',
  'TDS Mobile provider',
  'FSD base structure',
] as const;

export function SetupReadyCard() {
  return (
    <main className={styles.page}>
      <section className={styles.panel} aria-labelledby="page-title">
        <div className={styles.header}>
          <h1 id="page-title" className={styles.title}>
            말하는 운동기록
          </h1>
          <p className={styles.description}>WebView 앱 구조를 준비했습니다.</p>
        </div>

        <ul className={styles.statusList} aria-label="초기 설정 항목">
          {setupItems.map((item) => (
            <li key={item} className={styles.statusItem}>
              <span className={styles.dot} aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>

        <div className={styles.action}>
          <Button display="full" disabled>
            운동 기록 시작
          </Button>
          <p className={styles.caption}>다음 작업에서 로그인과 녹음 흐름을 연결합니다.</p>
        </div>
      </section>
    </main>
  );
}
