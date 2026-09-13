import OpenAI from "openai";
import {
    NextResponse,
} from "next/server";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(
    request: Request,
) {
    try {
        /*
         * Verifica se a API key existe.
         */
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                {
                    error:
                        "OPENAI_API_KEY não configurada.",
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
         * Exemplo:
         *
         * data:image/jpeg;base64,/9j/4AAQ...
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

        const imageUrl =
            `data:${image.type};base64,${base64}`;

        /*
         * Envia a imagem para
         * a OpenAI analisar.
         */
        const response =
            await openai.responses.create({
                model:
                    "gpt-5.6-luna",

                input: [
                    {
                        role: "user",
                        content: [
                            {
                                type:
                                    "input_text",

                                text: `
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

Não invente informações.

Se alguma informação não puder ser identificada
com segurança, retorne null para aquele campo.

Para "genre", quando possível, escolha
EXATAMENTE uma destas categorias:

AMBIENT / NEW AGE
AXÉ
BLUES
BOSSA NOVA
CHOROS
DISCO
FORRÓ
HARD ROCK / HEAVY METAL
HOUSE / DANCE
HUMOR
JAZZ
JOVEM GUARDA
LATINOS
MPB
NOVELAS
ORQUESTRAS NACIONAIS
POP / ALTERNATIVO
RAP / HIP HOP
REGGAE
REGIONAIS
ROCK
SAMBA / PAGODE / CARNAVAL / BATUCADA
SOUL / FUNK / R&B
VELHA GUARDA

Para "format", escolha EXATAMENTE um destes:

Vinil
Compacto
CD
Cassette
VHS
LaserDisc

Retorne SOMENTE JSON válido.

Formato:

{
    "name": string | null,
    "artist": string | null,
    "label": string | null,
    "catalog_number": string | null,
    "year": number | null,
    "genre": string | null,
    "format": string | null
}
                                `,
                            },
                            {
                                type:
                                    "input_image",

                                image_url:
                                    imageUrl,

                                detail:
                                    "high",
                            },
                        ],
                    },
                ],
            });

        /*
         * Texto retornado pela IA.
         */
        const output =
            response.output_text;

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
         * Às vezes um modelo pode retornar:
         *
         * ```json
         * {...}
         * ```
         *
         * Então removemos os fences
         * antes do JSON.parse.
         */
        const cleanedOutput =
            output
                .replace(
                    /^```json\s*/i,
                    "",
                )
                .replace(
                    /^```\s*/i,
                    "",
                )
                .replace(
                    /```$/i,
                    "",
                )
                .trim();

        let product;

        try {
            product =
                JSON.parse(
                    cleanedOutput,
                );
        } catch {
            console.error(
                "JSON inválido retornado pela OpenAI:",
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
         * Retorna os dados para
         * o ProductForm.
         */
        return NextResponse.json(
            product,
        );
    } catch (error) {
        console.error(
            "Erro OpenAI:",
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