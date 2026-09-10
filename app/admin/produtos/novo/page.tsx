import Link from "next/link";

import { ProductForm } from "@/components/products/product-form";

export default function NewProductPage() {
    return (
        <main className="p-6">
            <div className="mx-auto flex max-w-3xl flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-medium">
                            Novo produto
                        </h1>

                        <p className="mt-1 text-sm">
                            Adicione um novo produto à loja.
                        </p>
                    </div>

                    <Link
                        href="/admin/produtos"
                        className="text-sm underline"
                    >
                        Voltar
                    </Link>
                </div>

                <ProductForm />
            </div>
        </main>
    );
}