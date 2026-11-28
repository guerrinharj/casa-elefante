import "server-only";

export type PagBankCharge = {
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
        summary?: { paid: number; refunded: number };
    };
    payment_response?: {
        code?: string;
        message?: string;
    };
};

export type PagBankOrder = {
    id: string;
    reference_id?: string;

    charges?: PagBankCharge[];

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
        public readonly providerCode?: string,
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

    const isChargeLookup = method === "GET" && path.startsWith("/charges/");
    const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        Accept: isChargeLookup ? "application/vnd.pagseguro.api.v1+json" : "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
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
        const code: unknown = data?.error_messages?.[0]?.code;
        throw new PagBankError(
            response.status,
            `PagBank retornou HTTP ${response.status}.`,
            typeof code === "string" && /^\d{4,8}$/.test(code) ? code : undefined,
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
export function getPagBankWebhookPublicKey() {
    return request<{ public_key: string }>("/public-keys?type=webhook", "GET");
}

export function getPagBankCharge(id: string) {
    if (!/^CHAR_[A-Za-z0-9-]+$/.test(id)) {
        throw new Error("Cobrança PagBank inválida.");
    }
    return request<PagBankCharge>(`/charges/${encodeURIComponent(id)}`, "GET");
}

export function refundPagBankCharge(id: string, amount: number, requestId: string) {
    if (!/^CHAR_[A-Za-z0-9-]+$/.test(id)) {
        throw new Error("Cobrança PagBank inválida.");
    }
    return request<PagBankCharge>(
        `/charges/${encodeURIComponent(id)}/cancel`,
        "POST",
        { amount: { value: amount } },
        requestId,
    );
}
