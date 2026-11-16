import { NextRequest, NextResponse } from "next/server";
import { getUserAccess } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const PRODUCTS_PER_PAGE = 24;

function values(value: string | null) {
    return [...new Set((value ?? "").split(",").map((item) => item.trim()).filter(Boolean))];
}

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const { isWholesale, isAdmin, wholesaleStatus } = await getUserAccess();
    const canSeeWholesaleOnly = isAdmin || isWholesale || wholesaleStatus === "pending";
    const searchParams = request.nextUrl.searchParams;
    const rawPage = Number(searchParams.get("page") ?? "1");
    const page = Number.isSafeInteger(rawPage) && rawPage >= 1 ? rawPage : 1;
    const from = page * PRODUCTS_PER_PAGE;
    const to = from + PRODUCTS_PER_PAGE - 1;

    let query = supabase
        .from("products")
        .select(`
            id, name, slug, artist, price, year, format, images,
            stock, condition, pre_order, wholesale_only
        `)
        .gt("stock", 0)
        .order("created_at", { ascending: false });

    if (!canSeeWholesaleOnly) query = query.eq("wholesale_only", false);

    for (const key of ["genre", "format", "condition", "country"] as const) {
        const selected = values(searchParams.get(key));
        if (selected.length) query = query.in(key, selected);
    }

    const selectedYears = values(searchParams.get("year"))
        .map(Number)
        .filter((year) => Number.isInteger(year) && year > 0);
    if (selectedYears.length) query = query.in("year", selectedYears);

    const artist = searchParams.get("artist");
    const label = searchParams.get("label");
    const search = searchParams.get("search");
    if (artist) query = query.ilike("artist", `%${artist}%`);
    if (label) query = query.ilike("label", `%${label}%`);

    const selectedAvailability = values(searchParams.get("pre_order"))
        .filter((value) => value === "true" || value === "false");
    if (selectedAvailability.length === 1) {
        query = query.eq("pre_order", selectedAvailability[0] === "true");
    } else if (selectedAvailability.length === 0) {
        const availability = searchParams.get("availability");
        if (availability === "pre_order") query = query.eq("pre_order", true);
        if (availability === "ready") query = query.eq("pre_order", false);
    }

    if (search) query = query.or(`name.ilike.%${search}%,artist.ilike.%${search}%`);

    const { data, error } = await query.range(from, to);
    if (error) {
        console.error("Erro ao carregar produtos:", error);
        return NextResponse.json({ error: "Erro ao carregar produtos." }, { status: 500 });
    }
    return NextResponse.json(data ?? []);
}
