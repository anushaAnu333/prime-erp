"use client";

import { useSidebar } from "./SidebarProvider";

const DashboardContent = ({ children }) => {
  const { isCollapsed } = useSidebar();

  return (
    <div
      className={`transition-all duration-300 ${
        isCollapsed ? "ml-16" : "ml-64"
      }`}>
      <main className="p-4 lg:p-6">{children}</main>
    </div>
  );
};

export default DashboardContent;
