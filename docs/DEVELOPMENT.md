# Guia de Desenvolvimento — Ramos Glamour

Objetivo: permitir que um novo colaborador clone o repositório, compreenda as responsabilidades de cada aplicação e comece a trabalhar sem depender de contexto oral.

## 1. Requisitos

Recomendado:

- Node.js 20+
- pnpm 10
- Git
- acesso ao projeto Supabase usado pela equipa
- acesso aos projetos Vercel apenas se for trabalhar com deploy/configuração

Os workflows de deploy usam Node 20. O workflow de auditoria usa Node 24.

## 2. Setup inicial

```bash
git clone <repo-url>
cd ramos-glamour
pnpm install
```

O workspace instala dependências para:

```text
admin/
store/
```

## 3. Ambiente

Crie os ficheiros abaixo a partir dos exemplos:

```text
admin/.env.local
store/.env.local
```

Nunca versione `.env.local`.

### Store

| Variável | Tipo | Uso |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Pública | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Pública | Chave anon do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Segredo | Operações privilegiadas no servidor |
| `NEXT_PUBLIC_SITE_URL` | Pública | URL canónica da Store |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Pública | Canal WhatsApp da loja |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Pública | Web Push |
| `VAPID_PRIVATE_KEY` | Segredo | Assinatura Web Push |
| `CRON_SECRET` | Segredo | Proteção de cron quando aplicável |

### Admin

| Variável | Tipo | Uso |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Pública | URL do Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Pública | Chave anon |
| `SUPABASE_SERVICE_ROLE_KEY` | Segredo | Operações administrativas |
| `CRON_SECRET` | Segredo | Cron de promoções |
| `WEBHOOK_SECRET` | Segredo | Webhook administrativo |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Pública | Contacto WhatsApp |
| `ADMIN_EMAIL` | Servidor | Email operacional |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Pública | Web Push |
| `VAPID_PRIVATE_KEY` | Segredo | Web Push |
| `NEXT_PUBLIC_SITE_URL` | Pública | URL do Admin/site associada |
| `MASTER_ADMIN_ID` | Servidor | Identificação do administrador principal |

Regra: o prefixo `NEXT_PUBLIC_` significa que o valor pode ser enviado para o browser. Nunca renomeie um segredo para esse prefixo.

## 4. Desenvolvimento local

Ambas as aplicações:

```bash
pnpm dev
```

- Store: porta 3000
- Admin: porta 3001

Separadamente:

```bash
pnpm store
pnpm admin
```

## 5. Verificação antes de entregar código

No mínimo, execute no package alterado:

```bash
pnpm --dir store lint
pnpm --dir store build
```

ou:

```bash
pnpm --dir admin lint
pnpm --dir admin build
```

Não existe uma suite de testes convencional claramente presente na árvore atual. Portanto, lint/build e validação funcional manual têm importância maior até haver cobertura automatizada.

## 6. Onde colocar código

### Nova página/rota

Use `src/app/` da aplicação correspondente.

### Componente de domínio

Use:

```text
src/components/<dominio>/
```

Exemplos existentes:

```text
components/orders/
components/products/
components/profile/
components/clients/
```

### Operação com dados

Preferir:

```text
src/lib/actions/<dominio>.ts
```

As regras críticas devem ficar no servidor.

### Validação do Admin

Schemas de formulário ficam em:

```text
admin/src/lib/validations/
```

### Supabase

Use o helper adequado:

```text
client.ts   -> browser
server.ts   -> SSR/session-aware
admin.ts    -> privilégios elevados
```

Não importe `admin.ts` num Client Component.

## 7. Alterações de base de dados

O repositório contém:

```text
supabase/schema.sql
supabase/migrations/*.sql
```

Ao alterar schema:

1. Não edite apenas o TypeScript.
2. Crie uma nova migração SQL numerada.
3. Atualize os types/queries afetados na mesma mudança.
4. Verifique Store e Admin, porque ambos partilham a mesma base.
5. Documente mudanças incompatíveis.

O `schema.sql` é base histórica; as migrações posteriores também são necessárias para compreender o estado real.

## 8. Fluxos que exigem cuidado

### Checkout

Não aceitar preço vindo do browser. O código atual reobtém produto/variante e recalcula o total no servidor. Preserve esta propriedade.

### Service role

`SUPABASE_SERVICE_ROLE_KEY` ignora várias proteções normais do lado do cliente. Antes de usar `createAdminClient`, valide explicitamente a identidade/permissão que autorizou a operação.

### Encomendas

Leia `KNOWN_ISSUES.md` antes de alterar status, filtros ou notificações. O schema e os types não estão atualmente alinhados.

### Push/PWA

Mudanças em `sw.ts`, Serwist, VAPID ou subscriptions precisam ser verificadas em browser já instalado e sessão limpa. Service Workers podem continuar ativos após deploy.

## 9. Fluxo de Git/CI

O repositório possui pipelines separados por aplicação.

Alterações em `store/**` disparam o workflow da Store; alterações em `admin/**` disparam o workflow do Admin.

Comportamento atual:

- Pull request: lint, sem deploy.
- Push para branch não-`main`: lint + preview Vercel.
- Push para `main`: lint + produção Vercel.
- Gitleaks: push e PR.
- Dependency audit: mudanças de dependências e execução semanal.

Isto significa que **push para `main` é uma ação de produção** no estado atual dos workflows.

## 10. Checklist para Pull Request

Antes de pedir revisão:

- [ ] O código está no package correto (`store` ou `admin`).
- [ ] Regras de negócio sensíveis estão no servidor.
- [ ] Nenhum segredo foi adicionado ao código/repositório.
- [ ] Nova variável está também no `.env.example` correto.
- [ ] Mudança de DB tem migração.
- [ ] Types e constraints estão alinhados.
- [ ] Lint passa.
- [ ] Build passa.
- [ ] Fluxo principal foi validado manualmente.
- [ ] Alteração de UI foi verificada em desktop e mobile quando aplicável.
- [ ] Alteração de encomendas considerou notificações e estados terminais.

## 11. Diagnóstico rápido

### Store inicia mas dados não carregam

Verifique primeiro `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### Operação administrativa falha

Verifique sessão, role/permissão e presença de `SUPABASE_SERVICE_ROLE_KEY` apenas no servidor.

### Push não funciona

Verifique par VAPID, permissão do browser, subscription guardada e Service Worker ativo.

### Deploy não ocorre

Verifique se o path alterado corresponde ao workflow (`store/**` ou `admin/**`) e se o job de lint passou.

### Estado de encomenda rejeitado pelo banco

Consulte `KNOWN_ISSUES.md`: o constraint da migração 008 e os valores TypeScript não estão atualmente sincronizados.
