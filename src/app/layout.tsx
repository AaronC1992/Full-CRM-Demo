import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "@/components/ui/Toast";
import { DemoModeProvider } from "@/components/demo/DemoModeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Full CRM Demo | Universal Demo Platform",
  description: "Premium CRM demo platform for local businesses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-gray-50`}>
        <DemoModeProvider>
          {children}
          <ToastContainer />
        </DemoModeProvider>
      </body>
    </html>
  );
}
