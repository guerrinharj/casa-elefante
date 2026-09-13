"use client";

import Link from "next/link";

import {
    ChangeEvent,
    useMemo,
    useState,
} from "react";

import {
    read,
    utils,
    writeFile,
} from "xlsx";

import { createClient } from "@/lib/supabase/client";


import {
    PRODUCT_FORMATS,
    PRODUCT_GENRES,
} from "@/lib/products";

type SpreadsheetRow = {
    name?: unknown;
    artist?: unknown;
    label?: unknown;
    year?: unknown;
    price?: unknown;
    genre?: unknown;
    format?: unknown;
    condition?: unknown;
    stock?: unknown;
    catalog_number?: unknown;
    description?: unknown;
    images?: unknown;
};

type ParsedProduct = {
    row: number;
    name: string;
    artist: string;
    label: string | null;
    year: number | null;
    price: number;
    genre: string | null;
    format: string | null;
    condition: string | null;
    stock: number;
    catalog_number: string | null;
    description: string | null;
    imageNames: string[];
};

type ImportError = {
    row: number;
    message: string;
};

function normalizeString(value: unknown) {
    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value).trim();
}

function normalizeNumber(
    value: unknown,
) {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return null;
    }

    if (
        typeof value === "number"
    ) {
        return value;
    }

    const normalized = String(value)
        .trim()
        .replace(/\s/g, "")
        .replace(",", ".");

    const parsed = Number(normalized);

    if (
        Number.isNaN(parsed)
    ) {
        return null;
    }

    return parsed;
}

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

function sanitizeStorageFilename(
    filename: string,
) {
    const lastDot =
        filename.lastIndexOf(".");

    const name =
        lastDot >= 0
            ? filename.slice(
                0,
                lastDot,
            )
            : filename;

    const extension =
        lastDot >= 0
            ? filename
                .slice(
                    lastDot + 1,
                )
                .toLowerCase()
            : "";

    const cleanName =
        slugify(name) ||
        crypto.randomUUID();

    return extension
        ? `${cleanName}.${extension}`
        : cleanName;
}

function parseImageNames(
    value: unknown,
) {
    const string =
        normalizeString(value);

    if (!string) {
        return [];
    }

    return string
        .split(/[;,|]/)
        .map((item) =>
            item.trim(),
        )
        .filter(Boolean);
}

