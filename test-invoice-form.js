// Test script to verify invoice form functionality
const testInvoiceForm = async () => {
  console.log("🧪 Testing Invoice Form Components...\n");

  // Test 1: Check if customers API works
  console.log("1. Testing Customers API...");
  try {
    const customersResponse = await fetch("/api/customers?limit=5");
    if (customersResponse.ok) {
      const customersData = await customersResponse.json();
      console.log(
        `✅ Customers API: Found ${customersData.customers.length} customers`
      );
      if (customersData.customers.length > 0) {
        console.log(
          `   Sample customer: ${customersData.customers[0].displayName}`
        );
      }
    } else {
      console.log("❌ Customers API: Failed to fetch customers");
    }
  } catch (error) {
    console.log("❌ Customers API: Error", error.message);
  }

  // Test 2: Check if products API works
  console.log("\n2. Testing Products API...");
  try {
    const productsResponse = await fetch("/api/products?limit=5");
    if (productsResponse.ok) {
      const productsData = await productsResponse.json();
      console.log(
        `✅ Products API: Found ${productsData.products.length} products`
      );
      if (productsData.products.length > 0) {
        console.log(
          `   Sample product: ${productsData.products[0].displayName}`
        );
      }
    } else {
      console.log("❌ Products API: Failed to fetch products");
    }
  } catch (error) {
    console.log("❌ Products API: Error", error.message);
  }

  // Test 3: Test calculations
  console.log("\n3. Testing Calculations...");
  try {
    const { calculateItemTotals, calculateInvoiceTotals } = await import(
      "./lib/calculations.js"
    );

    // Test item calculation
    const itemTotals = calculateItemTotals("dosa", 2, 25, new Date());
    console.log("✅ Item calculation:", {
      product: "dosa",
      qty: 2,
      rate: 25,
      taxableValue: itemTotals.taxableValue,
      gst: itemTotals.gst,
      invoiceValue: itemTotals.invoiceValue,
    });

    // Test invoice calculation
    const invoiceTotals = calculateInvoiceTotals([itemTotals], 5);
    console.log("✅ Invoice calculation:", {
      totalInvoiceValue: invoiceTotals.totalInvoiceValue,
      discount: invoiceTotals.discount,
      total: invoiceTotals.total,
    });
  } catch (error) {
    console.log("❌ Calculations: Error", error.message);
  }

  console.log("\n🎉 Test completed!");
};

// Run the test if this file is executed directly
if (typeof window !== "undefined") {
  // Browser environment
  testInvoiceForm();
} else {
  // Node.js environment
  console.log("This test should be run in the browser environment");
}
