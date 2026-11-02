const FOCUS_NFE_URLS = {
    homologacao: "https://homologacao.focusnfe.com.br",
    producao: "https://api.focusnfe.com.br",
} as const;

type FocusEnvironment = keyof typeof FOCUS_NFE_URLS;

export async function focusNfeRequest<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const token = process.env.FOCUS_NFE_TOKEN;

    const environment =
        process.env.FOCUS_NFE_ENV ?? "homologacao";

    if (!token) {
        throw new Error(
            "FOCUS_NFE_TOKEN não configurado.",
        );
    }

    if (
        environment !== "homologacao" &&
        environment !== "producao"
    ) {
        throw new Error(
            "Ambiente Focus NFe inválido.",
        );
    }

    const baseUrl =
        FOCUS_NFE_URLS[
            environment as FocusEnvironment
        ];

    const authorization = Buffer.from(
        `${token}:`,
    ).toString("base64");

    const response = await fetch(
        `${baseUrl}${path}`,
        {
            ...options,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${authorization}`,
                ...options.headers,
            },
            cache: "no-store",
        },
    );

    const data: unknown = await response.json();

    if (!response.ok) {
        console.error(
            "Erro na API Focus NFe:",
            response.status,
            data,
        );

        throw new Error(
            `Erro na Focus NFe: ${response.status}`,
        );
    }

    return data as T;
}