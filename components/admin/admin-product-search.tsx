
import {
    Search,
} from "lucide-react";

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
            role="search"
            className="
                flex
                h-14
                w-full
                items-center
                overflow-hidden
                rounded-xl
                border
                border-black
                bg-white
                text-black
                shadow-[-5px_5px_0_0_#000]
                transition-shadow
                duration-200
                focus-within:shadow-[-5px_7px_0_0_#000]
            "
        >
            <input
                type="search"
                name="search"
                defaultValue={initialSearch}
                placeholder="Pesquisar por nome ou artista"
                aria-label="Pesquisar produtos"
                className="
                    h-full
                    min-w-0
                    flex-1
                    bg-transparent
                    px-4
                    text-sm
                    text-black
                    outline-none
                    placeholder:text-black/40
                    [&::-webkit-search-cancel-button]:hidden
                "
            />

            <button
                type="submit"
                aria-label="Pesquisar"
                title="Pesquisar produtos"
                className="
                    flex
                    h-[54px]
                    w-[54px]
                    shrink-0
                    items-center
                    justify-center
                    text-black
                    transition-colors
                    duration-200
                    hover:bg-black/5
                "
            >
                <Search
                    size={24}
                    strokeWidth={2}
                />
            </button>
        </form>
    );
}
