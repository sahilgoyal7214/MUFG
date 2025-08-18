import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from '../components/providers/AuthProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Pension Insights Platform",
  description: "Comprehensive pension data analysis and insights platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 transition-colors duration-200">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
