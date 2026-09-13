"use client";

import {
    useState,
} from "react";

import {
    useRouter,
} from "next/navigation";

import {
    slugify,
} from "@/lib/utils";

import {
    PRODUCT_FORMATS,
    PRODUCT_GENRES,
} from "@/lib/products";

import {
    createClient,
} from "@/lib/supabase/client";

type ProductAnalysis = {
    name: string | null;
    artist: string | null;
    label: string | null;
    catalog_number: string | null;
    year: number | null;
    genre: string | null;
    format: string | null;
};

export function ProductForm() {
    const router = useRouter();

    const [images, setImages] =
        useState<File[]>([]);

    const [isLoading, setIsLoading] =
        useState(false);

    const [isAnalyzing, setIsAnalyzing] =
        useState(false);

    const [analysis, setAnalysis] =
        useState<ProductAnalysis | null>(
            null,
        );

    const [error, setError] =
        useState<string | null>(null);

    async function handleAnalyze() {
        if (!images[0]) {
            setError(
                "Selecione uma imagem primeiro.",
            );

            return;
        }

        setIsAnalyzing(true);
        setError(null);
        setAnalysis(null);

        try {
            const formData =
                new FormData();

            formData.append(
                "image",
                images[0],
            );

            const response =
                await fetch(
                    "/api/admin/products/analyze",
                    {
                        method: "POST",
                        body: formData,
                    },
                );

            const result =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error ??
                        "Erro ao analisar imagem.",
                );
            }

            console.log(
                "Produto identificado:",
                result,
            );

            setAnalysis(result);
        } catch (error) {
            console.error(
                "Erro ao identificar produto:",
                error,
            );

            setError(
                error instanceof Error
                    ? error.message
                    : "Erro ao analisar imagem.",
            );
        } finally {
            setIsAnalyzing(false);
        }
    }

    async function handleSubmit(
        e: React.FormEvent<HTMLFormElement>,
    ) {
        e.preventDefault();

        setIsLoading(true);
        setError(null);

        const formData =
            new FormData(e.currentTarget);

        const supabase =
            createClient();

        const imageUrls: string[] = [];
        const imagePaths: string[] = [];

        try {
            for (const image of images) {
                const extension =
                    image.name
                        .split(".")
                        .pop()
                        ?.toLowerCase() ??
                    "jpg";

                const fileName =
                    `${crypto.randomUUID()}.${extension}`;

                const filePath =
                    `products/${fileName}`;

                const {
                    error: uploadError,
                } =
                    await supabase.storage
                        .from("products")
                        .upload(
                            filePath,
                            image,
                            {
                                cacheControl:
                                    "3600",
                                upsert: false,
                                contentType:
                                    image.type,
                            },
                        );

                if (uploadError) {
                    throw uploadError;
                }

                const {
                    data,
                } =
                    supabase.storage
                        .from("products")
                        .getPublicUrl(
                            filePath,
                        );

                imageUrls.push(
                    data.publicUrl,
                );

                imagePaths.push(
                    filePath,
                );
            }

            const yearValue =
                formData.get("year");

            const priceValue =
                formData.get("price");

            const stockValue =
                formData.get("stock");

            const name =
                String(
                    formData.get(
                        "name",
                    ) ?? "",
                );

            const slug =
                slugify(name);

            const {
                error: insertError,
            } =
                await supabase
                    .from("products")
                    .insert({
                        name:
                            formData.get(
                                "name",
                            ),

                        slug,

                        artist:
                            formData.get(
                                "artist",
                            ),

                        label:
                            formData.get(
                                "label",
                            ) ||
                            null,

                        catalog_number:
                            formData.get(
                                "catalog_number",
                            ) ||
                            null,

                        year:
                            yearValue
                                ? Number(
                                    yearValue,
                                )
                                : null,

                        price:
                            priceValue
                                ? Number(
                                    priceValue,
                                )
                                : 0,

                        genre:
                            formData.get(
                                "genre",
                            ),

                        format:
                            formData.get(
                                "format",
                            ),

                        description:
                            formData.get(
                                "description",
                            ) ||
                            null,

                        stock:
                            stockValue
                                ? Number(
                                    stockValue,
                                )
                                : 0,

                        condition:
                            formData.get(
                                "condition",
                            ) ||
                            null,

                        images:
                            imageUrls,

                        image_paths:
                            imagePaths,
                    });

            if (insertError) {
                throw insertError;
            }

            router.push(
                "/admin/produtos",
            );

            router.refresh();
        } catch (error) {
            console.error(
                "Erro ao criar produto:",
                error,
            );

            /*
             * Se o upload funcionou,
             * mas o INSERT falhou,
             * removemos as imagens que
             * acabaram de ser enviadas
             * para não deixar arquivos
             * órfãos no Storage.
             */
            if (
                imagePaths.length >
                0
            ) {
                await supabase.storage
                    .from("products")
                    .remove(
                        imagePaths,
                    );
            }

            setError(
                error instanceof Error
                    ? error.message
                    : "Erro ao salvar produto",
            );
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-6"
        >
            <div className="flex flex-col gap-2">
                <label htmlFor="name">
                    Nome
                </label>

                <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="border border-black px-3 py-2"
                />
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="artist">
                    Artista
                </label>

                <input
                    id="artist"
                    name="artist"
                    type="text"
                    required
                    className="border border-black px-3 py-2"
                />
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="label">
                    Selo
                </label>

                <input
                    id="label"
                    name="label"
                    type="text"
                    className="border border-black px-3 py-2"
                />
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="catalog_number">
                    Número de catálogo
                </label>

                <input
                    id="catalog_number"
                    name="catalog_number"
                    type="text"
                    placeholder="Ex: 88697 08241 2"
                    className="border border-black px-3 py-2"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                    <label htmlFor="year">
                        Ano
                    </label>

                    <input
                        id="year"
                        name="year"
                        type="number"
                        min="1900"
                        max="2100"
                        className="border border-black px-3 py-2"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="price">
                        Preço
                    </label>

                    <input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        className="border border-black px-3 py-2"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="genre">
                    Gênero
                </label>

                <select
                    id="genre"
                    name="genre"
                    required
                    defaultValue=""
                    className="border border-black bg-white px-3 py-2"
                >
                    <option
                        value=""
                        disabled
                    >
                        Selecione um gênero
                    </option>

                    {PRODUCT_GENRES.map(
                        (genre) => (
                            <option
                                key={
                                    genre
                                }
                                value={
                                    genre
                                }
                            >
                                {
                                    genre
                                }
                            </option>
                        ),
                    )}
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="format">
                    Formato
                </label>

                <select
                    id="format"
                    name="format"
                    required
                    defaultValue=""
                    className="border border-black bg-white px-3 py-2"
                >
                    <option
                        value=""
                        disabled
                    >
                        Selecione um formato
                    </option>

                    {PRODUCT_FORMATS.map(
                        (format) => (
                            <option
                                key={
                                    format
                                }
                                value={
                                    format
                                }
                            >
                                {
                                    format
                                }
                            </option>
                        ),
                    )}
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="description">
                    Descrição
                </label>

                <textarea
                    id="description"
                    name="description"
                    rows={6}
                    className="resize-none border border-black px-3 py-2"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                    <label htmlFor="stock">
                        Estoque
                    </label>

                    <input
                        id="stock"
                        name="stock"
                        type="number"
                        min="0"
                        defaultValue={
                            1
                        }
                        required
                        className="border border-black px-3 py-2"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="condition">
                        Condição
                    </label>

                    <input
                        id="condition"
                        name="condition"
                        type="text"
                        placeholder="Ex: VG+, NM"
                        className="border border-black px-3 py-2"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <label htmlFor="images">
                    Imagens
                </label>

                <input
                    id="images"
                    name="images"
                    type="file"
                    accept="image/*"
                    multiple
                    required
                    onChange={(
                        e,
                    ) => {
                        const files =
                            e.target
                                .files;

                        setImages(
                            files
                                ? Array.from(
                                    files,
                                )
                                : [],
                        );

                        /*
                         * Remove análise anterior
                         * caso o admin troque
                         * as imagens.
                         */
                        setAnalysis(
                            null,
                        );
                    }}
                    className="border border-black px-3 py-2"
                />

                {images.length >
                    0 && (
                    <div className="mt-2">
                        <p className="mb-2 text-sm">
                            {
                                images.length
                            }{" "}
                            {images.length ===
                            1
                                ? "imagem selecionada"
                                : "imagens selecionadas"}
                        </p>

                        <ul className="space-y-1 text-sm">
                            {images.map(
                                (
                                    image,
                                ) => (
                                    <li
                                        key={`${image.name}-${image.lastModified}`}
                                    >
                                        {
                                            image.name
                                        }
                                    </li>
                                ),
                            )}
                        </ul>
                    </div>
                )}

                <p className="text-xs">
                    A primeira imagem será
                    usada como capa do produto.
                </p>

                <button
                    type="button"
                    onClick={
                        handleAnalyze
                    }
                    disabled={
                        isAnalyzing ||
                        images.length ===
                            0
                    }
                    className="mt-2 w-fit rounded border border-black bg-white px-5 py-2 shadow-[3px_3px_0_#000] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isAnalyzing
                        ? "Identificando..."
                        : "Identificar com IA"}
                </button>
            </div>

            {analysis && (
                <div className="rounded border border-black bg-white p-4 shadow-[3px_3px_0_#000]">
                    <div className="mb-4 flex items-center justify-between gap-4">
                        <h2 className="font-bold uppercase">
                            Produto identificado
                        </h2>

                        <span className="text-sm">
                            IA
                        </span>
                    </div>

                    <div className="grid gap-3 text-sm md:grid-cols-2">
                        <div>
                            <strong>
                                Nome:
                            </strong>{" "}
                            {analysis.name ??
                                "Não identificado"}
                        </div>

                        <div>
                            <strong>
                                Artista:
                            </strong>{" "}
                            {analysis.artist ??
                                "Não identificado"}
                        </div>

                        <div>
                            <strong>
                                Selo:
                            </strong>{" "}
                            {analysis.label ??
                                "Não identificado"}
                        </div>

                        <div>
                            <strong>
                                Catálogo:
                            </strong>{" "}
                            {analysis.catalog_number ??
                                "Não identificado"}
                        </div>

                        <div>
                            <strong>
                                Ano:
                            </strong>{" "}
                            {analysis.year ??
                                "Não identificado"}
                        </div>

                        <div>
                            <strong>
                                Gênero:
                            </strong>{" "}
                            {analysis.genre ??
                                "Não identificado"}
                        </div>

                        <div>
                            <strong>
                                Formato:
                            </strong>{" "}
                            {analysis.format ??
                                "Não identificado"}
                        </div>
                    </div>

                    <details className="mt-4 border-t border-black pt-4">
                        <summary className="cursor-pointer text-xs">
                            Ver JSON retornado
                        </summary>

                        <pre className="mt-3 overflow-auto bg-neutral-100 p-3 text-xs">
                            {JSON.stringify(
                                analysis,
                                null,
                                4,
                            )}
                        </pre>
                    </details>
                </div>
            )}

            {error && (
                <p className="text-sm text-red-500">
                    {error}
                </p>
            )}

            <div className="flex justify-end border-t border-black pt-6">
                <button
                    type="submit"
                    disabled={
                        isLoading ||
                        isAnalyzing
                    }
                    className="border border-black px-5 py-2 transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isLoading
                        ? "Salvando..."
                        : "Salvar produto"}
                </button>
            </div>
        </form>
    );
}