import { CheckoutForm } from "@/components/checkout/checkout-form";

export default function CheckoutPage() {
    return (
        <main className="p-4 md:p-6">
            <div className="mx-auto max-w-6xl">
                <h1 className="font-windsor text-4xl font-bold">
                    Checkout
                </h1>

                <div className="mt-10">
                    <CheckoutForm />
                </div>
            </div>
        </main>
    );
}