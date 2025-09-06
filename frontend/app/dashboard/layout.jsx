"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "../../lib/hooks";
import { useAuth } from "../../lib/hooks";
import { getCurrentUser } from "../../lib/store/slices/authSlice";
import Sidebar from "@/components/Sidebar";
import { SidebarProvider } from "@/components/SidebarProvider";
import DashboardContent from "@/components/DashboardContent";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated && !user) {
        try {
          await dispatch(getCurrentUser()).unwrap();
        } catch (error) {
          console.error("Auth check failed:", error);
          router.push("/login");
        }
      }
    };

    checkAuth();
  }, [dispatch, isAuthenticated, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect to login
  }

  // Convert user object to plain object to avoid toJSON method issues
  const userData = {
    _id: user._id?.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    companyAccess: user.companyAccess,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50">
        <Sidebar user={userData} />
        <DashboardContent>{children}</DashboardContent>
      </div>
    </SidebarProvider>
  );
}
