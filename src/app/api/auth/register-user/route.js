import { NextResponse } from "next/server";
import crypto from "crypto";
import { createUser, findUserByUsername, initializeDatabase } from "@/lib/db";

export async function POST(request) {
  try {
    // Initialize database (safe to call multiple times)
    await initializeDatabase();
    
    const { name, username, position } = await request.json();

    // Validate input
    if (!name || !username || !position) {
      return NextResponse.json(
        { error: "Name, username, and position are required" },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await findUserByUsername(username);

    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 409 }
      );
    }

    // Generate a unique hash for this user
    const hash = crypto
      .createHash("sha256")
      .update(`${username}-${Date.now()}-${Math.random()}`)
      .digest("hex")
      .substring(0, 32); // Use first 32 characters for a shorter hash

    // Create user
    const newUser = await createUser(name, username, position, hash);

    return NextResponse.json({
      success: true,
      hash,
      username: newUser.username,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An error occurred during registration: " + error.message },
      { status: 500 }
    );
  }
}
