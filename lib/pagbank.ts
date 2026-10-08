import "server-only";

export type PagBankOrder = {
    id: string;
    reference_id?: string;

    charges?: {
            id: string;
            status: string;

        qr_code?: {
            id: string;
            text: string;
        };

        links?: {
            rel: string;
            href: string;
            media?: string;
        }[];

        payment_method?: {
            type: string;

        pix?: {
            expiration_date?: string;
        };
        };

        amount: {
            value: number;
            currency: string;
        };

        payment_response?: {
            code?: string;
            message?: string;
        };
    }[];

    qr_codes?: {
            id: string;
            text: string;
            expiration_date?: string;

        links?: {
            rel: string;
            href: string;
            media?: string;
            }[];
    }[];
};

export class PagBankError extends Error {
    constructor(
        public readonly status: number,
        message: string,
    ) {
        super(message);
    }
}

export function getPagBankConfig() {
    const env = process.env.PAGBANK_ENV;
    const token = process.env.PAGBANK_TOKEN?.trim();

    if (env !== "sandbox" && env !== "production") {
        throw new Error(
        "PAGBANK_ENV deve ser sandbox ou production.",
        );
    }

    if (!token) {
        throw new Error("PAGBANK_TOKEN não configurado.");
    }

    return {
        env,
        token,

        baseUrl:
        env === "sandbox"
            ? "https://sandbox.api.pagseguro.com"
            : "https://api.pagseguro.com",
    };
}

export function getPagBankPublicKey() {
    const key = process.env.PAGBANK_PUBLIC_KEY?.trim();

    if (!key) {
        throw new Error(
            "PAGBANK_PUBLIC_KEY não configurada.",
        );
    }

    return key;
}

export function getPagBankWebhookUrl() {
    const value = process.env.PAGBANK_WEBHOOK_URL?.trim();

    if (!value) {
        if (getPagBankConfig().env === "production") {
        throw new Error(
            "Configure PAGBANK_WEBHOOK_URL em produção.",
        );
        }

        return undefined;
    }

    const url = new URL(value);

    if (
        url.protocol !== "https:" ||
        ["localhost", "127.0.0.1"].includes(url.hostname)
    ) {
        throw new Error(
        "PAGBANK_WEBHOOK_URL deve ser uma URL HTTPS pública.",
        );
    }

    return url.toString();
}

async function request<T>(
    path: string,
    method: "GET" | "POST",
    body?: Record<string, unknown>,
    key?: string,
    ): Promise<T> {
    const { token, baseUrl } = getPagBankConfig();

    const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
    };

    if (key) {
        headers["x-idempotency-key"] = key;
    }

    const response = await fetch(
        `${baseUrl}${path}`,
        {
        method,
        headers,

        body: body
            ? JSON.stringify(body)
            : undefined,

        cache: "no-store",

        signal: AbortSignal.timeout(25_000),
        },
    );

    const data = await response
        .json()
        .catch(() => null);

    if (!response.ok) {
        throw new PagBankError(
        response.status,
        `PagBank retornou HTTP ${response.status}.`,
        );
    }

    if (!data || typeof data !== "object") {
        throw new Error("Resposta PagBank inválida.");
    }

    return data as T;
}

export function createPagBankOrder(
    payload: Record<string, unknown>,
    key: string,
    ) {
    return request<PagBankOrder>(
        "/orders",
        "POST",
        payload,
        key,
    );
}

export function getPagBankOrder(id: string) {
    if (!/^ORDE_[A-Za-z0-9-]+$/.test(id)) {
        throw new Error("Pedido PagBank inválido.");
    }

    return request<PagBankOrder>(
        `/orders/${encodeURIComponent(id)}`,
        "GET",
    );
}