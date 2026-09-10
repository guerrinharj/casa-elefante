import type { Metadata } from "next";

import { Suspense } from "react";
import localFont from "next/font/local";

import "./globals.css";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

const grotesque = localFont({
    src: "./fonts/Grotesque.ttf",
    variable: "--font-grotesque",
    display: "swap",
});

const gillSans = localFont({
    src: "./fonts/GillSans.otf",
    variable: "--font-gill-sans",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Casa Elefante",
    description: "Loja de discos, música e Toda Terça Tem.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="pt-BR"
            className={`${grotesque.variable} ${gillSans.variable}`}
        >
            <body>
                <Suspense
                    fallback={
                        <header className="border-b border-black">
                            <div className="h-[65px]" />
                        </header>
                    }
                >
                    <Navbar />
                </Suspense>

                <main>
                    {children}
                </main>

                <Footer />
            </body>
        </html>
    );
}