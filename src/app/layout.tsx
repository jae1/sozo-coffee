import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sozo Coffee",
  description: "A tiny shared coffee queue for our home church.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
