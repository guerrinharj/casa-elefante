
import Link from "next/link";

import { ProductForm } from "@/components/products/product-form";

import {
    requireProductManager,
} from "@/lib/auth";

export default function NewProductPage() {
    requireProductManager();

    return (
        <main className="min-h-screen p-6 md:p-10">
            <div className="mx-auto flex max-w-3xl flex-col gap-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="font-october text-5xl uppercase leading-none text-black md:text-6xl">
                            Novo produto
                        </h1>

                        <p className="mt-3 text-sm text-black/70 md:text-base">
                            Adicione um novo produto à loja.
                        </p>
                    </div>

                    <Link
                        href="/admin/produtos"
                        className="inline-flex w-fit shrink-0 items-center justify-center rounded-xl border border-black bg-white px-6 py-3  text-xl  leading-none text-black shadow-[-5px_5px_0_0_#000] transition-all duration-200 hover:-translate-y-1 hover:shadow-[-5px_9px_0_0_#000]"
                    >
                        Voltar
                    </Link>
                </div>

                <ProductForm />
            </div>
        </main>
    );
}
