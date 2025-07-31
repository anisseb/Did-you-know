import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "DidYouKnow",
  slug: "DidYouKnow",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/logo.png",
  scheme: "didyouknow",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.anisse3000.didyouknow"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/logo.png",
      backgroundColor: "#15061e"
    },
    edgeToEdgeEnabled: true,
    package: "com.anisse3000.didyouknow"
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png"
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        enableFullScreenImage_legacy: true,
        resizeMode: "contain",
        ios: {
          backgroundColor: "#15061e",
          image: "./assets/images/splash_icon.png"
        },
        android: {
          backgroundColor: "#15061e",
          image: "./assets/images/logo.png",
          imageWidth: 195
        }
      }
    ],
    [
      "react-native-google-mobile-ads",
      {
        androidAppId: process.env.EXPO_PUBLIC_ADS_ANDROID_FR || "",
        iosAppId: process.env.EXPO_PUBLIC_ADS_IOS_FR || ""
      }
    ],
    [
      "expo-build-properties",
      {
        ios: {
          deploymentTarget: "14.0"
        }
      }
    ]
  ],
  experiments: {
    typedRoutes: true
  },
  extra: {
    router: {},
    eas: {
      projectId: "84ef8bc3-3235-4953-9d55-da7277c1bdba"
    },
    EXPO_PUBLIC_REVENUECAT_API_KEY_IOS: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS || "",
    EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID || ""
  }
}); 