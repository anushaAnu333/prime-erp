# Prima ERP - Monorepo Structure

This project has been restructured into a monorepo with separate frontend and backend folders for better organization and performance optimization.

## 🏗️ Project Structure

```
prima-erp/
├── frontend/                 # Next.js Frontend Application
│   ├── app/                 # Next.js App Router
│   ├── components/          # React Components
│   ├── hooks/              # Custom React Hooks
│   ├── lib/                # Frontend Utilities
│   ├── public/             # Static Assets
│   └── package.json        # Frontend Dependencies
├── backend/                # Express.js Backend API
│   ├── models/             # MongoDB Models
│   ├── routes/             # API Routes
│   ├── lib/                # Backend Utilities
│   ├── scripts/            # Database Scripts
│   └── package.json        # Backend Dependencies
└── package.json            # Root Monorepo Configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm 8+
- MongoDB

### Installation

1. **Install all dependencies:**

   ```bash
   npm run install:all
   ```

2. **Set up environment variables:**
   Create `.env` files in both frontend and backend directories:

   **Backend (.env):**

   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=3001
   NODE_ENV=development
   ```

   **Frontend (.env.local):**

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

3. **Start development servers:**

   ```bash
   npm run dev
   ```

   This will start both frontend (port 3000) and backend (port 3001) concurrently.

## 📦 Available Scripts

### Root Level (Monorepo)

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both frontend and backend
- `npm run start` - Start both frontend and backend in production mode
- `npm run install:all` - Install dependencies for all packages
- `npm run lint` - Lint both frontend and backend
- `npm run clean` - Clean all node_modules and build files
- `npm run optimize` - Run optimization scripts for both packages

### Frontend Only

- `npm run dev:frontend` - Start frontend development server
- `npm run build:frontend` - Build frontend for production
- `npm run start:frontend` - Start frontend production server
- `npm run optimize:frontend` - Optimize frontend bundle

### Backend Only

- `npm run dev:backend` - Start backend development server
- `npm run build:backend` - Build backend
- `npm run start:backend` - Start backend production server
- `npm run optimize:backend` - Optimize backend

## ⚡ Performance Optimizations

### Frontend Optimizations

- **Turbopack** for faster development builds
- **SWC Minification** for faster production builds
- **Code Splitting** with dynamic imports
- **Image Optimization** with Next.js Image component
- **API Response Caching** with intelligent cache invalidation
- **Bundle Analysis** with `npm run analyze`
- **Lazy Loading** for components and routes
- **Service Worker** for offline support (optional)

### Backend Optimizations

- **Connection Pooling** for MongoDB
- **Response Caching** with Redis (optional)
- **Request Rate Limiting**
- **Compression** middleware
- **Error Handling** with proper logging
- **Health Check** endpoints

### API Optimizations

- **Intelligent Caching** with 5-minute TTL
- **Request Deduplication** for concurrent requests
- **Error Retry Logic** with exponential backoff
- **Request Abortion** for cancelled requests
- **Real-time Updates** with WebSocket support

## 🔧 Development Features

### Frontend

- **TypeScript** support
- **Tailwind CSS** for styling
- **ESLint** for code quality
- **Hot Module Replacement** for fast development
- **Component Library** with reusable UI components
- **Form Validation** with custom hooks
- **State Management** with React hooks

### Backend

- **Express.js** framework
- **MongoDB** with Mongoose ODM
- **JWT Authentication** with secure cookies
- **CORS** configuration
- **Request Validation** middleware
- **Error Handling** middleware
- **Logging** with structured logs

## 📊 Monitoring & Analytics

### Performance Monitoring

- **Bundle Size Analysis** with webpack-bundle-analyzer
- **API Response Times** monitoring
- **Error Tracking** with proper error boundaries
- **User Experience Metrics** tracking

### Development Tools

- **Hot Reload** for both frontend and backend
- **Debug Logging** in development mode
- **API Documentation** with Swagger (planned)
- **Database Seeding** scripts

## 🚀 Deployment

### Frontend Deployment

The frontend can be deployed to:

- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS S3 + CloudFront**
- **Any static hosting service**

### Backend Deployment

The backend can be deployed to:

- **Railway**
- **Heroku**
- **AWS EC2**
- **DigitalOcean**
- **Any Node.js hosting service**

### Environment Variables

Make sure to set the following environment variables in production:

**Frontend:**

- `NEXT_PUBLIC_API_URL` - Backend API URL

**Backend:**

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `NODE_ENV` - Set to 'production'
- `PORT` - Server port (optional)

## 🔒 Security Features

- **JWT Authentication** with secure HTTP-only cookies
- **CORS** protection
- **Input Validation** and sanitization
- **Rate Limiting** (implemented in backend)
- **Secure Headers** with helmet middleware
- **SQL Injection** protection (MongoDB)
- **XSS Protection** with proper content encoding

## 📈 Performance Metrics

### Target Performance Goals

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms
- **API Response Time**: < 200ms

### Optimization Checklist

- [x] Code splitting implemented
- [x] Image optimization enabled
- [x] API response caching
- [x] Bundle size optimization
- [x] Lazy loading for components
- [x] Service worker (optional)
- [x] Database query optimization
- [x] CDN integration (deployment specific)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review the optimization guides in the docs folder
