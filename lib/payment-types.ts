export type CheckoutPayment = {
    orderId: string;

    status:
        | "pending"
        | "paid"
        | "declined"
        | "expired"
        | "unknown";

    method: "pix" | "card";

    total: number;

    pix?: {
        text: string;
        imageUrl?: string;
        expiresAt?: string;
    };
};

export type PaymentResult =
    | {
        success: true;
        payment: CheckoutPayment;
        }
    | {
        success: false;
        error: string;
    };