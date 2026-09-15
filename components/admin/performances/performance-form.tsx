"use client";

import {
    FormEvent,
    useState,
} from "react";

import {
    useRouter,
} from "next/navigation";

import {
    createClient,
} from "@/lib/supabase/client";

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
        videoUrl,
        setVideoUrl,
    ] = useState("");

    const [
        audioFile,
        setAudioFile,
    ] =
        useState<File | null>(
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
    ] =
        useState<string | null>(
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

    async function handleSubmit(
        event:
            FormEvent<HTMLFormElement>,
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

        if (!audioFile) {
            setError(
                "Selecione um arquivo de áudio.",
            );

            return;
        }

        setLoading(true);
        setError(null);

        try {
            const audioUrl =
                await uploadAudio();

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

                        video_url:
                            videoUrl.trim() ||
                            null,

                        audio_url:
                            audioUrl,

                        cover_image:
                            null,

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
            onSubmit={
                handleSubmit
            }
            className="flex flex-col gap-6"
        >
            <div className="flex flex-col gap-2">
                <label
                    htmlFor="name"
                    className="text-sm"
                >
                    Nome
                </label>

                <input
                    id="name"
                    type="text"
                    value={
                        name
                    }
                    onChange={(
                        event,
                    ) =>
                        handleNameChange(
                            event
                                .target
                                .value,
                        )
                    }
                    required
                    className="rounded-md border border-black bg-white px-4 py-3 outline-none"
                    placeholder="Nome da apresentação"
                />
            </div>

            <div className="flex flex-col gap-2">
                <label
                    htmlFor="slug"
                    className="text-sm"
                >
                    Slug
                </label>

                <input
                    id="slug"
                    type="text"
                    value={
                        slug
                    }
                    onChange={(
                        event,
                    ) =>
                        setSlug(
                            slugify(
                                event
                                    .target
                                    .value,
                            ),
                        )
                    }
                    required
                    className="rounded-md border border-black bg-white px-4 py-3 outline-none"
                    placeholder="nome-da-apresentacao"
                />
            </div>

            <div className="flex flex-col gap-2">
                <label
                    htmlFor="description"
                    className="text-sm"
                >
                    Descrição
                </label>

                <textarea
                    id="description"
                    value={
                        description
                    }
                    onChange={(
                        event,
                    ) =>
                        setDescription(
                            event
                                .target
                                .value,
                        )
                    }
                    rows={6}
                    className="resize-y rounded-md border border-black bg-white px-4 py-3 outline-none"
                    placeholder="Descrição da apresentação"
                />
            </div>

            <div className="flex flex-col gap-2">
                <label
                    htmlFor="performance-date"
                    className="text-sm"
                >
                    Data da apresentação
                </label>

                <input
                    id="performance-date"
                    type="date"
                    value={
                        performanceDate
                    }
                    onChange={(
                        event,
                    ) =>
                        setPerformanceDate(
                            event
                                .target
                                .value,
                        )
                    }
                    className="rounded-md border border-black bg-white px-4 py-3 outline-none"
                />
            </div>

            <div className="flex flex-col gap-2">
                <label
                    htmlFor="audio"
                    className="text-sm"
                >
                    Áudio
                </label>

                <input
                    id="audio"
                    type="file"
                    accept="audio/*"
                    onChange={(
                        event,
                    ) =>
                        setAudioFile(
                            event
                                .target
                                .files?.[0] ??
                                null,
                        )
                    }
                    required
                    className="rounded-md border border-black bg-white px-4 py-3"
                />

                {audioFile && (
                    <div className="flex flex-col gap-1">
                        <p className="text-xs opacity-60">
                            {
                                audioFile.name
                            }
                        </p>

                        <p className="text-xs opacity-60">
                            {(
                                audioFile.size /
                                1024 /
                                1024
                            ).toFixed(
                                1,
                            )}{" "}
                            MB
                        </p>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <label
                    htmlFor="video-url"
                    className="text-sm"
                >
                    URL do vídeo
                </label>

                <input
                    id="video-url"
                    type="url"
                    value={
                        videoUrl
                    }
                    onChange={(
                        event,
                    ) =>
                        setVideoUrl(
                            event
                                .target
                                .value,
                        )
                    }
                    className="rounded-md border border-black bg-white px-4 py-3 outline-none"
                    placeholder="https://..."
                />
            </div>

            <label className="flex cursor-pointer items-center gap-3 border-y border-black py-4">
                <input
                    type="checkbox"
                    checked={
                        published
                    }
                    onChange={(
                        event,
                    ) =>
                        setPublished(
                            event
                                .target
                                .checked,
                        )
                    }
                    className="h-4 w-4"
                />

                <div>
                    <p className="text-sm font-medium">
                        Publicado
                    </p>

                    <p className="mt-1 text-xs opacity-60">
                        A apresentação ficará visível no Toda Terça Tem.
                    </p>
                </div>
            </label>

            {error && (
                <div className="border border-red-600 p-4 text-sm text-red-600">
                    {error}
                </div>
            )}

            <div className="flex items-center gap-4">
                <button
                    type="submit"
                    disabled={
                        loading
                    }
                    className="rounded-md border border-black bg-white px-5 py-3 shadow-[3px_3px_0_#000] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading
                        ? "Enviando..."
                        : "Criar apresentação"}
                </button>

                <button
                    type="button"
                    disabled={
                        loading
                    }
                    onClick={() =>
                        router.push(
                            "/admin/performances",
                        )
                    }
                    className="px-4 py-3 text-sm transition-opacity hover:opacity-50 disabled:opacity-50"
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
}