import "server-only";

import { createHash } from "node:crypto";

import {
    createAdminClient,
} from "@/lib/supabase/admin";

import {
    orderPaidEmail,
} from "@/lib/emails/order-paid";

import { resend } from "@/lib/resend";

import {
    createPagBankOrder,
    getPagBankOrder,
    PagBankError,
    type PagBankOrder,
} from "@/lib/pagbank";

import type {
    CheckoutPayment,
} from "@/lib/payment-types";

export type PaymentRow = {
    order_id: string;
    attempt_hash: string;
    method: "pix" | "card";
    state: string;
    provider_id: string | null;
    payload: Record<string, unknown> | null;
    pix: CheckoutPayment["pix"] | null;
    created_at: string;
};

export function hashPaymentAttempt(
    secret: string,
) {
    if (
        !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        secret,
        )
    ) {
        throw new Error(
            "Tentativa de pagamento inválida.",
        );
    }

    return createHash("sha256")
        .update(secret)
        .digest("hex");
}

export async function findPaymentAttempt(
    secret: string,
): Promise<PaymentRow | null> {
    const { data, error } =
        await createAdminClient()
            .from("pagbank_payments")
            .select("*")
            .eq(
                "attempt_hash",
                hashPaymentAttempt(secret),
            )
            .maybeSingle();

    if (error) {
        throw new Error(
            "Não foi possível consultar a tentativa de pagamento.",
        );
    }

    return data as PaymentRow | null;
}

export async function sendPaidEmail(
    orderId: string,
    ) {
    const db = createAdminClient();

    const {
        data: claimed,
        error: claimError,
    } = await db.rpc(
                "pagbank_claim_email",
            {
                p_order_id: orderId,
            },
    );

    if (claimError) {
        throw new Error(
            "Não foi possível reservar o envio do e-mail.",
        );
    }

    if (!claimed) {
        return;
    }

    try {
        const { data: order, error } = await db
            .from("orders")
            .select("*")
            .eq("id", orderId)
            .single();

    const {
        data: items,
        error: itemsError,
        } = await db
            .from("order_items")
            .select(
                "product_name,unit_price,quantity",
            )
            .eq("order_id", orderId);

        if (
            error ||
            itemsError ||
            !order ||
            !items
        ) {
        throw new Error(
            "Pedido não encontrado para o e-mail.",
        );
    }

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

                orderId,

                subtotal:
                Number(order.subtotal),

                couponCode:
                order.coupon_code,

                discountAmount:
                Number(order.discount_amount),

                shipping:
                Number(order.shipping),

                total:
                Number(order.total),

                items: items.map((item) => ({
                ...item,

                unit_price:
                    Number(item.unit_price),
                })),
            }),
            },
            {
            idempotencyKey:
                `order-paid/${orderId}`,
            },
    );

    if (emailError) {
        throw new Error(
            "Falha no envio do e-mail.",
        );
    }

    const { error: saved } = await db
        .from("pagbank_payments")
        .update({
            email_sent_at:
            new Date().toISOString(),
        })
        .eq("order_id", orderId);

        if (saved) {
            throw new Error(
                "Falha ao registrar envio do e-mail.",
            );
        }
    } catch {
        await db
            .from("pagbank_payments")
            .update({
                email_claimed_at: null,
            })
            .eq("order_id", orderId);

        console.error(
            "E-mail de pedido pago pendente:",
            orderId,
        );
    }
}

