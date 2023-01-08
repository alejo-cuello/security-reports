import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'report.and.alert',
  appName: 'ReportAndAlert',
  webDir: 'www',
  bundledWebRuntime: false,

  plugins: {
    "GoogleAuth": {
      "scopes": ["profile", "email"],
      "serverClientId": "1039828588026-8bjp810m3iqeh1gn78mora1ec6rl1s88.apps.googleusercontent.com",
      "forceCodeForRefreshToken": true
    }
  }
};

export default config;
