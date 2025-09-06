// Utility functions for company management

let companiesCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getCompanies = async () => {
  // Check if cache is valid
  if (
    companiesCache &&
    cacheTimestamp &&
    Date.now() - cacheTimestamp < CACHE_DURATION
  ) {
    return companiesCache;
  }

  try {
    const response = await fetch("/api/companies");
    if (response.ok) {
      const data = await response.json();
      companiesCache = data.companies;
      cacheTimestamp = Date.now();
      return companiesCache;
    }
  } catch (error) {
    console.error("Error fetching companies:", error);
  }

  // Return default companies if API fails
  return [
    {
      companyCode: "PRIMA-SM",
      name: "PRIMA Sales & Marketing",
      address: "123 Business Street, City, State - 123456",
      gstNumber: "12ABCDE1234F1Z5",
    },
    {
      companyCode: "PRIMA-FT",
      name: "PRIMA Food Trading",
      address: "456 Trade Avenue, City, State - 123456",
      gstNumber: "12ABCDE1234F1Z6",
    },
    {
      companyCode: "PRIMA-EX",
      name: "PRIMA Export",
      address: "789 Export Road, City, State - 123456",
      gstNumber: "12ABCDE1234F1Z7",
    },
  ];
};

export const getCompanyByCode = async (companyCode) => {
  const companies = await getCompanies();
  return companies.find((company) => company.companyCode === companyCode);
};

export const getDefaultCompany = async () => {
  const companies = await getCompanies();
  return (
    companies[0] ||
    companies.find((company) => company.companyCode === "PRIMA-SM")
  );
};
