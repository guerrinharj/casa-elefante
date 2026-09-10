"use server";

import { createAdminClient } from "@/lib/supabase/admin";

import { getProductPackage } from "@/lib/shipping/product-package";

type ShippingItem = {
    productId: string;
    quantity: number;
};

type CalculateShippingInput = {
    postalCode: string;
    items: ShippingItem[];
};

export type ShippingOption = {
    id: number;
    name: string;
    price: number;
    deliveryTime: number;
    company: string;
};

type CalculateShippingResult =
    | {
          success: true;
          options: ShippingOption[];
      }
    | {
          success: false;
          error: string;
      };

type MelhorEnvioResponse = {
    id?: number;
    name?: string;
    price?: string;
    custom_price?: string;
    delivery_time?: number;
    custom_delivery_time?: number;
    error?: string;
    company?: {
        name?: string;
    };
};

export async function calculateShipping(
    input: CalculateShippingInput,
): Promise<CalculateShippingResult> {
    const postalCode =
        input.postalCode.replace(
            /\D/g,
            "",
        );

    if (postalCode.length !== 8) {
        return {
            success: false,
            error: "Informe um CEP válido.",
        };
    }

    if (!input.items.length) {
        return {
            success: false,
            error: "Seu carrinho está vazio.",
        };
    }

    const validItems =
        input.items.filter(
            (item) =>
                item.productId &&
                Number.isInteger(
                    item.quantity,
                ) &&
                item.quantity > 0,
        );

    if (
        validItems.length !==
        input.items.length
    ) {
        return {
            success: false,
            error: "Existem itens inválidos no carrinho.",
        };
    }

    const productIds = [
        ...new Set(
            validItems.map(
                (item) =>
                    item.productId,
            ),
        ),
    ];

    const supabase =
        createAdminClient();

    const {
        data: products,
        error: productsError,
    } = await supabase
        .from("products")
        .select(`
            id,
            price,
            format
        `)
        .in("id", productIds);

    if (
        productsError ||
        !products
    ) {
        console.error(
            "Erro ao carregar produtos:",
            productsError,
        );

        return {
            success: false,
            error: "Não foi possível carregar os produtos.",
        };
    }

    if (
        products.length !==
        productIds.length
    ) {
        return {
            success: false,
            error: "Um ou mais produtos não foram encontrados.",
        };
    }

    const productsMap =
        new Map(
            products.map(
                (product) => [
                    product.id,
                    product,
                ],
            ),
        );

    const shippingProducts =
        validItems.map(
            (item) => {
                const product =
                    productsMap.get(
                        item.productId,
                    );

                if (!product) {
                    throw new Error(
                        "Produto não encontrado.",
                    );
                }

                const packageData =
                    getProductPackage(
                        product.format ??
                            "",
                    );

                return {
                    id: product.id,

                    width:
                        packageData.width,

                    height:
                        packageData.height,

                    length:
                        packageData.length,

                    weight:
                        packageData.weight,

                    insurance_value:
                        Number(
                            product.price,
                        ),

                    quantity:
                        item.quantity,
                };
            },
        );

    const token =
        process.env
            .MELHOR_ENVIO_ACCESS_TOKEN;

    const originPostalCode =
        process.env
            .MELHOR_ENVIO_ORIGIN_CEP;

    if (
        !token ||
        !originPostalCode
    ) {
        console.error(
            "Variáveis do Melhor Envio não configuradas.",
        );

        return {
            success: false,
            error: "O cálculo de frete ainda não está configurado.",
        };
    }

    try {
        const response =
            await fetch(
                "https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate",
                {
                    method: "POST",

                    headers: {
                        Accept:
                            "application/json",

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`,

                        "User-Agent":
                            "Casa Elefante (contato@casaelefante.com.br)",
                    },

                    body:
                        JSON.stringify(
                            {
                                from: {
                                    postal_code:
                                        originPostalCode,
                                },

                                to: {
                                    postal_code:
                                        postalCode,
                                },

                                products:
                                    shippingProducts,

                                options: {
                                    receipt:
                                        false,

                                    own_hand:
                                        false,
                                },
                            },
                        ),

                    cache: "no-store",
                },
            );

        const data:
            MelhorEnvioResponse[] =
            await response.json();

        if (!response.ok) {
            console.error(
                "Erro Melhor Envio:",
                data,
            );

            return {
                success: false,
                error: "Não foi possível calcular o frete.",
            };
        }

        const options =
            data
                .filter(
                    (service) =>
                        !service.error &&
                        service.id &&
                        (
                            service.custom_price ??
                            service.price
                        ),
                )
                .map(
                    (service) => ({
                        id:
                            service.id!,

                        name:
                            service.name ??
                            "Entrega",

                        price:
                            Number(
                                service.custom_price ??
                                    service.price,
                            ),

                        deliveryTime:
                            service.custom_delivery_time ??
                            service.delivery_time ??
                            0,

                        company:
                            service.company
                                ?.name ??
                            "",
                    }),
                )
                .sort(
                    (a, b) =>
                        a.price -
                        b.price,
                );

        if (!options.length) {
            return {
                success: false,
                error: "Nenhuma opção de frete encontrada para este CEP.",
            };
        }

        return {
            success: true,
            options,
        };
    } catch (error) {
        console.error(
            "Erro ao calcular frete:",
            error,
        );

        return {
            success: false,
            error: "Não foi possível calcular o frete.",
        };
    }
}