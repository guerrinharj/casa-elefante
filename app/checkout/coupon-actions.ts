"use server";

import {
    createAdminClient,
} from "@/lib/supabase/admin";

import {
    createClient,
} from "@/lib/supabase/server";

type ValidateCouponInput = {
    code: string;
    subtotal: number;
};

type ValidateCouponResult =
    | {
          success: true;
          coupon: {
              id: string;
              code: string;
              discountAmount: number;
          };
      }
    | {
          success: false;
          error: string;
      };

export async function validateCoupon({
    code,
    subtotal,
}: ValidateCouponInput): Promise<ValidateCouponResult> {
    const normalizedCode =
        code.trim().toUpperCase();

    if (!normalizedCode) {
        return {
            success: false,
            error: "Informe um cupom.",
        };
    }

    if (
        !Number.isFinite(subtotal) ||
        subtotal <= 0
    ) {
        return {
            success: false,
            error: "Seu carrinho está vazio.",
        };
    }

    const supabase =
        createAdminClient();

    const {
        data: coupon,
        error,
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
        .eq(
            "code",
            normalizedCode,
        )
        .maybeSingle();

    if (error) {
        console.error(
            "Erro ao buscar cupom:",
            error,
        );

        return {
            success: false,
            error: "Não foi possível validar o cupom.",
        };
    }

    if (!coupon) {
        return {
            success: false,
            error: "Cupom inválido.",
        };
    }

    if (!coupon.active) {
        return {
            success: false,
            error: "Este cupom está inativo.",
        };
    }

    const now =
        new Date();

    if (
        coupon.starts_at &&
        new Date(
            coupon.starts_at,
        ) > now
    ) {
        return {
            success: false,
            error: "Este cupom ainda não está disponível.",
        };
    }

    if (
        coupon.expires_at &&
        new Date(
            coupon.expires_at,
        ) < now
    ) {
        return {
            success: false,
            error: "Este cupom expirou.",
        };
    }

    if (
        coupon.max_uses !== null &&
        coupon.usage_count >=
            coupon.max_uses
    ) {
        return {
            success: false,
            error: "Este cupom atingiu o limite de usos.",
        };
    }

    const minimumOrderValue =
        Number(
            coupon.minimum_order_value ??
                0,
        );

    if (
        subtotal <
        minimumOrderValue
    ) {
        return {
            success: false,
            error: `Este cupom exige um pedido mínimo de ${minimumOrderValue.toLocaleString(
                "pt-BR",
                {
                    style: "currency",
                    currency:
                        "BRL",
                },
            )}.`,
        };
    }

    /*
     * Se o cupom for exclusivo
     * para atacadistas, precisamos
     * verificar o usuário atual.
     */

    if (coupon.wholesale_only) {
        const authSupabase =
            await createClient();

        const {
            data: {
                user,
            },
        } =
            await authSupabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                error: "Este cupom é exclusivo para clientes atacadistas.",
            };
        }

        const {
            data:
                wholesaleApplication,
            error:
                wholesaleError,
        } = await supabase
            .from(
                "wholesale_applications",
            )
            .select(
                "status",
            )
            .eq(
                "user_id",
                user.id,
            )
            .maybeSingle();

        if (wholesaleError) {
            console.error(
                "Erro ao validar atacadista:",
                wholesaleError,
            );

            return {
                success: false,
                error: "Não foi possível validar o cupom.",
            };
        }

        if (
            wholesaleApplication?.status !==
            "approved"
        ) {
            return {
                success: false,
                error: "Este cupom é exclusivo para clientes atacadistas.",
            };
        }
    }

    const discountValue =
        Number(
            coupon.discount_value,
        );

    let discountAmount = 0;

    if (
        coupon.discount_type ===
        "percentage"
    ) {
        discountAmount =
            subtotal *
            (discountValue /
                100);
    } else {
        discountAmount =
            discountValue;
    }

    /*
     * O desconto nunca pode
     * ultrapassar o subtotal.
     */

    discountAmount =
        Math.min(
            discountAmount,
            subtotal,
        );

    /*
     * Trabalhamos com centavos.
     */

    discountAmount =
        Math.round(
            discountAmount * 100,
        ) / 100;

    return {
        success: true,
        coupon: {
            id: coupon.id,
            code: coupon.code,
            discountAmount,
        },
    };
}