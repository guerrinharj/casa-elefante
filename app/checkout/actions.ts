"use server";

import { createAdminClient } from "@/lib/supabase/admin";

type CheckoutItem = {
    productId: string;
    quantity: number;
};

type CreateOrderInput = {
    customerName: string;
    customerEmail: string;
    items: CheckoutItem[];
};

type CreateOrderResult =
    | {
          success: true;
          orderId: string;
      }
    | {
          success: false;
          error: string;
      };

export async function createOrder(
    input: CreateOrderInput,
): Promise<CreateOrderResult> {
    const customerName =
        input.customerName.trim();

    const customerEmail =
        input.customerEmail
            .trim()
            .toLowerCase();

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

    if (!input.items.length) {
        return {
            success: false,
            error: "Seu carrinho está vazio.",
        };
    }

    const validItems = input.items.filter(
        (item) =>
            item.productId &&
            Number.isInteger(item.quantity) &&
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
                (item) => item.productId,
            ),
        ),
    ];

    const supabase =
        await createAdminClient();

    const {
        data: products,
        error: productsError,
    } = await supabase
        .from("products")
        .select(`
            id,
            name,
            price,
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
            error: "Não foi possível validar os produtos.",
        };
    }

    if (
        !products ||
        products.length !==
            productIds.length
    ) {
        return {
            success: false,
            error: "Um ou mais produtos não estão mais disponíveis.",
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
            productsMap.get(
                item.productId,
            );

        if (!product) {
            return {
                success: false,
                error: "Produto não encontrado.",
            };
        }

        if (
            product.stock <
            item.quantity
        ) {
            return {
                success: false,
                error: `Só existem ${product.stock} unidade(s) de ${product.name} disponíveis.`,
            };
        }

        const unitPrice = Number(
            product.price,
        );

        subtotal +=
            unitPrice *
            item.quantity;

        orderItems.push({
            product_id:
                product.id,
            product_name:
                product.name,
            unit_price:
                unitPrice,
            quantity:
                item.quantity,
        });
    }

    const shipping = 0;

    const total =
        subtotal + shipping;

    const {
        data: order,
        error: orderError,
    } = await supabase
        .from("orders")
        .insert({
            customer_name:
                customerName,
            customer_email:
                customerEmail,
            status: "pending",
            payment_provider:
                "dummy",
            payment_id: null,
            subtotal,
            shipping,
            total,
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
            error: "Não foi possível criar o pedido.",
        };
    }

    const {
        error: itemsError,
    } = await supabase
        .from("order_items")
        .insert(
            orderItems.map(
                (item) => ({
                    ...item,
                    order_id:
                        order.id,
                }),
            ),
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
            error: "Não foi possível salvar os itens do pedido.",
        };
    }

    return {
        success: true,
        orderId: order.id,
    };
}