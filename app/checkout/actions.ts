"use server";

import type {
    CheckoutPayment,
} from "@/lib/payment-types";

import {
    createAdminClient,
} from "@/lib/supabase/admin";

import {
    createClient,
} from "@/lib/supabase/server";

import {
    orderPaidEmail,
} from "@/lib/emails/order-paid";

import {
    resend,
} from "@/lib/resend";

type CreateOrderInput = {
    attemptId: string;
    customerName: string;
    customerEmail: string;
    customerTaxId: string;
    paymentMethod: "pix" | "card";
    card?: {
        encrypted: string;
        holderName: string;
        holderTaxId: string;
    };
    couponCode: string | null;
    shippingAddress: {
        postalCode: string;
        street: string;
        number: string;
        complement: string;
        neighborhood: string;
        city: string;
        state: string;
    };
    shipping: {
        id: string | number;
        company: string;
        name: string;
        price: number;
        deliveryTime: number;
    };
    items: {
        productId: string;
        quantity: number;
    }[];
};

type ActionResult<T> =
    | ({
            success: true;
        } & T)
    | {
            success: false;
            error: string;
        };

type PagBankOrder = {
    id?: string;
    reference_id?: string;
    charges?: {
        id?: string;
        status?: string;
        amount?: {
            value?: number;
        };
        payment_method?: {
            type?: string;
            pix?: {
                expiration_date?: string;
            };
        };
        qr_code?: {
            text?: string;
        };
        links?: {
            rel?: string;
            href?: string;
        }[];
    }[];
    qr_codes?: {
        text?: string;
        links?: {
            rel?: string;
            href?: string;
        }[];
    }[];
};

function getPagBankBaseUrl() {
    return process.env.PAGBANK_ENV === "sandbox"
        ? "https://sandbox.api.pagseguro.com"
        : "https://api.pagseguro.com";
}

function getPagBankToken() {
    const token = process.env.PAGBANK_TOKEN;

    if (!token) {
        throw new Error(
            "A variável PAGBANK_TOKEN não está configurada.",
        );
    }

    return token;
}

async function pagBankRequest<T>(
    path: string,
    init: RequestInit = {},
): Promise<T> {
    const response = await fetch(
        `${getPagBankBaseUrl()}${path}`,
        {
            ...init,
            cache: "no-store",
            headers: {
                Authorization: `Bearer ${getPagBankToken()}`,
                Accept: "application/json",
                "Content-Type": "application/json",
                ...init.headers,
            },
        },
    );

    const responseText = await response.text();

    let data: unknown = {};

    if (responseText) {
        try {
            data = JSON.parse(responseText);
        } catch {
            data = {
                message: responseText,
            };
        }
    }

    if (!response.ok) {
        const errorData = data as {
            message?: string;
            error_messages?: {
                description?: string;
            }[];
        };

        const message =
            errorData.error_messages?.[0]?.description ??
            errorData.message ??
            `O PagBank respondeu com status ${response.status}.`;

        throw new Error(message);
    }

    return data as T;
}

function mapPaymentStatus(
    chargeStatus: string | undefined,
): CheckoutPayment["status"] {
    switch (chargeStatus?.toUpperCase()) {
        case "PAID":
            return "paid";

        case "DECLINED":
            return "declined";

        case "CANCELED":
        case "CANCELLED":
        case "EXPIRED":
            return "expired";

        case "WAITING":
        case "AUTHORIZED":
        case "IN_ANALYSIS":
            return "pending";

        default:
            return "unknown";
    }
}

function getPixDetails(
    pagBankOrder: PagBankOrder,
) {
    const charge = pagBankOrder.charges?.[0];
    const qrCode =
        charge?.qr_code ??
        pagBankOrder.qr_codes?.[0];

    const links =
        charge?.links ??
        pagBankOrder.qr_codes?.[0]?.links ??
        [];

    const imageUrl = links.find(
        (link) =>
            link.rel?.toUpperCase().includes("QRCODE.PNG"),
    )?.href;

    return qrCode?.text
        ? {
                text: qrCode.text,
                imageUrl,
                expiresAt:
                    charge?.payment_method?.pix
                        ?.expiration_date ?? undefined,
            }
        : undefined;
}

