"use client";

import {
    ChangeEvent,
    FormEvent,
    useState,
} from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import {
    PRODUCT_FORMATS,
    PRODUCT_GENRES,
} from "@/lib/products";

type Product = {
    id: string;
    name: string;
    slug: string;
    artist: string | null;
    price: number;
    format: string | null;
    year: number | null;
    stock: number;
    genre: string | null;
    label: string | null;
    catalog_number: string | null;
    images: string[] | null;
};

type EditProductFormProps = {
    product: Product;
};

export function EditProductForm({
    product,
}: EditProductFormProps) {
    const router = useRouter();
    const supabase = createClient();

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const [images, setImages] =
        useState<string[]>(
            product.images ?? [],
        );

    const [newImages, setNewImages] =
        useState<File[]>([]);

    function handleImagesChange(
        event: ChangeEvent<HTMLInputElement>,
    ) {
        const files = Array.from(
            event.target.files ?? [],
        );

        setNewImages((current) => [
            ...current,
            ...files,
        ]);

        event.target.value = "";
    }

    function removeExistingImage(
        image: string,
    ) {
        setImages((current) =>
            current.filter(
                (item) => item !== image,
            ),
        );
    }

    function removeNewImage(
        index: number,
    ) {
        setNewImages((current) =>
            current.filter(
                (_, currentIndex) =>
                    currentIndex !== index,
            ),
        );
    }

    async function uploadImages() {
        const uploadedUrls: string[] = [];

        for (const file of newImages) {
            const extension =
                file.name
                    .split(".")
                    .pop()
                    ?.toLowerCase() ??
                "jpg";

            const fileName =
                `${crypto.randomUUID()}.${extension}`;

            const path =
                `${product.id}/${fileName}`;

            const {
                error: uploadError,
            } = await supabase.storage
                .from("products")
                .upload(
                    path,
                    file,
                    {
                        cacheControl:
                            "3600",
                        upsert: false,
                    },
                );

            if (uploadError) {
                throw uploadError;
            }

            const { data } =
                supabase.storage
                    .from("products")
                    .getPublicUrl(
                        path,
                    );

            uploadedUrls.push(
                data.publicUrl,
            );
        }

        return uploadedUrls;
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setLoading(true);
        setError(null);

        const form =
            event.currentTarget;

        try {
            const formData =
                new FormData(form);

            const uploadedImages =
                await uploadImages();

            const finalImages = [
                ...images,
                ...uploadedImages,
            ];

            const year =
                formData.get("year");

            const {
                error: updateError,
            } = await supabase
                .from("products")
                .update({
                    name: String(
                        formData.get(
                            "name",
                        ),
                    ).trim(),

                    slug: String(
                        formData.get(
                            "slug",
                        ),
                    ).trim(),

                    artist:
                        String(
                            formData.get(
                                "artist",
                            ) ?? "",
                        ).trim() ||
                        null,

                    label:
                        String(
                            formData.get(
                                "label",
                            ) ?? "",
                        ).trim() ||
                        null,

                    catalog_number:
                        String(
                            formData.get(
                                "catalog_number",
                            ) ?? "",
                        ).trim() ||
                        null,

                    genre:
                        String(
                            formData.get(
                                "genre",
                            ) ?? "",
                        ).trim() ||
                        null,

                    format:
                        String(
                            formData.get(
                                "format",
                            ) ?? "",
                        ).trim() ||
                        null,

                    year: year
                        ? Number(year)
                        : null,

                    price: Number(
                        formData.get(
                            "price",
                        ),
                    ),

                    stock: Number(
                        formData.get(
                            "stock",
                        ),
                    ),

                    images:
                        finalImages,
                })
                .eq(
                    "id",
                    product.id,
                );

            if (updateError) {
                throw updateError;
            }

            router.push(
                "/admin/produtos",
            );

            router.refresh();
        } catch (error) {
            console.error(error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Erro ao atualizar produto.",
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-8"
        >
            <div className="grid gap-6 md:grid-cols-2">
                <Field
                    label="Nome"
                    name="name"
                    defaultValue={
                        product.name
                    }
                    required
                />

                <Field
                    label="Artista"
                    name="artist"
                    defaultValue={
                        product.artist ??
                        ""
                    }
                />

                <Field
                    label="Slug"
                    name="slug"
                    defaultValue={
                        product.slug
                    }
                    required
                />

                <Field
                    label="Gravadora"
                    name="label"
                    defaultValue={
                        product.label ??
                        ""
                    }
                />

                <SelectField
                    label="Gênero"
                    name="genre"
                    defaultValue={
                        product.genre ?? ""
                    }
                    options={PRODUCT_GENRES}
                />

                <Field
                    label="Número de catálogo"
                    name="catalog_number"
                    defaultValue={
                        product.catalog_number ??
                        ""
                    }
                />

                <SelectField
                    label="Formato"
                    name="format"
                    defaultValue={
                        product.format ?? ""
                    }
                    options={PRODUCT_FORMATS}
                />

                <Field
                    label="Ano"
                    name="year"
                    type="number"
                    defaultValue={
                        product.year ??
                        ""
                    }
                />

                <Field
                    label="Estoque"
                    name="stock"
                    type="number"
                    min="0"
                    defaultValue={
                        product.stock
                    }
                />

                <Field
                    label="Preço"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={
                        product.price
                    }
                    required
                />
            </div>

            <div className="flex flex-col gap-4">
                <div>
                    <h2 className="text-lg font-medium">
                        Imagens
                    </h2>

                    <p className="text-sm text-black/50">
                        A primeira imagem será
                        usada como capa do
                        produto.
                    </p>
                </div>

                {images.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {images.map(
                            (
                                image,
                                index,
                            ) => (
                                <div
                                    key={
                                        image
                                    }
                                    className="relative aspect-square overflow-hidden border border-black"
                                >
                                    <Image
                                        src={
                                            image
                                        }
                                        alt={`Imagem ${index + 1}`}
                                        fill
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                        className="object-cover"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeExistingImage(
                                                image,
                                            )
                                        }
                                        className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center bg-white text-lg leading-none"
                                    >
                                        ×
                                    </button>
                                </div>
                            ),
                        )}
                    </div>
                )}

                {newImages.length >
                    0 && (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {newImages.map(
                            (
                                file,
                                index,
                            ) => {
                                const preview =
                                    URL.createObjectURL(
                                        file,
                                    );

                                return (
                                    <div
                                        key={`${file.name}-${index}`}
                                        className="relative aspect-square overflow-hidden border border-black"
                                    >
                                        <Image
                                            src={
                                                preview
                                            }
                                            alt={
                                                file.name
                                            }
                                            fill
                                            unoptimized
                                            sizes="(max-width: 768px) 50vw, 25vw"
                                            className="object-cover"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeNewImage(
                                                    index,
                                                )
                                            }
                                            className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center bg-white text-lg leading-none"
                                        >
                                            ×
                                        </button>

                                        <span className="absolute bottom-0 left-0 bg-black px-2 py-1 text-xs text-white">
                                            Nova
                                        </span>
                                    </div>
                                );
                            },
                        )}
                    </div>
                )}

                <label className="flex cursor-pointer items-center justify-center border border-dashed border-black px-6 py-10 text-sm transition-colors hover:bg-black hover:text-white">
                    Adicionar imagens

                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={
                            handleImagesChange
                        }
                        className="hidden"
                    />
                </label>
            </div>

            {error && (
                <p className="text-sm text-red-600">
                    {error}
                </p>
            )}

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="border border-black px-6 py-3 text-sm transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading
                        ? "Salvando..."
                        : "Salvar alterações"}
                </button>
            </div>
        </form>
    );
}

