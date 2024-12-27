import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.taskmanagement',
  appName: 'taskmanagement',
  webDir: '.vercel/output/static',
  server: {
    url: "https://task-management-system-steel.vercel.app/",
    cleartext: true,
    androidScheme: 'https',
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    App: {
      URL: true
    }
  },
};

export default config;
