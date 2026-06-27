# Auditoria ProspectOS — Referência para Extensão Chrome

## Stack
- React 19 + Vite 8 + TypeScript + React Router 7
- Tailwind CSS v4 (`@tailwindcss/vite`)
- Supabase JS SDK v2 (`@supabase/supabase-js`)
- oxlint + TypeScript strict

## Rotas (`src/App.tsx`)
```
/login              → público
/                   → Dashboard (protegido)
/leads              → Lista + Modal Novo/Editar
/leads/:id          → Detalhe + Edição inline
/pipeline
/followups
/rotina             → Checklist diário
/templates
/analise
/configuracoes
```

## Lead — Tipo e Campos (`src/types/index.ts:170-197`)
```ts
interface Lead {
  id, nome, perfilInstagram, linkPerfil, nicho, produtoOferta,
  tipoOferta: 'mentoria'|'curso'|'formacao'|'consultoria'|'comunidade'|'workshop'|'imersao'|'outro',
  seguidores, linkOferta,
  sinalVendaPercebido, problemaVisualPercebido, pontoPositivo, oportunidadeVisual, observacoes,
  status: LeadStatus (13 valores),
  qualification: QualificationCriteria,
  nota: number (0-10),
  prioridade: 'baixa'|'media'|'alta'|'prioridade_maxima',
  primeiraAbordagem, ultimoContato, proximoFollowUp: number|null,
  qtdFollowUps, historico: ContactRecord[],
  criadoEm, atualizadoEm, proximaAcao
}
```
Factory: `criarLeadPadrao()` (linha 199-234)

## Qualificação (`src/types/index.ts:155-161`, `src/utils/scoring.ts`)
```ts
QualificationCriteria = {
  temProdutoClaro, temCtaVenda, temAudienciaAtiva,
  visualPoderiaMelhorar, consigoAjudar  // cada 0|1|2
}
```
- `calcularNota()` = soma (0-10)
- `definirPrioridade()`: ≥9 máxima, ≥7 alta, ≥5 média, <5 baixa
- Labels/opções em `scoring.ts:20-31`

## Formulários
- `src/components/LeadForm.tsx` — formulário completo (usa `QualificationForm`)
- `src/components/QualificationForm.tsx` — UI botões 0/1/2 por critério
- `src/pages/LeadsPage.tsx:125-146` — modal Novo/Editar
- `src/pages/LeadDetailPage.tsx:286-288` — edição inline

## Persistência / Supabase
- **localStorage** (via `src/data/store.ts`) — fonte primária reativa
- **Supabase** — sync bidirecional (`src/data/supabaseService.ts`)
  - `syncService.syncLead(lead)` → upsert `leads` (onConflict: id)
  - `syncService.pullLeadsFromSupabase()` → pull + `store.salvarLeads()`
- Tabela: `supabase/schema.sql:5-32` (`leads` com 32 colunas, índices, RLS "allow all")
- Hook: `src/hooks/useLeads.ts` — `putLead`/`removeLead`/`getLead` disparam sync

## Autenticação (`src/lib/auth.tsx`)
- Supabase Auth (Email/Password)
- `AuthProvider` + `useAuth()` context
- Sessão em localStorage (padrão SDK)
- `ProtectedRoute` protege rotas privadas

## Deploy Vercel (`vercel.json`)
```json
{ "framework": "vite", "buildCommand": "npm run build", "outputDirectory": "dist", "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

## Scripts (`package.json`)
```json
"dev": "vite", "build": "tsc -b && vite build", "lint": "oxlint", "preview": "vite preview"
```

## Ponto de Integração para Extensão
**Importação via JSON** → `src/pages/LeadsPage.tsx` (header do modal Novo lead)
- Adicionar botão "Importar JSON"
- Modal com `<textarea>` → `JSON.parse` → merge com `criarLeadPadrao()` → `calcularNota/definirPrioridade` → `putLead(lead)` via `useLeads()`

## Cores / Identidade (do CSS/Tailwind)
- Fundo: `#0C0C14` (`brand-deep`)
- Cards: `#1A1A2E` (`brand-base`)
- Primária: `#FF5C00` (`brand-primary`)
- Acento: `#FFCC00` (`brand-accent`)
- Texto: `#F0EDE6` (`brand-platinum`)

## Arquivos-chave
| Arquivo | Uso |
|---------|-----|
| `src/types/index.ts` | Tipos centrais, enums, factory |
| `src/components/LeadForm.tsx` | Formulário lead |
| `src/components/QualificationForm.tsx` | UI qualificação |
| `src/utils/scoring.ts` | Nota/prioridade |
| `src/data/supabaseService.ts` | Sync Supabase |
| `src/hooks/useLeads.ts` | CRUD reativo |
| `src/pages/LeadsPage.tsx` | Lista + modal importação |
| `src/lib/auth.tsx` | Auth context |
| `supabase/schema.sql` | Schema DB |