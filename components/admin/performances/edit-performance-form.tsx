
"use client";

import {
    type FormEvent,
    useRef,
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
    location: string | null;
    video_url: string | null;
    audio_url: string | null;
    cover_image: string | null;
    published: boolean;
};

type EditPerformanceFormProps = {
    performance: Performance;
};

const labelClassName =
    "font-october text-xl uppercase leading-none text-[#FFFDE9]";

const inputClassName =
    "w-full min-w-0 rounded-xl border border-black bg-white px-4 py-3 text-base text-black outline-none transition-colors placeholder:text-black/40 focus:ring-2 focus:ring-[#FFFDE9]/40 disabled:opacity-50";

const fileInputClassName =
    "w-full min-w-0 rounded-xl border border-black bg-white px-4 py-3 text-sm text-black file:mr-4 file:cursor-pointer file:rounded-lg file:border file:border-black file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-black disabled:opacity-50";

const buttonClassName =
    "inline-flex items-center justify-center rounded-xl border border-black bg-[#FFFDE9] px-6 py-3 text-base font-medium text-black shadow-[-5px_5px_0_0_#000] transition-all duration-200 hover:-translate-y-1 hover:shadow-[-5px_9px_0_0_#000] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-[-5px_5px_0_0_#000]";

const smallButtonClassName =
    "inline-flex items-center justify-center rounded-lg border border-black bg-[#FFFDE9] px-4 py-2 text-sm font-medium text-black shadow-[-3px_3px_0_0_#000] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[-3px_5px_0_0_#000] disabled:cursor-not-allowed disabled:opacity-40";

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
        location,
        setLocation,
    ] = useState(
        performance.location ??
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
        removeCoverImage,
        setRemoveCoverImage,
    ] = useState(false);

    const coverInputRef =
        useRef<HTMLInputElement>(null);

    function handleRemoveCoverImage() {
        setRemoveCoverImage(true);
        setCoverImageFile(null);

        if (coverInputRef.current) {
            coverInputRef.current.value = "";
        }
    }

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
    ] = useState<string | null>(
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
        if (
            removeCoverImage &&
            !coverImageFile
        ) {
            return null;
        }

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

                        location:
                            location.trim() ||
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
                (coverImageFile || removeCoverImage) &&
                newCoverImageUrl !== performance.cover_image
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
                    disabled={isBusy}
                    className={inputClassName}
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
                    disabled={isBusy}
                    className={inputClassName}
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
                    disabled={isBusy}
                    className={`${inputClassName} resize-y`}
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
                        disabled={isBusy}
                        className={inputClassName}
                    />
                </div>

                <div className="flex flex-col gap-3">
                    <label
                        htmlFor="location"
                        className={labelClassName}
                    >
                        Local
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
                        disabled={isBusy}
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
                        </label>

                        {performance.cover_image && !removeCoverImage && (
                            <div className="rounded-xl border border-black bg-[#FFFDE9] p-5 text-black shadow-[-5px_5px_0_0_#000]">
                                <p className="font-october text-lg uppercase leading-none text-black">
                                    Imagem atual
                                </p>

                                <img
                                    src={performance.cover_image}
                                    alt={performance.name}
                                    className="mt-4 max-h-80 w-full rounded-lg border border-black object-cover"
                                />

                                <button
                                    type="button"
                                    disabled={isBusy}
                                    onClick={handleRemoveCoverImage}
                                    className={`mt-5 ${smallButtonClassName}`}
                                >
                                    Remover imagem
                                </button>
                            </div>
                        )}

                        {removeCoverImage && (
                            <div className="rounded-xl border border-black bg-[#FFFDE9] p-5 text-black shadow-[-5px_5px_0_0_#000]">
                                <p className="text-sm font-medium">
                                    Imagem marcada para remoção.
                                </p>

                                <p className="mt-2 text-xs text-black/60">
                                    A remoção será confirmada ao salvar.
                                </p>

                                <button
                                    type="button"
                                    disabled={isBusy}
                                    onClick={() =>
                                        setRemoveCoverImage(false)
                                    }
                                    className={`mt-4 ${smallButtonClassName}`}
                                >
                                    Desfazer remoção
                                </button>
                            </div>
                        )}

                        <input
                            ref={coverInputRef}
                            id="cover-image"
                            type="file"
                            accept="image/*"
                            disabled={isBusy}
                            onChange={(event) => {
                                const file =
                                    event.target.files?.[0] ??
                                    null;

                                setCoverImageFile(file);

                                if (file) {
                                    setRemoveCoverImage(false);
                                }
                            }}
                            className={fileInputClassName}
                        />

                        <p className="text-xs text-[#FFFDE9]/70">
                            Deixe vazio para manter a imagem atual.
                        </p>

                        {coverImageFile && (
                            <div className="rounded-xl border border-[#FFFDE9]/40 p-4">
                                <p className="text-sm font-medium">
                                    Nova imagem:
                                </p>

                                <p className="mt-2 break-all text-sm text-[#FFFDE9]/80">
                                    {coverImageFile.name}
                                </p>

                                <p className="mt-1 text-xs text-[#FFFDE9]/70">
                                    {formatFileSize(
                                        coverImageFile.size,
                                    )}
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
                        </label>

                        {performance.audio_url && (
                            <div className="rounded-xl border border-black bg-[#FFFDE9] p-5 text-black shadow-[-5px_5px_0_0_#000]">
                                <p className="font-october text-lg uppercase leading-none text-black">
                                    Áudio atual
                                </p>

                                <audio
                                    controls
                                    preload="metadata"
                                    src={performance.audio_url}
                                    className="mt-4 w-full"
                                />
                            </div>
                        )}

                        <input
                            id="audio"
                            type="file"
                            accept="audio/*"
                            disabled={isBusy}
                            onChange={(event) =>
                                setAudioFile(
                                    event.target.files?.[0] ??
                                    null,
                                )
                            }
                            className={fileInputClassName}
                        />

                        <p className="text-xs text-[#FFFDE9]/70">
                            Deixe vazio para manter o áudio atual.
                        </p>

                        {audioFile && (
                            <div className="rounded-xl border border-[#FFFDE9]/40 p-4">
                                <p className="text-sm font-medium">
                                    Novo áudio:
                                </p>

                                <p className="mt-2 break-all text-sm text-[#FFFDE9]/80">
                                    {audioFile.name}
                                </p>

                                <p className="mt-1 text-xs text-[#FFFDE9]/70">
                                    {formatFileSize(
                                        audioFile.size,
                                    )}
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
                            disabled={isBusy}
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
                    disabled={isBusy}
                    onChange={(event) =>
                        setPublished(
                            event.target.checked,
                        )
                    }
                    className="mt-1 h-5 w-5 shrink-0 accent-black disabled:opacity-50"
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
                    disabled={isBusy}
                    className={buttonClassName}
                >
                    {loading
                        ? "Salvando..."
                        : "Salvar alterações"}
                </button>

                <button
                    type="button"
                    disabled={isBusy}
                    onClick={() =>
                        router.push(
                            "/admin/performances",
                        )
                    }
                    className={buttonClassName}
                >
                    Cancelar
                </button>

                <button
                    type="button"
                    disabled={isBusy}
                    onClick={handleDelete}
                    className={`${buttonClassName} sm:ml-auto`}
                >
                    {deleting
                        ? "Excluindo..."
                        : "Excluir apresentação"}
                </button>
            </div>
        </form>
    );
}
