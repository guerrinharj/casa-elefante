
export function AboutSection() {
    return (
        <section
            id="sobre"
            className="border-t-2 border-[#D2232A] px-2 py-16 md:py-24"
        >
            <div className="grid gap-10 md:grid-cols-12">
                <div className="md:col-span-4">
                    <h2 className="font-october text-6xl uppercase leading-none md:text-7xl">
                        Sobre
                    </h2>
                </div>

                <div className="md:col-span-8">
                    <p className="text-2xl leading-tight md:text-4xl">
                        A Casa Elefante é mais que uma loja de discos.
                        Somos um ponto de encontro para amantes da música
                        independente, um espaço para descobrir novos sons e
                        reviver clássicos.
                    </p>

                    <div className="mt-12 max-w-2xl space-y-6 text-base leading-relaxed md:text-lg">
                        <p>
                            Nascemos em São Paulo com a missão de fortalecer
                            a cena da música independente, oferecendo uma
                            curadoria especial de livros, discos de vinil,
                            CDs e K7s.
                        </p>

                        <p>
                            Acreditamos no poder da cultura e da música para
                            conectar pessoas e criar experiências
                            memoráveis.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
