import {
    NextResponse,
} from "next/server";

import {
    Resend,
} from "resend";

const resend = new Resend(
    process.env.RESEND_API_KEY,
);

export async function POST(
    request: Request,
) {
    try {
        const segmentId =
            process.env.RESEND_NEWSLETTER_SEGMENT_ID;

        if (!segmentId) {
            console.error(
                "RESEND_NEWSLETTER_SEGMENT_ID não configurado.",
            );

            return NextResponse.json(
                {
                    error:
                        "Newsletter não configurada.",
                },
                {
                    status: 500,
                },
            );
        }

        const {
            name,
            email,
        } = await request.json();

        if (
            !email ||
            typeof email !== "string"
        ) {
            return NextResponse.json(
                {
                    error:
                        "E-mail é obrigatório.",
                },
                {
                    status: 400,
                },
            );
        }

        const normalizedEmail =
            email
                .trim()
                .toLowerCase();

        const normalizedName =
            typeof name === "string"
                ? name.trim()
                : "";

        const {
            data,
            error,
        } =
            await resend.contacts.create({
                email: normalizedEmail,

                firstName:
                    normalizedName ||
                    undefined,

                unsubscribed: false,

                segments: [
                    {
                        id: segmentId,
                    },
                ],
            });

        if (error) {
            console.error(
                "Resend contact error:",
                error,
            );

            return NextResponse.json(
                {
                    error:
                        "Não foi possível realizar a inscrição.",
                },
                {
                    status: 500,
                },
            );
        }

        return NextResponse.json({
            success: true,
            contactId: data?.id,
        });
    } catch (error) {
        console.error(
            "Newsletter subscribe error:",
            error,
        );

        return NextResponse.json(
            {
                error:
                    "Não foi possível realizar a inscrição.",
            },
            {
                status: 500,
            },
        );
    }
}