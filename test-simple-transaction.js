async function testSimpleTransaction() {
    try {
        const fetch = (await import('node-fetch')).default;
        
        console.log('🔍 SIMPLE TRANSACTION TEST');
        console.log('==========================\n');
        
        // Test 1: Get a sale
        console.log('1. Getting a sale to test with...');
        const salesResponse = await fetch('http://localhost:3000/api/sales?limit=1');
        const salesData = await salesResponse.json();
        
        if (!salesResponse.ok || !salesData.sales?.length) {
            console.log('❌ No sales found');
            return;
        }
        
        const testSale = salesData.sales[0];
        console.log(`✅ Found sale: ${testSale.invoiceNumber} - ₹${testSale.finalAmount}`);
        
        // Test 2: Get individual sale details
        console.log('\n2. Getting individual sale details...');
        const individualResponse = await fetch(`http://localhost:3000/api/sales/${testSale.id}`);
        const individualData = await individualResponse.json();
        
        if (!individualResponse.ok) {
            console.log('❌ Failed to get individual sale');
            console.log('Response:', individualData);
            return;
        }
        
        console.log('✅ Individual sale retrieved');
        console.log(`   Payment status: ${individualData.sale.paymentStatus}`);
        console.log(`   Payments array length: ${individualData.sale.payments?.length || 0}`);
        
        // Test 3: Update payment status
        console.log('\n3. Updating payment status...');
        const updateData = {
            paymentStatus: "Partial",
            paymentMode: "Online",
            amountPaid: Math.floor(individualData.sale.finalAmount / 2),
            referenceNumber: `TXN${Date.now()}`,
            deliveryStatus: individualData.sale.deliveryStatus
        };
        
        console.log('Update data:', updateData);
        
        const updateResponse = await fetch(`http://localhost:3000/api/sales/${testSale.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData)
        });
        
        const updateResult = await updateResponse.json();
        
        if (updateResponse.ok) {
            console.log('✅ Payment update successful');
            console.log('Response data:', JSON.stringify(updateResult, null, 2));
        } else {
            console.log('❌ Payment update failed');
            console.log('Response:', updateResult);
        }
        
        // Test 4: Test customer transactions endpoint
        console.log('\n4. Testing customer transactions endpoint...');
        
        // Get customer ID from the sale
        const customerId = individualData.sale.customerId;
        console.log(`Customer ID: ${customerId}`);
        
        const customerTransactionsResponse = await fetch(`http://localhost:3000/api/customers/${customerId}/transactions`);
        
        console.log(`Customer transactions response status: ${customerTransactionsResponse.status}`);
        
        if (customerTransactionsResponse.ok) {
            const customerTransactionsData = await customerTransactionsResponse.json();
            console.log('✅ Customer transactions retrieved');
            console.log('Response data:', JSON.stringify(customerTransactionsData, null, 2));
        } else {
            const errorText = await customerTransactionsResponse.text();
            console.log('❌ Customer transactions failed');
            console.log('Error response:', errorText);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

testSimpleTransaction();

