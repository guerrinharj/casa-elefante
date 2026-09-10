"use server";

import { createAdminClient } from "@/lib/supabase/admin";

import { orderPaidEmail } from "@/lib/emails/order-paid";

import { resend } from "@/lib/resend";

/*
 * Item recebido do carrinho.
 */

type CheckoutItem = {
    productId: string;
    quantity: number;
};

/*
 * Dados recebidos pelo checkout.
 */

type CreateOrderInput = {
    /*
     * Dados pessoais
     */

    customerName: string;
    customerEmail: string;

    /*
     * Endereço de entrega
     */

    shippingAddress: {
        postalCode: string;
        street: string;
        number: string;
        complement: string;
        neighborhood: string;
        city: string;
        state: string;
    };

    /*
     * Produtos do carrinho
     */

    items: CheckoutItem[];
};

/*
 * Resultado retornado
 * para o CheckoutForm.
 */

type CreateOrderResult =
    | {
          success: true;
          orderId: string;
      }
    | {
          success: false;
          error: string;
      };

/*
 * Cria o pedido.
 */

export async function createOrder(
    input: CreateOrderInput,
): Promise<CreateOrderResult> {
    /*
     * Normaliza o nome
     * do cliente.
     */

    const customerName =
        input.customerName.trim();

    /*
     * Normaliza o e-mail.
     */

    const customerEmail =
        input.customerEmail
            .trim()
            .toLowerCase();

    /*
     * Normaliza todos os campos
     * do endereço.
     */

    const shippingAddress = {
        postalCode:
            input.shippingAddress.postalCode
                .replace(
                    /\D/g,
                    "",
                ),

        street:
            input.shippingAddress.street.trim(),

        number:
            input.shippingAddress.number.trim(),

        complement:
            input.shippingAddress.complement.trim(),

        neighborhood:
            input.shippingAddress.neighborhood.trim(),

        city:
            input.shippingAddress.city.trim(),

        state:
            input.shippingAddress.state
                .trim()
                .toUpperCase(),
    };

    /*
     * Validação:
     * Nome.
     */

    if (!customerName) {
        return {
            success: false,
            error: "Informe seu nome.",
        };
    }

    /*
     * Validação:
     * E-mail.
     */

    if (!customerEmail) {
        return {
            success: false,
            error: "Informe seu e-mail.",
        };
    }

    /*
     * Validação:
     * CEP.
     */

    if (
        shippingAddress.postalCode.length !==
        8
    ) {
        return {
            success: false,
            error: "Informe um CEP válido.",
        };
    }

    /*
     * Validação:
     * Rua.
     */

    if (!shippingAddress.street) {
        return {
            success: false,
            error: "Informe a rua.",
        };
    }

    /*
     * Validação:
     * Número.
     */

    if (!shippingAddress.number) {
        return {
            success: false,
            error: "Informe o número.",
        };
    }

    /*
     * Validação:
     * Bairro.
     */

    if (
        !shippingAddress.neighborhood
    ) {
        return {
            success: false,
            error: "Informe o bairro.",
        };
    }

    /*
     * Validação:
     * Cidade.
     */

    if (!shippingAddress.city) {
        return {
            success: false,
            error: "Informe a cidade.",
        };
    }

    /*
     * Validação:
     * Estado.
     */

    if (
        shippingAddress.state.length !==
        2
    ) {
        return {
            success: false,
            error: "Informe um estado válido.",
        };
    }

    /*
     * Validação:
     * Carrinho vazio.
     */

    if (!input.items.length) {
        return {
            success: false,
            error: "Seu carrinho está vazio.",
        };
    }

    /*
     * Remove itens inválidos.
     */

    const validItems =
        input.items.filter(
            (item) =>
                item.productId &&
                Number.isInteger(
                    item.quantity,
                ) &&
                item.quantity > 0,
        );

    /*
     * Se algum item foi removido
     * pela validação, retornamos erro.
     */

    if (
        validItems.length !==
        input.items.length
    ) {
        return {
            success: false,
            error: "Existem itens inválidos no carrinho.",
        };
    }

    /*
     * IDs únicos dos produtos
     * presentes no carrinho.
     */

    const productIds = [
        ...new Set(
            validItems.map(
                (item) =>
                    item.productId,
            ),
        ),
    ];

    /*
     * Cliente administrativo
     * do Supabase.
     */

    const supabase =
        createAdminClient();

    /*
     * Busca os produtos diretamente
     * no banco.
     *
     * Nunca confiamos no preço
     * enviado pelo browser.
     */

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

    /*
     * Erro ao consultar
     * os produtos.
     */

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

    /*
     * Verifica se todos
     * os produtos existem.
     */

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

    /*
     * Cria um Map para localizar
     * rapidamente cada produto.
     */

    const productsMap =
        new Map(
            products.map(
                (product) => [
                    product.id,
                    product,
                ],
            ),
        );

    /*
     * Subtotal inicial.
     */

    let subtotal = 0;

    /*
     * Itens que serão salvos
     * na tabela order_items.
     */

    const orderItems: {
        product_id: string;
        product_name: string;
        unit_price: number;
        quantity: number;
    }[] = [];

    /*
     * Valida estoque,
     * calcula subtotal
     * e prepara os itens.
     */

    for (const item of validItems) {
        const product =
            productsMap.get(
                item.productId,
            );

        /*
         * Produto não encontrado.
         */

        if (!product) {
            return {
                success: false,
                error: "Produto não encontrado.",
            };
        }

        /*
         * Verifica estoque.
         */

        if (
            product.stock <
            item.quantity
        ) {
            return {
                success: false,
                error: `Só existem ${product.stock} unidade(s) de ${product.name} disponíveis.`,
            };
        }

        /*
         * Converte o preço
         * para número.
         */

        const unitPrice =
            Number(
                product.price,
            );

        /*
         * Soma ao subtotal.
         */

        subtotal +=
            unitPrice *
            item.quantity;

        /*
         * Prepara o item
         * para salvar no pedido.
         */

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

    /*
     * Frete.
     *
     * Ainda está temporariamente
     * como zero.
     *
     * No próximo passo vamos
     * validar novamente no servidor
     * a modalidade escolhida
     * no Melhor Envio.
     */

    const shipping = 0;

    /*
     * Total do pedido.
     */

    const total =
        subtotal + shipping;

    /*
     * Cria o pedido
     * na tabela orders.
     */

    const {
        data: order,
        error: orderError,
    } = await supabase
        .from("orders")
        .insert({
            /*
             * Cliente
             */

            customer_name:
                customerName,

            customer_email:
                customerEmail,

            /*
             * Endereço
             */

            postal_code:
                shippingAddress.postalCode,

            street:
                shippingAddress.street,

            address_number:
                shippingAddress.number,

            complement:
                shippingAddress.complement ||
                null,

            neighborhood:
                shippingAddress.neighborhood,

            city:
                shippingAddress.city,

            state:
                shippingAddress.state,

            /*
             * Pedido
             */

            status: "pending",

            /*
             * Pagamento dummy
             */

            payment_provider:
                "dummy",

            payment_id:
                null,

            /*
             * Valores
             */

            subtotal,
            shipping,
            total,
        })
        .select("id")
        .single();



    /*
     * Erro ao criar
     * o pedido.
     */

    if (
        orderError ||
        !order
    ) {
        console.error(
            "Erro ao criar pedido:",
            orderError,
        );

        return {
            success: false,
            error: "Não foi possível criar o pedido.",
        };
    }

    /*
     * Cria os itens
     * do pedido.
     */

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

    /*
     * Se os itens falharem,
     * removemos o pedido criado.
     */

    if (itemsError) {
        console.error(
            "Erro ao criar itens do pedido:",
            itemsError,
        );

        await supabase
            .from("orders")
            .delete()
            .eq(
                "id",
                order.id,
            );

        return {
            success: false,
            error: "Não foi possível salvar os itens do pedido.",
        };
    }

    /*
     * PAGAMENTO DUMMY
     *
     * Por enquanto consideramos
     * todo pagamento como aprovado.
     */

    const paymentId =
        `dummy_${order.id}`;

    /*
     * Atualiza o pedido
     * como pago.
     */

    const {
        error: paymentError,
    } = await supabase
        .from("orders")
        .update({
            status:
                "paid",

            payment_provider:
                "dummy",

            payment_id:
                paymentId,
        })
        .eq(
            "id",
            order.id,
        );

    /*
     * Erro no pagamento dummy.
     */

    if (paymentError) {
        console.error(
            "Erro ao processar pagamento:",
            paymentError,
        );

        return {
            success: false,
            error: "Não foi possível processar o pagamento.",
        };
    }

    /*
    * Atualiza o estoque
    * depois do pagamento aprovado.
    */

    for (const item of orderItems) {
        const product =
            productsMap.get(
                item.product_id,
            );

        if (!product) {
            continue;
        }

        /*
        * Calcula o novo estoque.
        */

        const newStock =
            product.stock -
            item.quantity;

        /*
        * Atualiza o produto
        * no banco.
        */

        const {
            error: stockError,
        } = await supabase
            .from("products")
            .update({
                stock:
                    newStock,
            })
            .eq(
                "id",
                item.product_id,
            );

        /*
        * Se houver erro,
        * registramos no servidor.
        */

        if (stockError) {
            console.error(
                "Erro ao atualizar estoque:",
                stockError,
            );
        }
    }

    /*
     * E-MAIL DE CONFIRMAÇÃO
     *
     * Se o e-mail falhar,
     * não cancelamos o pedido,
     * pois o pagamento já foi
     * considerado aprovado.
     */

    try {
        const {
            error: emailError,
        } = await resend.emails.send(
            {
                /*
                 * Remetente
                 */

                from:
                    process.env
                        .RESEND_FROM_EMAIL!,

                /*
                 * Cliente
                 */

                to:
                    customerEmail,

                /*
                 * Assunto
                 */

                subject:
                    "Seu pedido Casa Elefante foi confirmado",

                /*
                 * Conteúdo
                 * do e-mail
                 */

                html:
                    orderPaidEmail({
                        customerName,

                        orderId:
                            order.id,

                        total,

                        items:
                            orderItems,
                    }),
            },
            {
                /*
                 * Evita enviar o mesmo
                 * e-mail duas vezes
                 * para o mesmo pedido.
                 */

                idempotencyKey:
                    `order-paid/${order.id}`,
            },
        );

        /*
         * Log de erro de e-mail.
         */

        if (emailError) {
            console.error(
                "Erro ao enviar e-mail:",
                emailError,
            );
        }
    } catch (emailError) {
        console.error(
            "Erro inesperado ao enviar e-mail:",
            emailError,
        );
    }

    /*
     * Pedido criado
     * com sucesso.
     */

    return {
        success: true,
        orderId:
            order.id,
    };
}