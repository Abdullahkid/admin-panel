import { NextRequest, NextResponse } from "next/server";

// API route for fetching stores with pagination and search
const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "50";
    const search = searchParams.get("search");

    // Build backend URL
    const params = new URLSearchParams({
      page,
      limit,
    });

    if (search) {
      params.append("search", search);
    }

    const backendUrl = `${BACKEND_URL}/admin/stores?${params.toString()}`;
    console.log("Fetching stores from backend:", backendUrl);

    // Get auth token from request headers
    const authHeader = request.headers.get("authorization");

    // Make request to backend
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { Authorization: authHeader }),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend error:", response.status, errorText);
      const errorData = JSON.parse(errorText || "{}");
      return NextResponse.json(
        { error: errorData.error || "Failed to fetch stores from backend" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in stores API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
