import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DevLog Agent",
  description: "AI summaries for developer logs",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
