import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.taskmanagement',
  appName: 'taskmanagement',
  webDir: '.vercel/output/static',
  server: {
    url: "task-management-system-steel.vercel.app",
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
