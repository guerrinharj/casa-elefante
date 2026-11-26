"use client";

import { useActionState, useState } from "react";
import { Disc3 } from "lucide-react";
import {
    saveRecordOfTheWeek,
    searchRecordProducts,
} from "@/app/admin/produtos/record-of-the-week-actions";

type RecordProduct = {
    id: string;
    name: string;
    artist: string | null;
    format: string | null;
    stock: number;
    wholesale_only: boolean | null;
};

type CurrentRecord = RecordProduct & { editorial_comment: string | null };

const buttonClass = "rounded-xl border border-black px-4 py-2 text-sm font-medium hover:bg-black/5 disabled:opacity-50";
const inputClass = "w-full min-w-0 rounded-xl border border-black bg-white px-3 py-2 text-sm";

function productLabel(product: RecordProduct) {
    return [product.artist, product.name, product.format].filter(Boolean).join(" · ");
}

function RecordEditor({
    current,
    saveAction,
    saving,
}: {
    current: CurrentRecord | null;
    saveAction: (formData: FormData) => void;
    saving: boolean;
}) {
    const [search, searchAction, searching] = useActionState(
        searchRecordProducts,
        { products: [] as RecordProduct[], message: "" },
    );
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState<RecordProduct | null>(current);
    const [comment, setComment] = useState(current?.editorial_comment ?? "");

    function selectProduct(product: RecordProduct) {
        if (product.id === selected?.id) return;
        setSelected(product);
        setComment(product.id === current?.id ? current.editorial_comment ?? "" : "");
    }

    return (
        <>
            <form action={searchAction} role="search" aria-label="Buscar Disco da Semana">
                <label htmlFor="record-product-search" className="mb-1 block text-sm font-medium">
                    Buscar por nome ou artista
                </label>
                <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                    <input
                        id="record-product-search"
                        name="query"
                        type="search"
                        required
                        maxLength={120}
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        className={inputClass}
                    />
                    <button type="submit" disabled={searching || saving} className={buttonClass}>
                        {searching ? "Buscando…" : "Buscar"}
                    </button>
                </div>
            </form>

            <p role="status" className="text-sm">{search.message}</p>
            {search.products.length > 0 && (
                <ul aria-label="Resultados da busca" className="max-h-60 divide-y divide-black/20 overflow-auto rounded-xl border border-black">
                    {search.products.map((product: RecordProduct) => (
                        <li key={product.id}>
                            <button
                                type="button"
                                disabled={saving}
                                aria-pressed={selected?.id === product.id}
                                onClick={() => selectProduct(product)}
                                className="w-full break-words px-3 py-2 text-left text-sm hover:bg-black/5 aria-pressed:bg-black/10"
                            >
                                {productLabel(product)}
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {selected && (
                <form action={saveAction} className="space-y-2">
                    <input type="hidden" name="expectedProductId" value={current?.id ?? ""} />
                    <input type="hidden" name="productId" value={selected.id} />
                    <input type="hidden" name="operation" value="save" />
                    <p className="break-words text-sm font-medium">Editando {productLabel(selected)}</p>
                    {selected.stock <= 0 && (
                        <p className="text-sm">O carrossel exibe este disco quando houver estoque.</p>
                    )}
                    {selected.wholesale_only && (
                        <p className="text-sm">A exibição segue as regras de acesso do atacado.</p>
                    )}
                    <label htmlFor="record-editorial-comment" className="block text-sm">
                        Comentário editorial
                    </label>
                    <textarea
                        id="record-editorial-comment"
                        name="comment"
                        rows={4}
                        value={comment}
                        readOnly={saving}
                        onChange={(event) => setComment(event.target.value)}
                        className={inputClass}
                    />
                    <div className="flex flex-wrap gap-2">
                        <button type="submit" disabled={saving} className={buttonClass + " bg-black text-white hover:bg-black/80"}>
                            {current && selected.id !== current.id ? "Substituir Disco da Semana" : "Salvar Disco da Semana"}
                        </button>
                        {current && selected.id !== current.id && (
                            <button type="button" disabled={saving} onClick={() => selectProduct(current)} className={buttonClass}>
                                Cancelar substituição
                            </button>
                        )}
                    </div>
                </form>
            )}
        </>
    );
}

export function RecordOfTheWeek({
    current,
    loadFailed,
}: {
    current: CurrentRecord | null;
    loadFailed: boolean;
}) {
    const [message, saveAction, saving] = useActionState(saveRecordOfTheWeek, "");

    return (
        <section aria-labelledby="record-of-the-week-title" className="space-y-4 rounded-xl border border-black bg-white p-4 shadow-[-5px_5px_0_0_#000] md:p-6">
            <h2 id="record-of-the-week-title" className="flex items-center gap-2 font-october text-2xl uppercase">
                <Disc3 aria-hidden="true" size={24} />
                Disco da Semana
            </h2>
            {loadFailed ? (
                <p role="alert" className="text-sm">Não foi possível carregar a seleção atual.</p>
            ) : (
                <>
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/20 pb-4">
                        {current ? (
                            <>
                                <p className="min-w-0 break-words text-sm">Seleção atual · {productLabel(current)}</p>
                                <form action={saveAction}>
                                    <input type="hidden" name="expectedProductId" value={current.id} />
                                    <input type="hidden" name="operation" value="remove" />
                                    <button type="submit" disabled={saving} className={buttonClass}>Remover seleção</button>
                                </form>
                            </>
                        ) : (
                            <p className="text-sm">Nenhum disco selecionado.</p>
                        )}
                    </div>
                    <RecordEditor
                        key={JSON.stringify([current?.id, current?.editorial_comment])}
                        current={current}
                        saveAction={saveAction}
                        saving={saving}
                    />
                    <p role="status" className="text-sm">{saving ? "Salvando…" : message}</p>
                </>
            )}
        </section>
    );
}
