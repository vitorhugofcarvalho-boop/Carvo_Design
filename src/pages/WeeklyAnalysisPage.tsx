import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save } from 'lucide-react'
import { useLeads } from '@/hooks/useLeads'
import { useWeeklyReport } from '@/hooks/useWeeklyReport'
import type { WeeklyReport } from '@/types'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { calcularMetricas } from '@/utils/dashboard'
import { inicioDaSemana, formatarPorcentagem } from '@/utils/formatting'

export function WeeklyAnalysisPage() {
  const { leads } = useLeads()
  const { reportAtual, reports, salvarReport } = useWeeklyReport()
  const navigate = useNavigate()
  const metricas = calcularMetricas(leads)

  const weekStart = inicioDaSemana()

  const [form, setForm] = useState<WeeklyReport>(
    reportAtual || {
      id: crypto.randomUUID(),
      weekStart,
      leadsCaptados: metricas.totalLeads,
      leadsQualificados: metricas.qualificados,
      dmsEnviadas: metricas.dmsEnviadas,
      respostas: metricas.respostas,
      propostas: metricas.propostasEnviadas,
      fechamentos: metricas.fechados,
      nichosQueResponderam: '',
      mensagemQueGerouResposta: '',
      objecoes: '',
      aprendizado: '',
      criadoEm: Date.now(),
    },
  )

  function salvar() {
    salvarReport({
      ...form,
      leadsCaptados: metricas.totalLeads,
      leadsQualificados: metricas.qualificados,
      dmsEnviadas: metricas.dmsEnviadas,
      respostas: metricas.respostas,
      propostas: metricas.propostasEnviadas,
      fechamentos: metricas.fechados,
      criadoEm: Date.now(),
    })
  }

  return (
    <div>
      <PageHeader
        titulo="Análise semanal"
        subtitulo={`Semana de ${weekStart}`}
        acao={
          <Button onClick={salvar}>
            <Save className="size-4" /> Salvar relatório
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 mb-6">
        <Card>
          <p className="text-xs text-brand-platinum/40">Leads captados</p>
          <p className="text-xl font-bold text-brand-platinum">{metricas.totalLeads}</p>
        </Card>
        <Card>
          <p className="text-xs text-brand-platinum/40">Qualificados</p>
          <p className="text-xl font-bold text-blue-400">{metricas.qualificados}</p>
        </Card>
        <Card>
          <p className="text-xs text-brand-platinum/40">DMs enviadas</p>
          <p className="text-xl font-bold text-amber-400">{metricas.dmsEnviadas}</p>
        </Card>
        <Card>
          <p className="text-xs text-brand-platinum/40">Respostas</p>
          <p className="text-xl font-bold text-violet-400">{metricas.respostas}</p>
        </Card>
        <Card>
          <p className="text-xs text-brand-platinum/40">Propostas</p>
          <p className="text-xl font-bold text-pink-400">{metricas.propostasEnviadas}</p>
        </Card>
        <Card>
          <p className="text-xs text-brand-platinum/40">Fechamentos</p>
          <p className="text-xl font-bold text-green-400">{metricas.fechados}</p>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card>
          <p className="text-xs text-brand-platinum/40">Taxa de resposta</p>
          <p className="text-xl font-bold text-brand-accent">{formatarPorcentagem(metricas.respostas, metricas.dmsEnviadas)}</p>
        </Card>
        <Card>
          <p className="text-xs text-brand-platinum/40">Taxa de conversão</p>
          <p className="text-xl font-bold text-brand-accent">{formatarPorcentagem(metricas.fechados, metricas.propostasEnviadas)}</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-sm font-semibold text-brand-platinum mb-4">Observações da semana</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-brand-platinum/70">Nichos que mais responderam</label>
            <Input
              value={form.nichosQueResponderam}
              onChange={(e) => setForm({ ...form, nichosQueResponderam: e.target.value })}
              placeholder="Ex.: Nutrição, Psicologia, Marketing"
              className="w-full mt-1"
            />
          </div>
          <div>
            <label className="text-sm text-brand-platinum/70">Mensagem que mais gerou resposta</label>
            <Input
              value={form.mensagemQueGerouResposta}
              onChange={(e) => setForm({ ...form, mensagemQueGerouResposta: e.target.value })}
              placeholder="Qual abordagem funcionou melhor?"
              className="w-full mt-1"
            />
          </div>
          <div>
            <label className="text-sm text-brand-platinum/70">Principais objeções percebidas</label>
            <Textarea
              value={form.objecoes}
              onChange={(e) => setForm({ ...form, objecoes: e.target.value })}
              placeholder="O que os leads mais responderam como objeção?"
              rows={2}
              className="w-full mt-1"
            />
          </div>
          <div>
            <label className="text-sm text-brand-platinum/70">Aprendizado da semana</label>
            <Textarea
              value={form.aprendizado}
              onChange={(e) => setForm({ ...form, aprendizado: e.target.value })}
              placeholder="O que você aprendeu essa semana?"
              rows={3}
              className="w-full mt-1"
            />
          </div>
        </div>
      </Card>

      {reports.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-brand-platinum mb-3">Relatórios anteriores</h2>
          <div className="space-y-2">
            {[...reports].reverse().slice(0, 5).map((r) => (
              <Card key={r.id} className="!p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-brand-platinum">Semana de {r.weekStart}</p>
                    <p className="text-xs text-brand-platinum/40">{r.leadsCaptados} leads · {r.fechamentos} fechamentos</p>
                  </div>
                  {r.aprendizado && (
                    <p className="text-xs text-brand-platinum/40 max-w-[300px] truncate">{r.aprendizado}</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
