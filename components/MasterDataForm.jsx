"use client";

import { useState } from "react";
import ProductForm from "./ProductForm";
import VendorForm from "./VendorForm";
import CustomerForm from "./CustomerForm";
import Card from "@/components/ui/Card";

const MasterDataForm = () => {
  const [activeTab, setActiveTab] = useState("product");

  const tabs = [
    { id: "product", name: "Add Product", icon: "📦" },
    { id: "vendor", name: "Add Vendor", icon: "🏢" },
    { id: "customer", name: "Add Customer", icon: "👤" },
  ];

  const renderForm = () => {
    switch (activeTab) {
      case "product":
        return <ProductForm />;
      case "vendor":
        return <VendorForm />;
      case "customer":
        return <CustomerForm />;
      default:
        return <ProductForm />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card className="p-6">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">
          Master Data Management
        </h1>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}>
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Form Content */}
        <div className="mt-6">{renderForm()}</div>
      </Card>
    </div>
  );
};

export default MasterDataForm;
