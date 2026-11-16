
"use client";

import {
    type FormEvent,
    useState,
} from "react";

import {
    useRouter,
} from "next/navigation";

import {
    createClient,
} from "@/lib/supabase/client";

const labelClassName =
    "font-october text-xl uppercase leading-none text-[#FFFDE9]";

const inputClassName =
    "w-full min-w-0 rounded-xl border border-black bg-white px-4 py-3 text-base text-black outline-none transition-colors placeholder:text-black/40 focus:ring-2 focus:ring-[#FFFDE9]/40";

const fileInputClassName =
    "w-full min-w-0 rounded-xl border border-black bg-white px-4 py-3 text-sm text-black file:mr-4 file:rounded-lg file:border file:border-black file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-black file:cursor-pointer";

const buttonClassName =
    "inline-flex items-center justify-center rounded-xl border border-black bg-[#FFFDE9] px-6 py-3 text-base font-medium text-black shadow-[-5px_5px_0_0_#000] transition-all duration-200 hover:-translate-y-1 hover:shadow-[-5px_9px_0_0_#000] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-[-5px_5px_0_0_#000]";

function slugify(
    value: string,
) {
    return value
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            "",
        )
        .toLowerCase()
        .trim()
        .replace(
            /[^a-z0-9]+/g,
            "-",
        )
        .replace(
            /^-+|-+$/g,
            "",
        );
}

function createFileName(
    file: File,
) {
    const extension =
        file.name
            .split(".")
            .pop()
            ?.toLowerCase() ||
        "";

    const random =
        crypto.randomUUID();

    return `${random}.${extension}`;
}

