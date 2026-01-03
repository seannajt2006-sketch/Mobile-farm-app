import type { RouteProp } from "@react-navigation/native";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
} from "react-native";

import { RootStackParamList } from "../navigation/AppNavigator";
import { get } from "../services/api";
import { Product } from "../types/api";

type BuyerRoute = RouteProp<RootStackParamList, "BuyerHome">;

const BuyerHomeScreen = () => {
  const navigation = useNavigation();
  const { params } = useRoute<BuyerRoute>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");

  const load = async () => {
    setLoading(true);
    try {
      const data = (await get("/products")) as Product[];
      setProducts(data);
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const categories = useMemo(() => {
    const uniq = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    return ["All", ...uniq];
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = category === "All" || p.category === category;
      const needle = search.trim().toLowerCase();
      if (!needle) return matchesCategory;
      return matchesCategory && (p.name.toLowerCase().includes(needle) || (p.description || "").toLowerCase().includes(needle));
    });
  }, [products, search, category]);

  const renderHeader = () => (
    <View style={styles.headerArea}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.kicker}>Fresh from local farms</Text>
          <Text style={styles.heading}>Hey {params?.user?.name || "Buyer"}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.reset({ index: 0, routes: [{ name: "Auth" as never }] })}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products or farms"
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <FlatList
        data={categories}
        keyExtractor={(item) => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
        renderItem={({ item }) => {
          const isActive = item === category;
          return (
            <TouchableOpacity
              style={[styles.chip, isActive ? styles.chipActive : styles.chipIdle]}
              onPress={() => setCategory(item)}
            >
              <Text style={[styles.chipText, isActive ? styles.chipTextActive : styles.chipTextIdle]}>{item}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );

  const renderCard = ({ item }: { item: Product }) => {
    const imageSource = { uri: item.image_url || "https://images.unsplash.com/photo-1447175008436-054170c2e979?auto=format&fit=crop&w=800&q=80" };
    return (
      <View style={styles.card}>
        <ImageBackground
          source={imageSource}
          style={styles.cardImage}
          imageStyle={styles.cardImageInner}
          resizeMode="cover"
        >
          <View style={styles.priceTag}>
            <Text style={styles.priceText}>${item.price}</Text>
          </View>
        </ImageBackground>
        <View style={styles.cardBody}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.badge}>{item.category}</Text>
          </View>
          <Text style={styles.cardMeta}>Qty: {item.quantity}</Text>
          {item.location ? <Text style={styles.cardMeta}>{item.location}</Text> : null}
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.description || "Fresh produce available now."}
          </Text>
          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.9}>
            <Text style={styles.primaryButtonText}>Request</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={renderCard}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No products yet.</Text> : null}
        ListFooterComponent={loading ? <ActivityIndicator style={{ marginVertical: 12 }} /> : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
    paddingTop: 12,
  },
  list: {
    gap: 14,
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  headerArea: {
    gap: 12,
    paddingHorizontal: 0,
    paddingTop: 20,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  kicker: {
    color: "#16a34a",
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  heading: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
    marginTop: 2,
  },
  searchBox: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  searchInput: {
    fontSize: 14,
    color: "#0f172a",
  },
  chipsRow: {
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: "#16a34a",
    borderColor: "#16a34a",
  },
  chipIdle: {
    backgroundColor: "#fff",
    borderColor: "#e2e8f0",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "700",
  },
  chipTextActive: {
    color: "#fff",
  },
  chipTextIdle: {
    color: "#0f172a",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  cardImage: {
    width: "100%",
    aspectRatio: 4 / 3,
    backgroundColor: "#e5e7eb",
  },
  cardImageInner: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  priceTag: {
    position: "absolute",
    right: 10,
    top: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  priceText: {
    fontWeight: "800",
    color: "#0f172a",
  },
  cardBody: {
    padding: 14,
    gap: 6,
  },
  cardTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    flex: 1,
  },
  badge: {
    backgroundColor: "#e0f2fe",
    color: "#0369a1",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 11,
    fontWeight: "700",
  },
  cardMeta: {
    fontSize: 12,
    color: "#475569",
  },
  cardDescription: {
    fontSize: 13,
    color: "#334155",
  },
  primaryButton: {
    marginTop: 6,
    backgroundColor: "#16a34a",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "800",
  },
  logoutButton: {
    backgroundColor: "#e11d48",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "700",
  },
  empty: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 20,
  },
});

export default BuyerHomeScreen;
