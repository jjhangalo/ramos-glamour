# Ramos Glamour - Monorepo

Este repositório contém a infraestrutura completa da plataforma **Ramos Glamour**, uma solução de e-commerce moderna composta por uma loja virada ao cliente e um painel administrativo robusto.

## 🏗️ Estrutura do Projeto

O projeto está organizado como um monorepo gerido via `npm/pnpm`:

- **`/store`**: Aplicação Next.js para o storefront do cliente. Focada em performance, SEO e experiência de compra fluida.
- **`/admin`**: Painel de administração Next.js para gestão de produtos, categorias, encomendas e clientes.
- **`/supabase`**: Configurações e migrações para o backend servido pelo Supabase.

## 🚀 Tecnologias Utilizadas

### Core
- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Backend-as-a-Service:** [Supabase](https://supabase.com/) (Auth, Database, Storage)

### Store (Cliente)
- **Estado Global:** [Zustand](https://docs.pmnd.rs/zustand/) (Gestão de carrinho)
- **Componentes:** Radix UI & Lucide Icons
- **Feedback:** React Hot Toast

### Admin (Gestão)
- **Formulários:** React Hook Form + Zod
- **Drag & Drop:** [@dnd-kit](https://dnd-kit.com/) para reordenação de imagens
- **Autenticação:** Supabase Auth com SSR

## 🛠️ Como Começar

### Pré-requisitos
- Node.js (versão 18 ou superior)
- pnpm (recomendado) ou npm

### Instalação
1. Clone o repositório.
2. Instale as dependências em todas as aplicações:
   ```bash
   npm run install-all
   ```

### Configuração
Crie ficheiros `.env.local` tanto na pasta `/admin` como na `/store` com as seguintes variáveis:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico (apenas admin)
```

### Execução em Desenvolvimento
Para correr ambas as aplicações simultaneamente:
```bash
npm run dev
```
- **Store:** [http://localhost:3000](http://localhost:3000)
- **Admin:** [http://localhost:3001](http://localhost:3001)

## 📦 Scripts Disponíveis

| Script | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia Store e Admin em simultâneo com `concurrently`. |
| `npm run store` | Inicia apenas a aplicação da loja (porta 3000). |
| `npm run admin` | Inicia apenas o painel administrativo (porta 3001). |
| `npm run install-all` | Instala dependências em ambos os diretórios. |

---

Desenvolvido para **Ramos Glamour**.
