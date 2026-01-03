import type { RouteProp } from "@react-navigation/native";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { RootStackParamList } from "../navigation/AppNavigator";
import { del, get, postJson } from "../services/api";
import { Product } from "../types/api";

type AdminRoute = RouteProp<RootStackParamList, "AdminDashboard">;

const AdminDashboardScreen = () => {
  const { params } = useRoute<AdminRoute>();
  const navigation = useNavigation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [actionLoading, setActionLoading] = useState(false);

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

  const metrics = useMemo(() => {
    const total = products.length;
    const approved = products.filter((p) => p.status === "approved").length;
    const blocked = products.filter((p) => p.status === "blocked").length;
    const pendingCount = products.filter((p) => p.status === "pending").length;
    return { total, approved, blocked, pending: pendingCount };
  }, [products]);

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());

  const selectAllPending = () => {
    if (selected.size === products.length) {
      clearSelection();
    } else {
      setSelected(new Set(products.map((p) => p.id)));
    }
  };

  const updateStatus = async (ids: number[], status: "approved" | "blocked" | "pending") => {
    if (!ids.length) return;
    setActionLoading(true);
    try {
      await postJson("/products/bulk/status", { ids, status });
      await load();
      clearSelection();
    } catch (err) {
      console.warn("status update failed", err);
    } finally {
      setActionLoading(false);
    }
  };

  const deleteProducts = async (ids: number[]) => {
    if (!ids.length) return;
    setActionLoading(true);
    try {
      if (ids.length === 1) {
        await del(`/products/${ids[0]}`);
      } else {
        await postJson("/products/bulk/delete", { ids });
      }
      await load();
      clearSelection();
    } catch (err) {
      console.warn("delete failed", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    navigation.reset({ index: 0, routes: [{ name: "Auth" as never }] });
  };

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.heroLeft}>
          <Text style={styles.kicker}>Admin Control</Text>
          <Text style={styles.heading}>Welcome back, {params?.user?.name || "Admin"}</Text>
          <Text style={styles.subheading}>Manage marketplace inventory without approval steps.</Text>
          <View style={styles.pillsRow}>
            <View style={[styles.pill, styles.pillSuccess]}>
              <Text style={styles.pillText}>Approved {metrics.approved}</Text>
            </View>
            <View style={[styles.pill, styles.pillPending]}>
              <Text style={styles.pillText}>Pending {metrics.pending}</Text>
            </View>
            <View style={[styles.pill, styles.pillMuted]}>
              <Text style={styles.pillText}>Blocked {metrics.blocked}</Text>
            </View>
          </View>
        </View>
        <View style={styles.avatarBlock}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>{(params?.user?.name || "A").slice(0, 1).toUpperCase()}</Text>
          </View>
          <Text style={styles.avatarEmail}>{params?.user?.email || "admin"}</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bulkRow}>
        <View style={styles.bulkActions}>
          <TouchableOpacity
            style={[styles.bulkButton, styles.bulkApprove, selected.size === 0 && styles.bulkDisabled]}
            onPress={() => updateStatus(Array.from(selected), "pending")}
            disabled={actionLoading || selected.size === 0}
          >
            <Text style={styles.bulkText}>Mark Pending</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.bulkButton, styles.bulkBlock, selected.size === 0 && styles.bulkDisabled]}
            onPress={() => updateStatus(Array.from(selected), "blocked")}
            disabled={actionLoading || selected.size === 0}
          >
            <Text style={styles.bulkText}>Block</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.bulkButton, styles.bulkDelete, selected.size === 0 && styles.bulkDisabled]}
            onPress={() => deleteProducts(Array.from(selected))}
            disabled={actionLoading || selected.size === 0}
          >
            <Text style={styles.bulkText}>Delete</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bulkLeft}>
          <TouchableOpacity style={styles.checkboxRow} onPress={selectAllPending}>
            <View style={[styles.checkbox, selected.size === products.length && products.length > 0 && styles.checkboxChecked]}>
              {selected.size === products.length && products.length > 0 ? <Text style={styles.checkboxTick}>✓</Text> : null}
            </View>
            <Text style={styles.checkboxLabel}>Select all ({products.length})</Text>
          </TouchableOpacity>
          <Text style={styles.sectionTitle}>All products</Text>
        </View>
      </View>
      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({ item }) => {
          const isSelected = selected.has(item.id ?? -1);
          return (
            <View style={[styles.card, isSelected && styles.cardSelected]}>
              <View style={styles.cardHeader}>
                <TouchableOpacity onPress={() => toggleSelect(item.id)} style={styles.checkbox}>
                  {isSelected ? <Text style={styles.checkboxTick}>✓</Text> : null}
                </TouchableOpacity>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <View style={[styles.statusPill, statusPillStyle(item.status)]}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>
              <Text style={styles.cardMeta}>Seller #{item.seller_id}</Text>
              <Text style={styles.cardMeta}>Price: ${item.price}</Text>
              <Text style={styles.cardDescription} numberOfLines={2}>
                {item.description || "No description provided."}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={!loading ? (
          <Text style={styles.empty}>No products.</Text>
        ) : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
    paddingHorizontal: 16,
    paddingTop: 36,
  },
  hero: {
    backgroundColor: "#0f172a",
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
  },
  heroLeft: {
    flex: 1,
    gap: 6,
  },
  kicker: {
    color: "#a5f3fc",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: "#f8fafc",
  },
  subheading: {
    color: "#cbd5e1",
    fontSize: 14,
  },
  pillsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  pillSuccess: {
    backgroundColor: "rgba(34,197,94,0.15)",
  },
  pillPending: {
    backgroundColor: "rgba(250,204,21,0.2)",
  },
  pillMuted: {
    backgroundColor: "rgba(148,163,184,0.2)",
  },
  pillText: {
    color: "#e2e8f0",
    fontWeight: "700",
  },
  avatarBlock: {
    alignItems: "flex-end",
    gap: 6,
    alignSelf: "flex-start",
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    color: "#0f172a",
    fontWeight: "800",
    fontSize: 18,
  },
  avatarEmail: {
    color: "#cbd5e1",
    fontSize: 12,
  },
  logoutButton: {
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#ef4444",
  },
  logoutText: {
    color: "#fff",
    fontWeight: "700",
  },
  sectionTitle: {
    marginTop: 18,
    marginBottom: 6,
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  list: {
    gap: 12,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  cardMeta: {
    marginTop: 4,
    fontSize: 13,
    color: "#6b7280",
  },
  cardDescription: {
    marginTop: 6,
    fontSize: 13,
    color: "#374151",
  },
  actions: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  approve: {
    backgroundColor: "#22c55e",
  },
  block: {
    backgroundColor: "#ef4444",
  },
  delete: {
    backgroundColor: "#0f172a",
  },
  actionText: {
    color: "#fff",
    fontWeight: "700",
  },
  statusPill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  statusPending: {
    backgroundColor: "rgba(250,204,21,0.2)",
  },
  statusText: {
    color: "#854d0e",
    fontWeight: "700",
    fontSize: 12,
  },
  empty: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 20,
  },
  bulkRow: {
    marginTop: 18,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  bulkActions: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  bulkLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bulkButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  bulkApprove: {
    backgroundColor: "#16a34a",
  },
  bulkBlock: {
    backgroundColor: "#f59e0b",
  },
  bulkDelete: {
    backgroundColor: "#0f172a",
  },
  bulkText: {
    color: "#fff",
    fontWeight: "700",
  },
  bulkDisabled: {
    opacity: 0.4,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: "#16a34a",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    backgroundColor: "#fff",
  },
  checkboxChecked: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },
  checkboxTick: {
    color: "#0f172a",
    fontWeight: "800",
    fontSize: 14,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  checkboxLabel: {
    color: "#0f172a",
    fontWeight: "700",
    fontSize: 13,
  },
});

const statusPillStyle = (status: Product["status"]) => {
  switch (status) {
    case "approved":
      return { backgroundColor: "rgba(34,197,94,0.2)" };
    case "blocked":
      return { backgroundColor: "rgba(239,68,68,0.2)" };
    default:
      return { backgroundColor: "rgba(250,204,21,0.2)" };
  }
};

export default AdminDashboardScreen;
