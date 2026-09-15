import Link from "next/link";

import {
    PerformanceForm,
} from "@/components/admin/performances/performance-form";

export default function NewPerformancePage() {
    return (
        <main className="p-6">
            <div className="mx-auto flex max-w-3xl flex-col gap-8">
                <div>
                    <Link
                        href="/admin/performances"
                        className="text-sm transition-opacity hover:opacity-60"
                    >
                        ← Toda Terça Tem
                    </Link>

                    <h1 className="mt-4 text-3xl font-medium">
                        Nova apresentação
                    </h1>

                    <p className="mt-2 text-sm opacity-60">
                        Adicione uma nova apresentação do Toda Terça Tem.
                    </p>
                </div>

                <PerformanceForm />
            </div>
        </main>
    );
}