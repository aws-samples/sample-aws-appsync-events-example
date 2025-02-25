"use client"
import { useTranslation } from 'react-i18next';
import "@aws-amplify/ui-react/styles.css";
import localFont from "next/font/local";
import AuthProvider from "./components/AuthProvider";
import "./globals.css";
import "../i18n";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const { t } = useTranslation();

  return (
    <html lang="en">
      <title>{t('root.topbar.title')}</title>
      <body className={`${geistSans.variable} ${geistMono.variable}`} style={{backgroundColor: 'white'}}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
