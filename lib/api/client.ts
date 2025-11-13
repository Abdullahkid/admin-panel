import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add auth token and refresh if needed
apiClient.interceptors.request.use(
  async (config) => {
    // Import Firebase auth dynamically to avoid circular dependencies
    const { auth } = await import("../firebase");

    // Get current user and refresh token if needed
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken(true); // Force refresh
        config.headers.Authorization = `Bearer ${token}`;
        console.log("🔑 Token attached to request:", config.url);
      } catch (error) {
        console.error("❌ Failed to get token:", error);
      }
    } else {
      console.warn("⚠️  No Firebase user for request:", config.url);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => {
    console.log("✅ API Response Success:", {
      url: response.config.url,
      status: response.status,
      statusText: response.statusText
    });
    return response;
  },
  async (error) => {
    console.error("\n🔴 API CLIENT INTERCEPTOR - ERROR CAUGHT");
    console.error("├─ URL:", error.config?.url);
    console.error("├─ Method:", error.config?.method?.toUpperCase());
    console.error("├─ Status:", error.response?.status);
    console.error("└─ Status Text:", error.response?.statusText);

    if (error.response?.status === 401) {
      console.error("\n⚠️  401 UNAUTHORIZED DETECTED");

      // Don't redirect if we're already on the login page or if this is a login request
      const isLoginPage = typeof window !== "undefined" && window.location.pathname === "/login";
      const isLoginRequest = error.config?.url?.includes("/admin/login");

      console.error("├─ Is Login Page:", isLoginPage);
      console.error("├─ Is Login Request:", isLoginRequest);

      if (!isLoginPage && !isLoginRequest) {
        console.error("└─ Redirecting to /login...\n");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      } else {
        console.error("└─ Skipping redirect (already on login or login request)\n");
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
