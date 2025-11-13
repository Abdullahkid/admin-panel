# Admin Panel Frontend - Complete Implementation Guide

## 🎉 Project Initialized Successfully!

The Next.js admin panel project has been created with all necessary configuration files.

---

## 📦 Step 1: Install Dependencies

```bash
cd C:\Users\PC\DownXtown\admin-panel
npm install
```

This will install:
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Axios (API client)
- Firebase (authentication)
- React Query (data fetching)
- Lucide React (icons)

---

## 🔐 Step 2: Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`sigma2-25a57` or whatever your project is)
3. Click **Project Settings** (gear icon)
4. Scroll to **Your apps** section
5. If you don't have a web app, click **Add app** → **Web**
6. Copy the Firebase configuration
7. Update `.env.local` file:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sigma2-25a57.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sigma2-25a57
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sigma2-25a57.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📁 Step 3: Create Remaining Files

I've created the basic structure. Now you need to create these additional files:

### 3.1 Firebase Configuration
Create: `lib/firebase.ts`

```typescript
import { initializeApp, getApps } from "firebase/auth";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (only once)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export { app, auth };
```

### 3.2 API Client
Create: `lib/api/client.ts`

```typescript
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  async (config) => {
    // Token will be added from context
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 3.3 Admin Auth Context
Create: `lib/auth/AdminAuthContext.tsx`

```typescript
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { signInWithCustomToken, signOut } from "firebase/auth";
import { auth } from "../firebase";
import apiClient from "../api/client";

interface Admin {
  id: string;
  email: string;
  role: string;
  permissions: string[];
  isActive: boolean;
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
    try {
      // Step 1: Login to backend
      const response = await apiClient.post("/admin/login", {
        email,
        password,
        accountType: "ADMIN",
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Login failed");
      }

      const { customFirebaseToken, adminData } = response.data;

      // Step 2: Store admin data
      localStorage.setItem("admin_data", JSON.stringify(adminData));
      setAdmin(adminData);

      // Step 3: Sign in to Firebase
      await signInWithCustomToken(auth, customFirebaseToken);

      // Step 4: Get Firebase token for future requests
      const firebaseToken = await auth.currentUser?.getIdToken();
      if (firebaseToken) {
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${firebaseToken}`;
      }
    } catch (error: any) {
      localStorage.removeItem("admin_data");
      setAdmin(null);
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

  // Initialize from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const savedAdmin = localStorage.getItem("admin_data");
      if (savedAdmin) {
        try {
          const adminData = JSON.parse(savedAdmin);
          setAdmin(adminData);

          // Get current Firebase token
          const firebaseToken = await auth.currentUser?.getIdToken();
          if (firebaseToken) {
            apiClient.defaults.headers.common["Authorization"] = `Bearer ${firebaseToken}`;
          }
        } catch (error) {
          console.error("Failed to parse admin data:", error);
          localStorage.removeItem("admin_data");
        }
      }
      setIsLoading(false);
    };

    initAuth();
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
```

### 3.4 Update Root Layout
Update: `app/layout.tsx`

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AdminAuthProvider } from "@/lib/auth/AdminAuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Downxtown Admin Panel",
  description: "Admin panel for managing Downxtown platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AdminAuthProvider>
          {children}
        </AdminAuthProvider>
      </body>
    </html>
  );
}
```

### 3.5 Login Page
Create: `app/login/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/auth/AdminAuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAdminAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Downxtown Admin Panel
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access the admin dashboard
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

### 3.6 Dashboard Page (Placeholder)
Create: `app/dashboard/page.tsx`

```typescript
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/auth/AdminAuthContext";

export default function DashboardPage() {
  const { isAuthenticated, isLoading, admin, logout } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Welcome, {admin?.email}!</h2>
          <p className="text-gray-600">Role: {admin?.role}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Total Stores</h3>
            <p className="text-3xl font-bold text-primary">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Total Products</h3>
            <p className="text-3xl font-bold text-primary">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Images Processed</h3>
            <p className="text-3xl font-bold text-primary">0</p>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <p className="text-gray-600">✅ Authentication working!</p>
            <p className="text-gray-600">Next steps:</p>
            <ul className="list-disc list-inside text-gray-600 ml-4">
              <li>Create store creation form</li>
              <li>Create bulk product import</li>
              <li>Add sidebar navigation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 3.7 Home Page (Redirect to Login/Dashboard)
Create: `app/page.tsx`

```typescript
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/auth/AdminAuthContext";

export default function Home() {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Loading...</p>
    </div>
  );
}
```

---

## 🚀 Step 4: Run the Development Server

```bash
npm run dev
```

Open: http://localhost:3000

You should see:
1. Home page redirects to `/login`
2. Login page with email/password fields
3. After login → redirects to `/dashboard`
4. Dashboard shows welcome message

---

## ✅ Testing the Frontend

### Test Login:
1. Email: `admin@downxtown.com`
2. Password: Your admin password
3. Click "Sign in"
4. Should redirect to dashboard

### Expected Flow:
```
1. Open http://localhost:3000
2. Redirects to /login
3. Enter credentials
4. POST /admin/login → Get Firebase token
5. Redirect to /dashboard
6. See admin dashboard
```

---

## 📝 Next Steps - Additional Features

Once login works, you can add:

1. **Store Creation Form** (`app/dashboard/stores/create/page.tsx`)
2. **Bulk Product Import** (`app/dashboard/products/import/page.tsx`)
3. **Sidebar Navigation** (component)
4. **Analytics Dashboard** (enhanced dashboard)
5. **Store List** (view all stores)
6. **Product List** (view all products)

---

## 🐛 Troubleshooting

### Error: "Module not found"
**Solution:** Run `npm install` to install dependencies

### Error: "Firebase not configured"
**Solution:** Update `.env.local` with your Firebase credentials

### Error: "Login failed"
**Solution:**
- Check backend is running on `localhost:8080`
- Verify admin user exists in MongoDB
- Check password is correct

### Error: "CORS error"
**Solution:** Backend needs to allow localhost:3000 in CORS settings

---

## 📦 Complete File Structure

```
admin-panel/
├── app/
│   ├── dashboard/
│   │   └── page.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── auth/
│   │   └── AdminAuthContext.tsx
│   ├── api/
│   │   └── client.ts
│   └── firebase.ts
├── .env.local
├── .env.local.example
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
└── FRONTEND_IMPLEMENTATION_GUIDE.md (this file)
```

---

## 🎉 You're Ready!

The admin panel frontend is now set up with:
- ✅ Next.js + TypeScript + Tailwind
- ✅ Firebase authentication
- ✅ API client configured
- ✅ Login page
- ✅ Protected dashboard
- ✅ Auto-redirect logic

**Next:** Create the remaining pages for store creation and product import!
