import Link from "next/link";

export function Navbar() {
    return (
        <header className="border-b border-black">
            <div className="flex items-center justify-between px-6 py-4">
                <Link href="/" className="text-xl font-bold uppercase">
                    Casa Elefante
                </Link>

                <nav>
                    <ul className="flex gap-6">
                        <li>
                            <Link href="/">Loja</Link>
                        </li>

                        <li>
                            <Link href="/toda-terca-tem">
                                Toda Terça Tem
                            </Link>
                        </li>

                        <li>
                            <Link href="/sobre">Sobre</Link>
                        </li>

                        <li>
                            <Link href="/contato">Contato</Link>
                        </li>

                        <li>
                            <Link href="/newsletter">Newsletter</Link>
                        </li>

                        <li>
                            <Link href="/carrinho">Carrinho</Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}