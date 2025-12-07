import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CallProvider } from "./contexts/CallContext";
import CallInterface from "./components/CallInterface";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CollabSpace",
  description: "A Slack alternative.",
  keywords: ["CollabSpace", "Collaboration", "Chat", "Messaging", "Team Communication"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CallProvider>
          {children}
          <CallInterface />
        </CallProvider>
      </body>
    </html>
  );
}
