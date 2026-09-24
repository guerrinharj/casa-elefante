"use client";

import {
    useState,
} from "react";

import Link from "next/link";

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

type FormData = {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;

    companyName: string;
    document: string;
    phone: string;

    instagram: string;
    website: string;

    city: string;
    state: string;

    businessDescription: string;
};

const initialFormData: FormData = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",

    companyName: "",
    document: "",
    phone: "",

    instagram: "",
    website: "",

    city: "",
    state: "",

    businessDescription: "",
};

export function CadastroForm() {
    const [
        formData,
        setFormData,
    ] = useState<FormData>(
        initialFormData,
    );

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

    const [
        success,
        setSuccess,
    ] = useState(false);

    function handleChange(
        event:
            | React.ChangeEvent<HTMLInputElement>
            | React.ChangeEvent<HTMLTextAreaElement>,
    ) {
        const {
            name,
            value,
        } = event.target;

        setFormData(
            (current) => ({
                ...current,
                [name]: value,
            }),
        );
    }

    async function handleSubmit(
        event: React.FormEvent,
    ) {
        event.preventDefault();

        setError(null);

        if (
            formData.password !==
            formData.confirmPassword
        ) {
            setError(
                "As senhas não coincidem.",
            );

            return;
        }

        if (
            formData.password.length < 6
        ) {
            setError(
                "A senha precisa ter pelo menos 6 caracteres.",
            );

            return;
        }

        setIsLoading(true);

        const supabase =
            createClient();

        try {
            /*
             * 1. Criamos o usuário.
             *
             * O trigger que criamos no Supabase
             * automaticamente cria profiles.
             */
            const {
                data: authData,
                error: authError,
            } =
                await supabase.auth.signUp(
                    {
                        email:
                            formData.email,
                        password:
                            formData.password,

                        options: {
                            data: {
                                name:
                                    formData.name,
                            },
                        },
                    },
                );

            if (authError) {
                throw authError;
            }

            if (!authData.user) {
                throw new Error(
                    "Não foi possível criar sua conta.",
                );
            }

            /*
             * Se o Supabase estiver configurado
             * para confirmação de e-mail,
             * signUp pode criar o usuário sem
             * criar uma sessão imediatamente.
             *
             * Precisamos de uma sessão para
             * inserir wholesale_applications
             * através da policy de RLS.
             */
            if (!authData.session) {
                setError(
                    "Sua conta foi criada. Confirme seu e-mail para continuar o cadastro.",
                );

                return;
            }

            /*
             * 2. Criamos a solicitação
             * de atacado.
             */
            const {
                error:
                    applicationError,
            } = await supabase
                .from(
                    "wholesale_applications",
                )
                .insert({
                    user_id:
                        authData.user.id,

                    company_name:
                        formData.companyName,

                    document:
                        formData.document,

                    phone:
                        formData.phone,

                    instagram:
                        formData.instagram ||
                        null,

                    website:
                        formData.website ||
                        null,

                    city:
                        formData.city,

                    state:
                        formData.state,

                    business_description:
                        formData.businessDescription ||
                        null,

                    status:
                        "pending",
                });

            if (
                applicationError
            ) {
                throw applicationError;
            }

            setSuccess(true);
        } catch (
            error: unknown
        ) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Não foi possível realizar o cadastro.",
            );
        } finally {
            setIsLoading(false);
        }
    }

    if (success) {
        return (
            <div className="rounded-lg border border-black bg-white p-8 shadow">
                <div className="mb-4 inline-flex rounded-full border border-black px-3 py-1 text-xs uppercase">
                    Cadastro pendente
                </div>

                <h1 className="mb-4 text-3xl font-medium">
                    Recebemos seu
                    cadastro.
                </h1>

                <p className="mb-6">
                    Sua solicitação de
                    acesso aos preços de
                    atacado da Casa
                    Elefante está sendo
                    analisada.
                </p>

                <p className="mb-8 text-sm opacity-70">
                    Assim que seu
                    cadastro for
                    aprovado, sua conta
                    terá acesso aos
                    preços e condições
                    de atacado.
                </p>

                <Link
                    href="/"
                    className="underline underline-offset-4"
                >
                    Voltar para a loja
                </Link>
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">
                    Cadastro de atacado
                </CardTitle>

                <p className="text-sm opacity-70">
                    Preencha seus dados
                    para solicitar
                    acesso aos preços de
                    atacado da Casa
                    Elefante.
                </p>
            </CardHeader>

            <CardContent>
                <form
                    onSubmit={
                        handleSubmit
                    }
                >
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">
                                Seu nome
                            </Label>

                            <Input
                                id="name"
                                name="name"
                                required
                                value={
                                    formData.name
                                }
                                onChange={
                                    handleChange
                                }
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">
                                E-mail
                            </Label>

                            <Input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={
                                    formData.email
                                }
                                onChange={
                                    handleChange
                                }
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="phone">
                                Telefone /
                                WhatsApp
                            </Label>

                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                required
                                value={
                                    formData.phone
                                }
                                onChange={
                                    handleChange
                                }
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="companyName">
                                Nome da loja
                                ou empresa
                            </Label>

                            <Input
                                id="companyName"
                                name="companyName"
                                required
                                value={
                                    formData.companyName
                                }
                                onChange={
                                    handleChange
                                }
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="document">
                                CPF / CNPJ
                            </Label>

                            <Input
                                id="document"
                                name="document"
                                required
                                value={
                                    formData.document
                                }
                                onChange={
                                    handleChange
                                }
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="city">
                                    Cidade
                                </Label>

                                <Input
                                    id="city"
                                    name="city"
                                    required
                                    value={
                                        formData.city
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="state">
                                    Estado
                                </Label>

                                <Input
                                    id="state"
                                    name="state"
                                    placeholder="SP"
                                    maxLength={2}
                                    required
                                    value={
                                        formData.state
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="instagram">
                                Instagram
                            </Label>

                            <Input
                                id="instagram"
                                name="instagram"
                                placeholder="@sualoja"
                                value={
                                    formData.instagram
                                }
                                onChange={
                                    handleChange
                                }
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="website">
                                Site
                            </Label>

                            <Input
                                id="website"
                                name="website"
                                placeholder="https://"
                                value={
                                    formData.website
                                }
                                onChange={
                                    handleChange
                                }
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="businessDescription">
                                Conte um pouco
                                sobre sua loja
                                ou atividade
                            </Label>

                            <textarea
                                id="businessDescription"
                                name="businessDescription"
                                rows={5}
                                value={
                                    formData.businessDescription
                                }
                                onChange={
                                    handleChange
                                }
                                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">
                                Senha
                            </Label>

                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                minLength={6}
                                required
                                value={
                                    formData.password
                                }
                                onChange={
                                    handleChange
                                }
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">
                                Confirmar senha
                            </Label>

                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                minLength={6}
                                required
                                value={
                                    formData.confirmPassword
                                }
                                onChange={
                                    handleChange
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
                                ? "Enviando..."
                                : "Solicitar acesso"}
                        </Button>

                        <p className="text-center text-sm">
                            Já possui uma
                            conta?{" "}
                            <Link
                                href="/login"
                                className="underline underline-offset-4"
                            >
                                Entrar
                            </Link>
                        </p>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}