import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.taskmanagement',
  appName: 'taskmanagement',
  webDir: 'build',
  server: {
    url: "https://b31e-89-135-5-39.ngrok-free.app/",
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
