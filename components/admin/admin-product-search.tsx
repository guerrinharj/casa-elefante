type AdminProductSearchProps = {
    initialSearch?: string;
};

export function AdminProductSearch({
    initialSearch = "",
}: AdminProductSearchProps) {
    return (
        <form
            action="/admin/produtos"
            method="get"
            className="w-full"
        >
            <input
                type="search"
                name="search"
                defaultValue={initialSearch}
                placeholder="Pesquisar por nome ou artista"
                className="w-full border-b border-black bg-transparent py-3 outline-none placeholder:text-black/40"
            />
        </form>
    );
}