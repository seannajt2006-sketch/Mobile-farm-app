export default {
  expo: {
    name: "FarmConnect",
    slug: "farmconnect",
    owner: "zibot",
    version: "0.1.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    splash: {
      image: "./assets/icon.png",
      resizeMode: "contain",
      backgroundColor: "#f6f7fb",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
    },
    android: {
      package: "com.zibot.farmconnect",
      adaptiveIcon: {
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#f6f7fb",
      },
    },
    web: {
      bundler: "metro",
    },
    extra: {
      apiBaseUrl:
        process.env.EXPO_PUBLIC_API_BASE_URL || "https://mobile-farm-app.onrender.com/api/v1",
      eas: {
        projectId: "4d8afbb6-ac64-4706-a6c7-55c33a1bac91",
      },
    },
  },
};
