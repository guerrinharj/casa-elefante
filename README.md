# Casa Elefante — Documentação Técnica

## 1. Visão geral

A **Casa Elefante** é uma plataforma de e-commerce desenvolvida para a loja de discos Casa Elefante.

Além das funcionalidades tradicionais de uma loja virtual, o projeto reúne catálogo de discos, vendas para clientes e atacadistas, gerenciamento de estoque, pedidos, pagamentos, frete, newsletter e a plataforma de conteúdo **Toda Terça Tem**, dedicada às apresentações e conteúdos audiovisuais da Casa Elefante.

O sistema foi desenvolvido de forma que grande parte da operação cotidiana possa ser realizada através do próprio painel administrativo, sem necessidade de alteração direta no código.

### Principais funcionalidades

- Catálogo de produtos
- Busca e filtros de produtos
- Controle de estoque
- Produtos em destaque
- Produtos exclusivos para atacado
- Preços específicos para atacadistas
- Carrinho de compras
- Checkout
- Cadastro e autenticação de usuários
- Cadastro e aprovação de atacadistas
- Área do cliente
- Histórico de pedidos
- Painel administrativo
- Gerenciamento de produtos
- Gerenciamento de pedidos
- Gerenciamento de apresentações
- Newsletter
- Integração de pagamentos
- Integração de frete
- Envio de e-mails transacionais
- Plataforma **Toda Terça Tem**
- Reprodução de áudio das apresentações

---

# 2. Stack tecnológica

## Front-end

### Next.js

A aplicação utiliza **Next.js com App Router** como framework principal.

O Next.js é responsável tanto pela interface da loja quanto por partes da lógica executada no servidor.

A estrutura principal da aplicação encontra-se em:

```text
/app
```

Cada diretório dentro de `app` representa uma rota ou um grupo de funcionalidades da aplicação.

Exemplos:

```text
/app
├── page.tsx
├── produtos/
├── carrinho/
├── checkout/
├── login/
├── minha-conta/
├── toda-terca-tem/
├── newsletter/
└── admin/
```

---

## TypeScript

Todo o projeto utiliza **TypeScript**.

Além de melhorar a manutenção do código, isso permite definir explicitamente estruturas importantes utilizadas pelo sistema, como:

```text
Product
Order
Performance
Profile
WholesaleApplication
```

Sempre que um campo novo for adicionado ao banco de dados, é importante verificar se os tipos TypeScript correspondentes também precisam ser atualizados.

---

## Tailwind CSS

A interface utiliza **Tailwind CSS** para estilização.

A maior parte do estilo dos componentes é definida diretamente através das classes Tailwind.

Estilos globais e comportamentos compartilhados pela aplicação podem ser encontrados em:

```text
app/globals.css
```

---

# 3. Backend e banco de dados

## Supabase

O **Supabase** funciona como principal infraestrutura de backend da Casa Elefante.

Ele é utilizado para:

- banco de dados PostgreSQL;
- autenticação;
- gerenciamento de usuários;
- Storage de arquivos e imagens;
- políticas de acesso;
- comunicação entre aplicação e banco.

A aplicação possui clientes Supabase específicos para diferentes contextos.

Por exemplo:

```text
lib/supabase/
```

Pode conter clientes destinados ao browser e ao servidor.

É importante utilizar o cliente correspondente ao ambiente em que o código está sendo executado.

---

# 4. Banco de dados

O banco de dados principal utiliza **PostgreSQL**, administrado através do Supabase.

Entre as principais tabelas da aplicação estão:

```text
products
orders
order_items
performances
subscribers
profiles
wholesale_applications
```

## products

Armazena o catálogo de produtos da loja.

Entre as informações de um produto podem estar:

```text
id
name
slug
artist
description
price
wholesale_price
format
genre
year
label
catalog_number
country
condition
stock
images
is_featured
```

A tabela também pode possuir campos relacionados às regras específicas de venda para atacadistas.

O estoque disponível é controlado através de:

```text
stock
```

Produtos sem estoque não devem estar disponíveis para compra.

