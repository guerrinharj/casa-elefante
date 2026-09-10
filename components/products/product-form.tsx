"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
    PRODUCT_FORMATS,
    PRODUCT_GENRES,
} from "@/lib/products";
import { createClient } from "@/lib/supabase/client";

export function ProductForm() {
    const router = useRouter();

    const [images, setImages] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(
        e: React.FormEvent<HTMLFormElement>,
    ) {
        e.preventDefault();

        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const supabase = createClient();

        const imageUrls: string[] = [];
        const imagePaths: string[] = [];

        try {
            for (const image of images) {
                const extension =
                    image.name.split(".").pop()?.toLowerCase() ?? "jpg";

                const fileName =
                    `${crypto.randomUUID()}.${extension}`;

                const filePath =
                    `products/${fileName}`;

                const { error: uploadError } =
                    await supabase.storage
                        .from("products")
                        .upload(filePath, image, {
                            cacheControl: "3600",
                            upsert: false,
                            contentType: image.type,
                        });

                if (uploadError) {
                    throw uploadError;
                }

                const { data } = supabase.storage
                    .from("products")
                    .getPublicUrl(filePath);

                imageUrls.push(data.publicUrl);
                imagePaths.push(filePath);
            }

            const yearValue = formData.get("year");
            const priceValue = formData.get("price");
            const stockValue = formData.get("stock");

            const { error: insertError } = await supabase
                .from("products")
                .insert({
                    name: formData.get("name"),
                    artist: formData.get("artist"),
                    label: formData.get("label") || null,
                    year: yearValue
                        ? Number(yearValue)
                        : null,
                    price: priceValue
                        ? Number(priceValue)
                        : 0,
                    genre: formData.get("genre"),
                    format: formData.get("format"),
                    description:
                        formData.get("description") || null,
                    stock: stockValue
                        ? Number(stockValue)
                        : 0,
                    condition:
                        formData.get("condition") || null,
                    images: imageUrls,
                    image_paths: imagePaths,
                });

            if (insertError) {
                throw insertError;
            }

            router.push("/admin/produtos");
            router.refresh();
        } catch (error) {
            console.error("Erro ao criar produto:", error);

            /*
             * Se o upload funcionou, mas o INSERT falhou,
             * removemos as imagens que acabaram de ser enviadas
             * para não deixar arquivos órfãos no Storage.
             */
            if (imagePaths.length > 0) {
                await supabase.storage
                    .from("products")
                    .remove(imagePaths);
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

                    {PRODUCT_GENRES.map((genre) => (
                        <option
                            key={genre}
                            value={genre}
                        >
                            {genre}
                        </option>
                    ))}
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

                    {PRODUCT_FORMATS.map((format) => (
                        <option
                            key={format}
                            value={format}
                        >
                            {format}
                        </option>
                    ))}
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
                        defaultValue={1}
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

            <div className="flex flex-col gap-2">
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
                    onChange={(e) => {
                        const files = e.target.files;

                        setImages(
                            files
                                ? Array.from(files)
                                : [],
                        );
                    }}
                    className="border border-black px-3 py-2"
                />

                {images.length > 0 && (
                    <div className="mt-2">
                        <p className="mb-2 text-sm">
                            {images.length}{" "}
                            {images.length === 1
                                ? "imagem selecionada"
                                : "imagens selecionadas"}
                        </p>

                        <ul className="space-y-1 text-sm">
                            {images.map((image) => (
                                <li
                                    key={`${image.name}-${image.lastModified}`}
                                >
                                    {image.name}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <p className="text-xs">
                    A primeira imagem será usada como capa do produto.
                </p>
            </div>

            {error && (
                <p className="text-sm text-red-500">
                    {error}
                </p>
            )}

            <div className="flex justify-end border-t border-black pt-6">
                <button
                    type="submit"
                    disabled={isLoading}
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