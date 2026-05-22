import type { Metadata, Viewport } from "next";
import "./globals.css";
import SWRegister from "@/components/SWRegister";
import { UserProvider } from "@/lib/user-context";

export const metadata: Metadata = {
  title: "GetIt",
  description: "여행 쇼핑 리스트",
  manifest: "/manifest.json",
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GetIt",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FFFFFF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full bg-white text-[#1A1A1A] antialiased">
        <UserProvider>
          <div className="mx-auto max-w-[480px] min-h-dvh flex flex-col">
            {children}
          </div>
        </UserProvider>
        <SWRegister />
      </body>
    </html>
  );
}
