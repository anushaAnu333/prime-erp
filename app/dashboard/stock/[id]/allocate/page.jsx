"use client";

import { useState, useEffect, use } from "react";
import { useParams, useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";

export default function StockAllocation() {
  const params = useParams();
  const router = useRouter();
  const [stock, setStock] = useState(null);
  const [agents, setAgents] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Modal state
  const [modal, setModal] = useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
    onConfirm: null,
  });

  // Sample delivery agents (in real app, fetch from API)
  const deliveryAgents = [
    { id: "agent1", name: "Amit Singh" },
    { id: "agent2", name: "Vikram Patel" },
    { id: "agent3", name: "Rajesh Kumar" },
    { id: "agent4", name: "Suresh Sharma" },
  ];

  useEffect(() => {
    fetchStockData();
  }, []);

  // Modal helper functions
  const showModal = (type, title, message, onConfirm = null) => {
    setModal({
      isOpen: true,
      type,
      title,
      message,
      onConfirm,
    });
  };

  const closeModal = () => {
    setModal({
      isOpen: false,
      type: "info",
      title: "",
      message: "",
      onConfirm: null,
    });
  };

  const fetchStockData = async () => {
    try {
      const resolvedParams = use(params);
      const response = await fetch(`/api/stock/${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        setStock(data.stock);
        
        // Set all agents (no company filtering needed)
        setAgents(deliveryAgents);
        
        // Initialize allocations
        setAllocations(deliveryAgents.map(agent => ({
          agentId: agent.id,
          agentName: agent.name,
          quantity: 0,
        })));
      }
    } catch (error) {
      setError("Failed to fetch stock data");
    } finally {
      setLoading(false);
    }
  };

  const handleAllocationChange = (index, field, value) => {
    const updatedAllocations = [...allocations];
    updatedAllocations[index] = {
      ...updatedAllocations[index],
      [field]: value,
    };
    setAllocations(updatedAllocations);
  };

  const calculateTotalAllocation = () => {
    return allocations.reduce((sum, alloc) => {
      const quantity = parseFloat(alloc.quantity) || 0;
      return sum + quantity;
    }, 0);
  };

  const getRemainingStock = () => {
    if (!stock) return 0;
    return stock.stockAvailable - calculateTotalAllocation();
  };

  const isAllocationValid = () => {
    const total = calculateTotalAllocation();
    return total <= stock?.stockAvailable && total > 0;
  };

  const handleSubmit = async () => {
    if (!isAllocationValid()) {
      setError("Invalid allocation. Check quantities and available stock.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/stock/allocate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stockId: use(params).id,
          allocations: allocations.filter(alloc => alloc.quantity > 0),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Show detailed results
        const successCount = result.results.filter(r => r.status === "success").length;
        const failedCount = result.results.filter(r => r.status === "failed").length;
        
        let message = `Stock allocated successfully!\n\n`;
        message += `✅ Successfully allocated: ${successCount} agents\n`;
        if (failedCount > 0) {
          message += `❌ Failed: ${failedCount} agents\n`;
        }
        
        showModal(
          "success",
          "Stock Allocation Successful!",
          message,
          () => router.push("/dashboard/stock")
        );
      } else {
        const errorData = await response.json();
        showModal(
          "error",
          "Allocation Failed",
          errorData.message || "Failed to allocate stock"
        );
      }
    } catch (error) {
      showModal(
        "error",
        "Allocation Failed",
        "Failed to allocate stock. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };


  const applyPresetAllocation = (preset) => {
    if (!stock) return;

    let newAllocations = [];
    
    switch (preset) {
      case "equal":
        const equalAmount = Math.floor(stock.stockAvailable / agents.length);
        newAllocations = agents.map(agent => ({
          agentId: agent.id,
          agentName: agent.name,
          quantity: equalAmount,
        }));
        break;
      
      case "pattern":
        // Apply the 1000, 2000, 2500 pattern
        const pattern = [1000, 2000, 2500];
        newAllocations = agents.map((agent, index) => ({
          agentId: agent.id,
          agentName: agent.name,
          quantity: pattern[index] || Math.floor(stock.stockAvailable / agents.length),
        }));
        break;
      
      case "proportional":
        // Allocate based on agent performance (example)
        const total = stock.stockAvailable;
        const proportions = [0.2, 0.3, 0.25, 0.25]; // 20%, 30%, 25%, 25%
        newAllocations = agents.map((agent, index) => ({
          agentId: agent.id,
          agentName: agent.name,
          quantity: Math.floor(total * proportions[index]),
        }));
        break;
    }

    setAllocations(newAllocations);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Stock Not Found</h2>
            <p className="text-gray-600 mb-4">The requested stock could not be found.</p>
            <Button onClick={() => router.push("/dashboard/stock")}>
              Back to Stock Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Allocate Stock to Agents</h1>
        <p className="text-gray-600">
          Allocate stock from {stock.product} to delivery agents
        </p>
      </div>

      {/* Stock Information */}
      <Card className="mb-6 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Stock Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Product</label>
            <p className="text-lg font-semibold capitalize">{stock.product}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Available Stock</label>
            <p className="text-lg font-semibold text-blue-600">
              {stock.stockAvailable.toLocaleString()} {stock.unit}
            </p>
          </div>
        </div>
      </Card>

      {/* Preset Allocation Buttons */}
      <Card className="mb-6 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Allocation Presets</h3>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => applyPresetAllocation("equal")}
            disabled={!stock || stock.stockAvailable === 0}
          >
            Equal Distribution
          </Button>
          <Button
            variant="outline"
            onClick={() => applyPresetAllocation("pattern")}
            disabled={!stock || stock.stockAvailable === 0}
          >
            Pattern (1000, 2000, 2500)
          </Button>
          <Button
            variant="outline"
            onClick={() => applyPresetAllocation("proportional")}
            disabled={!stock || stock.stockAvailable === 0}
          >
            Proportional
          </Button>
        </div>
      </Card>

      {/* Allocation Form */}
      <Card className="mb-6 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Agent Allocations</h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {allocations.map((allocation, index) => (
            <div key={allocation.agentId} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {allocation.agentName}
                </label>
                <p className="text-sm text-gray-500">Agent ID: {allocation.agentId}</p>
              </div>
              <div className="w-32">
                <Input
                  type="number"
                  min="0"
                  max={stock.stockAvailable}
                  value={allocation.quantity}
                  onChange={(e) => handleAllocationChange(index, "quantity", e.target.value)}
                  placeholder="Quantity"
                />
              </div>
              <div className="w-20 text-sm text-gray-500">
                {stock.unit}
              </div>
            </div>
          ))}
        </div>

        {/* Allocation Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Allocated</label>
              <p className="text-lg font-semibold text-blue-600">
                {calculateTotalAllocation().toLocaleString()} {stock.unit}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Remaining Stock</label>
              <p className={`text-lg font-semibold ${
                getRemainingStock() < 0 ? "text-red-600" : "text-green-600"
              }`}>
                {getRemainingStock().toLocaleString()} {stock.unit}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <p className={`text-lg font-semibold ${
                getRemainingStock() < 0 ? "text-red-600" : 
                getRemainingStock() === 0 ? "text-green-600" : "text-yellow-600"
              }`}>
                {getRemainingStock() < 0 ? "Over-allocated" : 
                 getRemainingStock() === 0 ? "Fully allocated" : "Partially allocated"}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={handleSubmit}
          disabled={!isAllocationValid() || submitting}
          
        >
          {submitting ? "Allocating..." : "Allocate Stock"}
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/stock")}
        >
          Cancel
        </Button>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onConfirm={modal.onConfirm}
        showCancelButton={modal.type === "warning"}
        confirmText={modal.type === "warning" ? "Yes, Continue" : "OK"}
        cancelText="Cancel"
      />
    </div>
  );
}
