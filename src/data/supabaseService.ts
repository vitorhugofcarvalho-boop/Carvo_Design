import type { Lead, ChecklistItem, WeeklyReport } from '@/types'
import { store } from './store'
import { supabase } from '@/lib/supabase'

function mapLeadToDB(lead: Lead): Record<string, unknown> {
  return {
    id: lead.id,
    nome: lead.nome,
    perfil_instagram: lead.perfilInstagram,
    link_perfil: lead.linkPerfil,
    nicho: lead.nicho,
    produto_oferta: lead.produtoOferta,
    tipo_oferta: lead.tipoOferta,
    seguidores: lead.seguidores,
    link_oferta: lead.linkOferta,
    sinal_venda_percebido: lead.sinalVendaPercebido,
    problema_visual_percebido: lead.problemaVisualPercebido,
    ponto_positivo: lead.pontoPositivo,
    oportunidade_visual: lead.oportunidadeVisual,
    observacoes: lead.observacoes,
    status: lead.status,
    qualification: lead.qualification,
    nota: lead.nota,
    prioridade: lead.prioridade,
    primeira_abordagem: lead.primeiraAbordagem,
    ultimo_contato: lead.ultimoContato,
    proximo_followup: lead.proximoFollowUp,
    qtd_followups: lead.qtdFollowUps,
    proxima_acao: lead.proximaAcao,
    historico: lead.historico,
    criado_em: lead.criadoEm,
    atualizado_em: lead.atualizadoEm,
  }
}

function mapLeadFromDB(row: Record<string, unknown>): Lead {
  return {
    id: row.id as string,
    nome: row.nome as string,
    perfilInstagram: row.perfil_instagram as string,
    linkPerfil: row.link_perfil as string,
    nicho: row.nicho as string,
    produtoOferta: row.produto_oferta as string,
    tipoOferta: row.tipo_oferta as Lead['tipoOferta'],
    seguidores: row.seguidores as number,
    linkOferta: row.link_oferta as string,
    sinalVendaPercebido: row.sinal_venda_percebido as string,
    problemaVisualPercebido: row.problema_visual_percebido as string,
    pontoPositivo: row.ponto_positivo as string,
    oportunidadeVisual: row.oportunidade_visual as string,
    observacoes: row.observacoes as string,
    status: row.status as Lead['status'],
    qualification: row.qualification as Lead['qualification'],
    nota: row.nota as number,
    prioridade: row.prioridade as Lead['prioridade'],
    primeiraAbordagem: row.primeira_abordagem as number | null,
    ultimoContato: row.ultimo_contato as number | null,
    proximoFollowUp: row.proximo_followup as number | null,
    qtdFollowUps: row.qtd_followups as number,
    proximaAcao: row.proxima_acao as string,
    historico: row.historico as Lead['historico'],
    criadoEm: row.criado_em as number,
    atualizadoEm: row.atualizado_em as number,
  }
}

export const syncService = {
  async syncLeadsToSupabase(): Promise<void> {
    if (!supabase) return
    const leads = store.listarLeads()
    if (leads.length === 0) return

    const { error } = await supabase.from('leads').upsert(
      leads.map(mapLeadToDB),
      { onConflict: 'id' }
    )
    if (error) console.error('[Supabase] sync leads error:', error)
  },

  async pullLeadsFromSupabase(): Promise<void> {
    if (!supabase) return
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('atualizado_em', { ascending: false })

    if (error) {
      console.error('[Supabase] pull leads error:', error)
      return
    }
    if (data && data.length > 0) {
      const leads = data.map(mapLeadFromDB)
      store.salvarLeads(leads)
    }
  },

  async syncLead(lead: Lead): Promise<void> {
    if (!supabase) return
    const { error } = await supabase
      .from('leads')
      .upsert(mapLeadToDB(lead), { onConflict: 'id' })
    if (error) console.error('[Supabase] sync lead error:', error)
  },

  async removeLeadFromSupabase(id: string): Promise<void> {
    if (!supabase) return
    const { error } = await supabase.from('leads').delete().eq('id', id)
    if (error) console.error('[Supabase] delete lead error:', error)
  },

  async syncWeeklyReport(report: WeeklyReport): Promise<void> {
    if (!supabase) return
    const { error } = await supabase
      .from('weekly_reports')
      .upsert({
        id: report.id,
        week_start: report.weekStart,
        leads_captados: report.leadsCaptados,
        leads_qualificados: report.leadsQualificados,
        dms_enviadas: report.dmsEnviadas,
        respostas: report.respostas,
        propostas: report.propostas,
        fechamentos: report.fechamentos,
        nichos_que_responderam: report.nichosQueResponderam,
        mensagem_que_gerou_resposta: report.mensagemQueGerouResposta,
        objecoes: report.objecoes,
        aprendizado: report.aprendizado,
        criado_em: report.criadoEm,
      }, { onConflict: 'id' })
    if (error) console.error('[Supabase] sync weekly report error:', error)
  },

  async pullWeeklyReports(): Promise<void> {
    if (!supabase) return
    const { data, error } = await supabase
      .from('weekly_reports')
      .select('*')
      .order('criado_em', { ascending: false })

    if (error) {
      console.error('[Supabase] pull reports error:', error)
      return
    }
    if (data && data.length > 0) {
      const reports: WeeklyReport[] = data.map((r: Record<string, unknown>) => ({
        id: r.id as string,
        weekStart: r.week_start as string,
        leadsCaptados: r.leads_captados as number,
        leadsQualificados: r.leads_qualificados as number,
        dmsEnviadas: r.dms_enviadas as number,
        respostas: r.respostas as number,
        propostas: r.propostas as number,
        fechamentos: r.fechamentos as number,
        nichosQueResponderam: r.nichos_que_responderam as string,
        mensagemQueGerouResposta: r.mensagem_que_gerou_resposta as string,
        objecoes: r.objecoes as string,
        aprendizado: r.aprendizado as string,
        criadoEm: r.criado_em as number,
      }))
      store.salvarReports(reports)
    }
  },

  async syncAll(): Promise<void> {
    await this.syncLeadsToSupabase()
  },
}