---

## orders

Armazena os pedidos realizados através da loja.

Um pedido representa a compra como um todo e contém informações relacionadas ao cliente, endereço, pagamento, frete e status da compra.

---

## order_items

Armazena os produtos pertencentes a cada pedido.

A separação entre `orders` e `order_items` permite que um único pedido possua vários produtos.

A relação conceitual é:

```text
ORDER
  │
  ├── ORDER ITEM
  │      └── PRODUCT
  │
  ├── ORDER ITEM
  │      └── PRODUCT
  │
  └── ORDER ITEM
         └── PRODUCT
```

---

## profiles

Contém informações adicionais relacionadas aos usuários autenticados.

O perfil pode ser utilizado para determinar permissões e características específicas do usuário, incluindo acesso administrativo ou atacadista.

---

## wholesale_applications

Armazena solicitações de cadastro para acesso ao sistema de atacado.

O fluxo geral é:

```text
Usuário solicita cadastro
        ↓
wholesale_applications
        ↓
Administrador analisa
        ↓
Solicitação aprovada
        ↓
Usuário recebe acesso ao atacado
```

---

## performances

Armazena as apresentações utilizadas na plataforma **Toda Terça Tem**.

Entre os campos utilizados estão:

```text
id
name
slug
description
performance_date
location
video_url
audio_url
cover_image
published
```

Uma performance pode possuir conteúdo de áudio, vídeo ou ambos.

A data também permite diferenciar apresentações futuras de apresentações já realizadas.

---

## subscribers

Armazena os usuários cadastrados para receber a newsletter da Casa Elefante.

---

# 5. Arquitetura geral

De forma simplificada, a arquitetura da aplicação funciona da seguinte maneira:

```text
                    USUÁRIO
                       │
                       ▼
                 CASA ELEFANTE
                    Next.js
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
       Supabase     PagBank     Melhor Envio
          │
   ┌──────┼──────┐
   │      │      │
   ▼      ▼      ▼
Database Auth  Storage
```

O Next.js funciona como a camada central da aplicação.

Ele é responsável por apresentar a interface para o usuário e coordenar a comunicação com os demais serviços.

### Supabase

Responsável por:

```text
Banco de dados
Autenticação
Usuários
Storage
Permissões
```

### PagBank

Responsável pelo processamento dos pagamentos realizados através do checkout.

As credenciais utilizadas pela aplicação devem ser armazenadas através de variáveis de ambiente e nunca diretamente no código.

### Melhor Envio

Responsável pelas funcionalidades relacionadas ao cálculo e gerenciamento de frete.

As credenciais também devem permanecer em variáveis de ambiente.

### Resend

Utilizado para o envio de e-mails da aplicação.

Pode ser utilizado para mensagens como:

```text
Confirmação de pedido
Atualizações de compra
Newsletter
Outras comunicações transacionais
```

### Vercel

A aplicação Next.js é hospedada na **Vercel**.

O fluxo de publicação é, de maneira simplificada:

```text
Código
  ↓
Git
  ↓
Vercel
  ↓
Build
  ↓
Deploy
  ↓
Casa Elefante
```

As variáveis de ambiente necessárias para produção também precisam estar configuradas no projeto da Vercel.

---

# 6. Separação de responsabilidades

A arquitetura pode ser entendida através de quatro grandes camadas:

```text
INTERFACE
Next.js + React + Tailwind

        ↓

LÓGICA DA APLICAÇÃO
Server Components
Client Components
API Routes / Server logic

        ↓

DADOS
Supabase
PostgreSQL
Auth
Storage

        ↓

SERVIÇOS EXTERNOS
PagBank
Melhor Envio
Resend
Vercel
```

Essa separação é importante para manutenção do projeto.

Uma alteração visual normalmente acontece na camada de interface.

Uma alteração relacionada a produtos, pedidos ou usuários pode envolver tanto a lógica da aplicação quanto o banco de dados.

Alterações relacionadas a pagamento, frete ou envio de e-mails podem envolver serviços externos e suas respectivas credenciais.