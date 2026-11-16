"use client";
import {
    useRef,
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
    const formRef =
        useRef<HTMLFormElement>(null);
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
    function fillFormWithAnalysis(
            product: ProductAnalysis,
    ) {
        const form = formRef.current;
        if (!form) {
            return;
        }
        const setFieldValue = (
            name: string,
            value:
                | string
                | number
                | null,
        ) => {
            if (
                value === null ||
                value === undefined
            ) {
                return;
            }
            const field =
                form.elements.namedItem(
                    name,
                );
            if (
                field instanceof
                    HTMLInputElement ||
                field instanceof
                    HTMLSelectElement ||
                field instanceof
                    HTMLTextAreaElement
            ) {
                field.value =
                    String(value);
                field.dispatchEvent(
            new Event(
                        "change",
                        {
                            bubbles: true,
                        },
                    ),
                );
            }
        };
        setFieldValue(
            "name",
            product.name,
        );
        setFieldValue(
            "artist",
            product.artist,
        );
        setFieldValue(
            "label",
            product.label,
        );
        setFieldValue(
            "catalog_number",
            product.catalog_number,
        );
        setFieldValue(
            "year",
            product.year,
        );
        setFieldValue(
            "genre",
            product.genre,
        );
        setFieldValue(
            "format",
            product.format,
        );
    }
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
            const product =
                result as ProductAnalysis;
            setAnalysis(product);
            fillFormWithAnalysis(
                product,
            );
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
            new FormData(
                e.currentTarget,
            );
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
            const wholesalePriceValue =
                formData.get(
                    "wholesale_price",
                );
            const stockValue =
                formData.get("stock");
            const widthValue =
                formData.get("width");
            const heightValue =
                formData.get("height");
            const lengthValue =
                formData.get("length");
            const weightValue =
                formData.get("weight");
            const preOrder =
                formData.get(
                    "pre_order",
                ) === "on";
            const isFeatured =
                formData.get(
                    "is_featured",
                ) === "on";
            const wholesaleOnly =
                formData.get(
                    "wholesale_only",
                ) === "on";
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
                        country:
                            formData.get(
                                "country",
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
                        wholesale_price:
                            wholesalePriceValue
                                ? Number(
                                      wholesalePriceValue,
                                  )
                                : null,
                        wholesale_only:
                            wholesaleOnly,
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
                        width:
                            widthValue
                                ? Number(
                                      widthValue,
                                  )
                                : null,
                        height:
                            heightValue
                                ? Number(
                                      heightValue,
                                  )
                                : null,
                        length:
                            lengthValue
                                ? Number(
                                      lengthValue,
                                  )
                                : null,
                        weight:
                            weightValue
                                ? Number(
                                      weightValue,
                                  )
                                : null,
                        pre_order:
                            preOrder,
                        is_featured:
                            isFeatured,
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
            ref={formRef}
            onSubmit={handleSubmit}
            className="flex flex-col gap-6 text-black"
        >
            <div className="flex flex-col gap-2">
                <label htmlFor="name" className="font-october text-xl uppercase leading-none text-black">
                    Nome
                </label>
                <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full rounded-xl border border-black bg-white px-4 pb-3 pt-10 text-black outline-none focus:ring-2 focus:ring-black/15"
                />
            </div>
            <div className="flex flex-col gap-2">
                <label htmlFor="artist" className="font-october text-xl uppercase leading-none text-black">
                    Artista
                </label>
                <input
            id="artist"
            name="artist"
            type="text"
            required
            className="w-full rounded-xl border border-black bg-white px-4 pb-3 pt-10 text-black outline-none focus:ring-2 focus:ring-black/15"
                />
            </div>
            <div className="flex flex-col gap-2">
                <label htmlFor="label" className="font-october text-xl uppercase leading-none text-black">
                    Selo
                </label>
                <input
            id="label"
            name="label"
            type="text"
            className="w-full rounded-xl border border-black bg-white px-4 pb-3 pt-10 text-black outline-none focus:ring-2 focus:ring-black/15"
                />
            </div>
            <div className="flex flex-col gap-2">
                <label htmlFor="catalog_number" className="font-october text-xl uppercase leading-none text-black">
                    Número de catálogo
                </label>
                <input
            id="catalog_number"
            name="catalog_number"
            type="text"
            placeholder="Ex: 88697 08241 2"
            className="w-full rounded-xl border border-black bg-white px-4 pb-3 pt-10 text-black outline-none focus:ring-2 focus:ring-black/15"
                />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                    <label htmlFor="country" className="font-october text-xl uppercase leading-none text-black">
                        País
                    </label>
                    <input
            id="country"
            name="country"
            type="text"
            placeholder="Ex: Brasil"
            className="w-full rounded-xl border border-black bg-white px-4 pb-3 pt-10 text-black outline-none focus:ring-2 focus:ring-black/15"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="year" className="font-october text-xl uppercase leading-none text-black">
                        Ano
                    </label>
                    <input
            id="year"
            name="year"
            type="number"
            min="1900"
            max="2100"
            className="w-full rounded-xl border border-black bg-white px-4 pb-3 pt-10 text-black outline-none focus:ring-2 focus:ring-black/15"
                    />
                </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                    <label htmlFor="price" className="font-october text-xl uppercase leading-none text-black">
                        Preço
                    </label>
                    <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            className="w-full rounded-xl border border-black bg-white px-4 pb-3 pt-10 text-black outline-none focus:ring-2 focus:ring-black/15"
                    />
                    <p className="text-xs opacity-50">
                        Preço normal de varejo.
                    </p>
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="wholesale_price" className="font-october text-xl uppercase leading-none text-black">
                        Preço de atacado
                    </label>
                    <input
            id="wholesale_price"
            name="wholesale_price"
            type="number"
            step="0.01"
            min="0"
            placeholder="Opcional"
            className="w-full rounded-xl border border-black bg-white px-4 pb-3 pt-10 text-black outline-none focus:ring-2 focus:ring-black/15"
                    />
                    <p className="text-xs opacity-50">
                        Deixe vazio se o produto
                        não estiver disponível
                        para atacado.
                    </p>
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <label htmlFor="genre" className="font-october text-xl uppercase leading-none text-black">
                    Gênero
                </label>
                <select
            id="genre"
            name="genre"
            required
            defaultValue=""
            className="w-full rounded-xl border border-black bg-white px-4 pb-3 pt-10 text-black outline-none focus:ring-2 focus:ring-black/15"
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
                <label htmlFor="format" className="font-october text-xl uppercase leading-none text-black">
                    Formato
                </label>
                <select
            id="format"
            name="format"
            required
            defaultValue=""
            className="w-full rounded-xl border border-black bg-white px-4 pb-3 pt-10 text-black outline-none focus:ring-2 focus:ring-black/15"
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
                <label htmlFor="description" className="font-october text-xl uppercase leading-none text-black">
                    Descrição
                </label>
                <textarea
            id="description"
            name="description"
            rows={6}
            className="w-full resize-y rounded-xl border border-black bg-white px-4 pb-3 pt-10 text-black outline-none focus:ring-2 focus:ring-black/15"
                />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                    <label htmlFor="stock" className="font-october text-xl uppercase leading-none text-black">
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
            className="w-full rounded-xl border border-black bg-white px-4 pb-3 pt-10 text-black outline-none focus:ring-2 focus:ring-black/15"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="condition" className="font-october text-xl uppercase leading-none text-black">
                        Condição
                    </label>
                    <input
            id="condition"
            name="condition"
            type="text"
            placeholder="Ex: VG+, NM"
            className="w-full rounded-xl border border-black bg-white px-4 pb-3 pt-10 text-black outline-none focus:ring-2 focus:ring-black/15"
                    />
                </div>
            </div>
            <div className="flex flex-col gap-4 rounded-xl border border-black bg-white p-5 shadow-[-5px_5px_0_0_#000]">
                <div>
                    <h2 className="font-october text-4xl uppercase leading-none md:text-5xl">
                        Dimensões e peso
                    </h2>
                    <p className="mt-1 text-sm">
                        Informações utilizadas
                        para cálculo de frete.
                    </p>
                </div>
                <div className="grid gap-6 md:grid-cols-4">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="width" className="font-october text-xl uppercase leading-none text-black">
                            Largura (cm)
                        </label>
                        <input
            id="width"
            name="width"
            type="number"
            min="0"
            step="0.1"
            className="w-full rounded-xl border border-black bg-white px-4 pb-3 pt-10 text-black outline-none focus:ring-2 focus:ring-black/15"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="height" className="font-october text-xl uppercase leading-none text-black">
                            Altura (cm)
                        </label>
                        <input
            id="height"
            name="height"
            type="number"
            min="0"
            step="0.1"
            className="w-full rounded-xl border border-black bg-white px-4 pb-3 pt-10 text-black outline-none focus:ring-2 focus:ring-black/15"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="length" className="font-october text-xl uppercase leading-none text-black">
                            Comprimento (cm)
                        </label>
                        <input
            id="length"
            name="length"
            type="number"
            min="0"
            step="0.1"
            className="w-full rounded-xl border border-black bg-white px-4 pb-3 pt-10 text-black outline-none focus:ring-2 focus:ring-black/15"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="weight" className="font-october text-xl uppercase leading-none text-black">
                            Peso (g)
                        </label>
                        <input
            id="weight"
            name="weight"
            type="number"
            min="0"
            step="1"
            className="w-full rounded-xl border border-black bg-white px-4 pb-3 pt-10 text-black outline-none focus:ring-2 focus:ring-black/15"
                        />
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-3 rounded-xl border border-black bg-white p-5 shadow-[-5px_5px_0_0_#000]">
                <div className="flex items-center gap-3">
                    <input
            id="pre_order"
            name="pre_order"
            type="checkbox"
            className="h-4 w-4"
                    />
                    <label htmlFor="pre_order" className="font-october text-xl uppercase leading-none text-black">
                        Produto em pré-venda
                    </label>
                </div>
                <div className="flex items-center gap-3">
                    <input
            id="is_featured"
            name="is_featured"
            type="checkbox"
            className="h-4 w-4"
                    />
                    <label htmlFor="is_featured" className="font-october text-xl uppercase leading-none text-black">
                        Produto destacado
                    </label>
                </div>
                <div className="flex items-center gap-3">
                    <input
            id="wholesale_only"
            name="wholesale_only"
            type="checkbox"
            className="h-4 w-4"
                    />
                    <label htmlFor="wholesale_only" className="font-october text-xl uppercase leading-none text-black">
                        Exclusivo para atacadistas
                    </label>
                </div>
            </div>
            <div className="flex flex-col gap-3 rounded-xl border border-black bg-white p-5 shadow-[-5px_5px_0_0_#000]">
                <label htmlFor="images" className="font-october text-xl uppercase leading-none text-black">
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
                        setAnalysis(
                            null,
                        );
                    }}
            className="w-full rounded-xl border border-black bg-white px-4 py-3 text-black outline-none focus:ring-2 focus:ring-black/15"
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
            className="mt-2 w-fit rounded-xl border border-black bg-white px-5 py-3 font-medium shadow-[-5px_5px_0_0_#000] transition-all hover:-translate-y-1 hover:shadow-[-5px_9px_0_0_#000] disabled:opacity-50"
                >
                    {isAnalyzing
                        ? "Identificando..."
                        : "Identificar com IA"}
                </button>
            </div>
            {analysis && (
                <div className="rounded-xl border border-black bg-white p-5 shadow-[-5px_5px_0_0_#000]">
                    <div className="mb-4 flex items-center justify-between gap-4">
                        <h2 className="font-october text-4xl uppercase leading-none md:text-5xl">
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
            className="rounded-xl border border-black bg-white px-5 py-3 font-medium shadow-[-5px_5px_0_0_#000] transition-all hover:-translate-y-1 hover:shadow-[-5px_9px_0_0_#000] disabled:opacity-50"
                >
                    {isLoading
                        ? "Salvando..."
                        : "Salvar produto"}
                </button>
            </div>
        </form>
    );
}