export async function syncPagBankOrder(
  snapshot: PagBankOrder,
) {
  const db = createAdminClient();

  if (
    !snapshot.reference_id ||
    !/^ORDE_[A-Za-z0-9-]+$/.test(
      snapshot.id,
    )
  ) {
    throw new Error(
      "Referência PagBank inválida.",
    );
  }

  const {
    data: payment,
    error,
  } = await db
    .from("pagbank_payments")
    .select("*")
    .eq(
      "order_id",
      snapshot.reference_id,
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      "Falha ao localizar pagamento.",
    );
  }

  if (!payment) {
    return;
  }

  if (
    payment.provider_id &&
    payment.provider_id !== snapshot.id
  ) {
    throw new Error("Pedido divergente.");
  }

  const {
    data: order,
    error: orderError,
  } = await db
    .from("orders")
    .select("total")
    .eq("id", payment.order_id)
    .single();

  if (orderError || !order) {
    throw new Error(
      "Pedido local não encontrado.",
    );
  }

  const cents = Math.round(
    Number(order.total) * 100,
  );

  const charges = snapshot.charges ?? [];

  const paid = charges.filter(
    (charge) => charge.status === "PAID",
  );

  let state = "waiting";

  if (paid.length) {
    if (
      paid.length !== 1 ||
      paid[0].amount.currency !== "BRL" ||
      paid[0].amount.value !== cents
    ) {
      throw new Error(
        "Valor pago divergente do pedido.",
      );
    }

    state = "paid";
  } else if (
    charges.length &&
    charges.every((charge) =>
      ["DECLINED", "CANCELED"].includes(
        charge.status,
      ),
    )
  ) {
    state =
      payment.method === "pix" &&
      charges.every(
        (charge) =>
          charge.status === "CANCELED",
      )
        ? "expired"
        : "declined";
  }

  const pixCharge = charges.find(
    (charge) =>
      charge.payment_method?.type === "PIX",
  );

  const qr = pixCharge?.qr_code;

  const pix = qr
    ? {
        text: qr.text,

        imageUrl:
          pixCharge?.links?.find(
            (link) =>
              link.rel === "QRCODE.PNG",
          )?.href,

        expiresAt:
          pixCharge?.payment_method?.pix
            ?.expiration_date,
      }
    : null;

  const { error: settleError } =
    await db.rpc("pagbank_settle", {
      p_order_id: payment.order_id,
      p_provider_id: snapshot.id,
      p_state: state,
      p_pix: pix,
    });

  if (settleError) {
    throw new Error(
      "Falha ao confirmar pagamento no banco.",
    );
  }

  if (state === "paid") {
    await sendPaidEmail(
      payment.order_id,
    );
  }
}

export async function paymentView(
  row: PaymentRow,
): Promise<CheckoutPayment> {
  const db = createAdminClient();

  const {
    data: current,
    error,
  } = await db
    .from("pagbank_payments")
    .select("*")
    .eq("order_id", row.order_id)
    .single();

  const {
    data: order,
    error: orderError,
  } = await db
    .from("orders")
    .select("total")
    .eq("id", row.order_id)
    .single();

  if (
    error ||
    orderError ||
    !current ||
    !order
  ) {
    throw new Error(
      "Falha ao consultar pagamento.",
    );
  }

  const status:
    CheckoutPayment["status"] =
      current.state === "paid"
        ? "paid"
        : current.state === "declined"
          ? "declined"
          : current.state === "expired"
            ? "expired"
            : current.state === "waiting"
              ? "pending"
              : "unknown";

  return {
    orderId: row.order_id,
    method: current.method,
    status,
    total: Number(order.total),
    pix: current.pix ?? undefined,
  };
}

export async function processPaymentAttempt(
  row: PaymentRow,
  allowCreate: boolean,
): Promise<CheckoutPayment> {
  const db = createAdminClient();

  if (row.state === "paid") {
    await sendPaidEmail(row.order_id);
    return paymentView(row);
  }

  if (
    ["declined", "expired"].includes(
      row.state,
    )
  ) {
    return paymentView(row);
  }

  if (row.provider_id) {
    await syncPagBankOrder(
      await getPagBankOrder(
        row.provider_id,
      ),
    );
  } else if (
    allowCreate &&
    row.payload
  ) {
    if (
      Date.now() -
        Date.parse(row.created_at) >
      60 * 60_000
    ) {
      return paymentView(row);
    }

    let snapshot: PagBankOrder;

    try {
        snapshot =
            await createPagBankOrder(
                row.payload,
                row.order_id,
            );
    } catch (error) {
        if (
            error instanceof PagBankError &&
            [400, 401, 403, 422].includes(
            error.status,
            )
        ) {
        const {
            error: releaseError,
            } = await db.rpc(
            "pagbank_settle",
            {
                p_order_id: row.order_id,
                p_provider_id: null,
                p_state: "declined",
                p_pix: null,
            },
        );

        if (releaseError) {
            throw new Error(
                "Falha ao liberar reserva do pedido recusado.",
            );
            }
        } else {
        // Timeout não significa pagamento recusado.
        const { error: saved } = await db
            .from("pagbank_payments")
            .update({
                state: "uncertain",

                updated_at:
                new Date().toISOString(),
            })
            .eq(
                "order_id",
                row.order_id,
            )
            .in("state", [
                "prepared",
                "uncertain",
            ]);

            if (saved) {
            throw new Error(
                "Falha ao registrar pagamento pendente.",
            );
            }
        }

        return paymentView(row);
    }

    const { error: saved } = await db
        .from("pagbank_payments")
        .update({
            provider_id: snapshot.id,
        })
        .eq("order_id", row.order_id);

        if (saved) {
        throw new Error(
            "Falha ao salvar referência do pagamento.",
        );
        }

        await syncPagBankOrder(snapshot);
    }

    return paymentView(row);
}