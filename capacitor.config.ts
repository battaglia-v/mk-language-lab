import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.macedonian.learn',
  appName: 'Macedonian Learning',
  webDir: 'out',
  server: {
    // Load from production Vercel deployment
    // This maintains all server-side features (auth, API routes, database)
    url: 'https://mk-language-lab.vercel.app',
    cleartext: true,
  },
};

export default config;
