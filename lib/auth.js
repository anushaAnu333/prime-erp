import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectDB } from './mongodb';
import User from './models/User';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        rememberMe: { label: 'Remember Me', type: 'checkbox' }
      },
      async authorize(credentials) {
        try {
          await connectDB();
          
          const { email, password } = credentials;
          
          // Find user by email
          const user = await User.findOne({ email: email.toLowerCase() });
          
          if (!user) {
            throw new Error('Invalid email or password');
          }
          
          // Check if user is active
          if (!user.isActive) {
            throw new Error('Account is deactivated. Please contact administrator.');
          }
          
          // Verify password
          const isPasswordValid = await user.comparePassword(password);
          
          if (!isPasswordValid) {
            throw new Error('Invalid email or password');
          }
          
          // Return user object (this will be available in session)
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            phone: user.phone,
            companyAccess: user.companyAccess,
            isActive: user.isActive,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phone = user.phone;
        token.companyAccess = user.companyAccess;
        token.isActive = user.isActive;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.phone = token.phone;
        session.user.companyAccess = token.companyAccess;
        session.user.isActive = token.isActive;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login', // Error code passed in query string as ?error=
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);