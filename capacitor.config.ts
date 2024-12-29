import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.taskmanagement',
  appName: 'taskmanagement',
  webDir: '.vercel/output/static',
  server: {
    url: "http://192.168.1.114:5173/",
    cleartext: true,
    androidScheme: 'https',
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    App: {
      URL: true
    },
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ["google.com"]
    }
  },
};

export default config;
