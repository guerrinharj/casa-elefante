
"use client";

import Link from "next/link";

import {
    type ChangeEvent,
    useMemo,
    useState,
} from "react";

import {
    useRouter,
} from "next/navigation";

import {
    createClient,
} from "@/lib/supabase/client";

type ImportStatus =
    | "pending"
    | "uploading"
    | "saving"
    | "success"
    | "error"
    | "duplicate";

type PerformanceRow = {
    id: string;
    name: string;
    slug: string;
    description: string;
    performance_date: string;
    location: string;
    video_url: string;
    audio_url: string;
    cover_image: string;
    audio_file: string;
    cover_file: string;
    published: boolean;
    status: ImportStatus;
    error: string;
};

const buttonClassName =
    "inline-flex items-center justify-center rounded-xl border border-black bg-white px-5 py-3 text-sm font-medium text-black shadow-[-5px_5px_0_0_#000] transition-all duration-200 hover:-translate-y-1 hover:shadow-[-5px_9px_0_0_#000] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0";

const inputClassName =
    "w-full min-w-0 rounded-xl border border-black bg-white px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-[#D2232A]/30 disabled:opacity-50";

const cardClassName =
    "rounded-xl border border-black bg-[#FFFDE9] p-6 text-black shadow-[-5px_5px_0_0_#000] md:p-8";

function slugify(value: string) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function normalizeFileName(value: string) {
    return value.trim().toLowerCase();
}

function formatSize(size: number) {
    return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function isValidDate(value: string) {
    if (!value) {
        return true;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }

    const date = new Date(`${value}T12:00:00Z`);

    return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
    );
}

function isValidUrl(value: string) {
    if (!value) {
        return true;
    }

    try {
        const url = new URL(value);

        return (
            url.protocol === "http:" ||
            url.protocol === "https:"
        );
    } catch {
        return false;
    }
}

function parseCSV(text: string) {
    const result: string[][] = [];
    let row: string[] = [];
    let cell = "";
    let quoted = false;

    const content = text
        .replace(/^\uFEFF/, "")
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n");

    for (let i = 0; i < content.length; i++) {
        const char = content[i];

        if (char === '"') {
            if (quoted && content[i + 1] === '"') {
                cell += '"';
                i++;
            } else {
                quoted = !quoted;
            }

            continue;
        }

        if (char === "," && !quoted) {
            row.push(cell.trim());
            cell = "";
            continue;
        }

        if (char === "\n" && !quoted) {
            row.push(cell.trim());

            if (row.some(Boolean)) {
                result.push(row);
            }

            row = [];
            cell = "";
            continue;
        }

        cell += char;
    }

    if (quoted) {
        throw new Error(
            "CSV inválido: aspas sem fechamento.",
        );
    }

    row.push(cell.trim());

    if (row.some(Boolean)) {
        result.push(row);
    }

    return result;
}

function downloadTemplate() {
    const headers = [
        "name",
        "slug",
        "description",
        "performance_date",
        "location",
        "video_url",
        "audio_url",
        "cover_image",
        "audio_file",
        "cover_file",
        "published",
    ];

    const example = [
        "Toda Terça Tem 001",
        "toda-terca-tem-001",
        "Apresentação ao vivo",
        "2026-11-17",
        "São Paulo",
        "",
        "",
        "",
        "ttt-001.mp3",
        "ttt-001.jpg",
        "false",
    ];

    const content = [
        headers.join(","),
        example
            .map(
                (value) =>
                    `"${value.replace(/"/g, '""')}"`,
            )
            .join(","),
    ].join("\n");

    const blob = new Blob(
        ["\uFEFF", content],
        {
            type: "text/csv;charset=utf-8",
        },
    );

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "toda-terca-tem-import.csv";
    anchor.click();

    URL.revokeObjectURL(url);
}

