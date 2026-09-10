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
     * Campo:
     * Nome do cliente.
     */

    const [
        customerName,
        setCustomerName,
    ] = useState("");

    /*
     * Campo:
     * E-mail do cliente.
     */

    const [
        customerEmail,
        setCustomerEmail,
    ] = useState("");

    /*
     * Campo:
     * CEP do endereço de entrega.
     */

    const [
        postalCode,
        setPostalCode,
    ] = useState("");

    /*
     * Campo:
     * Rua do endereço de entrega.
     */

    const [
        street,
        setStreet,
    ] = useState("");

    /*
     * Campo:
     * Número do endereço.
     */

    const [
        number,
        setNumber,
    ] = useState("");

    /*
     * Campo:
     * Complemento do endereço.
     */

    const [
        complement,
        setComplement,
    ] = useState("");

    /*
     * Campo:
     * Bairro.
     */

    const [
        neighborhood,
        setNeighborhood,
    ] = useState("");

    /*
     * Campo:
     * Cidade.
     */

    const [
        city,
        setCity,
    ] = useState("");

    /*
     * Campo:
     * Estado.
     */

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
     * Opção de frete escolhida
     * pelo cliente.
     */

    const [
        selectedShipping,
        setSelectedShipping,
    ] = useState<
        ShippingOption | null
    >(null);

    /*
     * Estado de carregamento
     * enquanto calculamos o frete.
     */

    const [
        calculatingShipping,
        setCalculatingShipping,
    ] = useState(false);

    /*
     * Estado de carregamento
     * enquanto criamos o pedido.
     */

    const [
        submitting,
        setSubmitting,
    ] = useState(false);

    /*
     * Erro relacionado ao cálculo
     * do frete.
     */

    const [
        shippingError,
        setShippingError,
    ] = useState<
        string | null
    >(null);

    /*
     * Erro geral do checkout.
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
     * Exemplo:
     * 01154001 → 01154-001
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
     * apagamos as opções de frete
     * calculadas anteriormente.
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
     * Calcula as opções de frete
     * usando o CEP e os produtos
     * do carrinho.
     */

    async function handleCalculateShipping() {
        setShippingError(
            null,
        );

        setSelectedShipping(
            null,
        );

        /*
         * Remove caracteres
         * não numéricos do CEP.
         */

        const normalizedPostalCode =
            postalCode.replace(
                /\D/g,
                "",
            );

        /*
         * Validação:
         * CEP precisa ter 8 números.
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
         * Validação:
         * O carrinho precisa ter produtos.
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
            /*
             * Consulta o Melhor Envio.
             */

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

            /*
             * Erro retornado
             * pelo cálculo de frete.
             */

            if (!result.success) {
                setShippingError(
                    result.error,
                );

                return;
            }

            /*
             * Salva as opções de frete.
             */

            setShippingOptions(
                result.options,
            );

            /*
             * Se existir apenas uma opção,
             * selecionamos automaticamente.
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
     * Finaliza o checkout
     * e cria o pedido.
     */

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setError(null);

        /*
         * Validação:
         * Carrinho vazio.
         */

        if (!items.length) {
            setError(
                "Seu carrinho está vazio.",
            );

            return;
        }

        /*
         * Validação:
         * O cliente precisa selecionar
         * uma opção de frete.
         */

        if (!selectedShipping) {
            setError(
                "Escolha uma opção de frete.",
            );

            return;
        }

        setSubmitting(true);

        try {
            /*
             * Cria o pedido.
             */

            const result =
                await createOrder({
                    /*
                     * Dados do cliente.
                     */

                    customerName,
                    customerEmail,

                    /*
                     * Endereço de entrega.
                     */

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

                    /*
                     * Produtos do pedido.
                     */

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

            /*
             * Erro retornado
             * ao criar o pedido.
             */

            if (!result.success) {
                setError(
                    result.error,
                );

                return;
            }

            /*
             * Limpa o carrinho
             * depois do pedido confirmado.
             */

            clearCart();

            /*
             * Volta para a loja
             * exibindo o banner
             * de pedido confirmado.
             */

            router.push(
                "/?pedido=confirmado",
            );
        } finally {
            setSubmitting(false);
        }
    }

    /*
     * Valor do frete selecionado.
     */

    const shipping =
        selectedShipping?.price ??
        0;

    /*
     * Total do pedido:
     * subtotal + frete.
     */

    const total =
        subtotal + shipping;

    return (
        <form
            onSubmit={
                handleSubmit
            }
            className="grid gap-10 md:grid-cols-[1fr_400px]"
        >
            {/*
             * COLUNA ESQUERDA
             *
             * Dados do cliente,
             * endereço e frete.
             */}

            <div className="flex flex-col gap-8">
                {/*
                 * SEÇÃO:
                 * Dados pessoais.
                 */}

                <section className="flex flex-col gap-4">
                    <h2 className="font-grotesque text-2xl font-bold uppercase">
                        Seus dados
                    </h2>

                    {/*
                     * Campo:
                     * Nome.
                     */}

                    <label className="flex flex-col gap-2">
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
                            className="border border-black bg-transparent px-4 py-3 outline-none"
                        />
                    </label>

                    {/*
                     * Campo:
                     * E-mail.
                     */}

                    <label className="flex flex-col gap-2">
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
                            className="border border-black bg-transparent px-4 py-3 outline-none"
                        />
                    </label>
                </section>

                {/*
                 * SEÇÃO:
                 * Endereço de entrega
                 * e cálculo do frete.
                 */}

                <section className="flex flex-col gap-4">
                    <h2 className="font-grotesque text-2xl font-bold uppercase">
                        Entrega
                    </h2>

                    {/*
                     * Campo:
                     * CEP.
                     *
                     * O botão ao lado
                     * calcula o frete.
                     */}

                    <label className="flex flex-col gap-2">
                        <span className="text-sm">
                            CEP
                        </span>

                        {/*
                         * Container:
                         * Input do CEP +
                         * botão de calcular.
                         */}

                        <div className="flex gap-2">
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
                                className="min-w-0 flex-1 border border-black bg-transparent px-4 py-3 outline-none"
                            />

                            {/*
                             * Botão:
                             * Calcular frete.
                             */}

                            <button
                                type="button"
                                onClick={
                                    handleCalculateShipping
                                }
                                disabled={
                                    calculatingShipping
                                }
                                className="border border-black px-5 py-3 uppercase transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {calculatingShipping
                                    ? "Calculando..."
                                    : "Calcular"}
                            </button>
                        </div>
                    </label>

                    {/*
                     * Campo:
                     * Rua.
                     */}

                    <label className="flex flex-col gap-2">
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
                            className="border border-black bg-transparent px-4 py-3 outline-none"
                        />
                    </label>

                    {/*
                     * Container:
                     * Número + Complemento.
                     */}

                    <div className="grid gap-4 md:grid-cols-[160px_1fr]">
                        {/*
                         * Campo:
                         * Número.
                         */}

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
                                className="border border-black bg-transparent px-4 py-3 outline-none"
                            />
                        </label>

                        {/*
                         * Campo:
                         * Complemento.
                         *
                         * Campo opcional.
                         */}

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
                                className="border border-black bg-transparent px-4 py-3 outline-none"
                            />
                        </label>
                    </div>

                    {/*
                     * Campo:
                     * Bairro.
                     */}

                    <label className="flex flex-col gap-2">
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
                            className="border border-black bg-transparent px-4 py-3 outline-none"
                        />
                    </label>

                    {/*
                     * Container:
                     * Cidade + Estado.
                     */}

                    <div className="grid gap-4 md:grid-cols-[1fr_120px]">
                        {/*
                         * Campo:
                         * Cidade.
                         */}

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
                                className="border border-black bg-transparent px-4 py-3 outline-none"
                            />
                        </label>

                        {/*
                         * Campo:
                         * Estado.
                         *
                         * Apenas a sigla:
                         * SP, RJ, MG...
                         */}

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
                                className="border border-black bg-transparent px-4 py-3 uppercase outline-none"
                            />
                        </label>
                    </div>

                    {/*
                     * Mensagem:
                     * Erro ao calcular frete.
                     */}

                    {shippingError && (
                        <p className="text-sm text-red-600">
                            {
                                shippingError
                            }
                        </p>
                    )}

                    {/*
                     * Container:
                     * Lista de opções de frete.
                     *
                     * Só aparece depois
                     * do cálculo.
                     */}

                    {shippingOptions.length >
                        0 && (
                        <div className="flex flex-col border border-black">
                            {shippingOptions.map(
                                (
                                    option,
                                ) => {
                                    /*
                                     * Verifica se esta modalidade
                                     * está selecionada.
                                     */

                                    const checked =
                                        selectedShipping
                                            ?.id ===
                                        option.id;

                                    return (
                                        /*
                                         * Opção individual
                                         * de frete.
                                         */

                                        <label
                                            key={
                                                option.id
                                            }
                                            className="flex cursor-pointer items-center gap-4 border-b border-black p-4 last:border-b-0"
                                        >
                                            {/*
                                             * Radio:
                                             * Seleciona o frete.
                                             */}

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

                                            {/*
                                             * Container:
                                             * Nome, prazo e preço
                                             * da modalidade.
                                             */}

                                            <div className="flex flex-1 items-center justify-between gap-4">
                                                {/*
                                                 * Transportadora,
                                                 * modalidade e prazo.
                                                 */}

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

                                                {/*
                                                 * Preço do frete.
                                                 */}

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
             * Resumo do pedido
             * e botão de finalizar.
             */}

            <aside className="flex flex-col gap-6">
                <h2 className="font-grotesque text-2xl font-bold uppercase">
                    Seu pedido
                </h2>

                {/*
                 * Container:
                 * Produtos do carrinho.
                 */}

                <div className="flex flex-col">
                    {items.map(
                        (item) => (
                            /*
                             * Produto individual.
                             */

                            <div
                                key={
                                    item.id
                                }
                                className="flex justify-between gap-4 border-b border-black py-4"
                            >
                                {/*
                                 * Nome, artista
                                 * e quantidade.
                                 */}

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

                                {/*
                                 * Valor do produto
                                 * multiplicado pela quantidade.
                                 */}

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
                 * Container:
                 * Resumo financeiro.
                 */}

                <div className="flex flex-col gap-3">
                    {/*
                     * Linha:
                     * Subtotal.
                     */}

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

                    {/*
                     * Linha:
                     * Frete selecionado.
                     */}

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

                    {/*
                     * Linha:
                     * Total do pedido.
                     */}

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
                 * Mensagem:
                 * Erro geral do checkout.
                 */}

                {error && (
                    <p className="text-sm text-red-600">
                        {error}
                    </p>
                )}

                {/*
                 * Botão:
                 * Finalizar pedido.
                 */}

                <button
                    type="submit"
                    disabled={
                        submitting ||
                        !selectedShipping ||
                        !items.length
                    }
                    className="border border-black px-6 py-4 uppercase transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {submitting
                        ? "Criando pedido..."
                        : "Finalizar pedido"}
                </button>

                {/*
                 * Aviso:
                 * Pagamento ainda
                 * está em modo dummy.
                 */}

                <p className="text-xs opacity-60">
                    Pagamento temporariamente
                    em modo de teste.
                </p>
            </aside>
        </form>
    );
}