export function ProductSpreadsheetImporter() {
    const supabase =
        useMemo(
            () => createClient(),
            [],
        );

    const [
        spreadsheetFile,
        setSpreadsheetFile,
    ] = useState<File | null>(
        null,
    );

    const [
        images,
        setImages,
    ] = useState<File[]>([]);

    const [
        products,
        setProducts,
    ] = useState<
        ParsedProduct[]
    >([]);

    const [
        errors,
        setErrors,
    ] = useState<
        ImportError[]
    >([]);

    const [
        isReading,
        setIsReading,
    ] = useState(false);

    const [
        isImporting,
        setIsImporting,
    ] = useState(false);

    const [
        importedCount,
        setImportedCount,
    ] = useState(0);

    const [
        progress,
        setProgress,
    ] = useState("");

    const [
        finished,
        setFinished,
    ] = useState(false);

    async function downloadTemplate() {
        const ExcelJS = await import("exceljs");

        const workbook =
            new ExcelJS.Workbook();

        const worksheet =
            workbook.addWorksheet("Produtos");

        const listsWorksheet =
            workbook.addWorksheet("Listas");

        worksheet.columns = [
            {
                header: "name",
                key: "name",
                width: 30,
            },
            {
                header: "artist",
                key: "artist",
                width: 25,
            },
            {
                header: "label",
                key: "label",
                width: 20,
            },
            {
                header: "year",
                key: "year",
                width: 10,
            },
            {
                header: "price",
                key: "price",
                width: 12,
            },
            {
                header: "genre",
                key: "genre",
                width: 35,
            },
            {
                header: "format",
                key: "format",
                width: 20,
            },
            {
                header: "condition",
                key: "condition",
                width: 15,
            },
            {
                header: "stock",
                key: "stock",
                width: 10,
            },
            {
                header: "catalog_number",
                key: "catalog_number",
                width: 20,
            },
            {
                header: "description",
                key: "description",
                width: 50,
            },
            {
                header: "images",
                key: "images",
                width: 50,
            },
        ];

        PRODUCT_GENRES.forEach(
            (genre, index) => {
                listsWorksheet.getCell(
                    index + 1,
                    1,
                ).value = genre;
            },
        );

        PRODUCT_FORMATS.forEach(
            (format, index) => {
                listsWorksheet.getCell(
                    index + 1,
                    2,
                ).value = format;
            },
        );

        listsWorksheet.getCell(
            "A1",
        ).value = PRODUCT_GENRES[0];

        listsWorksheet.getCell(
            "B1",
        ).value = PRODUCT_FORMATS[0];

        for (
            let row = 2;
            row <= 501;
            row += 1
        ) {
            worksheet.getCell(
                `F${row}`,
            ).dataValidation = {
                type: "list",
                allowBlank: true,
                formulae: [
                    `'Listas'!$A$1:$A$${PRODUCT_GENRES.length}`,
                ],
                showErrorMessage: true,
                errorTitle:
                    "Gênero inválido",
                error:
                    "Selecione um gênero da lista.",
            };

            worksheet.getCell(
                `G${row}`,
            ).dataValidation = {
                type: "list",
                allowBlank: true,
                formulae: [
                    `'Listas'!$B$1:$B$${PRODUCT_FORMATS.length}`,
                ],
                showErrorMessage: true,
                errorTitle:
                    "Formato inválido",
                error:
                    "Selecione um formato da lista.",
            };
        }

        listsWorksheet.state =
            "hidden";

        worksheet.addRow({
            name: "África Brasil",
            artist: "Jorge Ben",
            label: "Philips",
            year: 1976,
            price: 189.9,
            genre: PRODUCT_GENRES[0],
            format: PRODUCT_FORMATS[0],
            condition: "VG+",
            stock: 1,
            catalog_number:
                "6349 168",
            description:
                "Descrição do produto",
            images:
                "africa-brasil-1.jpg;africa-brasil-2.jpg",
        });

        const buffer =
            await workbook.xlsx.writeBuffer();

        const blob = new Blob(
            [buffer],
            {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            },
        );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;
        link.download =
            "modelo-produtos-casa-elefante.xlsx";

        document.body.appendChild(
            link,
        );

        link.click();

        document.body.removeChild(
            link,
        );

        URL.revokeObjectURL(url);
    }

    async function parseSpreadsheet(
        file: File,
    ) {
        setIsReading(true);
        setErrors([]);
        setProducts([]);
        setFinished(false);
        setImportedCount(0);

        try {
            const buffer =
                await file.arrayBuffer();

            const workbook =
                read(buffer);

            const firstSheetName =
                workbook.SheetNames[0];

            if (
                !firstSheetName
            ) {
                throw new Error(
                    "A planilha não possui nenhuma aba.",
                );
            }

            const worksheet =
                workbook.Sheets[
                    firstSheetName
                ];

            const rows =
                utils.sheet_to_json<
                    SpreadsheetRow
                >(
                    worksheet,
                    {
                        defval: "",
                    },
                );

            const parsedProducts:
                ParsedProduct[] =
                [];

            const validationErrors:
                ImportError[] =
                [];

            rows.forEach(
                (
                    row,
                    index,
                ) => {
                    const spreadsheetRow =
                        index + 2;

                    const name =
                        normalizeString(
                            row.name,
                        );

                    const artist =
                        normalizeString(
                            row.artist,
                        );

                    const label =
                        normalizeString(
                            row.label,
                        );

                    const genre =
                        normalizeString(
                            row.genre,
                        );

                    const format =
                        normalizeString(
                            row.format,
                        );

                    const condition =
                        normalizeString(
                            row.condition,
                        );

                    const catalogNumber =
                        normalizeString(
                            row.catalog_number,
                        );

                    const description =
                        normalizeString(
                            row.description,
                        );

                    const year =
                        normalizeNumber(
                            row.year,
                        );

                    const price =
                        normalizeNumber(
                            row.price,
                        );

                    const stock =
                        normalizeNumber(
                            row.stock,
                        );

                    const imageNames =
                        parseImageNames(
                            row.images,
                        );

                    if (!name) {
                        validationErrors.push({
                            row:
                                spreadsheetRow,
                            message:
                                "Nome do produto é obrigatório.",
                        });

                        return;
                    }

                    if (!artist) {
                        validationErrors.push({
                            row:
                                spreadsheetRow,
                            message:
                                "Artista é obrigatório.",
                        });

                        return;
                    }

                    if (
                        price === null ||
                        price < 0
                    ) {
                        validationErrors.push({
                            row:
                                spreadsheetRow,
                            message:
                                "Preço inválido.",
                        });

                        return;
                    }

                    if (
                        stock !== null &&
                        stock < 0
                    ) {
                        validationErrors.push({
                            row:
                                spreadsheetRow,
                            message:
                                "Estoque inválido.",
                        });

                        return;
                    }

                    parsedProducts.push({
                        row:
                            spreadsheetRow,
                        name,
                        artist,
                        label:
                            label ||
                            null,
                        year:
                            year !==
                            null
                                ? Math.trunc(
                                    year,
                                )
                                : null,
                        price,
                        genre:
                            genre ||
                            null,
                        format:
                            format ||
                            null,
                        condition:
                            condition ||
                            null,
                        stock:
                            stock !==
                            null
                                ? Math.trunc(
                                    stock,
                                )
                                : 0,
                        catalog_number:
                            catalogNumber ||
                            null,
                        description:
                            description ||
                            null,
                        imageNames,
                    });
                },
            );

            setProducts(
                parsedProducts,
            );

            setErrors(
                validationErrors,
            );
        } catch (error) {
            console.error(
                error,
            );

            setErrors([
                {
                    row: 0,
                    message:
                        error instanceof Error
                            ? error.message
                            : "Não foi possível ler a planilha.",
                },
            ]);
        } finally {
            setIsReading(false);
        }
    }

    async function handleSpreadsheetChange(
        event:
            ChangeEvent<HTMLInputElement>,
    ) {
        const file =
            event.target
                .files?.[0];

        if (!file) {
            return;
        }

        setSpreadsheetFile(
            file,
        );

        await parseSpreadsheet(
            file,
        );
    }

    function handleImagesChange(
        event:
            ChangeEvent<HTMLInputElement>,
    ) {
        const selected =
            Array.from(
                event.target.files ??
                    [],
            );

        setImages(selected);
        setFinished(false);
    }

    function validateImages() {
        const fileMap =
            new Map<
                string,
                File
            >();

        images.forEach(
            (file) => {
                fileMap.set(
                    file.name
                        .trim()
                        .toLowerCase(),
                    file,
                );
            },
        );

        const imageErrors:
            ImportError[] =
            [];

        products.forEach(
            (product) => {
                product.imageNames.forEach(
                    (
                        imageName,
                    ) => {
                        if (
                            !fileMap.has(
                                imageName
                                    .trim()
                                    .toLowerCase(),
                            )
                        ) {
                            imageErrors.push({
                                row:
                                    product.row,
                                message: `Imagem "${imageName}" não foi selecionada.`,
                            });
                        }
                    },
                );
            },
        );

        return {
            fileMap,
            imageErrors,
        };
    }

    async function uploadProductImages(
        product: ParsedProduct,
        fileMap: Map<
            string,
            File
        >,
    ) {
        if (
            product.imageNames
                .length === 0
        ) {
            return [];
        }

        const uploadedUrls:
            string[] =
            [];

        const folder =
            crypto.randomUUID();

        for (
            const imageName of product.imageNames
        ) {
            const file =
                fileMap.get(
                    imageName
                        .trim()
                        .toLowerCase(),
                );

            if (!file) {
                throw new Error(
                    `Imagem ${imageName} não encontrada.`,
                );
            }

            const safeFilename =
                sanitizeStorageFilename(
                    file.name,
                );

            const storagePath =
                `imports/${folder}/${safeFilename}`;

            const {
                error: uploadError,
            } = await supabase.storage
                .from("products")
                .upload(
                    storagePath,
                    file,
                    {
                        cacheControl:
                            "3600",
                        upsert:
                            false,
                        contentType:
                            file.type ||
                            undefined,
                    },
                );

            if (
                uploadError
            ) {
                throw new Error(
                    `Erro ao enviar ${file.name}: ${uploadError.message}`,
                );
            }

            const {
                data,
            } = supabase.storage
                .from("products")
                .getPublicUrl(
                    storagePath,
                );

            uploadedUrls.push(
                data.publicUrl,
            );
        }

        return uploadedUrls;
    }

    async function handleImport() {
        if (
            products.length ===
            0
        ) {
            setErrors([
                {
                    row: 0,
                    message:
                        "Nenhum produto válido para importar.",
                },
            ]);

            return;
        }

        const {
            fileMap,
            imageErrors,
        } = validateImages();

        if (
            imageErrors.length >
            0
        ) {
            setErrors(
                imageErrors,
            );

            return;
        }

        setErrors([]);
        setIsImporting(true);
        setFinished(false);
        setImportedCount(0);

        const importErrors:
            ImportError[] =
            [];

        let successCount =
            0;

        try {
            for (
                let index = 0;
                index <
                products.length;
                index += 1
            ) {
                const product =
                    products[index];

                setProgress(
                    `Importando ${index + 1} de ${products.length}: ${product.name}`,
                );

                try {
                    const imageUrls =
                        await uploadProductImages(
                            product,
                            fileMap,
                        );

                    const baseSlug =
                        slugify(
                            [
                                product.artist,
                                product.name,
                                product.catalog_number,
                            ]
                                .filter(
                                    Boolean,
                                )
                                .join(
                                    "-",
                                ),
                        );

                    const slug =
                        `${baseSlug}-${crypto
                            .randomUUID()
                            .slice(
                                0,
                                8,
                            )}`;

                    const {
                        error:
                            insertError,
                    } =
                        await supabase
                            .from(
                                "products",
                            )
                            .insert({
                                name:
                                    product.name,
                                slug,
                                artist:
                                    product.artist,
                                label:
                                    product.label,
                                year:
                                    product.year,
                                price:
                                    product.price,
                                genre:
                                    product.genre,
                                format:
                                    product.format,
                                description:
                                    product.description,
                                stock:
                                    product.stock,
                                condition:
                                    product.condition,
                                catalog_number:
                                    product.catalog_number,
                                images:
                                    imageUrls,
                            });

                    if (
                        insertError
                    ) {
                        throw new Error(
                            insertError.message,
                        );
                    }

                    successCount +=
                        1;

                    setImportedCount(
                        successCount,
                    );
                } catch (error) {
                    console.error(
                        `Erro na linha ${product.row}:`,
                        error,
                    );

                    importErrors.push({
                        row:
                            product.row,
                        message:
                            error instanceof Error
                                ? error.message
                                : "Erro desconhecido durante a importação.",
                    });
                }
            }

            setErrors(
                importErrors,
            );

            setFinished(true);
        } finally {
            setProgress("");
            setIsImporting(
                false,
            );
        }
    }

    return (
        <div className="flex flex-col gap-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-medium">
                        Importar produtos
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm opacity-60">
                        Importe vários produtos através de uma
                        planilha e associe as imagens pelos nomes
                        dos arquivos.
                    </p>
                </div>

                <Link
                    href="/admin/produtos"
                    className="rounded-lg border border-black bg-white px-4 py-2 shadow-[3px_3px_0_#000] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
                >
                    Voltar
                </Link>
            </div>

            <section className="rounded-xl border border-black bg-white p-6 shadow-[5px_5px_0_#000]">
                <div className="flex flex-col gap-4">
                    <div>
                        <h2 className="text-xl font-medium">
                            1. Baixe o modelo
                        </h2>

                        <p className="mt-1 text-sm opacity-60">
                            Use as colunas do modelo para garantir
                            que os produtos sejam reconhecidos.
                        </p>
                    </div>

                    <div>
                        <button
                            type="button"
                            onClick={
                                downloadTemplate
                            }
                            className="rounded-lg border border-black bg-white px-4 py-2 shadow-[3px_3px_0_#000] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
                        >
                            Baixar modelo .xlsx
                        </button>
                    </div>
                </div>
            </section>

            <section className="rounded-xl border border-black bg-white p-6 shadow-[5px_5px_0_#000]">
                <div className="flex flex-col gap-5">
                    <div>
                        <h2 className="text-xl font-medium">
                            2. Selecione a planilha
                        </h2>

                        <p className="mt-1 text-sm opacity-60">
                            Formatos aceitos: .xlsx, .xls e .csv.
                        </p>
                    </div>

                    <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        disabled={
                            isImporting
                        }
                        onChange={
                            handleSpreadsheetChange
                        }
                        className="block w-full rounded-lg border border-black p-3"
                    />

                    {spreadsheetFile && (
                        <p className="text-sm">
                            Arquivo:{" "}
                            <strong>
                                {
                                    spreadsheetFile.name
                                }
                            </strong>
                        </p>
                    )}

                    {isReading && (
                        <p className="text-sm">
                            Lendo planilha...
                        </p>
                    )}

                    {!isReading &&
                        products.length >
                            0 && (
                            <div className="rounded-lg border border-black p-4">
                                <strong>
                                    {
                                        products.length
                                    }{" "}
                                    produtos
                                </strong>{" "}
                                encontrados na
                                planilha.
                            </div>
                        )}
                </div>
            </section>

            <section className="rounded-xl border border-black bg-white p-6 shadow-[5px_5px_0_#000]">
                <div className="flex flex-col gap-5">
                    <div>
                        <h2 className="text-xl font-medium">
                            3. Selecione as imagens
                        </h2>

                        <p className="mt-1 max-w-2xl text-sm opacity-60">
                            Você pode selecionar todas as imagens
                            de todos os produtos de uma vez. O
                            sistema usa os nomes informados na
                            coluna images para descobrir quais
                            imagens pertencem a cada produto.
                        </p>
                    </div>

                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={
                            isImporting
                        }
                        onChange={
                            handleImagesChange
                        }
                        className="block w-full rounded-lg border border-black p-3"
                    />

                    {images.length >
                        0 && (
                        <p className="text-sm">
                            <strong>
                                {
                                    images.length
                                }
                            </strong>{" "}
                            imagens
                            selecionadas.
                        </p>
                    )}
                </div>
            </section>

            {products.length >
                0 && (
                <section className="rounded-xl border border-black bg-white p-6 shadow-[5px_5px_0_#000]">
                    <h2 className="text-xl font-medium">
                        Prévia
                    </h2>

                    <div className="mt-5 overflow-x-auto">
                        <table className="w-full min-w-[800px] border-collapse text-left text-sm">
                            <thead>
                                <tr className="border-b border-black">
                                    <th className="p-3">
                                        Linha
                                    </th>

                                    <th className="p-3">
                                        Produto
                                    </th>

                                    <th className="p-3">
                                        Artista
                                    </th>

                                    <th className="p-3">
                                        Preço
                                    </th>

                                    <th className="p-3">
                                        Estoque
                                    </th>

                                    <th className="p-3">
                                        Imagens
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {products.map(
                                    (
                                        product,
                                    ) => (
                                        <tr
                                            key={
                                                product.row
                                            }
                                            className="border-b border-black/10"
                                        >
                                            <td className="p-3">
                                                {
                                                    product.row
                                                }
                                            </td>

                                            <td className="p-3">
                                                {
                                                    product.name
                                                }
                                            </td>

                                            <td className="p-3">
                                                {
                                                    product.artist
                                                }
                                            </td>

                                            <td className="p-3">
                                                R${" "}
                                                {product.price.toFixed(
                                                    2,
                                                )}
                                            </td>

                                            <td className="p-3">
                                                {
                                                    product.stock
                                                }
                                            </td>

                                            <td className="p-3">
                                                {
                                                    product
                                                        .imageNames
                                                        .length
                                                }
                                            </td>
                                        </tr>
                                    ),
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {errors.length >
                0 && (
                <section className="rounded-xl border border-red-600 bg-red-50 p-6">
                    <h2 className="font-medium text-red-700">
                        Foram encontrados alguns problemas
                    </h2>

                    <div className="mt-4 flex flex-col gap-2 text-sm text-red-700">
                        {errors.map(
                            (
                                error,
                                index,
                            ) => (
                                <p
                                    key={`${error.row}-${index}`}
                                >
                                    {error.row >
                                    0
                                        ? `Linha ${error.row}: `
                                        : ""}
                                    {
                                        error.message
                                    }
                                </p>
                            ),
                        )}
                    </div>
                </section>
            )}

            {finished && (
                <section className="rounded-xl border border-green-700 bg-green-50 p-6 text-green-800">
                    <strong>
                        Importação concluída.
                    </strong>

                    <p className="mt-1 text-sm">
                        {
                            importedCount
                        }{" "}
                        de{" "}
                        {
                            products.length
                        }{" "}
                        produtos foram
                        importados com
                        sucesso.
                    </p>
                </section>
            )}

            {products.length >
                0 && (
                <div className="flex flex-col gap-3">
                    {isImporting && (
                        <p className="text-sm">
                            {progress}
                        </p>
                    )}

                    <button
                        type="button"
                        disabled={
                            isImporting ||
                            isReading
                        }
                        onClick={
                            handleImport
                        }
                        className="w-full rounded-lg border border-black bg-white px-5 py-4 text-lg font-medium shadow-[4px_4px_0_#000] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {isImporting
                            ? `Importando... ${importedCount}/${products.length}`
                            : `Importar ${products.length} produtos`}
                    </button>
                </div>
            )}
        </div>
    );
}