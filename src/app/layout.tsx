import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const lexend = Lexend({
    variable: "--font-lexend",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Produce",
    description: "Get stuff done",
};

export default function RootLayout({
    children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${lexend.variable} antialiased h-screen`}
            >
                {children}
                <Analytics />
            </body>
        </html>
    );
}
