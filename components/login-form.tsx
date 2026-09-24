"use client";

import Link from "next/link";

import {
    useState,
} from "react";

import {
    useRouter,
} from "next/navigation";

import {
    cn,
} from "@/lib/utils";

import {
    createClient,
} from "@/lib/supabase/client";

import {
    Button,
} from "@/components/ui/button";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
    Input,
} from "@/components/ui/input";

import {
    Label,
} from "@/components/ui/label";

export function LoginForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {
    const [
        email,
        setEmail,
    ] = useState("");

    const [
        password,
        setPassword,
    ] = useState("");

    const [
        error,
        setError,
    ] = useState<string | null>(
        null,
    );

    const [
        isLoading,
        setIsLoading,
    ] = useState(false);

    const router =
        useRouter();

    const handleLogin = async (
        e: React.FormEvent,
    ) => {
        e.preventDefault();

        const supabase =
            createClient();

        setIsLoading(true);
        setError(null);

        try {
            const {
                data,
                error: loginError,
            } =
                await supabase.auth.signInWithPassword(
                    {
                        email,
                        password,
                    },
                );

            if (loginError) {
                throw loginError;
            }

            if (!data.user) {
                throw new Error(
                    "Não foi possível identificar o usuário.",
                );
            }

            const {
                data: profile,
                error: profileError,
            } = await supabase
                .from("profiles")
                .select("role")
                .eq(
                    "id",
                    data.user.id,
                )
                .single();

            if (profileError) {
                throw profileError;
            }

            if (
                profile?.role ===
                "admin"
            ) {
                router.push(
                    "/admin",
                );
            } else {
                router.push("/");
            }

            router.refresh();
        } catch (
            error: unknown
        ) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Erro ao fazer login",
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className={cn(
                "flex flex-col gap-6",
                className,
            )}
            {...props}
        >
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">
                        Entrar
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <form
                        onSubmit={
                            handleLogin
                        }
                    >
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">
                                    Email
                                </Label>

                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="email@exemplo.com"
                                    autoComplete="email"
                                    required
                                    value={
                                        email
                                    }
                                    onChange={(
                                        e,
                                    ) =>
                                        setEmail(
                                            e
                                                .target
                                                .value,
                                        )
                                    }
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">
                                    Senha
                                </Label>

                                <Input
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={
                                        password
                                    }
                                    onChange={(
                                        e,
                                    ) =>
                                        setPassword(
                                            e
                                                .target
                                                .value,
                                        )
                                    }
                                />
                            </div>

                            {error && (
                                <p className="text-sm text-red-500">
                                    {
                                        error
                                    }
                                </p>
                            )}

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={
                                    isLoading
                                }
                            >
                                {isLoading
                                    ? "Entrando..."
                                    : "Entrar"}
                            </Button>

                            <p className="text-center text-sm">
                                Quer comprar no atacado?{" "}
                                <Link
                                    href="/cadastro"
                                    className="underline underline-offset-4"
                                >
                                    Cadastre-se como atacadista
                                </Link>
                            </p>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}