function toCheckoutPayment(
    pagBankOrder: PagBankOrder,
    fallbackTotal: number,
): CheckoutPayment {
    const charge = pagBankOrder.charges?.[0];
    const status = mapPaymentStatus(charge?.status);

    const total =
        typeof charge?.amount?.value === "number"
            ? charge.amount.value / 100
            : fallbackTotal;

    return {
        orderId: pagBankOrder.id ?? "",
        method:
            charge?.payment_method?.type === "PIX"
                ? "pix"
                : "card",
        status,
        total,
        pix: getPixDetails(pagBankOrder),
    };
}

export async function getPaymentConfig() {
    return {
        publicKey:
            process.env.PAGBANK_PUBLIC_KEY ?? "",
        environment:
            process.env.PAGBANK_ENV ?? "production",
    };
}

async function sendPaidOrderEmail(
    orderId: string,
) {
    const supabase = createAdminClient();

    const {
        data: order,
        error: orderError,
    } = await supabase
        .from("orders")
        .select(`
            id,
            customer_name,
            customer_email,
            subtotal,
            coupon_code,
            discount_amount,
            shipping,
            total
        `)
        .eq("id", orderId)
        .single();

    if (orderError || !order) {
        console.error(
            "Erro ao carregar pedido para o e-mail:",
            orderError,
        );
        return;
    }

    const {
        data: items,
        error: itemsError,
    } = await supabase
        .from("order_items")
        .select(`
            product_name,
            unit_price,
            quantity
        `)
        .eq("order_id", orderId);

    if (itemsError || !items) {
        console.error(
            "Erro ao carregar itens para o e-mail:",
            itemsError,
        );
        return;
    }

    try {
        const { error: emailError } =
            await resend.emails.send(
                {
                    from:
                        process.env.RESEND_FROM_EMAIL!,
                    to: order.customer_email,
                    subject:
                        "Seu pedido Casa Elefante foi confirmado",
                    html: orderPaidEmail({
                        customerName:
                            order.customer_name,
                        orderId: order.id,
                        subtotal: Number(order.subtotal),
                        couponCode:
                            order.coupon_code ?? null,
                        discountAmount:
                            Number(order.discount_amount ?? 0),
                        shipping: Number(order.shipping),
                        total: Number(order.total),
                        items,
                    }),
                },
                {
                    idempotencyKey:
                        `order-paid/${order.id}`,
                },
            );

        if (emailError) {
            console.error(
                "Erro ao enviar e-mail de confirmação:",
                emailError,
            );
        }
    } catch (error) {
        console.error(
            "Erro inesperado ao enviar e-mail:",
            error,
        );
    }
}

async function finalizePaidOrder(
    orderId: string,
) {
    const supabase = createAdminClient();

    const {
        data: order,
        error: orderError,
    } = await supabase
        .from("orders")
        .select("id, coupon_id")
        .eq("id", orderId)
        .eq("status", "pending")
        .maybeSingle();

    if (orderError) {
        console.error(
            "Erro ao verificar pedido pago:",
            orderError,
        );
        return;
    }

    // O pedido já foi finalizado por uma consulta anterior.
    if (!order) {
        return;
    }

    const {
        data: items,
        error: itemsError,
    } = await supabase
        .from("order_items")
        .select("product_id, quantity")
        .eq("order_id", orderId);

    if (itemsError || !items) {
        console.error(
            "Erro ao carregar itens do pedido pago:",
            itemsError,
        );
        return;
    }

    const productIds = [
        ...new Set(
            items
                .map((item) => item.product_id)
                .filter(Boolean),
        ),
    ];

    if (productIds.length > 0) {
        const {
            data: products,
            error: productsError,
        } = await supabase
            .from("products")
            .select("id, stock")
            .in("id", productIds);

        if (productsError) {
            console.error(
                "Erro ao carregar estoque:",
                productsError,
            );
            return;
        }

        const productsById = new Map(
            (products ?? []).map((product) => [
                product.id,
                product,
            ]),
        );

        for (const item of items) {
            const product =
                productsById.get(item.product_id);

            if (!product) continue;

            const { error: stockError } =
                await supabase
                    .from("products")
                    .update({
                        stock:
                            Number(product.stock) -
                            Number(item.quantity),
                    })
                    .eq("id", item.product_id);

            if (stockError) {
                console.error(
                    "Erro ao atualizar estoque:",
                    stockError,
                );
            }
        }
    }

    if (order.coupon_id) {
        const {
            data: coupon,
            error: couponError,
        } = await supabase
            .from("coupons")
            .select("usage_count")
            .eq("id", order.coupon_id)
            .maybeSingle();

        if (couponError) {
            console.error(
                "Erro ao carregar cupom usado:",
                couponError,
            );
        } else if (coupon) {
            const { error: updateCouponError } =
                await supabase
                    .from("coupons")
                    .update({
                        usage_count:
                            Number(coupon.usage_count ?? 0) + 1,
                    })
                    .eq("id", order.coupon_id);

            if (updateCouponError) {
                console.error(
                    "Erro ao atualizar uso do cupom:",
                    updateCouponError,
                );
            }
        }
    }

    await sendPaidOrderEmail(orderId);
}

