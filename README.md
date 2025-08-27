# Prima ERP - Sales & Marketing

A complete ERP system for sales and marketing management with role-based access control.

## 🚀 Features

- **User Authentication**: Secure login with JWT tokens
- **Role-Based Access Control**: Admin, Manager, Accountant, and Delivery Agent roles
- **Dashboard**: Role-specific dashboards with stats and quick actions
- **Mobile Responsive**: Works perfectly on all devices
- **Modern UI**: Clean, professional design with Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens with HTTP-only cookies
- **Security**: bcryptjs for password hashing

## 📋 Prerequisites

- Node.js 18+
- MongoDB (local or cloud)
- npm or yarn

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Navigate to the project directory
cd prima-erp

# Install dependencies
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/prima-erp
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

Make sure MongoDB is running, then seed the database:

```bash
npm run seed
```

This will create initial users with the following credentials:

| Role           | Email                | Password      |
| -------------- | -------------------- | ------------- |
| Admin          | admin@prima.com      | admin123      |
| Manager        | manager@prima.com    | manager123    |
| Accountant     | accountant@prima.com | accountant123 |
| Delivery Agent | agent1@prima.com     | agent123      |

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```env
MONGODB_URI=mongodb+srv://anushasurendran566:anusha@cluster0.yaq5ykd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## MongoDB Atlas Setup

Before running the application, make sure to:

1. **Whitelist Your IP Address**:

   - Log into [MongoDB Atlas](https://cloud.mongodb.com)
   - Go to your cluster → Network Access
   - Click "Add IP Address"
   - Choose "Add Current IP Address" or "Allow Access from Anywhere" (0.0.0.0/0)

2. **Add Users to Database**:
   - After whitelisting your IP, run: `node add-user.js`
   - This will create the following users:
     - Admin: admin@prima.com / admin123
     - Manager: manager@prima.com / manager123
     - Accountant: accountant@prima.com / accountant123
     - Agent: agent1@prima.com / agent123

## 👥 User Roles & Access

### Admin/Manager/Accountant

- Full access to all features
- Dashboard with company-wide stats
- Sales Management
- Purchase Management
- Stock Management
- Payment Tracking
- Reports
- Settings

### Delivery Agent

- Limited access to assigned deliveries
- Personal dashboard with individual stats
- Create Sale
- Collect Payment
- My Stock
- Today's Route

## 📁 Project Structure

```
prima-erp/
├── app/
│   ├── (auth)/           # Authentication pages
│   │   ├── login/
│   │   └── layout.jsx
│   ├── dashboard/        # Dashboard pages
│   │   ├── page.jsx
│   │   └── layout.jsx
│   ├── api/             # API routes
│   │   ├── auth/
│   │   └── users/
│   ├── globals.css
│   ├── layout.jsx
│   └── page.jsx
├── components/
│   ├── ui/              # Reusable UI components
│   ├── LoginForm.jsx
│   ├── Navigation.jsx
│   └── ProtectedRoute.jsx
├── lib/
│   ├── mongodb.js       # Database connection
│   ├── auth.js          # Authentication utilities
│   ├── utils.js         # Helper functions
│   └── seed.js          # Database seeder
├── models/
│   └── User.js          # User model
└── middleware.js        # Route protection
```

## 🔐 Security Features

- **Password Hashing**: bcryptjs with 12+ salt rounds
- **JWT Tokens**: Stored in HTTP-only cookies
- **CORS Protection**: Configured for API routes
- **Input Validation**: Form validation and sanitization
- **SQL Injection Protection**: Mongoose ODM
- **Rate Limiting**: Built-in protection
- **Environment Variables**: Secure configuration

## 📱 Mobile Features

- **Responsive Design**: Tailwind CSS responsive classes
- **Touch-Friendly**: Optimized for mobile interaction
- **Mobile Navigation**: Hamburger menu for mobile
- **Fast Loading**: Optimized for mobile networks
- **Cross-Browser**: Works on iOS Safari and Android Chrome

## 🧪 Testing

Test the following scenarios:

1. **Login with valid credentials** ✅
2. **Login with invalid credentials** ✅
3. **Access dashboard after login** ✅
4. **Logout functionality** ✅
5. **Protected route access** ✅
6. **Role-based navigation** ✅
7. **Mobile responsive design** ✅
8. **Page refresh maintains session** ✅

## 🎨 Design System

### Colors

- **Primary**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Danger**: Red (#EF4444)
- **Gray**: Various shades for text and borders

### Typography

- **Headings**: font-bold, text-xl/2xl/3xl
- **Body**: font-normal, text-sm/base
- **Labels**: font-medium, text-sm

### Layout

- **Max width**: 1200px centered
- **Padding**: 4-6 on mobile, 8-12 on desktop
- **Cards**: rounded-lg, shadow-sm, border

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run seed         # Seed database with initial data
```

### Adding New Features

1. Create API routes in `app/api/`
2. Add components in `components/`
3. Create pages in `app/`
4. Update navigation in `components/Navigation.jsx`
5. Add role-based access control

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@prima-erp.com or create an issue in the repository.

---

**Ready for next feature:** Sales Invoice Creation
