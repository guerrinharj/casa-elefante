
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

export function LoginForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState<string | null>(
        null,
    );

    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();

    const handleLogin = async (
        e: React.FormEvent<HTMLFormElement>,
    ) => {
        e.preventDefault();

        const supabase = createClient();

        setIsLoading(true);
        setError(null);

        try {
            const {
                data,
                error: loginError,
            } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

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
                .eq("id", data.user.id)
                .single();

            if (profileError) {
                throw profileError;
            }

            if (profile?.role === "admin") {
                router.push("/admin");
            } else {
                router.push("/");
            }

            router.refresh();
        } catch (error: unknown) {
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
                "mx-auto flex w-full flex-col gap-6 text-black md:max-w-[50vw]",
                className,
            )}
            {...props}
        >
            <div className="mb-2">
                <h1 className="font-october text-5xl uppercase leading-none text-black md:text-6xl">
                    Entrar
                </h1>

                <p className="mt-3 text-sm text-black/70 md:text-base">
                    Acesse sua conta na Casa Elefante.
                </p>
            </div>

            <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="email"
                            className="font-october text-xl uppercase leading-none text-black"
                        >
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            placeholder="email@exemplo.com"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            className="w-full rounded-xl border border-black bg-white px-4 py-3 text-base text-black outline-none transition-colors placeholder:text-black/35 focus:ring-2 focus:ring-black/15"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="password"
                            className="font-october text-xl uppercase leading-none text-black"
                        >
                            Senha
                        </label>

                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            className="w-full rounded-xl border border-black bg-white px-4 py-3 text-base text-black outline-none transition-colors focus:ring-2 focus:ring-black/15"
                        />
                    </div>

                    {error && (
                        <p
                            role="alert"
                            className="rounded-xl border border-[#D2232A] bg-[#D2232A]/5 p-3 text-sm text-[#D2232A]"
                        >
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="mt-2 inline-flex w-full items-center justify-center rounded-xl border border-black bg-white px-6 py-4 font-october text-2xl uppercase leading-none text-black shadow-[-5px_5px_0_0_#000] transition-all duration-200 hover:-translate-y-1 hover:shadow-[-5px_9px_0_0_#000] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[-5px_5px_0_0_#000]"
                    >
                        {isLoading
                            ? "Entrando..."
                            : "Entrar"}
                    </button>

                    <div className="mt-2 border-t border-black/20 pt-6">
                        <p className="text-center text-sm text-black/70">
                            Quer comprar no atacado?
                        </p>

                        <Link
                            href="/cadastro"
                            className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-black bg-white px-4 py-3 text-center font-october text-xl uppercase leading-none text-black shadow-[-5px_5px_0_0_#000] transition-all duration-200 hover:-translate-y-1 hover:shadow-[-5px_9px_0_0_#000]"
                        >
                            Cadastre-se como atacadista
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    );
}
