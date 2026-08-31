# Known Issues / Dívida Técnica Observada

Este ficheiro regista inconsistências encontradas durante a revisão do branch `main` em 31/08/2026. Não significa que todas sejam regressões em produção; são divergências verificáveis no repositório que um colaborador deve conhecer antes de alterar o sistema.

## 1. Estado das encomendas está inconsistente entre DB e Admin

**Severidade: Alta**

A migração `supabase/migrations/008_update_order_statuses.sql` define o constraint de `orders.status` com:

```text
pending
confirmed
out_for_delivery
delivered
cancelled
refused
```

Mas o Admin ainda modela estados antigos/diferentes.

### `admin/src/lib/types.ts`

Inclui:

```text
pending
processing
delivering
delivered
delivery_failed
refused
cancelled_by_admin
cancelled_by_customer
```

### `admin/src/lib/constants/orders.ts`

Inclui labels/configuração para:

```text
pending
delivering
delivered
delivery_failed
refused
cancelled_by_admin
cancelled_by_customer
```

### `admin/src/lib/actions/orders.ts`

Ainda possui lógica e notificações baseadas em valores como:

```text
processing
delivering
cancelled_by_admin
cancelled_by_customer
```

Além disso, `migrateLegacyStatuses()` converte alguns estados para `delivering`, apesar de a migração 008 declarar `out_for_delivery` como valor permitido.

### Impacto possível

- update de status rejeitado pelo constraint da base;
- filtros/labels incorretos;
- notificações não emitidas para os novos valores;
- bulk actions inconsistentes;
- tipos TypeScript transmitindo uma falsa garantia de validade.

### Correção recomendada

Escolher uma única state machine e atualizar na mesma alteração:

1. constraint SQL;
2. `OrderRecord["status"]`;
3. constantes e labels;
4. ações unitárias;
5. bulk actions;
6. filtros/pesquisa;
7. notificações email/push;
8. histórico/migração de valores legados.

Não aplicar correções parciais.

---

## 2. `schema.sql` não representa sozinho o schema atual

**Severidade: Média**

O ficheiro `supabase/schema.sql` contém um schema base centrado em produtos/categorias/variantes/promoções/perfis. A aplicação atual também usa `orders`, `order_items`, `addresses`, push subscriptions e campos administrativos introduzidos/evoluídos por migrações.

### Regra para colaboradores

Não use `schema.sql` isoladamente para inferir o modelo atual. Leia as migrações numeradas posteriores.

Uma melhoria futura seria manter um dump/schema consolidado gerado a partir do estado migrado, mantendo as migrações como histórico.

---

## 3. README de raiz estava desatualizado em relação ao projeto

**Severidade: Baixa, impacto alto no onboarding**

O README existente descrevia apenas Store/Admin/Supabase e três variáveis Supabase, embora os `.env.example` atuais incluam VAPID, cron, webhook, WhatsApp, Admin email, site URL e master admin.

A documentação adicionada nesta revisão corrige o onboarding e substitui/expande o README anterior.

---

## 4. Package manager/convenções de execução estão misturados

**Severidade: Baixa**

O repositório é um workspace pnpm (`pnpm-workspace.yaml` + `pnpm-lock.yaml`) e os workflows usam pnpm 10. Entretanto, os scripts de raiz usam internamente `npm run --prefix` e existe `install-all` baseado em npm.

Isso funciona em vários ambientes, mas cria ambiguidade para novos colaboradores.

### Recomendação

Padronizar documentação e CI em pnpm. Numa refatoração futura, os scripts de raiz também podem usar filtros/workspace pnpm para eliminar o caminho duplo.

---

## 5. Cobertura automatizada não está evidente

**Severidade: Média**

Não foi encontrada uma suite de testes convencional na árvore atual durante esta revisão. O projeto possui lint/build em CI, mas módulos de alto risco — checkout, transições de encomendas, promoções e autorização administrativa — beneficiariam de testes automatizados.

### Ordem recomendada para cobertura inicial

1. state machine de encomendas;
2. cálculo de checkout e precedence de preços;
3. permissões das Server Actions administrativas;
4. promoções e expiração;
5. criação/edição de variantes e stock.

---

## 6. Dependency audit não bloqueia o workflow

**Severidade: Informativa**

O workflow `.github/workflows/audit.yml` executa:

```text
pnpm audit --prod --audit-level high
```

mas o step está com `continue-on-error: true`.

Isso significa que vulnerabilidades de nível alto podem ser reportadas sem falhar o job. Pode ser intencional para observabilidade, mas não deve ser interpretado como security gate.

---

## 7. `main` faz deploy de produção

**Severidade: Operacional**

Os workflows de Store e Admin tratam pushes em `main` como production deploy no Vercel.

Para novos colaboradores:

- não usar `main` como branch de experimentação;
- validar lint/build antes de merge;
- compreender que merge/push em `main` tem efeito operacional.
