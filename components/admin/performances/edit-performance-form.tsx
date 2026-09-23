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

type Performance = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    performance_date: string | null;
    video_url: string | null;
    audio_url: string | null;
    cover_image: string | null;
    published: boolean;
};

type EditPerformanceFormProps = {
    performance: Performance;
};

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

function getStoragePathFromUrl(
    url: string | null,
) {
    if (!url) {
        return null;
    }

    const marker =
        "/storage/v1/object/public/musicas/";

    const index =
        url.indexOf(
            marker,
        );

    if (index === -1) {
        return null;
    }

    return decodeURIComponent(
        url.slice(
            index +
                marker.length,
        ),
    );
}

function formatFileSize(
    bytes: number,
) {
    const megabytes =
        bytes /
        1024 /
        1024;

    return `${megabytes.toFixed(1)} MB`;
}

export function EditPerformanceForm({
    performance,
}: EditPerformanceFormProps) {
    const router =
        useRouter();

    const supabase =
        createClient();

    const [
        name,
        setName,
    ] = useState(
        performance.name,
    );

    const [
        slug,
        setSlug,
    ] = useState(
        performance.slug,
    );

    const [
        description,
        setDescription,
    ] = useState(
        performance.description ??
            "",
    );

    const [
        performanceDate,
        setPerformanceDate,
    ] = useState(
        performance.performance_date ??
            "",
    );

    const [
        videoUrl,
        setVideoUrl,
    ] = useState(
        performance.video_url ??
            "",
    );

    const [
        audioFile,
        setAudioFile,
    ] =
        useState<File | null>(
            null,
        );

    const [
        coverImageFile,
        setCoverImageFile,
    ] =
        useState<File | null>(
            null,
        );

    const [
        published,
        setPublished,
    ] = useState(
        performance.published,
    );

    const [
        loading,
        setLoading,
    ] = useState(false);

    const [
        deleting,
        setDeleting,
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
    }

    async function uploadAudio() {
        if (!audioFile) {
            return performance.audio_url;
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
            return performance.cover_image;
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

    async function removeStorageFile(
        url: string | null,
    ) {
        if (!url) {
            return;
        }

        const path =
            getStoragePathFromUrl(
                url,
            );

        if (!path) {
            return;
        }

        const {
            error: removeError,
        } =
            await supabase.storage
                .from(
                    "musicas",
                )
                .remove([
                    path,
                ]);

        if (removeError) {
            console.error(
                "Remove storage file error:",
                removeError,
            );
        }
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

        setLoading(true);
        setError(null);

        let newAudioUrl:
            string | null =
            performance.audio_url;

        let newCoverImageUrl:
            string | null =
            performance.cover_image;

        try {
            [
                newAudioUrl,
                newCoverImageUrl,
            ] =
                await Promise.all([
                    uploadAudio(),
                    uploadCoverImage(),
                ]);

            const {
                error:
                    updateError,
            } =
                await supabase
                    .from(
                        "performances",
                    )
                    .update({
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
                            newAudioUrl,

                        cover_image:
                            newCoverImageUrl,

                        published,
                    })
                    .eq(
                        "id",
                        performance.id,
                    );

            if (updateError) {
                throw updateError;
            }

            /*
             * Só removemos os arquivos antigos
             * depois que o UPDATE no banco
             * funcionou.
             */
            const filesToRemove:
                Promise<void>[] =
                [];

            if (
                audioFile &&
                newAudioUrl !==
                    performance.audio_url
            ) {
                filesToRemove.push(
                    removeStorageFile(
                        performance.audio_url,
                    ),
                );
            }

            if (
                coverImageFile &&
                newCoverImageUrl !==
                    performance.cover_image
            ) {
                filesToRemove.push(
                    removeStorageFile(
                        performance.cover_image,
                    ),
                );
            }

            if (
                filesToRemove.length >
                0
            ) {
                await Promise.all(
                    filesToRemove,
                );
            }

            router.push(
                "/admin/performances",
            );

            router.refresh();
        } catch (
            submitError
        ) {
            console.error(
                "Update performance error:",
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
                    "Não foi possível atualizar a apresentação.",
                );
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete() {
        const confirmed =
            window.confirm(
                `Tem certeza que deseja excluir "${performance.name}"?`,
            );

        if (!confirmed) {
            return;
        }

        setDeleting(true);
        setError(null);

        try {
            const {
                error:
                    deleteError,
            } =
                await supabase
                    .from(
                        "performances",
                    )
                    .delete()
                    .eq(
                        "id",
                        performance.id,
                    );

            if (deleteError) {
                throw deleteError;
            }

            /*
             * Depois de remover a performance
             * do banco, removemos também
             * áudio e imagem do Storage.
             */
            await Promise.all([
                removeStorageFile(
                    performance.audio_url,
                ),
                removeStorageFile(
                    performance.cover_image,
                ),
            ]);

            router.push(
                "/admin/performances",
            );

            router.refresh();
        } catch (
            deleteError
        ) {
            console.error(
                "Delete performance error:",
                deleteError,
            );

            if (
                deleteError instanceof
                Error
            ) {
                setError(
                    deleteError.message,
                );
            } else {
                setError(
                    "Não foi possível excluir a apresentação.",
                );
            }
        } finally {
            setDeleting(
                false,
            );
        }
    }

    const isBusy =
        loading ||
        deleting;

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
                    disabled={
                        isBusy
                    }
                    className="rounded-md border border-black bg-white px-4 py-3 outline-none disabled:opacity-50"
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
                    disabled={
                        isBusy
                    }
                    className="rounded-md border border-black bg-white px-4 py-3 outline-none disabled:opacity-50"
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
                    disabled={
                        isBusy
                    }
                    className="resize-y rounded-md border border-black bg-white px-4 py-3 outline-none disabled:opacity-50"
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
                    disabled={
                        isBusy
                    }
                    className="rounded-md border border-black bg-white px-4 py-3 outline-none disabled:opacity-50"
                />
            </div>

            <div className="flex flex-col gap-2">
                <label
                    htmlFor="cover-image"
                    className="text-sm"
                >
                    Imagem da apresentação
                </label>

                {performance.cover_image && (
                    <div className="rounded-md border border-black p-4">
                        <p className="text-xs uppercase opacity-50">
                            Imagem atual
                        </p>

                        <img
                            src={
                                performance.cover_image
                            }
                            alt={
                                performance.name
                            }
                            className="
                                mt-3
                                max-h-80
                                w-full
                                rounded-md
                                object-cover
                            "
                        />
                    </div>
                )}

                <input
                    id="cover-image"
                    type="file"
                    accept="image/*"
                    disabled={
                        isBusy
                    }
                    onChange={(
                        event,
                    ) =>
                        setCoverImageFile(
                            event
                                .target
                                .files?.[0] ??
                                null,
                        )
                    }
                    className="rounded-md border border-black bg-white px-4 py-3 disabled:opacity-50"
                />

                <p className="text-xs opacity-60">
                    Deixe vazio para manter a imagem atual.
                </p>

                {coverImageFile && (
                    <div className="flex flex-col gap-1">
                        <p className="text-xs font-medium">
                            Nova imagem:
                        </p>

                        <p className="text-xs opacity-60">
                            {
                                coverImageFile.name
                            }
                        </p>

                        <p className="text-xs opacity-60">
                            {formatFileSize(
                                coverImageFile.size,
                            )}
                        </p>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <label
                    htmlFor="audio"
                    className="text-sm"
                >
                    Áudio
                </label>

                {performance.audio_url && (
                    <div className="rounded-md border border-black p-4">
                        <p className="text-xs uppercase opacity-50">
                            Áudio atual
                        </p>

                        <audio
                            controls
                            preload="metadata"
                            src={
                                performance.audio_url
                            }
                            className="mt-3 w-full"
                        />
                    </div>
                )}

                <input
                    id="audio"
                    type="file"
                    accept="audio/*"
                    disabled={
                        isBusy
                    }
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
                    className="rounded-md border border-black bg-white px-4 py-3 disabled:opacity-50"
                />

                <p className="text-xs opacity-60">
                    Deixe vazio para manter o áudio atual.
                </p>

                {audioFile && (
                    <div className="flex flex-col gap-1">
                        <p className="text-xs font-medium">
                            Novo áudio:
                        </p>

                        <p className="text-xs opacity-60">
                            {
                                audioFile.name
                            }
                        </p>

                        <p className="text-xs opacity-60">
                            {formatFileSize(
                                audioFile.size,
                            )}
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
                    disabled={
                        isBusy
                    }
                    className="rounded-md border border-black bg-white px-4 py-3 outline-none disabled:opacity-50"
                    placeholder="https://..."
                />
            </div>

            <label className="flex cursor-pointer items-center gap-3 border-y border-black py-4">
                <input
                    type="checkbox"
                    checked={
                        published
                    }
                    disabled={
                        isBusy
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

            <div className="flex flex-wrap items-center gap-4">
                <button
                    type="submit"
                    disabled={
                        isBusy
                    }
                    className="rounded-md border border-black bg-white px-5 py-3 shadow-[3px_3px_0_#000] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading
                        ? "Salvando..."
                        : "Salvar alterações"}
                </button>

                <button
                    type="button"
                    disabled={
                        isBusy
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

                <button
                    type="button"
                    disabled={
                        isBusy
                    }
                    onClick={
                        handleDelete
                    }
                    className="ml-auto rounded-md border border-red-600 bg-white px-5 py-3 text-red-600 transition-opacity hover:opacity-60 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {deleting
                        ? "Excluindo..."
                        : "Excluir apresentação"}
                </button>
            </div>
        </form>
    );
}