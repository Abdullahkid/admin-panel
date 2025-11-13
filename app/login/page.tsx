"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/auth/AdminAuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, isLoading: authLoading } = useAdminAuth();
  const router = useRouter();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      console.log("✅ Already authenticated, redirecting to dashboard...");
      router.replace("/dashboard");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const timestamp = new Date().toISOString();
    console.log("\n" + "=".repeat(80));
    console.log(`🔐 LOGIN ATTEMPT STARTED AT ${timestamp}`);
    console.log("=".repeat(80));
    console.log("📧 Email:", email);
    console.log("🌐 Backend URL:", process.env.NEXT_PUBLIC_API_BASE_URL);
    console.log("=".repeat(80) + "\n");

    try {
      console.log("📡 Calling login function...");
      await login(email, password);
      console.log("\n" + "=".repeat(80));
      console.log("✅ LOGIN SUCCESSFUL! Redirecting to dashboard...");
      console.log("=".repeat(80) + "\n");

      // Small delay to ensure state is updated before navigation
      await new Promise(resolve => setTimeout(resolve, 100));
      router.replace("/dashboard");
    } catch (err: any) {
      // Log comprehensive error details
      console.error("\n" + "🚨".repeat(40));
      console.error("❌ LOGIN ERROR DETECTED");
      console.error("🚨".repeat(40));
      console.error("\n📋 ERROR DETAILS:");
      console.error("├─ Error Type:", err.constructor.name);
      console.error("├─ Error Message:", err.message);
      console.error("├─ Error Code:", err.code);
      console.error("└─ Error Stack:", err.stack);

      console.error("\n📡 NETWORK RESPONSE:");
      if (err.response) {
        console.error("├─ Status Code:", err.response.status);
        console.error("├─ Status Text:", err.response.statusText);
        console.error("├─ Response Headers:", JSON.stringify(err.response.headers, null, 2));
        console.error("└─ Response Data:", JSON.stringify(err.response.data, null, 2));
      } else if (err.request) {
        console.error("└─ No response received. Request was made but no response came back.");
        console.error("   Request details:", err.request);
      } else {
        console.error("└─ Error occurred before sending request");
      }

      console.error("\n🔍 AXIOS CONFIG:");
      if (err.config) {
        console.error("├─ URL:", err.config.url);
        console.error("├─ Method:", err.config.method);
        console.error("├─ Base URL:", err.config.baseURL);
        console.error("├─ Headers:", JSON.stringify(err.config.headers, null, 2));
        console.error("└─ Data Sent:", JSON.stringify(err.config.data, null, 2));
      }

      console.error("\n" + "🚨".repeat(40) + "\n");

      const errorMessage = err.response?.data?.message || err.message || "Login failed. Please try again.";
      console.error("💬 Displaying error to user:", errorMessage);
      setError(errorMessage);

      // Prevent any automatic redirects
      e.stopPropagation();
    } finally {
      setIsLoading(false);
      const endTime = new Date().toISOString();
      console.log(`\n⏱️  Login attempt finished at ${endTime}\n`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
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
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="admin@downxtown.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </div>
        </form>

        <div className="text-center text-xs text-gray-500 mt-4">
          <p>Downxtown Admin Panel v1.0</p>
        </div>
      </div>
    </div>
  );
}
