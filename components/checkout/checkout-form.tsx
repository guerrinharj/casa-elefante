"use client";

import {
    FormEvent,
    useState,
} from "react";

import { useRouter } from "next/navigation";

import { useCart } from "@/components/cart/cart-provider";

import { createOrder } from "@/app/checkout/actions";

import {
    calculateShipping,
    type ShippingOption,
} from "@/app/checkout/shipping-actions";

/*
 * Classe visual compartilhada
 * pelos botões do checkout.
 *
 * Mantém a mesma linguagem:
 * fundo branco,
 * borda arredondada,
 * borda preta
 * e sombra fixa.
 */
const buttonClassName = `
    rounded-xl
    border
    border-black
    bg-white
    px-6
    py-4
    uppercase
    shadow-[6px_6px_0_0_#000]
    transition-all
    duration-200
    ease-out
    hover:-translate-x-1
    hover:-translate-y-1
    hover:shadow-[10px_10px_0_0_#000]
    disabled:cursor-not-allowed
    disabled:opacity-40
    disabled:hover:translate-x-0
    disabled:hover:translate-y-0
    disabled:hover:shadow-[6px_6px_0_0_#000]
`;

/*
 * Classe compartilhada
 * pelos inputs.
 */
const inputClassName = `
    rounded-lg
    border
    border-black
    bg-white
    px-4
    py-3
    outline-none
    transition-shadow
    duration-200
    focus:shadow-[3px_3px_0_0_#000]
`;

