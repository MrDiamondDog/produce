import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import Background from "@/components/Background";
import { Toaster } from "sonner";
import { CheckCircle2, CircleAlert, Info } from "lucide-react";

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
                className={`${lexend.variable} antialiased h-screen overflow-hidden`}
            >
                {children}
                <Background />
                <Analytics />

                <Toaster
                    className="toaster group"
                    theme="dark"
                    richColors
                    style={{
                        "--normal-bg": "var(--color-bg-light)",
                        "--normal-text": "white",
                        "--normal-border": "var(--color-bg-lightest)",
                    } as React.CSSProperties}
                    visibleToasts={5}
                    icons={{
                        success: <CheckCircle2 size={20} />,
                        error: <CircleAlert size={20} />,
                        info: <Info size={20} />,
                    }}
                />

                <div id="portal-root" />
            </body>
        </html>
    );
}
