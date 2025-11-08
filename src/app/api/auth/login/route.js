import { NextResponse } from "next/server";
import { findUserByCredentials } from "@/lib/db";

export async function POST(request) {
  try {
    const { username, hash } = await request.json();

    // Validate input
    if (!username || !hash) {
      return NextResponse.json(
        { error: "Username and hash key are required" },
        { status: 400 }
      );
    }

    // Find user by username and hash
    const user = await findUserByCredentials(username, hash);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid username or hash key" },
        { status: 401 }
      );
    }

    // Return user data without hash
    const { hash: _, ...userWithoutHash } = user;

    return NextResponse.json({
      success: true,
      user: {
        ...userWithoutHash,
        role: "user",
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    );
  }
}
