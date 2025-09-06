# Redux Implementation Guide - Prima ERP

## Overview

This application now uses **Redux Toolkit** for state management instead of making direct API calls in every component. This provides better performance, centralized state management, and improved developer experience.

## 🏗️ Architecture

### Store Structure

```
store/
├── slices/
│   ├── authSlice.js          # Authentication state
│   ├── dashboardSlice.js     # Dashboard data
│   ├── salesSlice.js         # Sales management
│   ├── customersSlice.js     # Customers management
│   ├── productsSlice.js      # Products management
│   ├── purchasesSlice.js     # Purchases management
│   └── vendorsSlice.js       # Vendors management
├── store.js                  # Store configuration
└── hooks.js                  # Custom hooks for easy access
```

## 🚀 Quick Start

### 1. Using Redux in Components

Instead of making direct API calls, use Redux actions:

```jsx
import { useAppDispatch } from "@/lib/hooks";
import { useSalesList } from "@/lib/hooks";
import { fetchSales } from "@/lib/store/slices/salesSlice";

const MyComponent = () => {
  const dispatch = useAppDispatch();
  const sales = useSalesList();
  const { loading, error } = useSales();

  useEffect(() => {
    dispatch(fetchSales());
  }, [dispatch]);

  // Component logic...
};
```

### 2. Available Hooks

#### Authentication

```jsx
import { useAuth, useUser, useIsAuthenticated } from "@/lib/hooks";

const { user, isAuthenticated, loading, error } = useAuth();
const user = useUser();
const isAuthenticated = useIsAuthenticated();
```

#### Dashboard

```jsx
import { useDashboard, useDashboardData } from "@/lib/hooks";

const { data, loading, error } = useDashboard();
const dashboardData = useDashboardData();
```

#### Sales

```jsx
import { useSales, useSalesList, useCurrentSale } from "@/lib/hooks";

const { sales, loading, error, total } = useSales();
const salesList = useSalesList();
const currentSale = useCurrentSale();
```

#### Customers

```jsx
import {
  useCustomers,
  useCustomersList,
  useCurrentCustomer,
} from "@/lib/hooks";

const { customers, loading, error, total } = useCustomers();
const customersList = useCustomersList();
const currentCustomer = useCurrentCustomer();
```

#### Products

```jsx
import { useProducts, useProductsList, useCurrentProduct } from "@/lib/hooks";

const { products, loading, error, total } = useProducts();
const productsList = useProductsList();
const currentProduct = useCurrentProduct();
```

## 📋 Available Actions

### Authentication

- `loginUser(credentials)` - Login user
- `logoutUser()` - Logout user
- `getCurrentUser()` - Get current user

### Dashboard

- `fetchDashboardData()` - Fetch dashboard overview
- `fetchDashboardStats()` - Fetch dashboard statistics

### Sales

- `fetchSales(params)` - Fetch all sales
- `fetchSaleById(id)` - Fetch specific sale
- `createSale(data)` - Create new sale
- `updateSale({id, data})` - Update sale
- `deleteSale(id)` - Delete sale

### Customers

- `fetchCustomers(params)` - Fetch all customers
- `fetchCustomerById(id)` - Fetch specific customer
- `createCustomer(data)` - Create new customer
- `updateCustomer({id, data})` - Update customer
- `deleteCustomer(id)` - Delete customer

### Products

- `fetchProducts(params)` - Fetch all products
- `fetchProductById(id)` - Fetch specific product
- `createProduct(data)` - Create new product
- `updateProduct({id, data})` - Update product
- `deleteProduct(id)` - Delete product

### Purchases

- `fetchPurchases(params)` - Fetch all purchases
- `fetchPurchaseById(id)` - Fetch specific purchase
- `createPurchase(data)` - Create new purchase
- `updatePurchase({id, data})` - Update purchase
- `deletePurchase(id)` - Delete purchase

### Vendors

- `fetchVendors(params)` - Fetch all vendors
- `fetchVendorById(id)` - Fetch specific vendor
- `createVendor(data)` - Create new vendor
- `updateVendor({id, data})` - Update vendor
- `deleteVendor(id)` - Delete vendor

## 💡 Best Practices

### 1. Component Structure

```jsx
const MyComponent = () => {
  const dispatch = useAppDispatch();
  const data = useDataList();
  const { loading, error } = useData();

  useEffect(() => {
    dispatch(fetchData());
  }, [dispatch]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return <YourComponent data={data} />;
};
```

### 2. Error Handling

```jsx
const handleSubmit = async (formData) => {
  try {
    await dispatch(createItem(formData)).unwrap();
    // Success handling
  } catch (error) {
    // Error is automatically handled by Redux slice
    console.error("Operation failed:", error);
  }
};
```

### 3. Loading States

```jsx
const { loading, error, data } = useData();

if (loading) {
  return <div>Loading...</div>;
}

if (error) {
  return <div>Error: {error}</div>;
}
```

## 🔄 State Updates

Redux automatically handles state updates when actions are dispatched:

- **Fetch actions** populate the state with API data
- **Create actions** add new items to the beginning of lists
- **Update actions** modify existing items in place
- **Delete actions** remove items from lists

## 📊 State Structure

### Auth State

```javascript
{
  user: null | UserObject,
  isAuthenticated: boolean,
  loading: boolean,
  error: string | null
}
```

### Data States (Sales, Customers, Products, etc.)

```javascript
{
  items: [],           // Array of items
  currentItem: null,   // Currently selected item
  loading: boolean,
  error: string | null,
  total: number,
  totalPages: number,
  currentPage: number,
  lastFetched: string  // ISO timestamp
}
```

### Dashboard State

```javascript
{
  data: {
    overview: { /* dashboard overview data */ },
    recentActivity: { /* recent activity data */ },
    monthlyStats: { /* monthly statistics */ },
    salesTrend: [],    // Sales trend data
    topProducts: [],   // Top products data
    // ... other dashboard data
  },
  stats: { /* additional statistics */ },
  loading: boolean,
  error: string | null,
  lastFetched: string
}
```

## 🎯 Benefits

1. **Centralized State**: All application state in one place
2. **Performance**: Automatic caching and optimized re-renders
3. **Developer Experience**: Better debugging with Redux DevTools
4. **Consistency**: Standardized data flow across components
5. **Scalability**: Easy to add new features and state slices

## 🔧 Development

### Adding New Slices

1. Create a new slice file in `lib/store/slices/`
2. Add the reducer to `lib/store.js`
3. Create custom hooks in `lib/hooks.js`
4. Use in components

### Debugging

- Install Redux DevTools browser extension
- All state changes are logged and inspectable
- Time-travel debugging available

## 📝 Migration Guide

### Before (Direct API calls)

```jsx
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getData();
      setData(response);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

### After (Redux)

```jsx
const dispatch = useAppDispatch();
const data = useDataList();
const { loading } = useData();

useEffect(() => {
  dispatch(fetchData());
}, [dispatch]);
```

This Redux implementation provides a robust, scalable foundation for the Prima ERP application with improved performance and developer experience.
