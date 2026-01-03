export type UserRole = "buyer" | "seller" | "admin";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
  location?: string;
  description?: string;
  image_url?: string;
  seller_id: number;
  status: "pending" | "approved" | "blocked";
}

export interface OrderRequest {
  id: string;
  product_id: string;
  buyer_id: string;
  status: "pending" | "accepted" | "rejected";
}
