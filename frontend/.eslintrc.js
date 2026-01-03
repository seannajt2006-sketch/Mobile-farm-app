module.exports = {
  env: {
    node: true,
  },
  extends: ["universe/native", "universe/shared/typescript-analysis"],
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: [
              "react-native-(?!safe-area-context|screens).*",
              "@react-native/*",
            ],
            message:
              "Avoid bare native modules; prefer Expo managed equivalents (expo-*) so it stays Expo Go friendly.",
          },
        ],
        paths: [
          { name: "react-native-fs", message: "Use expo-file-system instead." },
          {
            name: "react-native-contacts",
            message: "Use expo-contacts instead.",
          },
          {
            name: "react-native-device-info",
            message: "Use expo-device or expo-constants instead.",
          },
          {
            name: "react-native-image-picker",
            message: "Use expo-image-picker instead.",
          },
          {
            name: "react-native-push-notification",
            message: "Use expo-notifications instead.",
          },
          {
            name: "@react-native-firebase/app",
            message: "Use Expo config plugins/EAS or web SDK instead.",
          },
        ],
      },
    ],
  },
};
