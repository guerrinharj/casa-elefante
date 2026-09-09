import Link from "next/link";

export default function HomePage() {
    return (
        <div className="min-h-[80vh]">
            <section className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
                <h1 className="text-6xl font-bold uppercase md:text-8xl">
                    Casa Elefante
                </h1>

                <p className="mt-4 max-w-xl text-lg">
                    Discos, música e outras coisas.
                </p>

                <Link
                    href="/loja"
                    className="mt-8 border border-black px-6 py-3 uppercase"
                >
                    Entrar na loja
                </Link>
            </section>
        </div>
    );
}