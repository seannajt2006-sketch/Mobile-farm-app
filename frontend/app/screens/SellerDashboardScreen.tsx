import type { RouteProp } from "@react-navigation/native";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Modal,
  TextInput,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

import { RootStackParamList } from "../navigation/AppNavigator";
import { get, patchFormData } from "../services/api";
import { Product } from "../types/api";

type SellerRoute = RouteProp<RootStackParamList, "SellerDashboard">;

const SellerDashboardScreen = () => {
  const navigation = useNavigation();
  const { params } = useRoute<SellerRoute>();
  const [listings, setListings] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImage, setEditImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = (await get("/products")) as Product[];
      if (params?.user?.id) {
        setListings(data.filter((p) => p.seller_id === params.user.id));
      } else {
        setListings(data);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openEdit = (product: Product) => {
    setEditing(product);
    setEditName(product.name);
    setEditPrice(String(product.price));
    setEditQuantity(String(product.quantity));
    setEditCategory(product.category);
    setEditDescription(product.description || "");
    setEditImage(null);
  };

  const pickEditImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== "granted") return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length) {
      setEditImage(result.assets[0]);
    }
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const form = new FormData();
      form.append("name", editName);
      form.append("price", editPrice);
      form.append("quantity", editQuantity);
      form.append("category", editCategory);
      if (editDescription) form.append("description", editDescription);
      if (editImage) {
        const filename = editImage.fileName || editImage.uri.split("/").pop() || "upload.jpg";
        form.append("image", {
          uri: editImage.uri,
          name: filename,
          type: editImage.mimeType || "image/jpeg",
        } as unknown as Blob);
      }
      await patchFormData(`/products/${editing.id}/form`, form);
      await load();
      setEditing(null);
    } catch (err) {
      console.warn("edit failed", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Hi {params?.user?.name || "Seller"}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.cta}
            onPress={() => navigation.navigate("AddProduct", { user: params.user })}
          >
            <Text style={styles.ctaText}>+ Add Product</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => navigation.reset({ index: 0, routes: [{ name: "Auth" as never }] })}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={listings}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => openEdit(item)}>
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <View style={[styles.badge, badgeStyle(item.status)]}>
                <Text style={styles.badgeText}>{item.status}</Text>
              </View>
            </View>
            <Text style={styles.cardMeta}>Price: ${item.price}</Text>
            <Text style={styles.cardMeta}>Qty: {item.quantity}</Text>
            {item.image_url ? <Text style={styles.cardMeta}>Image: attached</Text> : null}
          </TouchableOpacity>
        )}
        ListEmptyComponent={!loading ? (
          <Text style={styles.empty}>No listings yet.</Text>
        ) : null}
      />

      <Modal visible={!!editing} animationType="slide" onRequestClose={() => setEditing(null)}>
        <ScrollView style={styles.modalContainer} contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalHeading}>Edit Product</Text>
          <TextInput style={styles.input} value={editName} onChangeText={setEditName} placeholder="Name" />
          <TextInput style={styles.input} value={editPrice} onChangeText={setEditPrice} placeholder="Price" />
          <TextInput style={styles.input} value={editQuantity} onChangeText={setEditQuantity} placeholder="Quantity" />
          <TextInput style={styles.input} value={editCategory} onChangeText={setEditCategory} placeholder="Category" />
          <TextInput
            style={[styles.input, styles.multiline]}
            value={editDescription}
            onChangeText={setEditDescription}
            placeholder="Description"
            multiline
            numberOfLines={4}
          />
          <TouchableOpacity style={styles.upload} onPress={pickEditImage}>
            <Text style={styles.uploadText}>{editImage ? "Change Image" : "Add/Replace Image"}</Text>
          </TouchableOpacity>
          {editImage ? <Text style={styles.attachment}>Attached: {editImage.fileName || editImage.uri.split("/").pop()}</Text> : null}
          <TouchableOpacity style={styles.save} onPress={saveEdit} disabled={saving}>
            <Text style={styles.saveText}>{saving ? "Saving..." : "Save"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancel} onPress={() => setEditing(null)}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
    paddingHorizontal: 16,
    paddingTop: 48,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 10,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1f36",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cta: {
    backgroundColor: "#1f6feb",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  ctaText: {
    color: "#fff",
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "#e11d48",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "700",
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
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  badgeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  cardStatus: {
    marginTop: 6,
    fontSize: 13,
    color: "#6b7280",
  },
  cardMeta: {
    marginTop: 6,
    fontSize: 13,
    color: "#6b7280",
  },
  empty: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  modalContent: {
    padding: 16,
    paddingTop: 48,
    gap: 12,
  },
  modalHeading: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  multiline: {
    height: 120,
    textAlignVertical: "top",
  },
  upload: {
    backgroundColor: "#e0ecff",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  uploadText: {
    color: "#1f6feb",
    fontWeight: "600",
  },
  attachment: {
    fontSize: 12,
    color: "#475569",
  },
  save: {
    backgroundColor: "#16a34a",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontWeight: "700",
  },
  cancel: {
    backgroundColor: "#e2e8f0",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelText: {
    color: "#0f172a",
    fontWeight: "700",
  },
});

const badgeStyle = (status: Product["status"]) => {
  switch (status) {
    case "approved":
      return { backgroundColor: "#16a34a" };
    case "blocked":
      return { backgroundColor: "#ef4444" };
    default:
      return { backgroundColor: "#f59e0b" };
  }
};

export default SellerDashboardScreen;