type FieldProps = {
    label: string;
    name: string;
    type?: string;
    defaultValue?:
        | string
        | number;
    required?: boolean;
    min?: string;
    step?: string;
};

function Field({
    label,
    name,
    type = "text",
    defaultValue,
    required,
    min,
    step,
}: FieldProps) {
    return (
        <label className="flex flex-col gap-2">
            <span className="text-sm">
                {label}
            </span>

            <input
                name={name}
                type={type}
                defaultValue={
                    defaultValue
                }
                required={required}
                min={min}
                step={step}
                className="w-full border border-black bg-transparent px-3 py-2 outline-none"
            />
        </label>
    );
}


type SelectFieldProps = {
    label: string;
    name: string;
    defaultValue?: string;
    options: readonly string[];
    required?: boolean;
};

function SelectField({
    label,
    name,
    defaultValue,
    options,
    required,
}: SelectFieldProps) {
    return (
        <label className="flex flex-col gap-2">
            <span className="text-sm">
                {label}
            </span>

            <select
                name={name}
                defaultValue={
                    defaultValue
                }
                required={required}
                className="w-full border border-black bg-transparent px-3 py-2 outline-none"
            >
                <option value="">
                    Selecione
                </option>

                {options.map(
                    (option) => (
                        <option
                            key={option}
                            value={option}
                        >
                            {option}
                        </option>
                    ),
                )}
            </select>
        </label>
    );
}