import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'voice-workout-log',
  brand: {
    displayName: '말하는 운동기록',
    primaryColor: '#0057FF',
    icon: '',
  },
  web: {
    host: 'localhost',
    port: 3000,
    commands: {
      dev: 'next dev',
      build: 'next build',
    },
  },
  webViewProps: {
    bounces: true,
    pullToRefreshEnabled: true,
    overScrollMode: 'never',
    mediaPlaybackRequiresUserAction: true,
    allowsBackForwardNavigationGestures: false,
  },
  permissions: [],
  outdir: 'out',
});
