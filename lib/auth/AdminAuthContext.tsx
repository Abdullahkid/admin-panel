"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { signInWithCustomToken, signOut } from "firebase/auth";
import { auth } from "../firebase";
import apiClient from "../api/client";

interface Admin {
  id: string;
  email: string;
  phoneNumber: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  createdAt: number;
  lastLoginAt: number | null;
}

interface AdminAuthContextType {
  admin: Admin | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    console.log("🔑 AdminAuthContext.login() called");
    console.log("└─ Email:", email);

    try {
      // Step 1: Login to backend
      console.log("\n📤 STEP 1: Sending login request to backend...");
      console.log("├─ Endpoint: /admin/login");
      console.log("├─ Email:", email);
      console.log("└─ Account Type: ADMIN");

      const response = await apiClient.post("/admin/login", {
        email,
        password,
        accountType: "ADMIN",
      });

      console.log("\n📥 STEP 1 COMPLETE: Backend response received");
      console.log("├─ Status:", response.status);
      console.log("├─ Success:", response.data.success);
      console.log("└─ Response Data:", JSON.stringify(response.data, null, 2));

      if (!response.data.success) {
        console.error("❌ Backend returned success=false");
        throw new Error(response.data.message || "Login failed");
      }

      const { customFirebaseToken, adminData } = response.data;

      if (!adminData) {
        console.error("❌ No adminData in response");
        throw new Error("Admin data not found in response");
      }

      console.log("\n✅ Admin data received:", JSON.stringify(adminData, null, 2));

      // Step 2: Store admin data
      console.log("\n💾 STEP 2: Storing admin data in localStorage...");
      localStorage.setItem("admin_data", JSON.stringify(adminData));
      console.log("✅ Admin data stored successfully");

      // Step 3: Sign in to Firebase
      console.log("\n🔥 STEP 3: Signing in to Firebase...");
      console.log("├─ Token length:", customFirebaseToken?.length || 0);
      await signInWithCustomToken(auth, customFirebaseToken);
      console.log("✅ Firebase sign-in successful");

      // Step 4: Get Firebase token and set admin state
      console.log("\n🎫 STEP 4: Getting Firebase ID token...");
      const firebaseToken = await auth.currentUser?.getIdToken();
      if (firebaseToken) {
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${firebaseToken}`;
        console.log("✅ Firebase token set in API client headers");
        console.log("└─ Token length:", firebaseToken.length);
      } else {
        console.warn("⚠️ No Firebase token received");
      }

      // Step 5: Set admin state BEFORE returning (important for navigation)
      console.log("\n👤 STEP 5: Setting admin state...");
      setAdmin(adminData);
      console.log("✅ Admin state set");

      console.log("\n🎉 Login process completed successfully!\n");
    } catch (error: any) {
      console.error("\n💥 LOGIN FAILED IN AdminAuthContext");
      console.error("├─ Cleaning up localStorage...");
      localStorage.removeItem("admin_data");
      setAdmin(null);
      console.error("└─ Re-throwing error to caller\n");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("admin_data");
      setAdmin(null);
      delete apiClient.defaults.headers.common["Authorization"];
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Initialize from localStorage and listen to Firebase auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log("🔥 Firebase auth state changed:", user?.uid || "No user");

      if (user) {
        // User is signed in, get their token
        try {
          const firebaseToken = await user.getIdToken();
          apiClient.defaults.headers.common["Authorization"] = `Bearer ${firebaseToken}`;
          console.log("✅ Firebase token set in headers");

          // Load admin data from localStorage
          const savedAdmin = localStorage.getItem("admin_data");
          if (savedAdmin) {
            const adminData = JSON.parse(savedAdmin);
            setAdmin(adminData);
          }
        } catch (error) {
          console.error("Failed to get Firebase token:", error);
          localStorage.removeItem("admin_data");
          setAdmin(null);
        }
      } else {
        // No user signed in
        console.log("❌ No Firebase user, clearing admin data");
        localStorage.removeItem("admin_data");
        setAdmin(null);
        delete apiClient.defaults.headers.common["Authorization"];
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        isLoading,
        isAuthenticated: !!admin,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
}
