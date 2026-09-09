import { ProductList } from "@/components/products/product-list";

type FilteredProductsProps = {
    searchParams: Promise<{
        genre?: string;
        format?: string;
        year?: string;
        artist?: string;
        label?: string;
    }>;
};

export async function FilteredProducts({
    searchParams,
}: FilteredProductsProps) {
    const filters = await searchParams;

    return (
        <ProductList filters={filters} />
    );
}