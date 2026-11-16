
"use client";

import {
    useState,
} from "react";

type Product = {
    id: string;
    name: string;
    slug: string;
    artist: string;
    price: number;
    images: string[] | null;
    stock: number;
};

type Performance = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    performance_date: string | null;
    cover_image: string | null;
    video_url: string | null;
    audio_url: string | null;
};

type NewsletterEditorProps = {
    products: Product[];
    performances: Performance[];
};

const labelClassName =
    "font-october text-xl uppercase leading-none text-black";

const inputClassName =
    "w-full min-w-0 rounded-xl border border-black bg-white px-4 py-3 text-base text-black outline-none transition-colors placeholder:text-black/35 focus:ring-2 focus:ring-black/15";

const sectionTitleClassName =
    "font-october text-3xl uppercase leading-none text-black";

function formatPerformanceDate(
    date: string | null,
) {
    if (!date) {
        return "";
    }

    return new Intl.DateTimeFormat(
        "pt-BR",
        {
            day: "2-digit",
            month: "long",
            year: "numeric",
            timeZone: "UTC",
        },
    ).format(
        new Date(date),
    );
}

export function NewsletterEditor({
    products,
    performances,
}: NewsletterEditorProps) {
    const [
        subject,
        setSubject,
    ] = useState("");

    const [
        title,
        setTitle,
    ] = useState("");

    const [
        content,
        setContent,
    ] = useState("");

    const [
        selectedProducts,
        setSelectedProducts,
    ] = useState<string[]>([]);

    const [
        selectedPerformances,
        setSelectedPerformances,
    ] = useState<string[]>([]);

    function toggleProduct(
        productId: string,
    ) {
        setSelectedProducts(
            (current) => {
                if (
                    current.includes(
                        productId,
                    )
                ) {
                    return current.filter(
                        (id) =>
                            id !== productId,
                    );
                }

                return [
                    ...current,
                    productId,
                ];
            },
        );
    }

    function togglePerformance(
        performanceId: string,
    ) {
        setSelectedPerformances(
            (current) => {
                if (
                    current.includes(
                        performanceId,
                    )
                ) {
                    return current.filter(
                        (id) =>
                            id !== performanceId,
                    );
                }

                return [
                    ...current,
                    performanceId,
                ];
            },
        );
    }

    return (
        <div className="grid items-start gap-10 lg:grid-cols-2">
            <div className="flex min-w-0 flex-col gap-10">
                <section className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3">
                        <label
                            htmlFor="subject"
                            className={labelClassName}
                        >
                            Assunto
                        </label>

                        <input
                            id="subject"
                            type="text"
                            value={subject}
                            onChange={(event) =>
                                setSubject(
                                    event.target.value,
                                )
                            }
                            placeholder="Discos novos na Casa Elefante"
                            className={inputClassName}
                        />
                    </div>

                    <div className="flex flex-col gap-3">
                        <label
                            htmlFor="title"
                            className={labelClassName}
                        >
                            Título
                        </label>

                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(event) =>
                                setTitle(
                                    event.target.value,
                                )
                            }
                            placeholder="Chegaram por aqui"
                            className={inputClassName}
                        />
                    </div>

                    <div className="flex flex-col gap-3">
                        <label
                            htmlFor="content"
                            className={labelClassName}
                        >
                            Texto
                        </label>

                        <textarea
                            id="content"
                            value={content}
                            onChange={(event) =>
                                setContent(
                                    event.target.value,
                                )
                            }
                            rows={8}
                            placeholder="Escreva o texto da newsletter..."
                            className={`${inputClassName} resize-y`}
                        />
                    </div>
                </section>

                <section className="border-t border-black/20 pt-8">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className={sectionTitleClassName}>
                            Produtos
                        </h2>

                        <span className="rounded-lg border border-black bg-white px-3 py-1 text-xs font-medium text-black">
                            {selectedProducts.length} selecionados
                        </span>
                    </div>

                    <div className="mt-5 max-h-[500px] overflow-y-auto rounded-xl border border-black bg-white shadow-[-5px_5px_0_0_#000]">
                        {products.map(
                            (product) => {
                                const selected =
                                    selectedProducts.includes(
                                        product.id,
                                    );

                                return (
                                    <button
                                        key={product.id}
                                        type="button"
                                        aria-pressed={selected}
                                        onClick={() =>
                                            toggleProduct(
                                                product.id,
                                            )
                                        }
                                        className={`flex w-full items-center gap-4 border-b border-black/20 p-4 text-left transition-colors last:border-b-0 ${
                                            selected
                                                ? "bg-white"
                                                : "bg-white hover:bg-white/60"
                                        }`}
                                    >
                                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-black/20 bg-white">
                                            {product.images?.[0] && (
                                                <img
                                                    src={product.images[0]}
                                                    alt=""
                                                    className="h-full w-full object-cover"
                                                />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-black">
                                                {product.name}
                                            </p>

                                            <p className="mt-1 truncate text-sm text-black/60">
                                                {product.artist}
                                            </p>
                                        </div>

                                        <div
                                            aria-hidden="true"
                                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-black text-sm font-bold ${
                                                selected
                                                    ? "bg-white text-black"
                                                    : "bg-white text-black"
                                            }`}
                                        >
                                            {selected && "✓"}
                                        </div>
                                    </button>
                                );
                            },
                        )}
                    </div>
                </section>

                <section className="border-t border-black/20 pt-8">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className={sectionTitleClassName}>
                            Apresentações
                        </h2>

                        <span className="rounded-lg border border-black bg-white px-3 py-1 text-xs font-medium text-black">
                            {selectedPerformances.length} selecionadas
                        </span>
                    </div>

                    <div className="mt-5 max-h-[500px] overflow-y-auto rounded-xl border border-black bg-white shadow-[-5px_5px_0_0_#000]">
                        {performances.length === 0 && (
                            <div className="p-5 text-sm text-black/60">
                                Nenhuma apresentação disponível.
                            </div>
                        )}

                        {performances.map(
                            (performance) => {
                                const selected =
                                    selectedPerformances.includes(
                                        performance.id,
                                    );

                                return (
                                    <button
                                        key={performance.id}
                                        type="button"
                                        aria-pressed={selected}
                                        onClick={() =>
                                            togglePerformance(
                                                performance.id,
                                            )
                                        }
                                        className={`flex w-full items-center gap-4 border-b border-black/20 p-4 text-left transition-colors last:border-b-0 ${
                                            selected
                                                ? "bg-white"
                                                : "bg-white hover:bg-white/60"
                                        }`}
                                    >
                                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-black/20 bg-white">
                                            {performance.cover_image && (
                                                <img
                                                    src={performance.cover_image}
                                                    alt=""
                                                    className="h-full w-full object-cover"
                                                />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-black">
                                                {performance.name}
                                            </p>

                                            {performance.performance_date && (
                                                <p className="mt-1 text-sm text-black/60">
                                                    {formatPerformanceDate(
                                                        performance.performance_date,
                                                    )}
                                                </p>
                                            )}

                                            {(performance.audio_url ||
                                                performance.video_url) && (
                                                <div className="mt-2 flex flex-wrap gap-2 text-xs text-black/60">
                                                    {performance.audio_url && (
                                                        <span className="rounded-md border border-black/20 px-2 py-1">
                                                            Áudio
                                                        </span>
                                                    )}

                                                    {performance.video_url && (
                                                        <span className="rounded-md border border-black/20 px-2 py-1">
                                                            Vídeo
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div
                                            aria-hidden="true"
                                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-black text-sm font-bold ${
                                                selected
                                                    ? "bg-[#D2232A] text-white"
                                                    : "bg-white text-black"
                                            }`}
                                        >
                                            {selected && "✓"}
                                        </div>
                                    </button>
                                );
                            },
                        )}
                    </div>
                </section>
            </div>

            <div className="min-w-0">
                <div className="lg:sticky lg:top-24">
                    <h2 className={`${sectionTitleClassName} mb-5`}>
                        Prévia
                    </h2>

                    <div className="rounded-xl border border-black bg-white p-6 text-black shadow-[-5px_5px_0_0_#000] md:p-8">
                        <p className="font-october text-center text-3xl uppercase leading-none text-black">
                            Casa Elefante
                        </p>

                        {title && (
                            <h2 className="mt-10 font-october text-4xl uppercase leading-none text-black">
                                {title}
                            </h2>
                        )}

                        {content && (
                            <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-black/80">
                                {content}
                            </p>
                        )}

                        {selectedProducts.length > 0 && (
                            <div className="mt-10 border-t border-black/20 pt-8">
                                <h3 className="font-october text-2xl uppercase leading-none text-black">
                                    Discos
                                </h3>

                                <div className="mt-5 grid grid-cols-2 gap-4">
                                    {products
                                        .filter(
                                            (product) =>
                                                selectedProducts.includes(
                                                    product.id,
                                                ),
                                        )
                                        .map(
                                            (product) => (
                                                <div
                                                    key={product.id}
                                                    className="min-w-0"
                                                >
                                                    <div className="aspect-square overflow-hidden rounded-xl border border-black/20 bg-white">
                                                        {product.images?.[0] && (
                                                            <img
                                                                src={product.images[0]}
                                                                alt=""
                                                                className="h-full w-full object-cover"
                                                            />
                                                        )}
                                                    </div>

                                                    <p className="mt-3 text-sm font-medium text-black">
                                                        {product.name}
                                                    </p>

                                                    <p className="mt-1 text-xs text-black/60">
                                                        {product.artist}
                                                    </p>

                                                    <p className="mt-2 text-sm font-medium text-black">
                                                        {Number(
                                                            product.price,
                                                        ).toLocaleString(
                                                            "pt-BR",
                                                            {
                                                                style: "currency",
                                                                currency: "BRL",
                                                            },
                                                        )}
                                                    </p>
                                                </div>
                                            ),
                                        )}
                                </div>
                            </div>
                        )}

                        {selectedPerformances.length > 0 && (
                            <div className="mt-10 border-t border-black/20 pt-8">
                                <h3 className="font-october text-2xl uppercase leading-none text-black">
                                    Apresentações
                                </h3>

                                <div className="mt-6 flex flex-col gap-8">
                                    {performances
                                        .filter(
                                            (performance) =>
                                                selectedPerformances.includes(
                                                    performance.id,
                                                ),
                                        )
                                        .map(
                                            (performance) => (
                                                <div
                                                    key={performance.id}
                                                >
                                                    {performance.cover_image && (
                                                        <div className="aspect-video overflow-hidden rounded-xl border border-black/20 bg-white">
                                                            <img
                                                                src={performance.cover_image}
                                                                alt=""
                                                                className="h-full w-full object-cover"
                                                            />
                                                        </div>
                                                    )}

                                                    {performance.performance_date && (
                                                        <p className="mt-4 text-xs font-medium uppercase text-black">
                                                            {formatPerformanceDate(
                                                                performance.performance_date,
                                                            )}
                                                        </p>
                                                    )}

                                                    <p className="mt-2 text-2xl  leading-none text-black">
                                                        {performance.name}
                                                    </p>

                                                    {performance.description && (
                                                        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-black/70">
                                                            {performance.description}
                                                        </p>
                                                    )}

                                                    {(performance.audio_url ||
                                                        performance.video_url) && (
                                                        <div className="mt-4 flex flex-wrap gap-3 text-xs font-medium text-black">
                                                            {performance.audio_url && (
                                                                <span className="rounded-lg border border-black px-3 py-2">
                                                                    Ouvir áudio
                                                                </span>
                                                            )}

                                                            {performance.video_url && (
                                                                <span className="rounded-lg border border-black px-3 py-2">
                                                                    Assistir vídeo
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ),
                                        )}
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        disabled
                        className="mt-6 inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl border border-black bg-white px-6 py-3 text-base font-medium text-black opacity-40 shadow-[-5px_5px_0_0_#000]"
                    >
                        Enviar newsletter
                    </button>
                </div>
            </div>
        </div>
    );
}
