import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { orderPaidEmail } from "@/lib/emails/order-paid";
import { resend } from "@/lib/resend";
import type { CheckoutPayment } from "@/lib/payment-types";

export type CheckoutPagBankOrder = {
    id?: string;
    reference_id?: string;
    charges?: {
        id?: string;
        status?: string;
        amount?: {
            value?: number;
            currency?: string;
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

// Converte status da cobrança para o formato interno.
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

// Extrai código PIX, imagem e expiração.
function getPixDetails(
    pagBankOrder: CheckoutPagBankOrder,
) {
    const charge = pagBankOrder.charges?.[0];

    const qrCode =
        pagBankOrder.qr_codes?.[0] ??
        charge?.qr_code;

    const links = [
        ...(pagBankOrder.qr_codes?.[0]?.links ?? []),
        ...(charge?.links ?? []),
    ];

    const imageUrl = links.find(
        (link) =>
            link.rel?.toUpperCase() === "QRCODE.PNG",
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

// Constrói o objeto de pagamento utilizado pelo checkout.
function toCheckoutPayment(
    pagBankOrder: CheckoutPagBankOrder,
    fallbackTotal: number,
): CheckoutPayment {
    const charge = pagBankOrder.charges?.[0];

    const isPix =
        Boolean(pagBankOrder.qr_codes?.length) ||
        charge?.payment_method?.type === "PIX";

    const status = isPix && !charge
        ? "pending"
        : mapPaymentStatus(charge?.status);

    const total =
        typeof charge?.amount?.value === "number"
            ? charge.amount.value / 100
            : fallbackTotal;

    return {
        orderId: pagBankOrder.id ?? "",
        method: isPix ? "pix" : "card",
        status,
        total,
        pix: isPix
            ? getPixDetails(pagBankOrder)
            : undefined,
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

// Processa estoque, cupom e chama o envio de e-mail.
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
        .eq("status", "paid")
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

// Atualiza o status do pedido e aciona a finalização quando pago.
export async function updateOrderFromPagBank(
    internalOrderId: string,
    pagBankOrder: CheckoutPagBankOrder,
    fallbackTotal: number,
) {
    const supabase = createAdminClient();

    const payment = toCheckoutPayment(
        pagBankOrder,
        fallbackTotal,
    );

    if (payment.method === "card") {
        const charge = pagBankOrder.charges?.[0];

        if (
            pagBankOrder.reference_id !== internalOrderId ||
            !pagBankOrder.id ||
            !/^ORDE_[A-Za-z0-9-]+$/.test(pagBankOrder.id) ||
            pagBankOrder.charges?.length !== 1 ||
            charge?.payment_method?.type !== "CREDIT_CARD" ||
            charge.amount?.currency !== "BRL" ||
            charge.amount.value !== Math.round(fallbackTotal * 100)
        ) {
            throw new Error("Os dados da cobrança PagBank divergem do pedido.");
        }
    }

    if (
        payment.status === "paid" ||
        payment.status === "declined" ||
        payment.status === "expired"
    ) {
        const databaseStatus = payment.status;

        const update = supabase
            .from("orders")
            .update({
                status: databaseStatus,
                ...(payment.method === "card" ? { payment_id: pagBankOrder.id } : {}),
            })
            .eq("id", internalOrderId)
            .eq("status", "pending");

        if (payment.method === "card") {
            update.or(`payment_id.is.null,payment_id.eq.${pagBankOrder.id}`);
        }

        const { data: updatedOrder, error } = await update.select("id").maybeSingle();

        if (error) {
            throw new Error("Não foi possível atualizar o status do pedido.");
        }

        if (
            payment.status === "paid" &&
            updatedOrder &&
            !error
        ) {
            console.log(
                "[PAGBANK] Pagamento confirmado:",
                internalOrderId,
            );

            await finalizePaidOrder(internalOrderId);
        }
    }

    return payment;
}