async function updateOrderFromPagBank(
    internalOrderId: string,
    pagBankOrder: PagBankOrder,
    fallbackTotal: number,
) {
    const supabase = createAdminClient();
    const payment =
        toCheckoutPayment(pagBankOrder, fallbackTotal);

    if (
        payment.status === "paid" ||
        payment.status === "declined" ||
        payment.status === "expired"
    ) {
        const databaseStatus =
            payment.status === "paid"
                ? "paid"
                : payment.status;

        const { error } = await supabase
            .from("orders")
            .update({
                status: databaseStatus,
            })
            .eq("id", internalOrderId)
            .eq("status", "pending");

        if (error) {
            console.error(
                "Erro ao atualizar status do pedido:",
                error,
            );
        }

        if (payment.status === "paid") {
            await finalizePaidOrder(internalOrderId);
        }
    }

    return payment;
}

export async function createOrder(
    input: CreateOrderInput,
): Promise<ActionResult<{ payment: CheckoutPayment }>> {
    try {
        const attemptId =
            input.attemptId.trim();

        if (
            !/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(attemptId)
        ) {
            return {
                success: false,
                error: "A tentativa de pagamento é inválida.",
            };
        }

        const supabase = createAdminClient();

        const {
            data: existingOrder,
            error: existingOrderError,
        } = await supabase
            .from("orders")
            .select("id, payment_id, total, status")
            .eq("id", attemptId)
            .maybeSingle();

        if (existingOrderError) {
            console.error(
                "Erro ao verificar tentativa anterior:",
                existingOrderError,
            );

            return {
                success: false,
                error:
                    "Não foi possível recuperar a tentativa de pagamento.",
            };
        }

        if (existingOrder) {
            if (!existingOrder.payment_id) {
                return {
                    success: false,
                    error:
                        "Esta tentativa ainda está sendo processada. Aguarde alguns instantes e tente verificar o pagamento.",
                };
            }

            const pagBankOrder =
                await pagBankRequest<PagBankOrder>(
                    `/orders/${encodeURIComponent(
                        existingOrder.payment_id,
                    )}`,
                );

            const payment =
                await updateOrderFromPagBank(
                    attemptId,
                    pagBankOrder,
                    Number(existingOrder.total),
                );

            return {
                success: true,
                payment,
            };
        }

        const authSupabase =
            await createClient();

        const {
            data: { user },
            error: authError,
        } = await authSupabase.auth.getUser();

        if (authError) {
            console.error(
                "Erro ao verificar usuário:",
                authError,
            );
        }

        const userId = user?.id ?? null;

        let isWholesale = false;
        let wholesaleApplicationId: string | null =
            null;

        if (userId) {
            const {
                data: wholesaleApplication,
                error: wholesaleError,
            } = await supabase
                .from("wholesale_applications")
                .select("id, status")
                .eq("user_id", userId)
                .maybeSingle();

            if (wholesaleError) {
                console.error(
                    "Erro ao verificar atacadista:",
                    wholesaleError,
                );

                return {
                    success: false,
                    error:
                        "Não foi possível validar sua conta.",
                };
            }

            isWholesale =
                wholesaleApplication?.status === "approved";

            wholesaleApplicationId =
                isWholesale
                    ? wholesaleApplication?.id ?? null
                    : null;
        }

        const customerName =
            input.customerName.trim();

        const customerEmail =
            input.customerEmail.trim().toLowerCase();

        const customerTaxId =
            input.customerTaxId.replace(/\D/g, "");

        const shippingAddress = {
            postalCode:
                input.shippingAddress.postalCode.replace(
                    /\D/g,
                    "",
                ),
            street: input.shippingAddress.street.trim(),
            number: input.shippingAddress.number.trim(),
            complement:
                input.shippingAddress.complement.trim(),
            neighborhood:
                input.shippingAddress.neighborhood.trim(),
            city: input.shippingAddress.city.trim(),
            state:
                input.shippingAddress.state
                    .trim()
                    .toUpperCase(),
        };

        if (!customerName) {
            return {
                success: false,
                error: "Informe seu nome.",
            };
        }

        if (!customerEmail) {
            return {
                success: false,
                error: "Informe seu e-mail.",
            };
        }

        if (
            customerTaxId.length !== 11 &&
            customerTaxId.length !== 14
        ) {
            return {
                success: false,
                error: "Informe um CPF ou CNPJ válido.",
            };
        }

        if (shippingAddress.postalCode.length !== 8) {
            return {
                success: false,
                error: "Informe um CEP válido.",
            };
        }

        if (
            !shippingAddress.street ||
            !shippingAddress.number ||
            !shippingAddress.neighborhood ||
            !shippingAddress.city ||
            shippingAddress.state.length !== 2
        ) {
            return {
                success: false,
                error:
                    "Confira os dados do endereço de entrega.",
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
                    Number.isInteger(item.quantity) &&
                    item.quantity > 0,
            );

        if (
            validItems.length !== input.items.length
        ) {
            return {
                success: false,
                error:
                    "Existem itens inválidos no carrinho.",
            };
        }

        if (
            input.paymentMethod === "card" &&
            !input.card?.encrypted
        ) {
            return {
                success: false,
                error:
                    "Não foi possível validar os dados do cartão.",
            };
        }

        const productIds = [
            ...new Set(
                validItems.map((item) => item.productId),
            ),
        ];

        const {
            data: products,
            error: productsError,
        } = await supabase
            .from("products")
            .select(`
                id,
                name,
                price,
                wholesale_price,
                wholesale_only,
                stock
            `)
            .in("id", productIds);

        if (productsError) {
            console.error(
                "Erro ao carregar produtos:",
                productsError,
            );

            return {
                success: false,
                error:
                    "Não foi possível validar os produtos.",
            };
        }

        if (
            !products ||
            products.length !== productIds.length
        ) {
            return {
                success: false,
                error:
                    "Um ou mais produtos não estão mais disponíveis.",
            };
        }

        const productsMap = new Map(
            products.map((product) => [
                product.id,
                product,
            ]),
        );

        let subtotal = 0;

        const orderItems: {
            product_id: string;
            product_name: string;
            unit_price: number;
            quantity: number;
        }[] = [];

        for (const item of validItems) {
            const product =
                productsMap.get(item.productId);

            if (!product) {
                return {
                    success: false,
                    error: "Produto não encontrado.",
                };
            }

            if (product.stock < item.quantity) {
                return {
                    success: false,
                    error:
                        `Só existem ${product.stock} unidade(s) de ${product.name} disponíveis.`,
                };
            }

            if (
                product.wholesale_only &&
                !isWholesale
            ) {
                return {
                    success: false,
                    error:
                        `${product.name} é exclusivo para clientes atacadistas.`,
                };
            }

            const hasWholesalePrice =
                product.wholesale_price !== null;

            const unitPrice =
                isWholesale && hasWholesalePrice
                    ? Number(product.wholesale_price)
                    : Number(product.price);

            if (
                !Number.isFinite(unitPrice) ||
                unitPrice < 0
            ) {
                return {
                    success: false,
                    error:
                        `O preço de ${product.name} é inválido.`,
                };
            }

            subtotal += unitPrice * item.quantity;

            orderItems.push({
                product_id: product.id,
                product_name: product.name,
                unit_price: unitPrice,
                quantity: item.quantity,
            });
        }

        const couponCode =
            input.couponCode
                ?.trim()
                .toUpperCase() || null;

        let couponId: string | null = null;
        let appliedCouponCode: string | null = null;
        let discountAmount = 0;
        let couponUsageCount: number | null = null;

        if (couponCode) {
            const {
                data: coupon,
                error: couponError,
            } = await supabase
                .from("coupons")
                .select(`
                    id,
                    code,
                    discount_type,
                    discount_value,
                    minimum_order_value,
                    starts_at,
                    expires_at,
                    max_uses,
                    usage_count,
                    wholesale_only,
                    active
                `)
                .eq("code", couponCode)
                .maybeSingle();

            if (couponError) {
                console.error(
                    "Erro ao validar cupom:",
                    couponError,
                );

                return {
                    success: false,
                    error:
                        "Não foi possível validar o cupom.",
                };
            }

            if (!coupon || !coupon.active) {
                return {
                    success: false,
                    error: "Cupom inválido ou inativo.",
                };
            }

            const now = new Date();

            if (
                coupon.starts_at &&
                new Date(coupon.starts_at) > now
            ) {
                return {
                    success: false,
                    error:
                        "Este cupom ainda não está disponível.",
                };
            }

            if (
                coupon.expires_at &&
                new Date(coupon.expires_at) < now
            ) {
                return {
                    success: false,
                    error: "Este cupom expirou.",
                };
            }

            const usageCount =
                Number(coupon.usage_count) || 0;

            if (
                coupon.max_uses !== null &&
                usageCount >= coupon.max_uses
            ) {
                return {
                    success: false,
                    error:
                        "Este cupom atingiu o limite de usos.",
                };
            }

            const minimumOrderValue =
                Number(coupon.minimum_order_value) || 0;

            if (subtotal < minimumOrderValue) {
                return {
                    success: false,
                    error:
                        `Este cupom exige um pedido mínimo de ${minimumOrderValue.toLocaleString(
                            "pt-BR",
                            {
                                style: "currency",
                                currency: "BRL",
                            },
                        )}.`,
                };
            }

            if (
                coupon.wholesale_only &&
                !isWholesale
            ) {
                return {
                    success: false,
                    error:
                        "Este cupom é exclusivo para clientes atacadistas.",
                };
            }

            const discountValue =
                Number(coupon.discount_value);

            if (
                !Number.isFinite(discountValue) ||
                discountValue <= 0
            ) {
                return {
                    success: false,
                    error:
                        "Este cupom possui um desconto inválido.",
                };
            }

            if (
                coupon.discount_type === "percentage"
            ) {
                discountAmount =
                    subtotal * (discountValue / 100);
            } else if (
                coupon.discount_type === "fixed"
            ) {
                discountAmount = discountValue;
            } else {
                return {
                    success: false,
                    error:
                        "Este cupom possui um tipo de desconto inválido.",
                };
            }

            discountAmount = Math.round(
                Math.min(discountAmount, subtotal) * 100,
            ) / 100;

            couponId = coupon.id;
            appliedCouponCode = coupon.code;
            couponUsageCount = usageCount;
        }

        const shipping = Number(input.shipping.price);

        if (
            !Number.isFinite(shipping) ||
            shipping < 0
        ) {
            return {
                success: false,
                error: "Frete inválido.",
            };
        }

        const discountedSubtotal =
            Math.max(0, subtotal - discountAmount);

        const total =
            discountedSubtotal + shipping;

        if (!Number.isFinite(total) || total <= 0) {
            return {
                success: false,
                error:
                    "O valor total do pedido é inválido.",
            };
        }

        const {
            data: order,
            error: orderError,
        } = await supabase
            .from("orders")
            .insert({
                id: attemptId,
                user_id: userId,
                wholesale_application_id:
                    wholesaleApplicationId,
                customer_name: customerName,
                customer_email: customerEmail,
                shipping_address: shippingAddress,
                shipping,
                shipping_service: input.shipping.name,
                shipping_company: input.shipping.company,
                shipping_delivery_time:
                    input.shipping.deliveryTime,
                subtotal,
                coupon_id: couponId,
                coupon_code: appliedCouponCode,
                discount_amount: discountAmount,
                total,
                status: "pending",
                payment_provider: "pagbank",
            })
            .select("id")
            .single();

        if (orderError || !order) {
            console.error(
                "Erro ao criar pedido:",
                orderError,
            );

            return {
                success: false,
                error:
                    "Não foi possível criar o pedido.",
            };
        }

        const {
            error: itemsError,
        } = await supabase
            .from("order_items")
            .insert(
                orderItems.map((item) => ({
                    ...item,
                    order_id: order.id,
                })),
            );

        if (itemsError) {
            console.error(
                "Erro ao criar itens do pedido:",
                itemsError,
            );

            await supabase
                .from("orders")
                .delete()
                .eq("id", order.id);

            return {
                success: false,
                error:
                    "Não foi possível salvar os itens do pedido.",
            };
        }

        const chargeValue =
            Math.round(total * 100);

        const paymentMethod =
            input.paymentMethod === "pix"
                ? {
                        type: "PIX",
                        pix: {
                            expiration_date:
                                new Date(
                                    Date.now() +
                                        24 * 60 * 60 * 1000,
                                ).toISOString(),
                        },
                    }
                : {
                        type: "CREDIT_CARD",
                        installments: 1,
                        capture: true,
                        card: {
                            encrypted:
                                input.card!.encrypted,
                            store: false,
                            holder: {
                                name:
                                    input.card!.holderName,
                                tax_id:
                                    input.card!.holderTaxId
                                        .replace(/\D/g, ""),
                            },
                        },
                    };

        const pagBankPayload = {
            reference_id: attemptId,
            customer: {
                name: customerName,
                email: customerEmail,
                tax_id: customerTaxId,
            },
            items: orderItems.map((item) => ({
                reference_id: item.product_id,
                name: item.product_name,
                quantity: item.quantity,
                unit_amount:
                    Math.round(item.unit_price * 100),
            })),
            shipping: {
                address: {
                    street: shippingAddress.street,
                    number: shippingAddress.number,
                    complement:
                        shippingAddress.complement || undefined,
                    locality:
                        shippingAddress.neighborhood,
                    city: shippingAddress.city,
                    region_code: shippingAddress.state,
                    country: "BRA",
                    postal_code:
                        shippingAddress.postalCode,
                },
            },
            charges: [
                {
                    reference_id: attemptId,
                    description: "Pedido Casa Elefante",
                    amount: {
                        value: chargeValue,
                        currency: "BRL",
                    },
                    payment_method: paymentMethod,
                },
            ],
        };

        const pagBankOrder =
            await pagBankRequest<PagBankOrder>(
                "/orders",
                {
                    method: "POST",
                    headers: {
                        "x-idempotency-key":
                            attemptId.replace(/-/g, ""),
                    },
                    body: JSON.stringify(pagBankPayload),
                },
            );

        if (!pagBankOrder.id) {
            throw new Error(
                "O PagBank não retornou o identificador do pedido.",
            );
        }

        const { error: providerUpdateError } =
            await supabase
                .from("orders")
                .update({
                    payment_id: pagBankOrder.id,
                })
                .eq("id", order.id);

        if (providerUpdateError) {
            console.error(
                "Erro ao salvar o ID do pedido PagBank:",
                providerUpdateError,
            );

            throw new Error(
                "O pagamento foi criado, mas não foi possível salvar sua referência. Entre em contato com a loja.",
            );
        }

        const payment =
            await updateOrderFromPagBank(
                order.id,
                pagBankOrder,
                total,
            );

        return {
            success: true,
            payment,
        };
    } catch (error) {
        console.error(
            "Erro ao criar pedido ou pagamento:",
            error,
        );

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Não foi possível iniciar o pagamento.",
        };
    }
}

