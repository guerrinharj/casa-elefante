import type { Metadata } from "next";
import "./globals.css";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

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
        <html lang="pt-BR">
            <body>
                <Navbar />

                <main>
                    {children}
                </main>

                <Footer />
            </body>
        </html>
    );
}