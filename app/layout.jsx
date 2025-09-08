import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";
import LoadTimeMonitor from "@/components/performance/LoadTimeMonitor";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Prima ERP - Sales & Marketing",
  description: "Complete ERP solution for sales and marketing management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <LoadTimeMonitor />
      </body>
    </html>
  );
}
