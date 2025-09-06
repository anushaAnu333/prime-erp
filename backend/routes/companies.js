const express = require("express");
const router = express.Router();

// Static company data for PRIMA group
const companies = [
  {
    companyCode: "PRIMA-SM",
    name: "PRIMA Sales & Marketing",
    fullName: "PRIMA Sales & Marketing Pvt. Ltd.",
    address: "123 Business Park, Mumbai, Maharashtra 400001",
    phone: "+91-22-12345678",
    email: "info@primasalesmarketing.com",
    gstNumber: "27ABCDE1234F1Z5",
    isActive: true
  },
  {
    companyCode: "PRIMA-FT",
    name: "PRIMA Food Trading",
    fullName: "PRIMA Food Trading Pvt. Ltd.",
    address: "456 Trade Center, Delhi, Delhi 110001",
    phone: "+91-11-12345678",
    email: "info@primafoodtrading.com",
    gstNumber: "07FGHIJ1234K2Z6",
    isActive: true
  },
  {
    companyCode: "PRIMA-EX",
    name: "PRIMA Export",
    fullName: "PRIMA Export Pvt. Ltd.",
    address: "789 Export Plaza, Chennai, Tamil Nadu 600001",
    phone: "+91-44-12345678",
    email: "info@primaexport.com",
    gstNumber: "33LMNOP1234Q3Z7",
    isActive: true
  }
];

// Get all companies
router.get("/", (req, res) => {
  try {
    res.json({
      companies: companies.filter(c => c.isActive),
      total: companies.filter(c => c.isActive).length
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get company by code
router.get("/:code", (req, res) => {
  try {
    const company = companies.find(c => c.companyCode === req.params.code && c.isActive);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    res.json({ company });
  } catch (error) {
    console.error("Error fetching company:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
