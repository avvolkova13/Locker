import type { Metadata } from "next";
import { Tektur } from "next/font/google";
import "./globals.css";

const tektur = Tektur({
  subsets: ["cyrillic", "latin"],
  variable: "--font-tektur",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Locker | Цифровые товары под вашим контролем",
  description:
    "Locker - аккаунт для цифровых товаров: баланс, заказы и статусы.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" data-scroll-behavior="smooth">
      <body className={tektur.variable}>{children}</body>
    </html>
  );
}
