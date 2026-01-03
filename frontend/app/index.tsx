import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useMemo, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import AppNavigator from "./navigation/AppNavigator";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  useEffect(() => {
    const timer = setTimeout(async () => {
      setShowSplash(false);
      await SplashScreen.hideAsync();
    }, 1400);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" backgroundColor="#f6f7fb" />
        <View style={styles.splash}>
          <Text style={styles.splashTitle}>FarmConnect</Text>
          <Text style={styles.splashSubtitle}>Connecting buyers and sellers</Text>
          <Dots />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor="#ffffff" />
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const Dots = () => {
  const anims = useMemo(() => [0, 1, 2].map(() => new Animated.Value(0.2)), []);
  useEffect(() => {
    const loops = anims.map((val, idx) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(idx * 160),
          Animated.timing(val, {
            toValue: 1,
            duration: 320,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: 0.2,
            duration: 320,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [anims]);

  return (
    <View style={styles.dotsRow}>
      {anims.map((val, idx) => (
        <Animated.View key={idx} style={[styles.dot, { opacity: val }]} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: "#f6f7fb",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  splashTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0f172a",
  },
  splashSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  dotsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#16a34a",
  },
});
