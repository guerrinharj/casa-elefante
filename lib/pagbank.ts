import "server-only";

export type PagBankCharge = {
    id: string;
    reference_id?: string;
    status: string;

    amount: {
        value: number;
        currency: string;
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
            type?: string;
        }[];
    }[];
};

type PagBankErrorResponse = {
    error_messages?: {
        code?: string;
        description?: string;
        parameter_name?: string;
    }[];
};

function getPagBankConfig() {
    const environment = process.env.PAGBANK_ENV;
    const token = process.env.PAGBANK_TOKEN?.trim();

    if (
        environment !== "sandbox" &&
        environment !== "production"
    ) {
        throw new Error(
            "PAGBANK_ENV deve ser sandbox ou production.",
        );
    }

    if (!token) {
        throw new Error(
            "PAGBANK_TOKEN não foi configurado.",
        );
    }

    return {
        token,

        baseUrl:
            environment === "sandbox"
                ? "https://sandbox.api.pagseguro.com"
                : "https://api.pagseguro.com",
    };
}

async function pagBankRequest<T>(
    path: string,
    options: {
        method: "GET" | "POST";
        body?: Record<string, unknown>;
        idempotencyKey?: string;
    },
): Promise<T> {
    const { token, baseUrl } = getPagBankConfig();

    const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
    };

    if (options.idempotencyKey) {
        headers["x-idempotency-key"] =
            options.idempotencyKey;
    }

    const response = await fetch(
        `${baseUrl}${path}`,
        {
            method: options.method,
            headers,

            body: options.body
                ? JSON.stringify(options.body)
                : undefined,

            cache: "no-store",
            signal: AbortSignal.timeout(30_000),
        },
    );

    const data: unknown = await response
        .json()
        .catch(() => null);

    if (!response.ok) {
        const error = data as
            | PagBankErrorResponse
            | null;

        const details = error?.error_messages
            ?.map((item) =>
                [
                    item.code,
                    item.parameter_name,
                    item.description,
                ]
                    .filter(Boolean)
                    .join(": "),
            )
            .join("; ");

        throw new Error(
            details ||
                `PagBank retornou HTTP ${response.status}.`,
        );
    }

    if (!data || typeof data !== "object") {
        throw new Error(
            "PagBank retornou uma resposta inválida.",
        );
    }

    return data as T;
}

export async function createPagBankOrder(
    payload: Record<string, unknown>,
    idempotencyKey: string,
): Promise<PagBankOrder> {
    return pagBankRequest<PagBankOrder>(
        "/orders",
        {
            method: "POST",
            body: payload,
            idempotencyKey,
        },
    );
}

export async function getPagBankOrder(
    orderId: string,
): Promise<PagBankOrder> {
    if (!/^ORDE_[A-Za-z0-9-]+$/.test(orderId)) {
        throw new Error(
            "Identificador de pedido PagBank inválido.",
        );
    }

    return pagBankRequest<PagBankOrder>(
        `/orders/${encodeURIComponent(orderId)}`,
        {
            method: "GET",
        },
    );
}

export function getPagBankPublicKey(): string {
    const publicKey =
        process.env.PAGBANK_PUBLIC_KEY?.trim();

    if (!publicKey) {
        throw new Error(
            "PAGBANK_PUBLIC_KEY não foi configurada.",
        );
    }

    return publicKey;
}