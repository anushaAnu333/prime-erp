import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectDB } from "./mongodb";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not defined");
}

// Generate JWT token
export function generateToken(user) {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
      companyAccess: user.companyAccess,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// Get token from cookies
export async function getTokenFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get("auth-token")?.value;
}

// Set token in cookies
export async function setTokenCookie(token) {
  const cookieStore = await cookies();
  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  });
}

// Clear token from cookies
export async function clearTokenCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("auth-token");
}

// Get current user from token
export async function getCurrentUser() {
  try {
    const token = await getTokenFromCookies();
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded) return null;

    // Ensure database connection
    await connectDB();

    // Import User model here to avoid circular dependency
    const User = (await import("../models/User.js")).default;
    const user = await User.findById(decoded.userId).select("-password");

    // Convert Mongoose document to plain object to avoid serialization issues
    return user ? user.toObject() : null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

// Check if user has permission for a specific role
export function hasPermission(userRole, requiredRoles) {
  if (!userRole || !requiredRoles) return false;

  const roleHierarchy = {
    admin: 4,
    manager: 3,
    accountant: 2,
    agent: 1,
  };

  const userLevel = roleHierarchy[userRole] || 0;
  const requiredLevel = Math.max(
    ...requiredRoles.map((role) => roleHierarchy[role] || 0)
  );

  return userLevel >= requiredLevel;
}

// Check if user can access specific company
export function canAccessCompany(user, companyId) {
  if (!user || !companyId) return false;

  // Admin, manager, and accountant have access to all companies
  if (["admin", "manager", "accountant"].includes(user.role)) {
    return true;
  }

  // Agents can only access their assigned companies
  return (
    user.companyAccess.includes(companyId) || user.companyAccess.includes("all")
  );
}
