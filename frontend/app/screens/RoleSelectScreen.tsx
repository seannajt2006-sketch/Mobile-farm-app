
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { postJson } from "../services/api";
import { User } from "../types/api";

import { RootStackParamList } from "../navigation/AppNavigator";

type AccountType = "buyer" | "seller" | "admin";

const HERO_IMAGE = require("../../assets/medias/onboard-screen.png");

const RoleSelectScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [accountType, setAccountType] = useState<AccountType>("buyer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const destinations = useMemo(
    () =>
      ({
        buyer: "BuyerHome",
        seller: "SellerDashboard",
        admin: "AdminDashboard",
      }) satisfies Record<AccountType, keyof RootStackParamList>,
    [],
  );

  const handleSubmit = async () => {
    setError(null);
    if (!email || !password || (mode === "signup" && !name)) {
      setError("Please fill all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/signup";
      const payload =
        mode === "login"
          ? { email, password }
          : { name, email, password, role: accountType };
      const user = (await postJson(endpoint, payload)) as User;
      const roleRoute = destinations[(user.role as AccountType) || accountType];
      navigation.navigate(roleRoute, { user });
    } catch (err) {
      setError((err as Error).message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.heroWrapper}>
            <ImageBackground
              source={HERO_IMAGE}
              resizeMode="cover"
              style={styles.heroImage}
              imageStyle={styles.heroImageStyle}
            >
              <View style={styles.heroOverlay} />
              <View style={styles.heroContent}>
                <View style={styles.logoBadge}>
                  <MaterialCommunityIcons name="leaf" size={28} color="#0f172a" />
                </View>
                <Text style={styles.heroTitle}>Farm Connect</Text>
                <Text style={styles.heroSubtitle}>
                  One place for buyers, sellers, and admins to sign in.
                </Text>
              </View>
            </ImageBackground>
          </View>

          <View style={styles.card}>
            <View style={styles.segmentRow}>
              <Pressable
                style={[styles.segment, mode === "login" && styles.segmentActive]}
                onPress={() => setMode("login")}
              >
                <Text
                  style={[
                    styles.segmentText,
                    mode === "login" && styles.segmentTextActive,
                  ]}
                >
                  Log in
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.segment,
                  mode === "signup" && styles.segmentActive,
                ]}
                onPress={() => setMode("signup")}
              >
                <Text
                  style={[
                    styles.segmentText,
                    mode === "signup" && styles.segmentTextActive,
                  ]}
                >
                  Sign up
                </Text>
              </Pressable>
            </View>

            {mode === "signup" ? (
              <TextInput
                style={styles.input}
                placeholder="Full name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                placeholderTextColor="#94a3b8"
                returnKeyType="next"
              />
            ) : null}

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#94a3b8"
              returnKeyType="next"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#94a3b8"
              returnKeyType="done"
            />

            <Text style={styles.label}>Account type</Text>
            <View style={styles.chipRow}>
              {["buyer", "seller", "admin"].map((type) => {
                const isActive = accountType === type;
                return (
                  <Pressable
                    key={type}
                    style={[styles.chip, isActive && styles.chipActive]}
                    onPress={() => setAccountType(type as AccountType)}
                  >
                    <Text
                      style={[styles.chipText, isActive && styles.chipTextActive]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable style={styles.submit} onPress={handleSubmit}>
              <Text style={styles.submitText}>
                {submitting
                  ? "Working..."
                  : mode === "login"
                    ? "Continue"
                    : "Create account"}
              </Text>
            </Pressable>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Text style={styles.note}>
              You will be redirected to the {accountType} workspace after{" "}
              {mode === "login" ? "login." : "sign up."}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 48,
    gap: 20,
  },
  heroWrapper: {
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  heroImage: {
    height: width > 420 ? 280 : 220,
    justifyContent: "flex-end",
  },
  heroImageStyle: {
    borderRadius: 24,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(34,197,94,0.18)",
  },
  heroContent: {
    padding: 20,
    gap: 10,
  },
  logoBadge: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#ffffff",
  },
  heroSubtitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#e5e7eb",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  segmentRow: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  segmentActive: {
    backgroundColor: "#16a34a",
  },
  segmentText: {
    fontWeight: "700",
    color: "#1e293b",
  },
  segmentTextActive: {
    color: "#ffffff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#0f172a",
    backgroundColor: "#ffffff",
  },
  label: {
    marginTop: 4,
    marginBottom: 4,
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
  },
  chipActive: {
    borderColor: "#16a34a",
    backgroundColor: "#e8f8ee",
  },
  chipText: {
    fontWeight: "600",
    color: "#0f172a",
  },
  chipTextActive: {
    color: "#0f5132",
  },
  submit: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#16a34a",
    alignItems: "center",
    shadowColor: "#16a34a",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  submitText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 16,
  },
  note: {
    textAlign: "center",
    color: "#475569",
    fontSize: 13,
  },
  error: {
    color: "#b91c1c",
    textAlign: "center",
    marginTop: 8,
    fontWeight: "600",
  },
});

export default RoleSelectScreen;
