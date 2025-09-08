"use client";

import { useAuth } from "@/lib/hooks";
import DashboardClient from "@/components/DashboardClient";

export default function DashboardPage() {
  const { user } = useAuth();

  return <DashboardClient user={user} />;
}