export function CheckoutForm() {
    const router =
        useRouter();

    /*
     * Dados e funções do carrinho.
     */
    const {
        items,
        subtotal,
        clearCart,
    } = useCart();

    /*
     * Dados pessoais.
     */
    const [
        customerName,
        setCustomerName,
    ] = useState("");

    const [
        customerEmail,
        setCustomerEmail,
    ] = useState("");

    /*
     * Endereço.
     */
    const [
        postalCode,
        setPostalCode,
    ] = useState("");

    const [
        street,
        setStreet,
    ] = useState("");

    const [
        number,
        setNumber,
    ] = useState("");

    const [
        complement,
        setComplement,
    ] = useState("");

    const [
        neighborhood,
        setNeighborhood,
    ] = useState("");

    const [
        city,
        setCity,
    ] = useState("");

    const [
        state,
        setState,
    ] = useState("");

    /*
     * Opções de frete retornadas
     * pelo Melhor Envio.
     */
    const [
        shippingOptions,
        setShippingOptions,
    ] = useState<
        ShippingOption[]
    >([]);

    /*
     * Frete selecionado.
     */
    const [
        selectedShipping,
        setSelectedShipping,
    ] = useState<
        ShippingOption | null
    >(null);

    /*
     * Loading do cálculo
     * de frete.
     */
    const [
        calculatingShipping,
        setCalculatingShipping,
    ] = useState(false);

    /*
     * Loading da criação
     * do pedido.
     */
    const [
        submitting,
        setSubmitting,
    ] = useState(false);

    /*
     * Erro do frete.
     */
    const [
        shippingError,
        setShippingError,
    ] = useState<
        string | null
    >(null);

    /*
     * Erro geral.
     */
    const [
        error,
        setError,
    ] = useState<
        string | null
    >(null);

    /*
     * Formata o CEP.
     *
     * 01154001
     * vira
     * 01154-001
     */
    function formatPostalCode(
        value: string,
    ) {
        const numbers =
            value.replace(
                /\D/g,
                "",
            );

        if (
            numbers.length <= 5
        ) {
            return numbers;
        }

        return `${numbers.slice(
            0,
            5,
        )}-${numbers.slice(
            5,
            8,
        )}`;
    }

    /*
     * Atualiza o CEP.
     *
     * Quando o CEP muda,
     * eliminamos qualquer
     * cálculo de frete anterior.
     */
    function handlePostalCodeChange(
        value: string,
    ) {
        setPostalCode(
            formatPostalCode(
                value,
            ),
        );

        setShippingOptions(
            [],
        );

        setSelectedShipping(
            null,
        );

        setShippingError(
            null,
        );
    }

    /*
     * Calcula o frete.
     */
    async function handleCalculateShipping() {
        setShippingError(
            null,
        );

        setSelectedShipping(
            null,
        );

        const normalizedPostalCode =
            postalCode.replace(
                /\D/g,
                "",
            );

        /*
         * CEP precisa ter
         * exatamente 8 números.
         */
        if (
            normalizedPostalCode.length !==
            8
        ) {
            setShippingError(
                "Informe um CEP válido.",
            );

            return;
        }

        /*
         * Carrinho precisa
         * conter produtos.
         */
        if (!items.length) {
            setShippingError(
                "Seu carrinho está vazio.",
            );

            return;
        }

        setCalculatingShipping(
            true,
        );

        try {
            const result =
                await calculateShipping(
                    {
                        postalCode:
                            normalizedPostalCode,

                        items:
                            items.map(
                                (
                                    item,
                                ) => ({
                                    productId:
                                        item.id,

                                    quantity:
                                        item.quantity,
                                }),
                            ),
                    },
                );

            if (!result.success) {
                setShippingError(
                    result.error,
                );

                return;
            }

            setShippingOptions(
                result.options,
            );

            /*
             * Se existir apenas
             * uma opção,
             * seleciona automaticamente.
             */
            if (
                result.options.length ===
                1
            ) {
                setSelectedShipping(
                    result.options[0],
                );
            }
        } finally {
            setCalculatingShipping(
                false,
            );
        }
    }

    /*
     * Finaliza o checkout.
     */
    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setError(null);

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
            const result =
                await createOrder({
                    customerName,
                    customerEmail,

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

                    items:
                        items.map(
                            (item) => ({
                                productId:
                                    item.id,

                                quantity:
                                    item.quantity,
                            }),
                        ),
                });

            if (!result.success) {
                setError(
                    result.error,
                );

                return;
            }

            /*
             * Limpa o carrinho.
             */
            clearCart();

            /*
             * Retorna para a loja.
             */
            router.push(
                "/?pedido=confirmado",
            );
        } finally {
            setSubmitting(false);
        }
    }

    /*
     * Valor do frete.
     */
    const shipping =
        selectedShipping?.price ??
        0;

    /*
     * Valor total.
     */
    const total =
        subtotal + shipping;

    return (
        <form
            onSubmit={handleSubmit}
            className="grid gap-10 md:grid-cols-[1fr_400px]"
        >
            {/*
             * COLUNA ESQUERDA
             */}
            <div className="flex flex-col gap-8">
                {/*
                 * DADOS PESSOAIS
                 */}
                <section className="flex flex-col gap-4">
                    <h2
                        className="
                            animate-checkout-field
                            font-grotesque
                            text-2xl
                            font-bold
                            uppercase
                            opacity-0
                        "
                        style={{
                            animationDelay:
                                "0ms",
                        }}
                    >
                        Seus dados
                    </h2>

                    {/*
                     * Nome.
                     */}
                    <label
                        className="animate-checkout-field flex flex-col gap-2 opacity-0"
                        style={{
                            animationDelay:
                                "60ms",
                        }}
                    >
                        <span className="text-sm">
                            Nome
                        </span>

                        <input
                            type="text"
                            value={
                                customerName
                            }
                            onChange={(
                                event,
                            ) =>
                                setCustomerName(
                                    event
                                        .target
                                        .value,
                                )
                            }
                            required
                            className={
                                inputClassName
                            }
                        />
                    </label>

                    {/*
                     * E-mail.
                     */}
                    <label
                        className="animate-checkout-field flex flex-col gap-2 opacity-0"
                        style={{
                            animationDelay:
                                "120ms",
                        }}
                    >
                        <span className="text-sm">
                            E-mail
                        </span>

                        <input
                            type="email"
                            value={
                                customerEmail
                            }
                            onChange={(
                                event,
                            ) =>
                                setCustomerEmail(
                                    event
                                        .target
                                        .value,
                                )
                            }
                            required
                            className={
                                inputClassName
                            }
                        />
                    </label>
                </section>

                {/*
                 * ENTREGA
                 */}
                <section className="flex flex-col gap-4">
                    <h2
                        className="
                            animate-checkout-field
                            font-grotesque
                            text-2xl
                            font-bold
                            uppercase
                            opacity-0
                        "
                        style={{
                            animationDelay:
                                "180ms",
                        }}
                    >
                        Entrega
                    </h2>

                    {/*
                     * CEP.
                     */}
                    <label
                        className="animate-checkout-field flex flex-col gap-2 opacity-0"
                        style={{
                            animationDelay:
                                "240ms",
                        }}
                    >
                        <span className="text-sm">
                            CEP
                        </span>

                        <div className="flex items-stretch gap-3">
                            <input
                                type="text"
                                inputMode="numeric"
                                value={
                                    postalCode
                                }
                                onChange={(
                                    event,
                                ) =>
                                    handlePostalCodeChange(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                maxLength={
                                    9
                                }
                                placeholder="00000-000"
                                required
                                className={`${inputClassName} min-w-0 flex-1`}
                            />

                            <button
                                type="button"
                                onClick={
                                    handleCalculateShipping
                                }
                                disabled={
                                    calculatingShipping
                                }
                                className={`${buttonClassName} shrink-0 px-5 py-3`}
                            >
                                {calculatingShipping
                                    ? "Calculando..."
                                    : "Calcular"}
                            </button>
                        </div>
                    </label>

                    {/*
                     * Rua.
                     */}
                    <label
                        className="animate-checkout-field flex flex-col gap-2 opacity-0"
                        style={{
                            animationDelay:
                                "300ms",
                        }}
                    >
                        <span className="text-sm">
                            Rua
                        </span>

                        <input
                            type="text"
                            value={
                                street
                            }
                            onChange={(
                                event,
                            ) =>
                                setStreet(
                                    event
                                        .target
                                        .value,
                                )
                            }
                            required
                            className={
                                inputClassName
                            }
                        />
                    </label>

                    {/*
                     * Número +
                     * complemento.
                     */}
                    <div
                        className="animate-checkout-field grid gap-4 opacity-0 md:grid-cols-[160px_1fr]"
                        style={{
                            animationDelay:
                                "360ms",
                        }}
                    >
                        <label className="flex flex-col gap-2">
                            <span className="text-sm">
                                Número
                            </span>

                            <input
                                type="text"
                                value={
                                    number
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setNumber(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                required
                                className={
                                    inputClassName
                                }
                            />
                        </label>

                        <label className="flex flex-col gap-2">
                            <span className="text-sm">
                                Complemento
                            </span>

                            <input
                                type="text"
                                value={
                                    complement
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setComplement(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                placeholder="Apto, bloco, casa..."
                                className={
                                    inputClassName
                                }
                            />
                        </label>
                    </div>

                    {/*
                     * Bairro.
                     */}
                    <label
                        className="animate-checkout-field flex flex-col gap-2 opacity-0"
                        style={{
                            animationDelay:
                                "420ms",
                        }}
                    >
                        <span className="text-sm">
                            Bairro
                        </span>

                        <input
                            type="text"
                            value={
                                neighborhood
                            }
                            onChange={(
                                event,
                            ) =>
                                setNeighborhood(
                                    event
                                        .target
                                        .value,
                                )
                            }
                            required
                            className={
                                inputClassName
                            }
                        />
                    </label>

                    {/*
                     * Cidade +
                     * Estado.
                     */}
                    <div
                        className="animate-checkout-field grid gap-4 opacity-0 md:grid-cols-[1fr_120px]"
                        style={{
                            animationDelay:
                                "480ms",
                        }}
                    >
                        <label className="flex flex-col gap-2">
                            <span className="text-sm">
                                Cidade
                            </span>

                            <input
                                type="text"
                                value={
                                    city
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setCity(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                required
                                className={
                                    inputClassName
                                }
                            />
                        </label>

                        <label className="flex flex-col gap-2">
                            <span className="text-sm">
                                Estado
                            </span>

                            <input
                                type="text"
                                value={
                                    state
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setState(
                                        event
                                            .target
                                            .value
                                            .toUpperCase(),
                                    )
                                }
                                maxLength={
                                    2
                                }
                                required
                                className={`${inputClassName} uppercase`}
                            />
                        </label>
                    </div>

                    {/*
                     * Erro do frete.
                     */}
                    {shippingError && (
                        <p className="animate-checkout-field text-sm text-red-600">
                            {
                                shippingError
                            }
                        </p>
                    )}

                    {/*
                     * OPÇÕES DE FRETE
                     */}
                    {shippingOptions.length >
                        0 && (
                        <div className="flex flex-col gap-3">
                            {shippingOptions.map(
                                (
                                    option,
                                    index,
                                ) => {
                                    const checked =
                                        selectedShipping
                                            ?.id ===
                                        option.id;

                                    return (
                                        <label
                                            key={
                                                option.id
                                            }
                                            className="
                                                animate-checkout-field
                                                flex
                                                cursor-pointer
                                                items-center
                                                gap-4
                                                rounded-xl
                                                border
                                                border-black
                                                bg-white
                                                p-4
                                                opacity-0
                                                shadow-[4px_4px_0_0_#000]
                                                transition-all
                                                duration-200
                                                hover:-translate-x-0.5
                                                hover:-translate-y-0.5
                                                hover:shadow-[6px_6px_0_0_#000]
                                            "
                                            style={{
                                                animationDelay: `${
                                                    index *
                                                        60
                                                }ms`,
                                            }}
                                        >
                                            <input
                                                type="radio"
                                                name="shipping"
                                                checked={
                                                    checked
                                                }
                                                onChange={() =>
                                                    setSelectedShipping(
                                                        option,
                                                    )
                                                }
                                            />

                                            <div className="flex flex-1 items-center justify-between gap-4">
                                                <div>
                                                    <p className="font-medium">
                                                        {
                                                            option.company
                                                        }{" "}
                                                        {
                                                            option.name
                                                        }
                                                    </p>

                                                    <p className="text-sm opacity-60">
                                                        {option.deliveryTime >
                                                        0
                                                            ? `${option.deliveryTime} dia${option.deliveryTime === 1 ? "" : "s"} úteis`
                                                            : "Prazo não informado"}
                                                    </p>
                                                </div>

                                                <span>
                                                    {option.price.toLocaleString(
                                                        "pt-BR",
                                                        {
                                                            style: "currency",
                                                            currency:
                                                                "BRL",
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
            </div>

            {/*
             * COLUNA DIREITA
             *
             * Resumo do pedido.
             */}
            <aside
                className="
                    animate-checkout-summary
                    flex
                    flex-col
                    gap-6
                    opacity-0
                "
            >
                <h2 className="font-grotesque text-2xl font-bold uppercase">
                    Seu pedido
                </h2>

                {/*
                 * Produtos.
                 */}
                <div className="flex flex-col">
                    {items.map(
                        (
                            item,
                            index,
                        ) => (
                            <div
                                key={
                                    item.id
                                }
                                className="
                                    animate-checkout-field
                                    flex
                                    justify-between
                                    gap-4
                                    border-b
                                    border-black
                                    py-4
                                    opacity-0
                                "
                                style={{
                                    animationDelay: `${
                                        150 +
                                        index *
                                            60
                                    }ms`,
                                }}
                            >
                                <div>
                                    <p>
                                        {
                                            item.name
                                        }
                                    </p>

                                    <p className="text-sm opacity-60">
                                        {
                                            item.artist
                                        }{" "}
                                        ×{" "}
                                        {
                                            item.quantity
                                        }
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
                                            currency:
                                                "BRL",
                                        },
                                    )}
                                </span>
                            </div>
                        ),
                    )}
                </div>

                {/*
                 * Resumo financeiro.
                 */}
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between">
                        <span>
                            Subtotal
                        </span>

                        <span>
                            {subtotal.toLocaleString(
                                "pt-BR",
                                {
                                    style: "currency",
                                    currency:
                                        "BRL",
                                },
                            )}
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span>
                            Frete
                        </span>

                        <span>
                            {selectedShipping
                                ? shipping.toLocaleString(
                                      "pt-BR",
                                      {
                                          style: "currency",
                                          currency:
                                              "BRL",
                                      },
                                  )
                                : "—"}
                        </span>
                    </div>

                    <div className="flex justify-between border-t border-black pt-4 text-xl">
                        <strong>
                            Total
                        </strong>

                        <strong>
                            {total.toLocaleString(
                                "pt-BR",
                                {
                                    style: "currency",
                                    currency:
                                        "BRL",
                                },
                            )}
                        </strong>
                    </div>
                </div>

                {/*
                 * Erro geral.
                 */}
                {error && (
                    <p className="text-sm text-red-600">
                        {error}
                    </p>
                )}

                {/*
                 * FINALIZAR PEDIDO
                 */}
                <button
                    type="submit"
                    disabled={
                        submitting ||
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
                    Pagamento temporariamente
                    em modo de teste.
                </p>
            </aside>
        </form>
    );
}