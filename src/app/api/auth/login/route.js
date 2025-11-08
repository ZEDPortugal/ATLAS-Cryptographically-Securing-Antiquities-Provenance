import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const USERS_FILE = path.join(process.cwd(), "data", "users.json");

function getUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(USERS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading users file:", error);
    return [];
  }
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
