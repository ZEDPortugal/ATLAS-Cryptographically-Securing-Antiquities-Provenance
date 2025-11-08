import { NextResponse } from "next/server";
import crypto from "crypto";
import fs from "fs";
import path from "path";

// In production, use a database
const USERS_FILE = path.join(process.cwd(), "data", "users.json");

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
  }
}

function getUsers() {
  ensureDataDir();
  const data = fs.readFileSync(USERS_FILE, "utf8");
  return JSON.parse(data);
}

function saveUsers(users) {
  ensureDataDir();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

export async function POST(request) {
  try {
    const { name, username, position } = await request.json();

    // Validate input
    if (!name || !username || !position) {
      return NextResponse.json(
        { error: "Name, username, and position are required" },
        { status: 400 }
      );
    }

    // Check if username already exists
    const users = getUsers();
    const existingUser = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    );

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

    // Create user object
    const newUser = {
      id: crypto.randomUUID(),
      name,
      username: username.toLowerCase(),
      position,
      hash,
      createdAt: new Date().toISOString(),
    };

    // Save user
    users.push(newUser);
    saveUsers(users);

    return NextResponse.json({
      success: true,
      hash,
      username: newUser.username,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const users = getUsers();
    // Return users without hashes for security
    const safeUsers = users.map(({ hash, ...user }) => user);
    return NextResponse.json({ users: safeUsers });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}
