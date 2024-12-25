import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.taskmanagement',
  appName: 'taskmanagement',
  webDir: '.vercel/output/static',
  server: {
    url: "https://task-management-system-steel.vercel.app/",
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    App: {
      handleUrlOpen: true
    },
    GoogleAuth: {
      scopes: ["profile", "email", "https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/calendar.events"],
      serverClientId: `${process.env.CLIENT_ID}`,
      forceCodeForRefreshToken: true
    }
  },
};

export default config;
