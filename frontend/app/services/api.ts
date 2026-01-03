import Constants from "expo-constants";

// Prefer Expo managed config over process.env for Expo Go compatibility.
const API_BASE_URL =
  Constants.expoConfig?.extra?.apiBaseUrl || "http://localhost:8000/api/v1";

const handle = async (res: Response) => {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
};

export const get = async (path: string) => handle(await fetch(`${API_BASE_URL}${path}`));

export const postJson = async (path: string, body: unknown) => {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handle(res);
};

export const postFormData = async (path: string, form: FormData) => {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    body: form,
  });
  return handle(res);
};

export const del = async (path: string) => handle(await fetch(`${API_BASE_URL}${path}`, { method: "DELETE" }));

export const patchFormData = async (path: string, form: FormData) => {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "PATCH",
    body: form,
  });
  return handle(res);
};
