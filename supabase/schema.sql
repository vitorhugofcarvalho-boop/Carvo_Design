-- ProspectOS Database Schema
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql/new)

-- 1. LEADS
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  nome text not null default '',
  perfil_instagram text not null default '',
  link_perfil text not null default '',
  nicho text not null default '',
  produto_oferta text not null default '',
  tipo_oferta text not null default 'outro',
  seguidores integer not null default 0,
  link_oferta text not null default '',
  sinal_venda_percebido text not null default '',
  problema_visual_percebido text not null default '',
  ponto_positivo text not null default '',
  oportunidade_visual text not null default '',
  observacoes text not null default '',
  status text not null default 'captado',
  qualification jsonb not null default '{"temProdutoClaro":0,"temCtaVenda":0,"temAudienciaAtiva":0,"visualPoderiaMelhorar":0,"consigoAjudar":0}',
  nota integer not null default 0,
  prioridade text not null default 'baixa',
  primeira_abordagem bigint,
  ultimo_contato bigint,
  proximo_followup bigint,
  qtd_followups integer not null default 0,
  proxima_acao text not null default '',
  historico jsonb not null default '[]',
  fonte text not null default '',
  criado_em bigint not null default extract(epoch from now()) * 1000,
  atualizado_em bigint not null default extract(epoch from now()) * 1000
);

-- Index for faster queries by status
create index if not exists leads_status_idx on leads (status);
create index if not exists leads_prioridade_idx on leads (prioridade);
create index if not exists leads_atualizado_em_idx on leads (atualizado_em desc);

-- 2. CHECKLIST ITEMS (daily template)
create table if not exists checklist_items (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  done boolean not null default false,
  data date not null default current_date,
  ordem integer not null default 0,
  criado_em bigint not null default extract(epoch from now()) * 1000
);

-- 3. DAILY LEARNING
create table if not exists daily_learnings (
  id uuid primary key default gen_random_uuid(),
  data date not null default current_date,
  texto text not null default '',
  criado_em bigint not null default extract(epoch from now()) * 1000
);

create unique index if not exists daily_learnings_data_idx on daily_learnings (data);

-- 4. WEEKLY REPORTS
create table if not exists weekly_reports (
  id uuid primary key default gen_random_uuid(),
  week_start text not null,
  leads_captados integer not null default 0,
  leads_qualificados integer not null default 0,
  dms_enviadas integer not null default 0,
  respostas integer not null default 0,
  propostas integer not null default 0,
  fechamentos integer not null default 0,
  nichos_que_responderam text not null default '',
  mensagem_que_gerou_resposta text not null default '',
  objecoes text not null default '',
  aprendizado text not null default '',
  criado_em bigint not null default extract(epoch from now()) * 1000
);

create unique index if not exists weekly_reports_week_start_idx on weekly_reports (week_start);

-- Enable Row Level Security (optional, disabled by default for MVP)
alter table leads enable row level security;
alter table checklist_items enable row level security;
alter table daily_learnings enable row level security;
alter table weekly_reports enable row level security;

-- For MVP: allow all operations with anon key
-- In production, replace with proper auth policies
create policy "Allow all on leads" on leads for all using (true) with check (true);
create policy "Allow all on checklist_items" on checklist_items for all using (true) with check (true);
create policy "Allow all on daily_learnings" on daily_learnings for all using (true) with check (true);
create policy "Allow all on weekly_reports" on weekly_reports for all using (true) with check (true);