export default function ImportPerformancesPage() {
    const router = useRouter();

    const [rows, setRows] =
        useState<PerformanceRow[]>([]);

    const [audioFiles, setAudioFiles] =
        useState<File[]>([]);

    const [coverFiles, setCoverFiles] =
        useState<File[]>([]);

    const [csvName, setCsvName] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const [progress, setProgress] =
        useState(0);

    const [finished, setFinished] =
        useState(false);

    const stats = useMemo(() => ({
        total: rows.length,
        success: rows.filter(
            (row) => row.status === "success",
        ).length,
        errors: rows.filter(
            (row) =>
                row.status === "error" ||
                row.status === "duplicate",
        ).length,
        pending: rows.filter(
            (row) => row.status === "pending",
        ).length,
    }), [rows]);

    const duplicateSlugs = useMemo(() => {
        const counts = new Map<string, number>();

        rows.forEach((row) => {
            if (row.slug) {
                counts.set(
                    row.slug,
                    (counts.get(row.slug) || 0) + 1,
                );
            }
        });

        return new Set(
            [...counts.entries()]
                .filter(([, count]) => count > 1)
                .map(([slug]) => slug),
        );
    }, [rows]);

    function updateRow(
        id: string,
        values: Partial<PerformanceRow>,
    ) {
        setRows((current) =>
            current.map((row) =>
                row.id === id
                    ? { ...row, ...values }
                    : row,
            ),
        );
    }

    async function handleCSV(
        event: ChangeEvent<HTMLInputElement>,
    ) {
        const file = event.target.files?.[0];

        if (!file || loading) {
            return;
        }

        setMessage("");
        setFinished(false);
        setProgress(0);

        try {
            const text = await file.text();
            const parsed = parseCSV(text);

            if (parsed.length < 2) {
                throw new Error(
                    "O CSV precisa conter um cabeçalho e pelo menos uma apresentação.",
                );
            }

            const headers = parsed[0].map(
                (header) => header.toLowerCase(),
            );

            if (!headers.includes("name")) {
                throw new Error(
                    'A coluna "name" é obrigatória.',
                );
            }

            const imported: PerformanceRow[] = parsed
                .slice(1)
                .map((cells) => {
                    function get(column: string) {
                        const index =
                            headers.indexOf(column);

                        return index >= 0
                            ? cells[index] || ""
                            : "";
                    }

                    const name = get("name");

                    return {
                        id: crypto.randomUUID(),
                        name,
                        slug: slugify(
                            get("slug") || name,
                        ),
                        description: get("description"),
                        performance_date:
                            get("performance_date"),
                        location: get("location"),
                        video_url: get("video_url"),
                        audio_url: get("audio_url"),
                        cover_image: get("cover_image"),
                        audio_file: get("audio_file"),
                        cover_file: get("cover_file"),
                        published: [
                            "true",
                            "1",
                            "sim",
                            "yes",
                        ].includes(
                            get("published").toLowerCase(),
                        ),
                        status: "pending",
                        error: "",
                    };
                });

            setRows(imported);
            setCsvName(file.name);
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Erro ao ler o CSV.",
            );
        }

        event.target.value = "";
    }

    function handleAudioFiles(
        event: ChangeEvent<HTMLInputElement>,
    ) {
        if (loading) {
            return;
        }

        const files = Array.from(
            event.target.files || [],
        ).filter(
            (file) =>
                file.name.toLowerCase().endsWith(".mp3"),
        );

        setAudioFiles(files);
        setFinished(false);
        setMessage("");
        event.target.value = "";
    }

    function handleCoverFiles(
        event: ChangeEvent<HTMLInputElement>,
    ) {
        if (loading) {
            return;
        }

        const files = Array.from(
            event.target.files || [],
        ).filter(
            (file) => file.type.startsWith("image/"),
        );

        setCoverFiles(files);
        setFinished(false);
        event.target.value = "";
    }

    const preparedRows = useMemo(() => {
        const audioMap = new Map(
            audioFiles.map((file) => [
                normalizeFileName(file.name),
                file,
            ]),
        );

        const coverMap = new Map(
            coverFiles.map((file) => [
                normalizeFileName(file.name),
                file,
            ]),
        );

        return rows.map((row) => {
            const audioFile =
                audioMap.get(
                    normalizeFileName(row.audio_file),
                ) || null;

            const coverFile =
                coverMap.get(
                    normalizeFileName(row.cover_file),
                ) || null;

            const validationErrors: string[] = [];

            if (!row.name.trim()) {
                validationErrors.push(
                    "Nome obrigatório",
                );
            }

            if (!row.slug.trim()) {
                validationErrors.push(
                    "Slug obrigatório",
                );
            }

            if (duplicateSlugs.has(row.slug)) {
                validationErrors.push(
                    "Slug duplicado no lote",
                );
            }

            if (!isValidDate(row.performance_date)) {
                validationErrors.push(
                    "Data inválida",
                );
            }

            for (const url of [
                row.video_url,
                row.audio_url,
                row.cover_image,
            ]) {
                if (!isValidUrl(url)) {
                    validationErrors.push(
                        "URL inválida",
                    );
                    break;
                }
            }

            if (
                row.audio_file &&
                !audioFile &&
                !row.audio_url
            ) {
                validationErrors.push(
                    `MP3 não encontrado: ${row.audio_file}`,
                );
            }

            if (row.cover_file && !coverFile) {
                validationErrors.push(
                    `Imagem não encontrada: ${row.cover_file}`,
                );
            }

            return {
                ...row,
                audioFile,
                coverFile,
                validationErrors,
            };
        });
    }, [
        rows,
        audioFiles,
        coverFiles,
        duplicateSlugs,
    ]);

    async function uploadFile(
        file: File,
        folder: string,
    ) {
        const supabase = createClient();

        const extension =
            file.name.split(".").pop()?.toLowerCase() ||
            "bin";

        const path =
            `${folder}/${crypto.randomUUID()}.${extension}`;

        const {
            error,
        } = await supabase.storage
            .from("musicas")
            .upload(
                path,
                file,
                {
                    cacheControl: "3600",
                    upsert: false,
                    contentType:
                        file.type ||
                        (
                            extension === "mp3"
                                ? "audio/mpeg"
                                : "application/octet-stream"
                        ),
                },
            );

        if (error) {
            throw error;
        }

        const {
            data,
        } = supabase.storage
            .from("musicas")
            .getPublicUrl(path);

        return {
            url: data.publicUrl,
            path,
        };
    }

    async function handleImport() {
        if (loading || preparedRows.length === 0) {
            return;
        }

        const invalid = preparedRows.filter(
            (row) =>
                row.status === "pending" &&
                row.validationErrors.length > 0,
        );

        if (invalid.length > 0) {
            setMessage(
                `Corrija os problemas de ${invalid.length} apresentação(ões) antes de importar.`,
            );
            return;
        }

        const pending = preparedRows.filter(
            (row) => row.status === "pending",
        );

        if (pending.length === 0) {
            setMessage(
                "Não existem apresentações pendentes.",
            );
            return;
        }

        setLoading(true);
        setFinished(false);
        setMessage("");
        setProgress(0);

        const supabase = createClient();

        try {
            const {
                data: existing,
                error: lookupError,
            } = await supabase
                .from("performances")
                .select("slug")
                .in(
                    "slug",
                    pending.map((row) => row.slug),
                );

            if (lookupError) {
                throw lookupError;
            }

            const existingSlugs = new Set(
                (existing || []).map(
                    (performance) => performance.slug,
                ),
            );

            let completed = 0;

            for (const row of pending) {
                if (existingSlugs.has(row.slug)) {
                    updateRow(row.id, {
                        status: "duplicate",
                        error: "Esta apresentação já existe no banco.",
                    });

                    completed++;
                    setProgress(
                        Math.round(
                            (completed / pending.length) * 100,
                        ),
                    );
                    continue;
                }

                const uploadedPaths: string[] = [];

                try {
                    updateRow(row.id, {
                        status: "uploading",
                        error: "",
                    });

                    let audioUrl =
                        row.audio_url || null;

                    let coverImageUrl =
                        row.cover_image || null;

                    if (row.audioFile) {
                        const uploaded = await uploadFile(
                            row.audioFile,
                            "audio",
                        );

                        audioUrl = uploaded.url;
                        uploadedPaths.push(uploaded.path);
                    }

                    if (row.coverFile) {
                        const uploaded = await uploadFile(
                            row.coverFile,
                            "covers",
                        );

                        coverImageUrl = uploaded.url;
                        uploadedPaths.push(uploaded.path);
                    }

                    updateRow(row.id, {
                        status: "saving",
                    });

                    const {
                        error: insertError,
                    } = await supabase
                        .from("performances")
                        .insert({
                            name: row.name.trim(),
                            slug: row.slug.trim(),
                            description:
                                row.description.trim() || null,
                            performance_date:
                                row.performance_date || null,
                            location:
                                row.location.trim() || null,
                            video_url:
                                row.video_url.trim() || null,
                            audio_url: audioUrl,
                            cover_image: coverImageUrl,
                            published: row.published,
                        });

                    if (insertError) {
                        throw insertError;
                    }

                    existingSlugs.add(row.slug);

                    updateRow(row.id, {
                        status: "success",
                        error: "",
                    });
                } catch (error) {
                    if (uploadedPaths.length > 0) {
                        const {
                            error: cleanupError,
                        } = await supabase.storage
                            .from("musicas")
                            .remove(uploadedPaths);

                        if (cleanupError) {
                            console.error(
                                "Erro ao limpar arquivos:",
                                cleanupError,
                            );
                        }
                    }

                    updateRow(row.id, {
                        status: "error",
                        error:
                            error instanceof Error
                                ? error.message
                                : "Erro desconhecido",
                    });
                }

                completed++;

                setProgress(
                    Math.round(
                        (completed / pending.length) * 100,
                    ),
                );
            }

            setFinished(true);
            router.refresh();
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Erro durante a importação.",
            );
        } finally {
            setLoading(false);
        }
    }

    function removeRow(id: string) {
        if (loading) {
            return;
        }

        setRows((current) =>
            current.filter((row) => row.id !== id),
        );
    }

    function updateField(
        id: string,
        field: "name" | "slug" | "performance_date" | "location",
        value: string,
    ) {
        if (loading) {
            return;
        }

        setRows((current) =>
            current.map((row) => {
                if (row.id !== id) {
                    return row;
                }

                if (field === "name") {
                    return {
                        ...row,
                        name: value,
                        slug: slugify(value),
                    };
                }

                return {
                    ...row,
                    [field]: value,
                };
            }),
        );
    }

    return (
        <main className="min-h-screen bg-[#D2232A] p-6 text-[#FFFDE9] md:p-10">
            <div className="mx-auto flex max-w-6xl flex-col gap-8">
                <div>
                    <Link
                        href="/admin/performances"
                        className={buttonClassName}
                    >
                        ← Apresentações
                    </Link>
                </div>

                <header>
                    <h1 className="font-october text-5xl uppercase leading-none md:text-6xl">
                        Importação em massa
                    </h1>

                    <p className="mt-4 text-sm text-[#FFFDE9]/80">
                        Importe apresentações e arquivos MP3
                        para o Toda Terça Tem.
                    </p>
                </header>

                <div className="border-t border-[#FFFDE9]/40" />

                <section className={cardClassName}>
                    <h2 className="font-october text-3xl uppercase">
                        01 — Arquivo CSV
                    </h2>

                    <p className="mt-3 text-sm text-black/60">
                        Baixe o modelo, preencha os dados e selecione
                        o arquivo CSV com suas apresentações.
                    </p>

                    <div className="mt-6">
                        <button
                            type="button"
                            onClick={downloadTemplate}
                            disabled={loading}
                            className={buttonClassName}
                        >
                            ↓ Baixar modelo CSV
                        </button>
                    </div>

                    <div className="mt-8">
                        <label className="mb-3 block text-sm font-medium">
                            Selecionar CSV
                        </label>

                        <input
                            type="file"
                            accept=".csv,text/csv"
                            disabled={loading}
                            onChange={handleCSV}
                            className={inputClassName}
                        />

                        {csvName && (
                            <p className="mt-3 text-sm text-black/60">
                                Arquivo carregado: {csvName}
                            </p>
                        )}
                    </div>
                </section>

                <section className={cardClassName}>
                    <h2 className="font-october text-3xl uppercase">
                        02 — Arquivos MP3
                    </h2>

                    <p className="mt-3 text-sm text-black/60">
                        Selecione todos os MP3s correspondentes
                        às apresentações do CSV. A associação
                        será feita pelo nome do arquivo.
                    </p>

                    <div className="mt-6">
                        <input
                            type="file"
                            accept=".mp3,audio/mpeg"
                            multiple
                            disabled={loading}
                            onChange={handleAudioFiles}
                            className={inputClassName}
                        />
                    </div>

                    {audioFiles.length > 0 && (
                        <div className="mt-6 flex flex-col gap-2">
                            <p className="mb-2 text-sm font-medium">
                                {audioFiles.length} MP3s selecionados
                            </p>

                            {audioFiles.map((file, index) => (
                                <div
                                    key={`${file.name}-${index}`}
                                    className="flex items-center justify-between gap-4 border-b border-black/10 py-2 text-sm"
                                >
                                    <span className="min-w-0 break-all">
                                        {file.name}
                                    </span>

                                    <span className="shrink-0 text-black/50">
                                        {formatSize(file.size)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className={cardClassName}>
                    <h2 className="font-october text-3xl uppercase">
                        03 — Imagens
                    </h2>

                    <p className="mt-3 text-sm text-black/60">
                        Opcional. Selecione as capas correspondentes
                        ao campo cover_file do CSV.
                    </p>

                    <div className="mt-6">
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            disabled={loading}
                            onChange={handleCoverFiles}
                            className={inputClassName}
                        />
                    </div>

                    {coverFiles.length > 0 && (
                        <p className="mt-4 text-sm font-medium">
                            {coverFiles.length} imagens selecionadas
                        </p>
                    )}
                </section>

                {rows.length > 0 && (
                    <>
                        <section className="grid grid-cols-2 gap-5 md:grid-cols-4">
                            {[
                                {
                                    label: "Total",
                                    value: stats.total,
                                },
                                {
                                    label: "Pendentes",
                                    value: stats.pending,
                                },
                                {
                                    label: "Importadas",
                                    value: stats.success,
                                },
                                {
                                    label: "Problemas",
                                    value: stats.errors,
                                },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className={cardClassName}
                                >
                                    <p className="text-xs text-black/60">
                                        {item.label}
                                    </p>

                                    <p className="mt-3 font-october text-5xl">
                                        {item.value}
                                    </p>
                                </div>
                            ))}
                        </section>

                        <section className={cardClassName}>
                            <h2 className="font-october text-3xl uppercase">
                                04 — Pré-visualização
                            </h2>

                            <p className="mt-3 text-sm text-black/60">
                                Confira os registros antes de importar.
                                Você pode editar nomes, slugs, datas e locais.
                            </p>

                            <div className="mt-8 flex flex-col gap-5">
                                {preparedRows.map((row, index) => (
                                    <article
                                        key={row.id}
                                        className="rounded-xl border border-black bg-white p-5"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <h3 className="font-october text-2xl uppercase">
                                                Apresentação {index + 1}
                                            </h3>

                                            <div className="flex items-center gap-3">
                                                <span
                                                    className={`rounded-lg border border-black px-3 py-1.5 text-xs font-medium ${
                                                        row.status === "success"
                                                            ? "bg-green-100"
                                                            : row.status === "error" ||
                                                                row.status === "duplicate" ||
                                                                row.validationErrors.length > 0
                                                              ? "bg-red-100"
                                                              : "bg-[#FFFDE9]"
                                                    }`}
                                                >
                                                    {row.status === "success"
                                                        ? "Importada"
                                                        : row.status === "uploading"
                                                          ? "Enviando áudio"
                                                          : row.status === "saving"
                                                            ? "Salvando"
                                                            : row.status === "duplicate"
                                                              ? "Duplicada"
                                                              : row.status === "error"
                                                                ? "Erro"
                                                                : row.validationErrors.length > 0
                                                                  ? "Verificar"
                                                                  : "Pronta"}
                                                </span>

                                                {row.status === "pending" && (
                                                    <button
                                                        type="button"
                                                        disabled={loading}
                                                        onClick={() =>
                                                            removeRow(row.id)
                                                        }
                                                        className="text-sm text-[#D2232A] hover:underline"
                                                    >
                                                        Remover
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                                            <div>
                                                <label className="mb-2 block text-xs font-medium">
                                                    Nome
                                                </label>

                                                <input
                                                    value={row.name}
                                                    disabled={
                                                        loading ||
                                                        row.status !== "pending"
                                                    }
                                                    onChange={(event) =>
                                                        updateField(
                                                            row.id,
                                                            "name",
                                                            event.target.value,
                                                        )
                                                    }
                                                    className={inputClassName}
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-xs font-medium">
                                                    Slug
                                                </label>

                                                <input
                                                    value={row.slug}
                                                    disabled={
                                                        loading ||
                                                        row.status !== "pending"
                                                    }
                                                    onChange={(event) =>
                                                        updateField(
                                                            row.id,
                                                            "slug",
                                                            slugify(
                                                                event.target.value,
                                                            ),
                                                        )
                                                    }
                                                    className={inputClassName}
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-xs font-medium">
                                                    Data
                                                </label>

                                                <input
                                                    type="date"
                                                    value={row.performance_date}
                                                    disabled={
                                                        loading ||
                                                        row.status !== "pending"
                                                    }
                                                    onChange={(event) =>
                                                        updateField(
                                                            row.id,
                                                            "performance_date",
                                                            event.target.value,
                                                        )
                                                    }
                                                    className={inputClassName}
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-xs font-medium">
                                                    Local
                                                </label>

                                                <input
                                                    value={row.location}
                                                    disabled={
                                                        loading ||
                                                        row.status !== "pending"
                                                    }
                                                    onChange={(event) =>
                                                        updateField(
                                                            row.id,
                                                            "location",
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="Local da apresentação"
                                                    className={inputClassName}
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-5 flex flex-wrap gap-3 text-xs">
                                            <span className="rounded-lg border border-black px-3 py-2">
                                                {row.audioFile
                                                    ? `MP3: ${row.audioFile.name}`
                                                    : row.audio_url
                                                      ? "Áudio externo"
                                                      : "Sem áudio"}
                                            </span>

                                            <span className="rounded-lg border border-black px-3 py-2">
                                                {row.coverFile
                                                    ? "Com imagem"
                                                    : row.cover_image
                                                      ? "Imagem externa"
                                                      : "Sem imagem"}
                                            </span>

                                            <span className="rounded-lg border border-black px-3 py-2">
                                                {row.published
                                                    ? "Publicado"
                                                    : "Rascunho"}
                                            </span>
                                        </div>

                                        {row.validationErrors.length > 0 && (
                                            <div className="mt-5 rounded-lg border border-[#D2232A] bg-red-50 p-4">
                                                {row.validationErrors.map(
                                                    (error, errorIndex) => (
                                                        <p
                                                            key={errorIndex}
                                                            className="text-sm text-[#D2232A]"
                                                        >
                                                            • {error}
                                                        </p>
                                                    ),
                                                )}
                                            </div>
                                        )}

                                        {row.error && (
                                            <p className="mt-4 text-sm text-[#D2232A]">
                                                {row.error}
                                            </p>
                                        )}
                                    </article>
                                ))}
                            </div>
                        </section>

                        <section className={cardClassName}>
                            <h2 className="font-october text-3xl uppercase">
                                05 — Importar
                            </h2>

                            <p className="mt-3 text-sm text-black/60">
                                Os MP3s serão enviados para o bucket
                                musicas e associados às apresentações
                                cadastradas no Supabase.
                            </p>

                            <p className="mt-3 text-sm font-medium">
                                {stats.pending} apresentações pendentes.
                            </p>

                            {loading && (
                                <div className="mt-6">
                                    <div className="h-4 overflow-hidden rounded-full border border-black bg-white">
                                        <div
                                            className="h-full bg-[#D2232A] transition-all duration-300"
                                            style={{
                                                width: `${progress}%`,
                                            }}
                                        />
                                    </div>

                                    <p className="mt-3 text-sm">
                                        {progress}% concluído
                                    </p>
                                </div>
                            )}

                            {message && (
                                <div
                                    role="alert"
                                    className="mt-6 rounded-lg border border-[#D2232A] bg-red-50 p-4 text-sm text-[#D2232A]"
                                >
                                    {message}
                                </div>
                            )}

                            {finished && (
                                <div className="mt-6 rounded-lg border border-black bg-white p-4 text-sm">
                                    Importação finalizada. Confira
                                    os resultados acima.
                                </div>
                            )}

                            <div className="mt-8 flex flex-wrap gap-4">
                                <button
                                    type="button"
                                    disabled={
                                        loading ||
                                        stats.pending === 0 ||
                                        preparedRows.some(
                                            (row) =>
                                                row.status === "pending" &&
                                                row.validationErrors.length > 0,
                                        )
                                    }
                                    onClick={handleImport}
                                    className={buttonClassName}
                                >
                                    {loading
                                        ? "Importando..."
                                        : `Importar ${stats.pending} apresentações`}
                                </button>

                                <Link
                                    href="/admin/performances"
                                    className={buttonClassName}
                                >
                                    Voltar às apresentações
                                </Link>
                            </div>
                        </section>
                    </>
                )}
            </div>
        </main>
    );
}