export async function checkPayment(
    attemptId: string,
): Promise<ActionResult<{ payment: CheckoutPayment }>> {
    try {
        const supabase = createAdminClient();

        const {
            data: order,
            error: orderError,
        } = await supabase
            .from("orders")
            .select("id, payment_id, total")
            .eq("id", attemptId)
            .maybeSingle();

        if (orderError) {
            console.error(
                "Erro ao localizar pedido:",
                orderError,
            );

            return {
                success: false,
                error:
                    "Não foi possível localizar o pedido.",
            };
        }

        if (!order?.payment_id) {
            return {
                success: false,
                error:
                    "Pagamento não encontrado.",
            };
        }

        const pagBankOrder =
            await pagBankRequest<PagBankOrder>(
                `/orders/${encodeURIComponent(
                    order.payment_id,
                )}`,
            );

        const payment =
            await updateOrderFromPagBank(
                order.id,
                pagBankOrder,
                Number(order.total),
            );

        return {
            success: true,
            payment,
        };
    } catch (error) {
        console.error(
            "Erro ao consultar pagamento:",
            error,
        );

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Não foi possível consultar o pagamento.",
        };
    }
}

export async function retryPayment(
    attemptId: string,
): Promise<ActionResult<{ payment: CheckoutPayment }>> {
    // A retentativa consulta a mesma cobrança; não cria outra cobrança.
    return checkPayment(attemptId);
}