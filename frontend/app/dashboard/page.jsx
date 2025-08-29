"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/hooks";
import { useAuth } from "@/lib/hooks";
import { getCurrentUser } from "@/lib/store/slices/authSlice";
import DashboardClient from "@/components/DashboardClient";

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await dispatch(getCurrentUser()).unwrap();
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/login");
      }
    };

    if (!isAuthenticated && !loading) {
      checkAuth();
    }
  }, [dispatch, isAuthenticated, loading, router]);

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

  return <DashboardClient user={user} />;
}
