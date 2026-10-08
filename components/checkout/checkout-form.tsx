"use client";

import {
    type FormEvent,
    useEffect,
    useRef,
    useState,
} from "react";

import Script from "next/script";
import Link from "next/link";

import type {
    CheckoutPayment,
} from "@/lib/payment-types";

import {
    useCart,
} from "@/components/cart/cart-provider";

import {
    createOrder,
    getPaymentConfig,
    checkPayment,
    retryPayment,
} from "@/app/checkout/actions";

import {
    calculateShipping,
    type ShippingOption,
} from "@/app/checkout/shipping-actions";

const buttonClassName = `
    rounded-xl border border-black bg-white px-6 py-4 uppercase
    shadow-[6px_6px_0_0_#000] transition-all duration-200 ease-out
    hover:-translate-x-1 hover:-translate-y-1
    hover:shadow-[10px_10px_0_0_#000]
    disabled:cursor-not-allowed disabled:opacity-40
    disabled:hover:translate-x-0 disabled:hover:translate-y-0
    disabled:hover:shadow-[6px_6px_0_0_#000]
`;

const inputClassName = `
    rounded-lg border border-black bg-white px-4 py-3
    outline-none transition-shadow duration-200
    focus:shadow-[3px_3px_0_0_#000]
`;

export function CheckoutForm() {
    const attemptRef =
        useRef<string | null>(null);

    const clearedRef =
        useRef(false);

    const {
        items,
        subtotal,
        coupon,
        discountAmount,
        discountedSubtotal,
        clearCart,
    } = useCart();

    const [customerName, setCustomerName] =
        useState("");

    const [customerEmail, setCustomerEmail] =
        useState("");

    const [customerTaxId, setCustomerTaxId] =
        useState("");

    const [holderTaxId, setHolderTaxId] =
        useState("");

    const [publicKey, setPublicKey] =
        useState("");

    const [environment, setEnvironment] =
        useState("");

    const [sdkReady, setSdkReady] =
        useState(false);

    const [payment, setPayment] =
        useState<CheckoutPayment | null>(null);

    const [checking, setChecking] =
        useState(false);

    const [copied, setCopied] =
        useState(false);

    const [paymentMethod, setPaymentMethod] =
        useState<"pix" | "card" | null>(null);

    const [cardNumber, setCardNumber] =
        useState("");

    const [cardName, setCardName] =
        useState("");

    const [cardExpiry, setCardExpiry] =
        useState("");

    const [cardCvv, setCardCvv] =
        useState("");

    const [postalCode, setPostalCode] =
        useState("");

    const [street, setStreet] =
        useState("");

    const [number, setNumber] =
        useState("");

    const [complement, setComplement] =
        useState("");

    const [neighborhood, setNeighborhood] =
        useState("");

    const [city, setCity] =
        useState("");

    const [state, setState] =
        useState("");

    const [shippingOptions, setShippingOptions] =
        useState<ShippingOption[]>([]);

    const [selectedShipping, setSelectedShipping] =
        useState<ShippingOption | null>(null);

    const [calculatingShipping, setCalculatingShipping] =
        useState(false);

    const [submitting, setSubmitting] =
        useState(false);

    const [shippingError, setShippingError] =
        useState<string | null>(null);

    const [error, setError] =
        useState<string | null>(null);

    useEffect(() => {
        let active = true;

        getPaymentConfig()
            .then((config) => {
                if (!active) return;

                setPublicKey(config.publicKey);
                setEnvironment(config.environment);
            })
            .catch(() => {
                if (active) {
                    setError(
                        "Não foi possível carregar a configuração de pagamento.",
                    );
                }
            });

        const attempt = sessionStorage.getItem(
            "casa-elefante-payment-attempt",
        );

        if (attempt) {
            attemptRef.current = attempt;

            setChecking(true);

            checkPayment(attempt)
                .then((result) => {
                    if (!active) return;

                    if (result.success) {
                        setPayment(result.payment);
                    } else if (
                        result.error !==
                        "Pagamento não encontrado."
                    ) {
                        setError(result.error);
                    }
                })
                .catch(() => {
                    if (active) {
                        setError(
                            "Não foi possível recuperar o pagamento.",
                        );
                    }
                })
                .finally(() => {
                    if (active) {
                        setChecking(false);
                    }
                });
        }

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (
            payment?.status === "paid" &&
            !clearedRef.current
        ) {
            clearedRef.current = true;

            clearCart();

            sessionStorage.removeItem(
                "casa-elefante-payment-attempt",
            );
        }
    }, [payment?.status, clearCart]);

    useEffect(() => {
        if (
            !payment ||
            !["pending", "unknown"].includes(
                payment.status,
            )
        ) {
            return;
        }

        let active = true;

        let timeout:
            ReturnType<typeof setTimeout>;

        const poll = async () => {
            const attempt =
                attemptRef.current;

            if (!attempt) return;

            try {
                const result =
                    await checkPayment(attempt);

                if (
                    active &&
                    result.success
                ) {
                    setPayment(result.payment);
                }
            } catch {
                // A próxima consulta tenta novamente.
            }

            if (active) {
                timeout = setTimeout(
                    poll,
                    10_000,
                );
            }
        };

        timeout = setTimeout(
            poll,
            10_000,
        );

        return () => {
            active = false;
            clearTimeout(timeout);
        };
    }, [payment?.status]);

    async function handleCheckPayment(
        recover = false,
    ) {
        const attempt =
            attemptRef.current;

        if (!attempt || checking) {
            return;
        }

        setChecking(true);
        setError(null);

        try {
            const result = await (
                recover
                    ? retryPayment(attempt)
                    : checkPayment(attempt)
            );

            if (result.success) {
                setPayment(result.payment);
            } else {
                setError(result.error);
            }
        } catch {
            setError(
                "Não foi possível consultar o pagamento.",
            );
        } finally {
            setChecking(false);
        }
    }

    function formatCardNumber(
        value: string,
    ) {
        return value
            .replace(/\D/g, "")
            .slice(0, 19)
            .replace(
                /(\d{4})(?=\d)/g,
                "$1 ",
            );
    }

    function formatCardExpiry(
        value: string,
    ) {
        const numbers = value
            .replace(/\D/g, "")
            .slice(0, 4);

        if (numbers.length <= 2) {
            return numbers;
        }

        return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    }

    function formatPostalCode(
        value: string,
    ) {
        const numbers =
            value.replace(/\D/g, "");

        if (numbers.length <= 5) {
            return numbers;
        }

        return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
    }

    async function fetchAddressByPostalCode(
        value: string,
    ) {
        try {
            const response = await fetch(
                `https://viacep.com.br/ws/${value}/json/`,
            );

            if (!response.ok) return;

            const data =
                await response.json();

            if (data.erro) return;

            setStreet(
                data.logradouro ?? "",
            );

            setNeighborhood(
                data.bairro ?? "",
            );

            setCity(
                data.localidade ?? "",
            );

            setState(
                data.uf ?? "",
            );
        } catch (error) {
            console.error(
                "Erro ao buscar CEP:",
                error,
            );
        }
    }

    function handlePostalCodeChange(
        value: string,
    ) {
        const formatted =
            formatPostalCode(value);

        setPostalCode(formatted);
        setShippingOptions([]);
        setSelectedShipping(null);
        setShippingError(null);

        const normalized =
            formatted.replace(/\D/g, "");

        if (normalized.length === 8) {
            void fetchAddressByPostalCode(
                normalized,
            );
        }
    }

    async function handleCalculateShipping() {
        setShippingError(null);
        setSelectedShipping(null);

        const normalized =
            postalCode.replace(/\D/g, "");

        if (normalized.length !== 8) {
            setShippingError(
                "Informe um CEP válido.",
            );

            return;
        }

        if (!items.length) {
            setShippingError(
                "Seu carrinho está vazio.",
            );

            return;
        }

        setCalculatingShipping(true);

        try {
            const result =
                await calculateShipping({
                    postalCode: normalized,

                    items: items.map((item) => ({
                        productId: item.id,
                        quantity: item.quantity,
                    })),
                });

            if (!result.success) {
                setShippingError(
                    result.error,
                );

                return;
            }

            setShippingOptions(
                result.options,
            );

            if (
                result.options.length === 1
            ) {
                setSelectedShipping(
                    result.options[0],
                );
            }
        } finally {
            setCalculatingShipping(false);
        }
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setError(null);

        if (submitting || checking) {
            return;
        }

        if (!paymentMethod) {
            setError(
                "Escolha Pix ou cartão de crédito.",
            );

            return;
        }

        if (!items.length) {
            setError(
                "Seu carrinho está vazio.",
            );

            return;
        }

        if (!selectedShipping) {
            setError(
                "Escolha uma opção de frete.",
            );

            return;
        }

        setSubmitting(true);

        try {
            let encryptedCard:
                string | undefined;

            if (
                paymentMethod === "card"
            ) {
                const sdk = (
                    window as Window & {
                        PagSeguro?: {
                            encryptCard(input: {
                                publicKey: string;
                                holder: string;
                                number: string;
                                expMonth: string;
                                expYear: string;
                                securityCode: string;
                            }): {
                                encryptedCard?: string;
                                hasErrors: boolean;

                                errors?: {
                                    message: string;
                                }[];
                            };
                        };
                    }
                ).PagSeguro;

                if (
                    !sdkReady ||
                    !sdk ||
                    !publicKey
                ) {
                    setError(
                        "Aguarde o carregamento do pagamento por cartão.",
                    );

                    return;
                }

                const [month, year] =
                    cardExpiry.split("/");

                if (
                    !/^\d{2}$/.test(month ?? "") ||
                    !/^\d{2}$/.test(year ?? "")
                ) {
                    setError(
                        "Informe a validade no formato MM/AA.",
                    );

                    return;
                }

                const encrypted =
                    sdk.encryptCard({
                        publicKey,

                        holder:
                            cardName.trim(),

                        number:
                            cardNumber.replace(
                                /\D/g,
                                "",
                            ),

                        expMonth:
                            month,

                        expYear:
                            `20${year}`,

                        securityCode:
                            cardCvv,
                    });

                if (
                    encrypted.hasErrors ||
                    !encrypted.encryptedCard
                ) {
                    setError(
                        "Confira número, nome, validade e CVV do cartão.",
                    );

                    return;
                }

                encryptedCard =
                    encrypted.encryptedCard;
            }

            const attemptId =
                attemptRef.current ??
                crypto.randomUUID();

            attemptRef.current =
                attemptId;

            sessionStorage.setItem(
                "casa-elefante-payment-attempt",
                attemptId,
            );

            const result =
                await createOrder({
                    attemptId,
                    customerTaxId,
                    paymentMethod,

                    card: encryptedCard
                        ? {
                                encrypted:
                                    encryptedCard,

                                holderName:
                                    cardName,

                                holderTaxId:
                                    holderTaxId ||
                                    customerTaxId,
                            }
                        : undefined,

                    customerName,
                    customerEmail,

                    couponCode:
                        coupon?.code ?? null,

                    shippingAddress: {
                        postalCode:
                            postalCode.replace(
                                /\D/g,
                                "",
                            ),

                        street,
                        number,
                        complement,
                        neighborhood,
                        city,
                        state,
                    },

                    shipping: {
                        id:
                            selectedShipping.id,

                        company:
                            selectedShipping.company,

                        name:
                            selectedShipping.name,

                        price:
                            selectedShipping.price,

                        deliveryTime:
                            selectedShipping.deliveryTime,
                    },

                    items: items.map((item) => ({
                        productId: item.id,
                        quantity: item.quantity,
                    })),
                });

            if (!result.success) {
                setError(result.error);
                return;
            }

            setPayment(
                result.payment,
            );

            setCardNumber("");
            setCardCvv("");
            setCardExpiry("");
        } catch {
            setError(
                "A resposta foi interrompida. Tente novamente para recuperar a mesma tentativa.",
            );
        } finally {
            setSubmitting(false);
        }
    }

    const shipping =
        selectedShipping?.price ?? 0;

    const total =
        discountedSubtotal + shipping;

    if (payment) {
        const paid =
            payment.status === "paid";

        const closed =
            ["declined", "expired"].includes(
                payment.status,
            );

        return (
            <section className="mx-auto flex max-w-xl flex-col gap-5 rounded-xl border border-black bg-white p-6">
                <h2 className="font-windsor text-2xl font-bold">
                    {paid
                        ? "Pagamento confirmado"
                        : payment.status === "declined"
                            ? "Pagamento não concluído"
                            : payment.status === "expired"
                                ? "Pix expirado"
                                : payment.status === "unknown"
                                    ? "Verificando pagamento"
                                    : "Aguardando pagamento"}
                </h2>

                <p className="break-all text-sm">
                    Pedido: {payment.orderId}
                </p>

                <p>
                    Total:{" "}
                    {payment.total.toLocaleString(
                        "pt-BR",
                        {
                            style: "currency",
                            currency: "BRL",
                        },
                    )}
                </p>

                {paid && (
                    <p>
                        Recebemos seu pagamento.
                        Você receberá a confirmação por e-mail.
                    </p>
                )}

                {!paid && !closed && payment.pix && (
                    <>
                        {payment.pix.imageUrl && (
                            <img
                                src={payment.pix.imageUrl}
                                alt="QR Code para pagamento Pix"
                                width={256}
                                height={256}
                                className="self-center"
                            />
                        )}

                        <label className="flex flex-col gap-2">
                            Pix copia e cola

                            <textarea
                                readOnly
                                value={payment.pix.text}
                                rows={4}
                                className={`${inputClassName} break-all text-sm`}
                            />
                        </label>

                        <button
                            type="button"
                            className={buttonClassName}
                            onClick={async () => {
                                try {
                                    await navigator.clipboard.writeText(
                                        payment.pix!.text,
                                    );

                                    setCopied(true);
                                } catch {
                                    setError(
                                        "Selecione e copie o código Pix acima.",
                                    );
                                }
                            }}
                        >
                            {copied
                                ? "Código copiado"
                                : "Copiar código Pix"}
                        </button>

                        {payment.pix.expiresAt && (
                            <p className="text-sm">
                                Validade:{" "}
                                {new Date(
                                    payment.pix.expiresAt,
                                ).toLocaleString("pt-BR")}
                            </p>
                        )}

                        <p className="text-sm">
                            {environment === "sandbox"
                                ? "Pix de teste: o resultado é simulado pelo PagBank conforme o valor do pedido."
                                : "Pague no aplicativo do seu banco e aguarde a confirmação."}
                        </p>
                    </>
                )}

                {!paid && !closed && (
                    <>
                        <p className="text-sm">
                            A confirmação será atualizada
                            automaticamente. Mantenha esta aba
                            aberta para acompanhar.
                        </p>

                        <button
                            type="button"
                            disabled={checking}
                            className={buttonClassName}
                            onClick={() =>
                                void handleCheckPayment(
                                    payment.status === "unknown",
                                )
                            }
                        >
                            {checking
                                ? "Verificando..."
                                : "Verificar pagamento"}
                        </button>
                    </>
                )}

                {closed && (
                    <button
                        type="button"
                        className={buttonClassName}
                        onClick={() => {
                            attemptRef.current = null;

                            setPayment(null);
                            setError(null);
                            setPaymentMethod(null);

                            sessionStorage.removeItem(
                                "casa-elefante-payment-attempt",
                            );
                        }}
                    >
                        Tentar outro pagamento
                    </button>
                )}

                {error && (
                    <p
                        role="alert"
                        className="text-sm text-red-600"
                    >
                        {error}
                    </p>
                )}

                <Link href="/" className="underline">
                    Voltar à loja
                </Link>
            </section>
        );
    }

    return (
        <>
            <Script
                src="https://assets.pagseguro.com.br/checkout-sdk-js/rc/dist/browser/pagseguro.min.js"
                strategy="afterInteractive"
                onReady={() => setSdkReady(true)}
                onError={() =>
                    setError(
                        "Falha ao carregar pagamento por cartão. Você pode usar Pix.",
                    )
                }
            />

            <form
                onSubmit={handleSubmit}
                className="grid gap-10 md:grid-cols-[1fr_400px]"
            >
                <div className="flex flex-col gap-8">
                    <section className="flex flex-col gap-4">
                        <h2
                            className="animate-checkout-field font-windsor text-2xl font-bold opacity-0"
                            style={{ animationDelay: "0ms" }}
                        >
                            Seus dados
                        </h2>

                        <label
                            className="animate-checkout-field flex flex-col gap-2 opacity-0"
                            style={{ animationDelay: "60ms" }}
                        >
                            <span className="text-sm">
                                Nome
                            </span>

                            <input
                                type="text"
                                value={customerName}
                                onChange={(event) =>
                                    setCustomerName(
                                        event.target.value,
                                    )
                                }
                                required
                                className={inputClassName}
                            />
                        </label>

                        <label
                            className="animate-checkout-field flex flex-col gap-2 opacity-0"
                            style={{ animationDelay: "120ms" }}
                        >
                            <span className="text-sm">
                                E-mail
                            </span>

                            <input
                                type="email"
                                value={customerEmail}
                                onChange={(event) =>
                                    setCustomerEmail(
                                        event.target.value,
                                    )
                                }
                                required
                                className={inputClassName}
                            />
                        </label>

                        <label className="flex flex-col gap-2">
                            <span className="text-sm">
                                CPF
                            </span>

                            <input
                                type="text"
                                inputMode="numeric"
                                value={customerTaxId}
                                onChange={(event) =>
                                    setCustomerTaxId(
                                        event.target.value
                                            .replace(/\D/g, "")
                                            .slice(0, 11),
                                    )
                                }
                                placeholder="Somente números"
                                required
                                minLength={11}
                                maxLength={11}
                                className={inputClassName}
                            />
                        </label>
                    </section>

                    <section className="flex flex-col gap-4">
                        <h2
                            className="animate-checkout-field font-windsor text-2xl font-bold opacity-0"
                            style={{ animationDelay: "180ms" }}
                        >
                            Entrega
                        </h2>

                        <label
                            className="animate-checkout-field flex flex-col gap-2 opacity-0"
                            style={{ animationDelay: "240ms" }}
                        >
                            <span className="text-sm">
                                CEP
                            </span>

                            <div className="flex items-stretch gap-3">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={postalCode}
                                    onChange={(event) =>
                                        handlePostalCodeChange(
                                            event.target.value,
                                        )
                                    }
                                    maxLength={9}
                                    placeholder="00000-000"
                                    required
                                    className={`${inputClassName} min-w-0 flex-1`}
                                />

                                <button
                                    type="button"
                                    onClick={handleCalculateShipping}
                                    disabled={calculatingShipping}
                                    className={`${buttonClassName} shrink-0 px-5 py-3`}
                                >
                                    {calculatingShipping
                                        ? "Calculando..."
                                        : "Calcular"}
                                </button>
                            </div>
                        </label>

                        <label
                            className="animate-checkout-field flex flex-col gap-2 opacity-0"
                            style={{ animationDelay: "300ms" }}
                        >
                            <span className="text-sm">
                                Rua
                            </span>

                            <input
                                type="text"
                                value={street}
                                onChange={(event) =>
                                    setStreet(event.target.value)
                                }
                                required
                                className={inputClassName}
                            />
                        </label>

                        <div
                            className="animate-checkout-field grid gap-4 opacity-0 md:grid-cols-[160px_1fr]"
                            style={{ animationDelay: "360ms" }}
                        >
                            <label className="flex flex-col gap-2">
                                <span className="text-sm">
                                    Número
                                </span>

                                <input
                                    type="text"
                                    value={number}
                                    onChange={(event) =>
                                        setNumber(event.target.value)
                                    }
                                    required
                                    className={inputClassName}
                                />
                            </label>

                            <label className="flex flex-col gap-2">
                                <span className="text-sm">
                                    Complemento
                                </span>

                                <input
                                    type="text"
                                    value={complement}
                                    onChange={(event) =>
                                        setComplement(
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Apto, bloco, casa..."
                                    className={inputClassName}
                                />
                            </label>
                        </div>

                        <label
                            className="animate-checkout-field flex flex-col gap-2 opacity-0"
                            style={{ animationDelay: "420ms" }}
                        >
                            <span className="text-sm">
                                Bairro
                            </span>

                            <input
                                type="text"
                                value={neighborhood}
                                onChange={(event) =>
                                    setNeighborhood(
                                        event.target.value,
                                    )
                                }
                                required
                                className={inputClassName}
                            />
                        </label>

                        <div
                            className="animate-checkout-field grid gap-4 opacity-0 md:grid-cols-[1fr_120px]"
                            style={{ animationDelay: "480ms" }}
                        >
                            <label className="flex flex-col gap-2">
                                <span className="text-sm">
                                    Cidade
                                </span>

                                <input
                                    type="text"
                                    value={city}
                                    onChange={(event) =>
                                        setCity(event.target.value)
                                    }
                                    required
                                    className={inputClassName}
                                />
                            </label>

                            <label className="flex flex-col gap-2">
                                <span className="text-sm">
                                    Estado
                                </span>

                                <input
                                    type="text"
                                    value={state}
                                    onChange={(event) =>
                                        setState(
                                            event.target.value.toUpperCase(),
                                        )
                                    }
                                    maxLength={2}
                                    required
                                    className={`${inputClassName} uppercase`}
                                />
                            </label>
                        </div>

                        {shippingError && (
                            <p className="animate-checkout-field text-sm text-red-600">
                                {shippingError}
                            </p>
                        )}

                        {shippingOptions.length > 0 && (
                            <div className="flex flex-col gap-3">
                                {shippingOptions.map(
                                    (option, index) => {
                                        const checked =
                                            selectedShipping?.id ===
                                            option.id;

                                        return (
                                            <label
                                                key={option.id}
                                                className="animate-checkout-field flex cursor-pointer items-center gap-4 rounded-xl border border-black bg-white p-4 opacity-0 shadow-[4px_4px_0_0_#000] transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#000]"
                                                style={{
                                                    animationDelay:
                                                        `${index * 60}ms`,
                                                }}
                                            >
                                                <input
                                                    type="radio"
                                                    name="shipping"
                                                    checked={checked}
                                                    onChange={() =>
                                                        setSelectedShipping(
                                                            option,
                                                        )
                                                    }
                                                />

                                                <div className="flex flex-1 items-center justify-between gap-4">
                                                    <div>
                                                        <p className="font-medium">
                                                            {option.company}{" "}
                                                            {option.name}
                                                        </p>

                                                        <p className="text-sm opacity-60">
                                                            {option.deliveryTime > 0
                                                                ? `${option.deliveryTime} dia${option.deliveryTime === 1 ? "" : "s"} úteis`
                                                                : "Prazo não informado"}
                                                        </p>
                                                    </div>

                                                    <span>
                                                        {option.price.toLocaleString(
                                                            "pt-BR",
                                                            {
                                                                style: "currency",
                                                                currency: "BRL",
                                                            },
                                                        )}
                                                    </span>
                                                </div>
                                            </label>
                                        );
                                    },
                                )}
                            </div>
                        )}
                    </section>

                    <section className="flex flex-col gap-4">
                        <h2
                            className="animate-checkout-field font-windsor text-2xl font-bold opacity-0"
                            style={{ animationDelay: "540ms" }}
                        >
                            Pagamento
                        </h2>

                        <div className="flex flex-col gap-3">
                            <label
                                className="animate-checkout-field flex cursor-pointer items-center gap-4 rounded-xl border border-black bg-white p-4 opacity-0 shadow-[4px_4px_0_0_#000] transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#000]"
                                style={{ animationDelay: "600ms" }}
                            >
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="pix"
                                    checked={paymentMethod === "pix"}
                                    onChange={() =>
                                        setPaymentMethod("pix")
                                    }
                                />

                                <div>
                                    <p className="font-medium">
                                        PIX
                                    </p>

                                    <p className="text-sm opacity-60">
                                        Pagamento instantâneo
                                    </p>
                                </div>
                            </label>

                            <label
                                className="animate-checkout-field flex cursor-pointer items-center gap-4 rounded-xl border border-black bg-white p-4 opacity-0 shadow-[4px_4px_0_0_#000] transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#000]"
                                style={{ animationDelay: "660ms" }}
                            >
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="card"
                                    checked={paymentMethod === "card"}
                                    onChange={() =>
                                        setPaymentMethod("card")
                                    }
                                />

                                <div>
                                    <p className="font-medium">
                                        Cartão de crédito
                                    </p>

                                    <p className="text-sm opacity-60">
                                        Crédito
                                    </p>
                                </div>
                            </label>

                            {paymentMethod === "card" && (
                                <div className="grid gap-4 rounded-xl border border-black bg-white p-5 shadow-[4px_4px_0_0_#000]">
                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm">
                                            Número do cartão
                                        </span>

                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            autoComplete="cc-number"
                                            value={cardNumber}
                                            onChange={(event) =>
                                                setCardNumber(
                                                    formatCardNumber(
                                                        event.target.value,
                                                    ),
                                                )
                                            }
                                            placeholder="0000 0000 0000 0000"
                                            maxLength={23}
                                            required
                                            className={inputClassName}
                                        />
                                    </label>

                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm">
                                            Nome no cartão
                                        </span>

                                        <input
                                            type="text"
                                            autoComplete="cc-name"
                                            value={cardName}
                                            onChange={(event) =>
                                                setCardName(
                                                    event.target.value.toUpperCase(),
                                                )
                                            }
                                            placeholder="NOME COMO ESTÁ NO CARTÃO"
                                            required
                                            className={inputClassName}
                                        />
                                    </label>

                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm">
                                            CPF do titular do cartão
                                        </span>

                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={holderTaxId}
                                            onChange={(event) =>
                                                setHolderTaxId(
                                                    event.target.value
                                                        .replace(/\D/g, "")
                                                        .slice(0, 11),
                                                )
                                            }
                                            placeholder="Em branco: usar o CPF do comprador"
                                            maxLength={11}
                                            className={inputClassName}
                                        />
                                    </label>

                                    <div className="grid grid-cols-2 gap-4">
                                        <label className="flex flex-col gap-2">
                                            <span className="text-sm">
                                                Validade
                                            </span>

                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                autoComplete="cc-exp"
                                                value={cardExpiry}
                                                onChange={(event) =>
                                                    setCardExpiry(
                                                        formatCardExpiry(
                                                            event.target.value,
                                                        ),
                                                    )
                                                }
                                                placeholder="MM/AA"
                                                maxLength={5}
                                                required
                                                className={inputClassName}
                                            />
                                        </label>

                                        <label className="flex flex-col gap-2">
                                            <span className="text-sm">
                                                CVV
                                            </span>

                                            <input
                                                type="password"
                                                inputMode="numeric"
                                                autoComplete="cc-csc"
                                                value={cardCvv}
                                                onChange={(event) =>
                                                    setCardCvv(
                                                        event.target.value
                                                            .replace(/\D/g, "")
                                                            .slice(0, 4),
                                                    )
                                                }
                                                placeholder="123"
                                                maxLength={4}
                                                required
                                                className={inputClassName}
                                            />
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                <aside className="animate-checkout-summary flex flex-col gap-6 opacity-0">
                    <h2 className="font-windsor text-2xl font-bold">
                        Seu pedido
                    </h2>

                    <div className="flex flex-col">
                        {items.map((item, index) => (
                            <div
                                key={item.id}
                                className="animate-checkout-field flex justify-between gap-4 border-b border-black py-4 opacity-0"
                                style={{
                                    animationDelay:
                                        `${150 + index * 60}ms`,
                                }}
                            >
                                <div>
                                    <p>{item.name}</p>

                                    <p className="text-sm opacity-60">
                                        {item.artist} × {item.quantity}
                                    </p>
                                </div>

                                <span>
                                    {(
                                        item.price *
                                        item.quantity
                                    ).toLocaleString(
                                        "pt-BR",
                                        {
                                            style: "currency",
                                            currency: "BRL",
                                        },
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between">
                            <span>Subtotal</span>

                            <span>
                                {subtotal.toLocaleString(
                                    "pt-BR",
                                    {
                                        style: "currency",
                                        currency: "BRL",
                                    },
                                )}
                            </span>
                        </div>

                        {coupon && (
                            <div className="flex justify-between">
                                <span>
                                    Cupom {coupon.code}
                                </span>

                                <span>
                                    -{" "}
                                    {discountAmount.toLocaleString(
                                        "pt-BR",
                                        {
                                            style: "currency",
                                            currency: "BRL",
                                        },
                                    )}
                                </span>
                            </div>
                        )}

                        {coupon && (
                            <div className="flex justify-between">
                                <span>
                                    Subtotal com desconto
                                </span>

                                <span>
                                    {discountedSubtotal.toLocaleString(
                                        "pt-BR",
                                        {
                                            style: "currency",
                                            currency: "BRL",
                                        },
                                    )}
                                </span>
                            </div>
                        )}

                        <div className="flex justify-between">
                            <span>Frete</span>

                            <span>
                                {selectedShipping
                                    ? shipping.toLocaleString(
                                            "pt-BR",
                                            {
                                                style: "currency",
                                                currency: "BRL",
                                            },
                                        )
                                    : "—"}
                            </span>
                        </div>

                        <div className="flex justify-between border-t border-black pt-4 text-xl">
                            <strong>Total</strong>

                            <strong>
                                {total.toLocaleString(
                                    "pt-BR",
                                    {
                                        style: "currency",
                                        currency: "BRL",
                                    },
                                )}
                            </strong>
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={
                            submitting ||
                            checking ||
                            !paymentMethod ||
                            (
                                paymentMethod === "card" &&
                                (!sdkReady || !publicKey)
                            ) ||
                            !selectedShipping ||
                            !items.length
                        }
                        className={`${buttonClassName} w-full`}
                    >
                        {submitting
                            ? "Criando pedido..."
                            : "Finalizar pedido"}
                    </button>

                    <p className="text-xs opacity-60">
                        {environment === "sandbox"
                            ? "Pagamento em ambiente de teste (Sandbox)."
                            : "Pagamento processado pelo PagBank."}
                    </p>
                </aside>
            </form>
        </>
    );
}