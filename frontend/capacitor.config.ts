import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'report.and.alert',
  appName: 'ReportAndAlert',
  webDir: 'www',
  bundledWebRuntime: false,

  plugins: {
    "GoogleAuth": {
      "scopes": ["profile", "email"],
      "serverClientId": "535184365642-t11qghb7passebgfniich7mlb20lbrrg.apps.googleusercontent.com",
      "forceCodeForRefreshToken": true
    }
  }
};

export default config;
