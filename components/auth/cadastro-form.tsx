
"use client";

import {
    useState,
} from "react";

import Link from "next/link";

import {
    createClient,
} from "@/lib/supabase/client";

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

const labelClassName =
    "font-october text-xl uppercase leading-none text-black";

const inputClassName =
    "w-full rounded-xl border border-black bg-white px-4 py-3 text-base text-black outline-none transition-colors placeholder:text-black/35 focus:ring-2 focus:ring-black/15";

const buttonClassName =
    "inline-flex w-full items-center justify-center rounded-xl border border-black bg-white px-6 py-4  text-2xl  leading-none text-black shadow-[-5px_5px_0_0_#000] transition-all duration-200 hover:-translate-y-1 hover:shadow-[-5px_9px_0_0_#000] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[-5px_5px_0_0_#000]";

export function CadastroForm() {
    const [formData, setFormData] = useState<FormData>(
        initialFormData,
    );

    const [error, setError] = useState<string | null>(
        null,
    );

    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    function handleChange(
        event:
            | React.ChangeEvent<HTMLInputElement>
            | React.ChangeEvent<HTMLTextAreaElement>,
    ) {
        const {
            name,
            value,
        } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: value,
        }));
    }

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
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

        if (formData.password.length < 6) {
            setError(
                "A senha precisa ter pelo menos 6 caracteres.",
            );

            return;
        }

        setIsLoading(true);

        const supabase = createClient();

        try {
            const {
                data: authData,
                error: authError,
            } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        name: formData.name,
                        phone: formData.phone,
                        company_name: formData.companyName,
                        document: formData.document,
                        instagram:
                            formData.instagram || null,
                        website:
                            formData.website || null,
                        city: formData.city,
                        state:
                            formData.state.toUpperCase(),
                        business_description:
                            formData.businessDescription || null,
                        wholesale_application: true,
                    },
                },
            });

            if (authError) {
                throw authError;
            }

            if (!authData.user) {
                throw new Error(
                    "Não foi possível criar sua conta.",
                );
            }

            /*
             * Não criamos wholesale_applications aqui.
             *
             * Os dados comerciais foram salvos em
             * raw_user_meta_data.
             *
             * Quando o usuário confirmar o e-mail,
             * o trigger do Supabase criará
             * automaticamente a solicitação com
             * status "pending".
             */

            setSuccess(true);
        } catch (error: unknown) {
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
            <div className="mx-auto flex w-full flex-col gap-6 text-black md:max-w-[50vw]">
                <div>
                    <h1 className="font-october text-5xl uppercase leading-none text-black md:text-6xl">
                        Cadastro recebido.
                    </h1>

                    <p className="mt-3 font-october text-xl uppercase leading-none text-black">
                        Confirme seu e-mail
                    </p>
                </div>

                <div className="flex flex-col gap-5">
                    <p className="text-base leading-relaxed">
                        Enviamos um e-mail de confirmação para{" "}
                        <strong className="break-all">
                            {formData.email}
                        </strong>
                        .
                    </p>

                    <p className="text-sm leading-relaxed text-black/70">
                        Clique no link enviado para confirmar
                        seu endereço de e-mail. Depois da
                        confirmação, sua solicitação de
                        acesso ao atacado será enviada
                        automaticamente para análise.
                    </p>

                    <p className="text-sm leading-relaxed text-black/70">
                        Assim que seu cadastro for aprovado
                        pela Casa Elefante, sua conta terá
                        acesso aos preços e condições de
                        atacado.
                    </p>

                    <Link
                        href="/"
                        className={buttonClassName}
                    >
                        Voltar para a loja
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto flex w-full flex-col gap-6 text-black md:max-w-[50vw]">
            <div className="mb-2">
                <h1 className="font-october text-5xl uppercase leading-none text-black md:text-6xl">
                    Cadastro de atacado
                </h1>

                <p className="mt-3 text-sm text-black/70 md:text-base">
                    Preencha seus dados para solicitar acesso
                    aos preços de atacado da Casa Elefante.
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="name"
                            className={labelClassName}
                        >
                            Seu nome
                        </label>

                        <input
                            id="name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className={inputClassName}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="email"
                            className={labelClassName}
                        >
                            E-mail
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className={inputClassName}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="phone"
                            className={labelClassName}
                        >
                            Telefone / WhatsApp
                        </label>

                        <input
                            id="phone"
                            name="phone"
                            type="tel"
                            autoComplete="tel"
                            required
                            value={formData.phone}
                            onChange={handleChange}
                            className={inputClassName}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="companyName"
                            className={labelClassName}
                        >
                            Nome da loja ou empresa
                        </label>

                        <input
                            id="companyName"
                            name="companyName"
                            type="text"
                            required
                            value={formData.companyName}
                            onChange={handleChange}
                            className={inputClassName}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="document"
                            className={labelClassName}
                        >
                            CPF / CNPJ
                        </label>

                        <input
                            id="document"
                            name="document"
                            type="text"
                            required
                            value={formData.document}
                            onChange={handleChange}
                            className={inputClassName}
                        />
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="flex flex-col gap-2">
                            <label
                                htmlFor="city"
                                className={labelClassName}
                            >
                                Cidade
                            </label>

                            <input
                                id="city"
                                name="city"
                                type="text"
                                autoComplete="address-level2"
                                required
                                value={formData.city}
                                onChange={handleChange}
                                className={inputClassName}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label
                                htmlFor="state"
                                className={labelClassName}
                            >
                                Estado
                            </label>

                            <input
                                id="state"
                                name="state"
                                type="text"
                                placeholder="SP"
                                autoComplete="address-level1"
                                maxLength={2}
                                required
                                value={formData.state}
                                onChange={handleChange}
                                className={inputClassName}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="instagram"
                            className={labelClassName}
                        >
                            Instagram
                        </label>

                        <input
                            id="instagram"
                            name="instagram"
                            type="text"
                            placeholder="@sualoja"
                            value={formData.instagram}
                            onChange={handleChange}
                            className={inputClassName}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="website"
                            className={labelClassName}
                        >
                            Site
                        </label>

                        <input
                            id="website"
                            name="website"
                            type="url"
                            placeholder="https://"
                            value={formData.website}
                            onChange={handleChange}
                            className={inputClassName}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="businessDescription"
                            className={labelClassName}
                        >
                            Conte um pouco sobre sua loja ou atividade
                        </label>

                        <textarea
                            id="businessDescription"
                            name="businessDescription"
                            rows={5}
                            value={formData.businessDescription}
                            onChange={handleChange}
                            className={`${inputClassName} resize-y`}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="password"
                            className={labelClassName}
                        >
                            Senha
                        </label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            minLength={6}
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className={inputClassName}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="confirmPassword"
                            className={labelClassName}
                        >
                            Confirmar senha
                        </label>

                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            minLength={6}
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={inputClassName}
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
                        className={buttonClassName}
                    >
                        {isLoading
                            ? "Enviando..."
                            : "Solicitar acesso"}
                    </button>

                    <div className="mt-2 border-t border-black/20 pt-6">
                        <p className="text-center text-sm text-black/70">
                            Já possui uma conta?
                        </p>

                        <Link
                            href="/login"
                            className={`mt-4 ${buttonClassName}`}
                        >
                            Entrar
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    );
}
