import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    return (
        <>
            {children}
        </>
    );
}