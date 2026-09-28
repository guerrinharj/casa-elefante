import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const PRODUCT_GENRES = [
    "AMBIENT / NEW AGE",
    "AXÉ",
    "BLUES",
    "BOSSA NOVA",
    "CHOROS",
    "DISCO",
    "FORRÓ",
    "HARD ROCK / HEAVY METAL",
    "HOUSE / DANCE",
    "HUMOR",
    "JAZZ",
    "JOVEM GUARDA",
    "LATINOS",
    "MPB",
    "NOVELAS",
    "ORQUESTRAS NACIONAIS",
    "POP / ALTERNATIVO",
    "RAP / HIP HOP",
    "REGGAE",
    "REGIONAIS",
    "ROCK",
    "SAMBA / PAGODE / CARNAVAL / BATUCADA",
    "SOUL / FUNK / R&B",
    "VELHA GUARDA",
];

const PRODUCT_FORMATS = [
    "Vinil",
    "Compacto",
    "CD",
    "Cassette",
    "VHS",
    "LaserDisc",
];

export async function POST(
    request: Request,
) {
    try {
        /*
         * Verifica se a API key existe.
         */
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                {
                    error:
                        "GEMINI_API_KEY não configurada.",
                },
                {
                    status: 500,
                },
            );
        }

        /*
         * Recebe a imagem enviada
         * pelo ProductForm.
         */
        const formData =
            await request.formData();

        const image =
            formData.get("image");

        /*
         * Verifica se realmente
         * recebemos um arquivo.
         */
        if (!(image instanceof File)) {
            return NextResponse.json(
                {
                    error:
                        "Nenhuma imagem enviada.",
                },
                {
                    status: 400,
                },
            );
        }

        /*
         * Aceita somente imagens.
         */
        if (
            !image.type.startsWith(
                "image/",
            )
        ) {
            return NextResponse.json(
                {
                    error:
                        "O arquivo precisa ser uma imagem.",
                },
                {
                    status: 400,
                },
            );
        }

        /*
         * Converte a imagem para base64.
         *
         * Diferente da OpenAI, não precisamos
         * montar uma data URL.
         *
         * O Gemini recebe:
         *
         * {
         *     mimeType: "image/jpeg",
         *     data: "base64..."
         * }
         */
        const arrayBuffer =
            await image.arrayBuffer();

        const buffer =
            Buffer.from(
                arrayBuffer,
            );

        const base64 =
            buffer.toString(
                "base64",
            );

        /*
         * Prompt de identificação.
         */
        const prompt = `
Você está analisando uma fotografia de um produto
para uma loja brasileira de discos chamada
Casa Elefante.

O produto pode ser:

- Vinil
- Compacto
- CD
- Cassette
- VHS
- LaserDisc

Analise cuidadosamente a imagem.

Tente identificar:

- nome do álbum ou produto
- artista
- selo / gravadora
- número de catálogo
- ano
- gênero musical
- formato

IMPORTANTE:

Não invente informações.

Se alguma informação não puder ser identificada
com segurança, retorne null para aquele campo.

O número de catálogo deve representar a edição
específica mostrada na fotografia quando ele
puder ser identificado.

Para "genre", quando possível, escolha
EXATAMENTE uma destas categorias:

${PRODUCT_GENRES.join("\n")}

Para "format", escolha EXATAMENTE um destes:

${PRODUCT_FORMATS.join("\n")}
        `.trim();

        /*
         * Envia a imagem para o Gemini.
         *
         * responseMimeType + responseSchema
         * fazem o Gemini retornar JSON
         * estruturado.
         */
        const response =
            await ai.models.generateContent({
                model:
                    "gemini-3.5-flash-lite",

                contents: [
                    {
                        role: "user",

                        parts: [
                            {
                                text:
                                    prompt,
                            },
                            {
                                inlineData: {
                                    mimeType:
                                        image.type,

                                    data:
                                        base64,
                                },
                            },
                        ],
                    },
                ],

                config: {
                    responseMimeType:
                        "application/json",

                    responseSchema: {
                        type:
                            "object",

                        properties: {
                            name: {
                                type:
                                    "string",
                                nullable:
                                    true,
                            },

                            artist: {
                                type:
                                    "string",
                                nullable:
                                    true,
                            },

                            label: {
                                type:
                                    "string",
                                nullable:
                                    true,
                            },

                            catalog_number: {
                                type:
                                    "string",
                                nullable:
                                    true,
                            },

                            year: {
                                type:
                                    "integer",
                                nullable:
                                    true,
                            },

                            genre: {
                                type:
                                    "string",
                                nullable:
                                    true,
                                enum: [
                                    ...PRODUCT_GENRES,
                                    null,
                                ],
                            },

                            format: {
                                type:
                                    "string",
                                nullable:
                                    true,
                                enum: [
                                    ...PRODUCT_FORMATS,
                                    null,
                                ],
                            },
                        },

                        required: [
                            "name",
                            "artist",
                            "label",
                            "catalog_number",
                            "year",
                            "genre",
                            "format",
                        ],
                    },
                },
            });

        /*
         * Texto retornado pelo Gemini.
         */
        const output =
            response.text;

        if (!output) {
            return NextResponse.json(
                {
                    error:
                        "A IA não retornou informações.",
                },
                {
                    status: 500,
                },
            );
        }

        /*
         * Como estamos usando
         * responseMimeType application/json,
         * o Gemini deve retornar JSON puro.
         */
        let product;

        try {
            product =
                JSON.parse(
                    output,
                );
        } catch {
            console.error(
                "JSON inválido retornado pelo Gemini:",
                output,
            );

            return NextResponse.json(
                {
                    error:
                        "A IA retornou uma resposta inválida.",

                    raw:
                        output,
                },
                {
                    status: 500,
                },
            );
        }

        /*
         * Retorna exatamente a mesma estrutura
         * que o ProductForm já espera.
         */
        return NextResponse.json(
            product,
        );
    } catch (error) {
        console.error(
            "Erro Gemini:",
            error,
        );

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Erro ao analisar produto.",
            },
            {
                status: 500,
            },
        );
    }
}