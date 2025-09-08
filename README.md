# Prima ERP - Unified Next.js Application

## Overview
This is a complete business management system built with Next.js, featuring both frontend and backend functionality in a single unified application.

## Project Structure

```
prima-erp/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes (Backend functionality)
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── products/             # Product management
│   │   ├── customers/            # Customer management
│   │   ├── sales/                # Sales management
│   │   ├── vendors/              # Vendor management
│   │   ├── stock/                # Stock management
│   │   ├── dashboard/            # Dashboard analytics
│   │   └── health/               # Health check
│   ├── (auth)/                   # Authentication pages
│   ├── dashboard/                # Dashboard pages
│   ├── reports/                  # Reports pages
│   ├── globals.css               # Global styles
│   ├── layout.jsx                # Root layout
│   └── page.jsx                  # Home page
├── components/                   # React components
├── lib/                          # Utility libraries
│   ├── mongodb.js                # Database connection
│   └── providers.js              # Context providers
├── models/                       # Mongoose models
├── hooks/                        # Custom React hooks
├── store/                        # Redux store
├── public/                       # Static assets
├── scripts/                      # Database seeding scripts
├── middleware.js                 # Next.js middleware for auth & CORS
├── package.json                  # Dependencies and scripts
├── next.config.ts                # Next.js configuration
├── tailwind.config.js            # Tailwind CSS configuration
└── tsconfig.json                 # TypeScript configuration
```

## Features

### ✅ Implemented
- **Authentication System** - JWT-based login/logout
- **Product Management** - Full CRUD operations
- **Customer Management** - Customer data and transaction history
- **Sales Management** - Sales processing with stock integration
- **Stock Management** - Inventory tracking and management
- **Vendor Management** - Vendor information management
- **Dashboard Analytics** - Business insights and statistics
- **Database Integration** - MongoDB with Mongoose
- **API Security** - Authentication middleware and CORS
- **Health Monitoring** - System health check endpoint

### 🚧 In Progress
- Purchase management
- Payment management
- User management
- Company management
- Reports generation

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account or local MongoDB
- Git

### Installation

1. **Clone and setup:**
   ```bash
   git clone <repository-url>
   cd prima-erp
   npm install
   ```

2. **Environment configuration:**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/prima-erp
   JWT_SECRET=your-super-secret-jwt-key-here
   NODE_ENV=development
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Visit [http://localhost:3000](http://localhost:3000)

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products (with pagination & search)
- `POST /api/products` - Create new product
- `GET /api/products/[id]` - Get product by ID
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Customers
- `GET /api/customers` - Get all customers (with pagination & search)
- `POST /api/customers` - Create new customer
- `GET /api/customers/[id]` - Get customer by ID
- `PUT /api/customers/[id]` - Update customer
- `DELETE /api/customers/[id]` - Delete customer
- `GET /api/customers/[id]/transactions` - Get customer transactions

### Sales
- `GET /api/sales` - Get all sales (with filtering)
- `POST /api/sales` - Create new sale
- `GET /api/sales/[id]` - Get sale by ID
- `PUT /api/sales/[id]` - Update sale
- `DELETE /api/sales/[id]` - Delete sale

### Stock
- `GET /api/stock` - Get all stock data
- `POST /api/stock` - Create new stock entry
- `GET /api/stock/[id]` - Get stock by ID
- `PUT /api/stock/[id]` - Update stock entry
- `DELETE /api/stock/[id]` - Delete stock entry

### Dashboard
- `GET /api/dashboard` - Get dashboard overview data
- `GET /api/dashboard/stats` - Get dashboard statistics

### Health Check
- `GET /api/health` - System health check

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with HTTP-only cookies
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Deployment**: Vercel (recommended)

## Security Features

- JWT-based authentication
- HTTP-only cookies for token storage
- CORS protection
- Input validation
- Role-based access control
- SQL injection prevention (MongoDB)

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
The project can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Development

### Adding New API Routes
1. Create a new directory in `app/api/`
2. Add `route.js` file with exported functions (GET, POST, PUT, DELETE)
3. Use the existing patterns for database connections and error handling

### Adding New Pages
1. Create a new directory in `app/`
2. Add `page.jsx` or `page.tsx` file
3. Use the existing layout and styling patterns

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MongoDB URI in environment variables
   - Ensure MongoDB is running and accessible

2. **Authentication Issues**
   - Verify JWT_SECRET is set
   - Check cookie settings in browser

3. **API Routes Not Working**
   - Ensure middleware.js is properly configured
   - Check Next.js version compatibility

### Getting Help

- Check the console for error messages
- Verify environment variables are set correctly
- Ensure all dependencies are installed
- Check MongoDB connection status

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary software. All rights reserved.

---

**Note**: This is a unified Next.js application. The old separate frontend and backend directories have been removed and all functionality has been consolidated into this single project.