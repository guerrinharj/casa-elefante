import { ProductSpreadsheetImporter } from "@/components/admin/product-spreadsheet-importer";

export default function ImportProductsPage() {
    return (
        <main className="p-6">
            <div className="mx-auto max-w-5xl">
                <ProductSpreadsheetImporter />
            </div>
        </main>
    );
}