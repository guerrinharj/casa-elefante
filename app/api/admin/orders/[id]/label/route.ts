
import {
    NextRequest,
    NextResponse,
} from "next/server";

import {
    PDFDocument,
    StandardFonts,
    rgb,
} from "pdf-lib";

import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type ShippingAddress = {
    postalCode?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
};

const MM = 72 / 25.4;

const PAGE_WIDTH = 105 * MM;
const PAGE_HEIGHT = 148 * MM;

function formatPostalCode(value?: string) {
    const numbers = (value ?? "").replace(/\D/g, "");

    if (numbers.length !== 8) {
        return value || "Não informado";
    }

    return `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
}

export async function GET(
    _request: NextRequest,
    context: {
        params: Promise<{ id: string }>;
    },
) {
    try {
        await requireAdmin();
    } catch {
        return NextResponse.json(
            { error: "Acesso não autorizado." },
            { status: 403 },
        );
    }

    const { id } = await context.params;

    const supabase = createAdminClient();

    const { data: order, error } = await supabase
        .from("orders")
        .select("id, customer_name, shipping_address")
        .eq("id", id)
        .single();

    if (error || !order) {
        return NextResponse.json(
            { error: "Pedido não encontrado." },
            { status: 404 },
        );
    }

    const address = order.shipping_address as ShippingAddress | null;

    if (
        !address?.street ||
        !address?.number ||
        !address?.city ||
        !address?.state ||
        !address?.postalCode ||
        !order.customer_name
    ) {
        return NextResponse.json(
            { error: "Endereço de entrega incompleto." },
            { status: 400 },
        );
    }

    const pdf = await PDFDocument.create();

    const page = pdf.addPage([
        PAGE_WIDTH,
        PAGE_HEIGHT,
    ]);

    const font = await pdf.embedFont(
        StandardFonts.Helvetica,
    );

    const boldFont = await pdf.embedFont(
        StandardFonts.HelveticaBold,
    );

    const black = rgb(0, 0, 0);

    const margin = 22;
    const contentWidth = PAGE_WIDTH - margin * 2;

    let y = PAGE_HEIGHT - 32;

    function drawText(
        value: string,
        size = 10,
        bold = false,
        gap = 17,
    ) {
        const selectedFont = bold ? boldFont : font;

        const words = value.split(/\s+/);
        let line = "";

        for (const word of words) {
            const candidate = line
                ? `${line} ${word}`
                : word;

            if (
                selectedFont.widthOfTextAtSize(
                    candidate,
                    size,
                ) > contentWidth &&
                line
            ) {
                page.drawText(line, {
                    x: margin,
                    y,
                    size,
                    font: selectedFont,
                    color: black,
                });

                y -= gap;
                line = word;
            } else {
                line = candidate;
            }
        }

        if (line) {
            page.drawText(line, {
                x: margin,
                y,
                size,
                font: selectedFont,
                color: black,
            });

            y -= gap;
        }
    }

    function divider() {
        y -= 6;

        page.drawLine({
            start: { x: margin, y },
            end: { x: PAGE_WIDTH - margin, y },
            thickness: 0.8,
            color: black,
        });

        y -= 24;
    }

    drawText("CASA ELEFANTE", 18, true, 25);
    drawText(`PEDIDO ${order.id.slice(0, 8).toUpperCase()}`, 8);

    divider();

    drawText("DESTINATÁRIO", 9, true, 20);
    drawText(order.customer_name, 14, true, 21);

    drawText(
        `${address.street}, ${address.number}`,
        11,
    );

    if (address.complement) {
        drawText(address.complement, 10);
    }

    if (address.neighborhood) {
        drawText(address.neighborhood, 10);
    }

    drawText(
        `${address.city} - ${address.state}`,
        10,
    );

    y -= 6;

    drawText(
        formatPostalCode(address.postalCode),
        19,
        true,
        25,
    );

    divider();

    drawText("REMETENTE", 9, true, 20);
    drawText("Casa Elefante", 12, true);
    drawText("Rua Conselheiro Brotero, 379", 10);
    drawText("Barra Funda", 10);
    drawText("São Paulo - SP", 10);
    drawText("CEP: 01154-001", 10);

    const pdfBytes = await pdf.save();

    return new NextResponse(
        new Uint8Array(pdfBytes),
        {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition":
                    `inline; filename="etiqueta-${order.id.slice(0, 8)}.pdf"`,
                "Cache-Control": "no-store",
            },
        },
    );
}
