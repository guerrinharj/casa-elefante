type OrderItem = {
    product_name: string;
    unit_price: number;
    quantity: number;
};

type OrderPaidEmailProps = {
    customerName: string;
    orderId: string;
    subtotal: number;
    couponCode: string | null;
    discountAmount: number;
    shipping: number;
    total: number;
    items: OrderItem[];
};

function formatCurrency(
    value: number,
) {
    return value.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL",
        },
    );
}

export function orderPaidEmail({
    customerName,
    orderId,
    subtotal,
    couponCode,
    discountAmount,
    shipping,
    total,
    items,
}: OrderPaidEmailProps) {
    const itemsHtml = items
        .map(
            (item) => `
                <tr>
                    <td style="padding: 12px 0;">
                        ${item.product_name}
                        × ${item.quantity}
                    </td>

                    <td
                        style="
                            padding: 12px 0;
                            text-align: right;
                        "
                    >
                        ${formatCurrency(
                            item.unit_price *
                                item.quantity,
                        )}
                    </td>
                </tr>
            `,
        )
        .join("");

    const discountedSubtotal =
        Math.max(
            0,
            subtotal -
                discountAmount,
        );

    const couponHtml =
        couponCode &&
        discountAmount > 0
            ? `
                <tr>
                    <td
                        style="
                            padding: 8px 0;
                        "
                    >
                        Cupom ${couponCode}
                    </td>

                    <td
                        style="
                            padding: 8px 0;
                            text-align: right;
                        "
                    >
                        - ${formatCurrency(
                            discountAmount,
                        )}
                    </td>
                </tr>

                <tr>
                    <td
                        style="
                            padding: 8px 0;
                        "
                    >
                        Subtotal com desconto
                    </td>

                    <td
                        style="
                            padding: 8px 0;
                            text-align: right;
                        "
                    >
                        ${formatCurrency(
                            discountedSubtotal,
                        )}
                    </td>
                </tr>
            `
            : "";

    return `
        <!DOCTYPE html>

        <html lang="pt-BR">
            <body
                style="
                    margin: 0;
                    padding: 40px 20px;
                    font-family: Arial, sans-serif;
                    color: #000000;
                    background: #ffffff;
                "
            >
                <div
                    style="
                        max-width: 600px;
                        margin: 0 auto;
                    "
                >
                    <h1>
                        Pedido confirmado
                    </h1>

                    <p>
                        Olá, ${customerName}.
                    </p>

                    <p>
                        Seu pagamento foi processado
                        e seu pedido foi confirmado.
                    </p>

                    <p>
                        <strong>Pedido:</strong>
                        ${orderId}
                    </p>

                    <table
                        style="
                            width: 100%;
                            border-collapse: collapse;
                            margin-top: 32px;
                        "
                    >
                        ${itemsHtml}
                    </table>

                    <table
                        style="
                            width: 100%;
                            border-collapse: collapse;
                            margin-top: 24px;
                            padding-top: 16px;
                            border-top: 1px solid #000000;
                        "
                    >
                        <tr>
                            <td
                                style="
                                    padding: 8px 0;
                                "
                            >
                                Subtotal
                            </td>

                            <td
                                style="
                                    padding: 8px 0;
                                    text-align: right;
                                "
                            >
                                ${formatCurrency(
                                    subtotal,
                                )}
                            </td>
                        </tr>

                        ${couponHtml}

                        <tr>
                            <td
                                style="
                                    padding: 8px 0;
                                "
                            >
                                Frete
                            </td>

                            <td
                                style="
                                    padding: 8px 0;
                                    text-align: right;
                                "
                            >
                                ${formatCurrency(
                                    shipping,
                                )}
                            </td>
                        </tr>

                        <tr>
                            <td
                                style="
                                    padding-top: 16px;
                                    border-top: 1px solid #000000;
                                    font-size: 20px;
                                "
                            >
                                <strong>
                                    Total
                                </strong>
                            </td>

                            <td
                                style="
                                    padding-top: 16px;
                                    border-top: 1px solid #000000;
                                    text-align: right;
                                    font-size: 20px;
                                "
                            >
                                <strong>
                                    ${formatCurrency(
                                        total,
                                    )}
                                </strong>
                            </td>
                        </tr>
                    </table>

                    <p
                        style="
                            margin-top: 40px;
                            font-size: 14px;
                        "
                    >
                        Obrigado por comprar na
                        Casa Elefante.
                    </p>
                </div>
            </body>
        </html>
    `;
}