export function PerformanceForm() {
    const router =
        useRouter();

    const supabase =
        createClient();

    const [
        name,
        setName,
    ] = useState("");

    const [
        slug,
        setSlug,
    ] = useState("");

    const [
        description,
        setDescription,
    ] = useState("");

    const [
        performanceDate,
        setPerformanceDate,
    ] = useState("");

    const [
        location,
        setLocation,
    ] = useState("");

    const [
        videoUrl,
        setVideoUrl,
    ] = useState("");

    const [
        audioFile,
        setAudioFile,
    ] = useState<File | null>(
        null,
    );

    const [
        coverImageFile,
        setCoverImageFile,
    ] = useState<File | null>(
        null,
    );

    const [
        published,
        setPublished,
    ] = useState(false);

    const [
        loading,
        setLoading,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState<string | null>(
        null,
    );

    function handleNameChange(
        value: string,
    ) {
        setName(value);

        setSlug(
            slugify(value),
        );
    }

    async function uploadAudio() {
        if (!audioFile) {
            return null;
        }

        const fileName =
            createFileName(
                audioFile,
            );

        const filePath =
            `audio/${fileName}`;

        const {
            error: uploadError,
        } =
            await supabase.storage
                .from(
                    "musicas",
                )
                .upload(
                    filePath,
                    audioFile,
                    {
                        cacheControl:
                            "3600",
                        upsert:
                            false,
                        contentType:
                            audioFile.type,
                    },
                );

        if (uploadError) {
            throw uploadError;
        }

        const {
            data,
        } =
            supabase.storage
                .from(
                    "musicas",
                )
                .getPublicUrl(
                    filePath,
                );

        return data.publicUrl;
    }

    async function uploadCoverImage() {
        if (!coverImageFile) {
            return null;
        }

        const fileName =
            createFileName(
                coverImageFile,
            );

        const filePath =
            `covers/${fileName}`;

        const {
            error: uploadError,
        } =
            await supabase.storage
                .from(
                    "musicas",
                )
                .upload(
                    filePath,
                    coverImageFile,
                    {
                        cacheControl:
                            "3600",
                        upsert:
                            false,
                        contentType:
                            coverImageFile.type,
                    },
                );

        if (uploadError) {
            throw uploadError;
        }

        const {
            data,
        } =
            supabase.storage
                .from(
                    "musicas",
                )
                .getPublicUrl(
                    filePath,
                );

        return data.publicUrl;
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (!name.trim()) {
            setError(
                "Digite o nome da apresentação.",
            );

            return;
        }

        if (!slug.trim()) {
            setError(
                "Digite um slug.",
            );

            return;
        }

        setLoading(true);
        setError(null);

        try {
            const [
                audioUrl,
                coverImageUrl,
            ] =
                await Promise.all([
                    uploadAudio(),
                    uploadCoverImage(),
                ]);

            const {
                error:
                    insertError,
            } =
                await supabase
                    .from(
                        "performances",
                    )
                    .insert({
                        name:
                            name.trim(),

                        slug:
                            slug.trim(),

                        description:
                            description.trim() ||
                            null,

                        performance_date:
                            performanceDate ||
                            null,

                        location:
                            location.trim() ||
                            null,

                        video_url:
                            videoUrl.trim() ||
                            null,

                        audio_url:
                            audioUrl,

                        cover_image:
                            coverImageUrl,

                        published,
                    });

            if (insertError) {
                throw insertError;
            }

            router.push(
                "/admin/performances",
            );

            router.refresh();
        } catch (
            submitError
        ) {
            console.error(
                "Create performance error:",
                submitError,
            );

            if (
                submitError instanceof
                Error
            ) {
                setError(
                    submitError.message,
                );
            } else {
                setError(
                    "Não foi possível criar a apresentação.",
                );
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col gap-8 text-[#FFFDE9]"
        >
            <div className="flex flex-col gap-3">
                <label
                    htmlFor="name"
                    className={labelClassName}
                >
                    Nome
                </label>

                <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(event) =>
                        handleNameChange(
                            event.target.value,
                        )
                    }
                    required
                    className={inputClassName}
                    placeholder="Nome da apresentação"
                />
            </div>

            <div className="flex flex-col gap-3">
                <label
                    htmlFor="slug"
                    className={labelClassName}
                >
                    Slug
                </label>

                <input
                    id="slug"
                    type="text"
                    value={slug}
                    onChange={(event) =>
                        setSlug(
                            slugify(
                                event.target.value,
                            ),
                        )
                    }
                    required
                    className={inputClassName}
                    placeholder="nome-da-apresentacao"
                />
            </div>

            <div className="flex flex-col gap-3">
                <label
                    htmlFor="description"
                    className={labelClassName}
                >
                    Descrição
                </label>

                <textarea
                    id="description"
                    value={description}
                    onChange={(event) =>
                        setDescription(
                            event.target.value,
                        )
                    }
                    rows={6}
                    className={`${inputClassName} resize-y`}
                    placeholder="Descrição da apresentação"
                />
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                <div className="flex flex-col gap-3">
                    <label
                        htmlFor="performance-date"
                        className={labelClassName}
                    >
                        Data da apresentação
                    </label>

                    <input
                        id="performance-date"
                        type="date"
                        value={performanceDate}
                        onChange={(event) =>
                            setPerformanceDate(
                                event.target.value,
                            )
                        }
                        className={inputClassName}
                    />
                </div>

                <div className="flex flex-col gap-3">
                    <label
                        htmlFor="location"
                        className={labelClassName}
                    >
                        Local
                        <span className="ml-2 font-sans text-xs font-normal normal-case opacity-60">
                            Opcional
                        </span>
                    </label>

                    <input
                        id="location"
                        type="text"
                        value={location}
                        onChange={(event) =>
                            setLocation(
                                event.target.value,
                            )
                        }
                        className={inputClassName}
                        placeholder="Ex: Casa Elefante, São Paulo"
                    />
                </div>
            </div>

            <div className="border-t border-[#FFFDE9]/30 pt-8">
                <h2 className="font-october text-3xl uppercase leading-none text-[#FFFDE9]">
                    Mídia
                </h2>

                <div className="mt-8 flex flex-col gap-8">
                    <div className="flex flex-col gap-3">
                        <label
                            htmlFor="cover-image"
                            className={labelClassName}
                        >
                            Imagem da apresentação
                            <span className="ml-2 font-sans text-xs font-normal normal-case opacity-60">
                                Opcional
                            </span>
                        </label>

                        <input
                            id="cover-image"
                            type="file"
                            accept="image/*"
                            onChange={(event) =>
                                setCoverImageFile(
                                    event.target.files?.[0] ??
                                    null,
                                )
                            }
                            className={fileInputClassName}
                        />

                        {coverImageFile && (
                            <div className="rounded-xl border border-[#FFFDE9]/40 p-4">
                                <p className="break-all text-sm font-medium">
                                    {coverImageFile.name}
                                </p>

                                <p className="mt-1 text-xs text-[#FFFDE9]/70">
                                    {(
                                        coverImageFile.size /
                                        1024 /
                                        1024
                                    ).toFixed(1)}{" "}
                                    MB
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-3">
                        <label
                            htmlFor="audio"
                            className={labelClassName}
                        >
                            Áudio
                            <span className="ml-2 font-sans text-xs font-normal normal-case opacity-60">
                                Opcional
                            </span>
                        </label>

                        <input
                            id="audio"
                            type="file"
                            accept="audio/*"
                            onChange={(event) =>
                                setAudioFile(
                                    event.target.files?.[0] ??
                                    null,
                                )
                            }
                            className={fileInputClassName}
                        />

                        {audioFile && (
                            <div className="rounded-xl border border-[#FFFDE9]/40 p-4">
                                <p className="break-all text-sm font-medium">
                                    {audioFile.name}
                                </p>

                                <p className="mt-1 text-xs text-[#FFFDE9]/70">
                                    {(
                                        audioFile.size /
                                        1024 /
                                        1024
                                    ).toFixed(1)}{" "}
                                    MB
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-3">
                        <label
                            htmlFor="video-url"
                            className={labelClassName}
                        >
                            URL do vídeo
                        </label>

                        <input
                            id="video-url"
                            type="url"
                            value={videoUrl}
                            onChange={(event) =>
                                setVideoUrl(
                                    event.target.value,
                                )
                            }
                            className={inputClassName}
                            placeholder="https://..."
                        />
                    </div>
                </div>
            </div>

            <label className="flex cursor-pointer items-start gap-4 rounded-xl border border-[#FFFDE9]/40 p-5">
                <input
                    type="checkbox"
                    checked={published}
                    onChange={(event) =>
                        setPublished(
                            event.target.checked,
                        )
                    }
                    className="mt-1 h-5 w-5 shrink-0 accent-black"
                />

                <div>
                    <p className="font-october text-xl uppercase leading-none text-[#FFFDE9]">
                        Publicado
                    </p>

                    <p className="mt-2 text-sm text-[#FFFDE9]/70">
                        A apresentação ficará visível no Toda Terça Tem.
                    </p>
                </div>
            </label>

            {error && (
                <div
                    role="alert"
                    className="rounded-xl border border-black bg-[#FFFDE9] p-4 text-sm text-[#D2232A] shadow-[-3px_3px_0_0_#000]"
                >
                    {error}
                </div>
            )}

            <div className="flex flex-wrap items-center gap-4 border-t border-[#FFFDE9]/30 pt-8">
                <button
                    type="submit"
                    disabled={loading}
                    className={buttonClassName}
                >
                    {loading
                        ? "Enviando..."
                        : "Criar apresentação"}
                </button>

                <button
                    type="button"
                    disabled={loading}
                    onClick={() =>
                        router.push(
                            "/admin/performances",
                        )
                    }
                    className={buttonClassName}
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
}
