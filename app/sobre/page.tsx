export default function SobrePage() {
    return (
        <main className="px-6 py-12 md:px-10 md:py-16">
            <div className="mx-auto max-w-5xl">
                <div className="grid gap-10 md:grid-cols-12">
                    <div className="md:col-span-3">
                        <h1 className="text-sm uppercase">
                            Sobre
                        </h1>
                    </div>

                    <div className="md:col-span-8 md:col-start-5">
                        <p className="text-2xl leading-tight md:text-4xl md:leading-tight">
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
            </div>
        </main>
    );
}