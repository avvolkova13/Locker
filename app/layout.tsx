import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Locker",
  description: "A trusted digital goods account.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
