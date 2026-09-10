type OrderItem = {
    product_name: string;
    unit_price: number;
    quantity: number;
};

type OrderPaidEmailProps = {
    customerName: string;
    orderId: string;
    total: number;
    items: OrderItem[];
};

export function orderPaidEmail({
    customerName,
    orderId,
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
                        ${(
                            item.unit_price *
                            item.quantity
                        ).toLocaleString(
                            "pt-BR",
                            {
                                style: "currency",
                                currency: "BRL",
                            },
                        )}
                    </td>
                </tr>
            `,
        )
        .join("");

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

                    <div
                        style="
                            margin-top: 24px;
                            padding-top: 16px;
                            border-top: 1px solid #000000;
                            font-size: 20px;
                        "
                    >
                        <strong>
                            Total:
                            ${total.toLocaleString(
                                "pt-BR",
                                {
                                    style: "currency",
                                    currency: "BRL",
                                },
                            )}
                        </strong>
                    </div>

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