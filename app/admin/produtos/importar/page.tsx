import { ProductSpreadsheetImporter } from "@/components/admin/product-spreadsheet-importer";

import {
    requireProductManager,
} from "@/lib/auth";

export default function ImportProductsPage() {
    requireProductManager();
    return (
        <main className="p-6">
            <div className="mx-auto max-w-5xl">
                <ProductSpreadsheetImporter />
            </div>
        </main>
    );
}