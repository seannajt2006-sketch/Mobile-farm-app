import type { RouteProp } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

import { RootStackParamList } from "../navigation/AppNavigator";
import { postFormData } from "../services/api";

type AddProductRoute = RouteProp<RootStackParamList, "AddProduct">;

const AddProductScreen = () => {
  const { params } = useRoute<AddProductRoute>();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSave = () => {
    setError(null);
    setSuccess(null);
    if (!name || !price || !quantity || !category) {
      setError("Fill all required fields.");
      return;
    }
    const sellerId = params?.user?.id;
    if (!sellerId) {
      setError("Missing seller user context.");
      return;
    }
    setSubmitting(true);
    const form = new FormData();
    form.append("name", name);
    form.append("price", price);
    form.append("quantity", quantity);
    form.append("category", category);
    form.append("seller_id", String(sellerId));
    if (description) form.append("description", description);
    if (image) {
      const filename = image.fileName || image.uri.split("/").pop() || "upload.jpg";
      form.append("image", {
        uri: image.uri,
        name: filename,
        type: image.mimeType || "image/jpeg",
      } as unknown as Blob);
    }
    postFormData("/products", form)
      .then(() => {
        setSuccess("Product submitted (pending approval).");
        setName("");
        setPrice("");
        setQuantity("");
        setCategory("");
        setDescription("");
        setImage(null);
      })
      .catch((err) => setError((err as Error).message || "Failed to save"))
      .finally(() => setSubmitting(false));
  };

  const pickImage = async () => {
    setError(null);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== "granted") {
      setError("Permission to access gallery is required.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length) {
      setImage(result.assets[0]);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Add Product</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Price"
        value={price}
        onChangeText={setPrice}
      />
      <TextInput
        style={styles.input}
        placeholder="Quantity"
        value={quantity}
        onChangeText={setQuantity}
      />
      <TextInput
        style={styles.input}
        placeholder="Category"
        value={category}
        onChangeText={setCategory}
      />
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />
      <TouchableOpacity style={styles.upload} onPress={pickImage}>
        <Text style={styles.uploadText}>{image ? "Change Image" : "Upload Image"}</Text>
      </TouchableOpacity>
      {image ? <Text style={styles.attachment}>Attached: {image.fileName || image.uri.split("/").pop()}</Text> : null}
      <TouchableOpacity style={styles.save} onPress={handleSave}>
        <Text style={styles.saveText}>
          {submitting ? "Saving..." : "Save Product"}
        </Text>
      </TouchableOpacity>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },
  content: {
    padding: 16,
    paddingTop: 48,
    gap: 12,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1f36",
    marginBottom: 8,
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
  save: {
    backgroundColor: "#1f6feb",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontWeight: "700",
  },
  error: {
    marginTop: 8,
    color: "#b91c1c",
    fontWeight: "600",
  },
  success: {
    marginTop: 8,
    color: "#15803d",
    fontWeight: "600",
  },
});

export default AddProductScreen;
