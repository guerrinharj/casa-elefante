import {
    CadastroForm,
} from "@/components/auth/cadastro-form";

export default function CadastroPage() {
    return (
        <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12">
            <div className="w-full max-w-xl">
                <CadastroForm />
            </div>
        </main>
    );
}