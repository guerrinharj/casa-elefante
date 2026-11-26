# Casa Elefante — AGENTS.md

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL, Auth e Storage)

## Database

- O projeto utiliza um banco Supabase remoto existente.
- Não criar ou configurar novas instâncias locais de PostgreSQL.
- Não inicializar o Supabase local ou containers Docker sem autorização.
- Não substituir as configurações existentes no `.env.local`.
- Preservar o schema, os dados e as políticas RLS existentes.
- Quando uma funcionalidade exigir alterações no banco, gerar a migration SQL correspondente.
- Apresentar o SQL para aprovação manual.
- Nunca executar migrations, INSERT, UPDATE, DELETE ou alterações estruturais no banco remoto sem autorização explícita.
- Nunca executar `supabase db reset` sem autorização.

## Development

- Analisar os arquivos existentes antes de implementar alterações.
- Reutilizar componentes, bibliotecas e funções existentes.
- Preservar funcionalidades não relacionadas à tarefa.
- Executar verificações de TypeScript, lint e build após implementar alterações, sem realizar operações de escrita no banco.

## Security

- Nunca expor credenciais ou chaves privadas.
- Nunca utilizar a service role no frontend.
- Preservar as regras de autenticação e autorização.

## Git

- Não fazer commit, push ou deploy sem autorização explícita.
- Apresentar um resumo dos arquivos modificados e das verificações realizadas.