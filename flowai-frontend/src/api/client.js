import { getAccessToken } from "../utils/storage";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://192.168.100.148:8000";

function formatQueryString(params) {
  if (!params || Object.keys(params).length === 0) return "";
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== "") {
      query.append(key, String(value));
    }
  }
  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

async function apiRequest(path, options = {}) {
  let url = `${API_BASE_URL}${path}`;
  if (options.params) {
    url += formatQueryString(options.params);
  }

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  // If no auth header passed explicitly, attempt to get saved access token
  if (!headers.Authorization && !headers.authorization) {
    try {
      const savedToken = await getAccessToken();
      if (savedToken) {
        headers.Authorization = `Bearer ${savedToken}`;
      }
    } catch {
      // Storage unavailable or running in non-storage context
    }
  }

  // Handle body: serialize only if it's an object/array, not already a string or FormData
  let body = options.body;
  if (body !== undefined && body !== null) {
    if (typeof body === "object" && !(body instanceof FormData)) {
      body = JSON.stringify(body);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let parsedError;
    try {
      parsedError = JSON.parse(errorText);
    } catch {
      parsedError = null;
    }

    const detailMsg = parsedError?.detail 
      ? (typeof parsedError.detail === "string" ? parsedError.detail : JSON.stringify(parsedError.detail))
      : errorText || "Request failed";

    const err = new Error(detailMsg);
    err.status = response.status;
    err.response = { status: response.status, data: parsedError || { detail: errorText } };
    throw err;
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

// Axios-like helper for components expecting apiClient.get / post / put / delete
const apiClient = {
  async get(path, config = {}) {
    const data = await apiRequest(path, { method: "GET", ...config });
    return { data };
  },

  async post(path, bodyData = null, config = {}) {
    const data = await apiRequest(path, {
      method: "POST",
      body: bodyData,
      ...config,
    });
    return { data };
  },

  async put(path, bodyData = null, config = {}) {
    const data = await apiRequest(path, {
      method: "PUT",
      body: bodyData,
      ...config,
    });
    return { data };
  },

  async delete(path, config = {}) {
    const data = await apiRequest(path, { method: "DELETE", ...config });
    return { data };
  },

  async patch(path, bodyData = null, config = {}) {
    const data = await apiRequest(path, {
      method: "PATCH",
      body: bodyData,
      ...config,
    });
    return { data };
  },
};

export { API_BASE_URL, apiRequest, apiClient };
