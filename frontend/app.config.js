export default {
  expo: {
    name: "FarmConnect",
    slug: "farmconnect",
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
    },
  },
};
