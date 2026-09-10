import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type OrderPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function OrderPage({
    params,
}: OrderPageProps) {
    const { id } = await params;

    const supabase =
        await createClient();

    const {
        data: order,
        error,
    } = await supabase
        .from("orders")
        .select(`
            id,
            customer_name,
            customer_email,
            status,
            subtotal,
            shipping,
            total,
            created_at,
            order_items (
                id,
                product_name,
                unit_price,
                quantity
            )
        `)
        .eq("id", id)
        .single();

    if (error || !order) {
        notFound();
    }

    return (
        <main className="p-4 md:p-6">
            <div className="mx-auto max-w-3xl">
                <h1 className="font-grotesque text-4xl font-bold uppercase">
                    Pedido recebido
                </h1>

                <p className="mt-4">
                    Obrigado,{" "}
                    {order.customer_name}.
                </p>

                <p className="mt-1 text-sm">
                    Pedido{" "}
                    {order.id}
                </p>

                <div className="mt-10 border-t border-black">
                    {order.order_items.map(
                        (item) => (
                            <div
                                key={
                                    item.id
                                }
                                className="flex justify-between border-b border-black py-4"
                            >
                                <div>
                                    <p>
                                        {
                                            item.product_name
                                        }
                                    </p>

                                    <p className="text-sm">
                                        Quantidade:{" "}
                                        {
                                            item.quantity
                                        }
                                    </p>
                                </div>

                                <p>
                                    {(
                                        Number(
                                            item.unit_price,
                                        ) *
                                        item.quantity
                                    ).toLocaleString(
                                        "pt-BR",
                                        {
                                            style: "currency",
                                            currency:
                                                "BRL",
                                        },
                                    )}
                                </p>
                            </div>
                        ),
                    )}
                </div>

                <div className="mt-6 flex justify-between text-xl">
                    <span>
                        Total
                    </span>

                    <span>
                        {Number(
                            order.total,
                        ).toLocaleString(
                            "pt-BR",
                            {
                                style: "currency",
                                currency:
                                    "BRL",
                            },
                        )}
                    </span>
                </div>

                <div className="mt-10 border border-black p-6">
                    <p className="font-grotesque text-xl font-bold uppercase">
                        Pagamento
                    </p>

                    <p className="mt-2">
                        Aguardando pagamento.
                    </p>

                    <p className="mt-1 text-sm">
                        O pagamento ainda está em modo de teste.
                    </p>
                </div>
            </div>
        </main>
    );
}