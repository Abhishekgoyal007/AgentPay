import type { Metadata } from "next";
import "./globals.css";
import { PrivyProvider } from "@/providers/PrivyProvider";

export const metadata: Metadata = {
  title: "AgentPay | AI Agent Payment Protocol on Movement",
  description: "The payment infrastructure for the agentic internet. AI agents pay each other for services in real-time using x402 on Movement Network.",
  keywords: ["AI agents", "crypto payments", "x402", "Movement Network", "micropayments", "DeFi", "Web3"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <PrivyProvider>
          {children}
        </PrivyProvider>
      </body>
    </html>
  );
}
