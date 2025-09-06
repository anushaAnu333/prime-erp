async function addSampleVendors() {
  const fetch = (await import('node-fetch')).default;
  
  const sampleVendors = [
    {
      vendorName: "ABC Electronics Ltd",
      contactPerson: "Rajesh Kumar",
      address: "123 Electronics Street, Mumbai, Maharashtra 400001",
      phone: "+91-9876543210",
      email: "rajesh@abcelectronics.com",
      gstNumber: "27ABCDE1234F1Z5",
      paymentTerms: "30 days"
    },
    {
      vendorName: "XYZ Textiles Pvt Ltd",
      contactPerson: "Priya Sharma",
      address: "456 Textile Avenue, Surat, Gujarat 395001",
      phone: "+91-9876543211",
      email: "priya@xyztextiles.com",
      gstNumber: "24ABCDE1234F1Z6",
      paymentTerms: "15 days"
    },
    {
      vendorName: "Global Foods Corporation",
      contactPerson: "Amit Patel",
      address: "789 Food Plaza, Delhi, Delhi 110001",
      phone: "+91-9876543212",
      email: "amit@globalfoods.com",
      gstNumber: "07ABCDE1234F1Z7",
      paymentTerms: "45 days"
    },
    {
      vendorName: "Tech Solutions India",
      contactPerson: "Sneha Reddy",
      address: "321 Tech Park, Bangalore, Karnataka 560001",
      phone: "+91-9876543213",
      email: "sneha@techsolutions.com",
      gstNumber: "29ABCDE1234F1Z8",
      paymentTerms: "30 days"
    },
    {
      vendorName: "Metro Hardware Store",
      contactPerson: "Vikram Singh",
      address: "654 Hardware Lane, Chennai, Tamil Nadu 600001",
      phone: "+91-9876543214",
      email: "vikram@metrohardware.com",
      gstNumber: "33ABCDE1234F1Z9",
      paymentTerms: "Cash"
    },
    {
      vendorName: "Ocean Shipping Lines",
      contactPerson: "Deepak Mehta",
      address: "987 Port Road, Kochi, Kerala 682001",
      phone: "+91-9876543215",
      email: "deepak@oceanshipping.com",
      gstNumber: "32ABCDE1234F1Z0",
      paymentTerms: "60 days"
    },
    {
      vendorName: "Green Energy Systems",
      contactPerson: "Anita Joshi",
      address: "147 Solar Street, Pune, Maharashtra 411001",
      phone: "+91-9876543216",
      email: "anita@greenenergy.com",
      gstNumber: "27ABCDE1234F1Z1",
      paymentTerms: "30 days"
    },
    {
      vendorName: "Premium Packaging Co",
      contactPerson: "Ravi Gupta",
      address: "258 Package Avenue, Ahmedabad, Gujarat 380001",
      phone: "+91-9876543217",
      email: "ravi@premiumpackaging.com",
      gstNumber: "24ABCDE1234F1Z2",
      paymentTerms: "15 days"
    },
    {
      vendorName: "Digital Marketing Hub",
      contactPerson: "Kavya Nair",
      address: "369 Digital Plaza, Hyderabad, Telangana 500001",
      phone: "+91-9876543218",
      email: "kavya@digitalmarketing.com",
      gstNumber: "36ABCDE1234F1Z3",
      paymentTerms: "30 days"
    },
    {
      vendorName: "Construction Materials Ltd",
      contactPerson: "Suresh Yadav",
      address: "741 Construction Road, Jaipur, Rajasthan 302001",
      phone: "+91-9876543219",
      email: "suresh@constructionmaterials.com",
      gstNumber: "08ABCDE1234F1Z4",
      paymentTerms: "45 days"
    },
    {
      vendorName: "Fashion Trends India",
      contactPerson: "Meera Iyer",
      address: "852 Fashion Street, Kolkata, West Bengal 700001",
      phone: "+91-9876543220",
      email: "meera@fashiontrends.com",
      gstNumber: "19ABCDE1234F1Z5",
      paymentTerms: "30 days"
    },
    {
      vendorName: "Auto Parts Central",
      contactPerson: "Rohit Agarwal",
      address: "963 Auto Lane, Chandigarh, Punjab 160001",
      phone: "+91-9876543221",
      email: "rohit@autoparts.com",
      gstNumber: "04ABCDE1234F1Z6",
      paymentTerms: "15 days"
    },
    {
      vendorName: "Medical Supplies Co",
      contactPerson: "Dr. Sunita Verma",
      address: "159 Medical Complex, Lucknow, Uttar Pradesh 226001",
      phone: "+91-9876543222",
      email: "sunita@medicalsupplies.com",
      gstNumber: "09ABCDE1234F1Z7",
      paymentTerms: "30 days"
    },
    {
      vendorName: "Office Furniture World",
      contactPerson: "Arjun Malhotra",
      address: "357 Office Park, Indore, Madhya Pradesh 452001",
      phone: "+91-9876543223",
      email: "arjun@officefurniture.com",
      gstNumber: "23ABCDE1234F1Z8",
      paymentTerms: "45 days"
    },
    {
      vendorName: "Sports Equipment Hub",
      contactPerson: "Neha Kapoor",
      address: "468 Sports Avenue, Bhopal, Madhya Pradesh 462001",
      phone: "+91-9876543224",
      email: "neha@sportsequipment.com",
      gstNumber: "23ABCDE1234F1Z9",
      paymentTerms: "30 days"
    }
  ];

  console.log(`Adding ${sampleVendors.length} sample vendors...`);
  
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < sampleVendors.length; i++) {
    const vendor = sampleVendors[i];
    try {
      console.log(`Adding vendor ${i + 1}/${sampleVendors.length}: ${vendor.vendorName}`);
      
      const response = await fetch('http://localhost:3001/api/vendors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(vendor)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Successfully added: ${result.vendor.vendorName} (Code: ${result.vendor.vendorCode})`);
        successCount++;
      } else {
        const error = await response.json();
        console.log(`❌ Failed to add ${vendor.vendorName}: ${error.message}`);
        errorCount++;
      }
    } catch (error) {
      console.log(`❌ Error adding ${vendor.vendorName}: ${error.message}`);
      errorCount++;
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n📊 Summary:`);
  console.log(`✅ Successfully added: ${successCount} vendors`);
  console.log(`❌ Failed: ${errorCount} vendors`);
  console.log(`📝 Total processed: ${sampleVendors.length} vendors`);
}

addSampleVendors();

