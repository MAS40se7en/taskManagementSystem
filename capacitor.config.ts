import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.taskmanagement',
  appName: 'taskmanagement',
  webDir: 'build',
  server: {
    url: "http://192.168.0.195:5173/",
    cleartext: true
  }
};

export default config;
