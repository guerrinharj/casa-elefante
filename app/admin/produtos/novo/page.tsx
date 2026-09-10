import Link from "next/link";

import {
    PRODUCT_FORMATS,
    PRODUCT_GENRES,
} from "@/lib/products";

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

                <form className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="name">
                            Nome
                        </label>

                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            className="border border-black px-3 py-2"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="artist">
                            Artista
                        </label>

                        <input
                            id="artist"
                            name="artist"
                            type="text"
                            required
                            className="border border-black px-3 py-2"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="label">
                            Selo / Editora
                        </label>

                        <input
                            id="label"
                            name="label"
                            type="text"
                            className="border border-black px-3 py-2"
                        />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="year">
                                Ano
                            </label>

                            <input
                                id="year"
                                name="year"
                                type="number"
                                className="border border-black px-3 py-2"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="price">
                                Preço
                            </label>

                            <input
                                id="price"
                                name="price"
                                type="number"
                                step="0.01"
                                min="0"
                                required
                                className="border border-black px-3 py-2"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="genre">
                            Gênero
                        </label>

                        <select
                            id="genre"
                            name="genre"
                            required
                            defaultValue=""
                            className="border border-black bg-white px-3 py-2"
                        >
                            <option
                                value=""
                                disabled
                            >
                                Selecione um gênero
                            </option>

                            {PRODUCT_GENRES.map((genre) => (
                                <option
                                    key={genre}
                                    value={genre}
                                >
                                    {genre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="format">
                            Formato
                        </label>

                        <select
                            id="format"
                            name="format"
                            required
                            defaultValue=""
                            className="border border-black bg-white px-3 py-2"
                        >
                            <option
                                value=""
                                disabled
                            >
                                Selecione um formato
                            </option>

                            {PRODUCT_FORMATS.map((format) => (
                                <option
                                    key={format}
                                    value={format}
                                >
                                    {format}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="description">
                            Descrição
                        </label>

                        <textarea
                            id="description"
                            name="description"
                            rows={6}
                            className="resize-none border border-black px-3 py-2"
                        />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="stock">
                                Estoque
                            </label>

                            <input
                                id="stock"
                                name="stock"
                                type="number"
                                min="0"
                                defaultValue={1}
                                className="border border-black px-3 py-2"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="condition">
                                Condição
                            </label>

                            <input
                                id="condition"
                                name="condition"
                                type="text"
                                placeholder="Ex: VG+, NM"
                                className="border border-black px-3 py-2"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end border-t border-black pt-6">
                        <button
                            type="submit"
                            className="border border-black px-5 py-2 transition-colors hover:bg-black hover:text-white"
                        >
                            Salvar produto
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}