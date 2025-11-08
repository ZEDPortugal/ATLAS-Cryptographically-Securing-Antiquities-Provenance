import { NextResponse } from "next/server";

// Temporary in-memory storage - replace with database in production
let usersCache = [];

function getUsers() {
  return usersCache;
}

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
    const users = getUsers();
    const user = users.find(
      (u) => 
        u.username.toLowerCase() === username.toLowerCase() && 
        u.hash === hash
    );

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
