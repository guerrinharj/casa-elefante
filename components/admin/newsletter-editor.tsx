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

type NewsletterEditorProps = {
    products: Product[];
};

export function NewsletterEditor({
    products,
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
                            id !==
                            productId,
                    );
                }

                return [
                    ...current,
                    productId,
                ];
            },
        );
    }

    return (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1fr]">
            <div>
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="subject"
                            className="font-medium"
                        >
                            Assunto
                        </label>

                        <input
                            id="subject"
                            type="text"
                            value={subject}
                            onChange={(
                                event,
                            ) =>
                                setSubject(
                                    event
                                        .target
                                        .value,
                                )
                            }
                            placeholder="Discos novos na Casa Elefante"
                            className="rounded-xl border border-black bg-white p-3 outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="title"
                            className="font-medium"
                        >
                            Título
                        </label>

                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(
                                event,
                            ) =>
                                setTitle(
                                    event
                                        .target
                                        .value,
                                )
                            }
                            placeholder="Chegaram por aqui"
                            className="rounded-xl border border-black bg-white p-3 outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="content"
                            className="font-medium"
                        >
                            Texto
                        </label>

                        <textarea
                            id="content"
                            value={content}
                            onChange={(
                                event,
                            ) =>
                                setContent(
                                    event
                                        .target
                                        .value,
                                )
                            }
                            rows={8}
                            placeholder="Escreva o texto da newsletter..."
                            className="resize-none rounded-xl border border-black bg-white p-3 outline-none"
                        />
                    </div>
                </div>

                <div className="mt-10">
                    <h2 className="text-xl font-bold uppercase">
                        Produtos
                    </h2>

                    <div className="mt-4 max-h-[500px] overflow-y-auto rounded-xl border border-black bg-white">
                        {products.map(
                            (product) => {
                                const selected =
                                    selectedProducts.includes(
                                        product.id,
                                    );

                                return (
                                    <button
                                        key={
                                            product.id
                                        }
                                        type="button"
                                        onClick={() =>
                                            toggleProduct(
                                                product.id,
                                            )
                                        }
                                        className="flex w-full items-center gap-4 border-b border-black p-3 text-left last:border-b-0"
                                    >
                                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                                            {product
                                                .images?.[0] && (
                                                <img
                                                    src={
                                                        product
                                                            .images[0]
                                                    }
                                                    alt=""
                                                    className="h-full w-full object-cover"
                                                />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium">
                                                {
                                                    product.name
                                                }
                                            </p>

                                            <p className="truncate text-sm">
                                                {
                                                    product.artist
                                                }
                                            </p>
                                        </div>

                                        <div
                                            className={`flex h-6 w-6 items-center justify-center rounded-md border border-black ${
                                                selected
                                                    ? "bg-black text-white"
                                                    : "bg-white"
                                            }`}
                                        >
                                            {selected &&
                                                "✓"}
                                        </div>
                                    </button>
                                );
                            },
                        )}
                    </div>
                </div>
            </div>

            <div>
                <div className="sticky top-24">
                    <p className="mb-3 text-sm uppercase">
                        Preview
                    </p>

                    <div className="rounded-xl border border-black bg-white p-6 shadow-[4px_4px_0_#000]">
                        <p className="text-center text-xl font-bold uppercase">
                            Casa Elefante
                        </p>

                        {title && (
                            <h2 className="mt-10 text-3xl font-bold uppercase">
                                {title}
                            </h2>
                        )}

                        {content && (
                            <p className="mt-6 whitespace-pre-line">
                                {content}
                            </p>
                        )}

                        {selectedProducts.length >
                            0 && (
                            <div className="mt-10 grid grid-cols-2 gap-4">
                                {products
                                    .filter(
                                        (
                                            product,
                                        ) =>
                                            selectedProducts.includes(
                                                product.id,
                                            ),
                                    )
                                    .map(
                                        (
                                            product,
                                        ) => (
                                            <div
                                                key={
                                                    product.id
                                                }
                                            >
                                                <div className="aspect-square overflow-hidden rounded-xl bg-neutral-100">
                                                    {product
                                                        .images?.[0] && (
                                                        <img
                                                            src={
                                                                product
                                                                    .images[0]
                                                            }
                                                            alt=""
                                                            className="h-full w-full object-cover"
                                                        />
                                                    )}
                                                </div>

                                                <p className="mt-2 font-medium">
                                                    {
                                                        product.name
                                                    }
                                                </p>

                                                <p className="text-sm">
                                                    {
                                                        product.artist
                                                    }
                                                </p>

                                                <p className="mt-1 text-sm">
                                                    {Number(
                                                        product.price,
                                                    ).toLocaleString(
                                                        "pt-BR",
                                                        {
                                                            style:
                                                                "currency",
                                                            currency:
                                                                "BRL",
                                                        },
                                                    )}
                                                </p>
                                            </div>
                                        ),
                                    )}
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        disabled
                        className="mt-6 w-full rounded-xl border border-black bg-white px-6 py-3 shadow-[4px_4px_0_#000] opacity-40"
                    >
                        Enviar newsletter
                    </button>
                </div>
            </div>
        </div>
    );
}