import {
    NextResponse,
} from "next/server";

import {
    timingSafeEqual,
} from "node:crypto";

import {
    createAdminClient,
} from "@/lib/supabase/admin";

import {
    processPaymentAttempt,
    type PaymentRow,
} from "@/lib/pagbank-payments";

export const runtime = "nodejs";

export const maxDuration = 60;

export async function GET(
    request: Request,
) {
    const secret =
        process.env.CRON_SECRET;

    const authorization =
            request.headers.get(
            "authorization",
        ) ?? "";

    const expected =
            secret
            ? `Bearer ${secret}`
        : "";

    if (
        !secret ||
        authorization.length !==
        expected.length ||
        !timingSafeEqual(
            Buffer.from(authorization),
            Buffer.from(expected),
        )
    ) {
        return NextResponse.json(
        {
            error:
            "Não autorizado.",
        },
        {
            status: 401,
        },
        );
    }

    const db =
        createAdminClient();

    const { data, error } = await db
        .from("pagbank_payments")
        .select("*")
        .or(
            "state.in.(prepared,waiting,uncertain),and(state.eq.paid,email_sent_at.is.null)",
        )
        .order(
            "updated_at",
            {
                ascending: true,
            },
        )
        .limit(4);

    if (error) {
        return NextResponse.json(
            {
                error:
                "Falha na consulta.",
            },
            {
                status: 503,
            },
        );
    }

    const results =
        await Promise.allSettled(
        (data as PaymentRow[]).map(
            async (row) => {
            try {
                await processPaymentAttempt(
                    row,
                    true,
                );
            } finally {
                await db
                .from("pagbank_payments")
                .update({
                    updated_at:
                    new Date().toISOString(),
                })
                .eq(
                    "order_id",
                    row.order_id,
                );
            }
            },
        ),
        );

    return NextResponse.json({
        checked:
        results.length,

        failed:
        results.filter(
                (result) =>
                result.status ===
                "rejected",
        ).length,
    });
}