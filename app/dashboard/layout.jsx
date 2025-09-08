"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAppDispatch } from "../../lib/hooks";
import { useAuth } from "../../lib/hooks";
import { getCurrentUser } from "../../lib/store/slices/authSlice";
import Sidebar from "@/components/Sidebar";
import { SidebarProvider } from "@/components/SidebarProvider";
import DashboardContent from "@/components/DashboardContent";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: session, status } = useSession();
  const { user, isAuthenticated, loading } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (status === "loading") return; // Still loading
      
      if (status === "unauthenticated") {
        router.push("/login");
        return;
      }

      if (status === "authenticated" && session?.user) {
        // User is authenticated via NextAuth, sync with Redux store
        if (!isAuthenticated || !user) {
          try {
            await dispatch(getCurrentUser()).unwrap();
          } catch (error) {
            console.error("Failed to sync session with Redux:", error);
          }
        }
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, [status, session, dispatch, isAuthenticated, user, router]);

  // Show loading while NextAuth is checking session or Redux is loading
  if (status === "loading" || loading || !authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render anything (will redirect)
  if (status === "unauthenticated" || !session?.user) {
    return null;
  }

  // Convert user object to plain object to avoid toJSON method issues
  // Use Redux user data if available, otherwise fall back to session data
  const currentUser = user || session?.user;
  const userData = {
    _id: currentUser?.id || currentUser?._id?.toString(),
    name: currentUser?.name,
    email: currentUser?.email,
    role: currentUser?.role,
    phone: currentUser?.phone,
    companyAccess: currentUser?.companyAccess,
    isActive: currentUser?.isActive,
    createdAt: currentUser?.createdAt,
    updatedAt: currentUser?.updatedAt,
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
