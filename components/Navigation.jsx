"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getRoleDisplayName, getRoleColor } from "@/lib/utils";

const Navigation = ({ user }) => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getMenuItems = () => {
    const isAdmin = ["admin", "manager", "accountant"].includes(user?.role);

    if (isAdmin) {
      return [
        { name: "Dashboard", href: "/dashboard" },
        { name: "Sales", href: "/dashboard/sales" },
        { name: "Purchases", href: "/dashboard/purchases" },
        { name: "Vendors", href: "/dashboard/vendors" },
        { name: "Stock", href: "/stock" },
        { name: "Payments", href: "/payments" },
        { name: "Reports", href: "/reports" },
        { name: "Settings", href: "/settings" },
      ];
    } else {
      return [
        { name: "Dashboard", href: "/dashboard" },
        { name: "Create Sale", href: "/dashboard/sales/create" },
        { name: "Collect Payment", href: "/payments/collect" },
        { name: "My Stock", href: "/stock/my" },
        { name: "Today's Route", href: "/route" },
      ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <nav className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Prima ERP
              </h1>
            </div>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200">
                {item.name}
              </a>
            ))}
          </div>

          {/* User menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-gray-900">
                  {user?.name}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(
                    user?.role
                  )}`}>
                  {getRoleDisplayName(user?.role)}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 px-4 py-2 rounded-lg text-sm font-medium"
                title="Logout">
                Logout
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {menuItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}>
                {item.name}
              </a>
            ))}

            {/* Mobile user info and logout */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="px-3 py-2">
                <div className="text-sm font-medium text-gray-900">
                  {user?.name}
                </div>
                <div
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getRoleColor(
                    user?.role
                  )}`}>
                  {getRoleDisplayName(user?.role)}
                </div>
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left text-gray-700 hover:text-red-600 hover:bg-red-50 block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200">
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
