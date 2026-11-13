
import type {
    Metadata,
} from "next";

import {
    Suspense,
} from "react";

import localFont from "next/font/local";

import "./globals.css";

import {
    CartProvider,
} from "@/components/cart/cart-provider";

import {
    AudioPlayerProvider,
} from "@/components/toda-terca-tem/audio-player-provider";

import {
    Navbar,
} from "@/components/layout/navbar";

import {
    OrderConfirmedBanner,
} from "@/components/orders/order-confirmed-banner";

import {
    ScrollBackground,
} from "@/components/layout/scroll-background";

import {
    PageTransitionProvider,
} from "@/components/layout/page-transition-provider";

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

const questrial = localFont({
    src: "./fonts/Questrial-Regular.ttf",
    variable: "--font-questrial",
    display: "swap",
});

const anton = localFont({
    src: "./fonts/Anton-Regular.ttf",
    variable: "--font-anton",
    display: "swap",
});

const windsor = localFont({
    src: "./fonts/WindsorProX.ttf",
    variable: "--font-windsor",
    display: "swap",
});

const october = localFont({
    src: "./fonts/OctoberCompressedDevanagari.ttf",
    variable: "--font-october",
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
            className={`
                ${grotesque.variable}
                ${gillSans.variable}
                ${questrial.variable}
                ${anton.variable}
                ${windsor.variable}
                ${october.variable}
            `}
        >
            <body>
                <ScrollBackground />

                <CartProvider>
                    <AudioPlayerProvider>
                        <PageTransitionProvider>
                            <Suspense
                                fallback={
                                    <header className="border-b border-black">
                                        <div className="h-[65px]" />
                                    </header>
                                }
                            >
                                <Navbar />
                            </Suspense>

                            <Suspense fallback={null}>
                                <OrderConfirmedBanner />
                            </Suspense>

                            <main className="pb-[320px]">
                                {children}
                            </main>
                        </PageTransitionProvider>
                    </AudioPlayerProvider>
                </CartProvider>
            </body>
        </html>
    );
}
