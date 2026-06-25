import { useState } from 'react'
import type { Lead, TipoOferta } from '@/types'
import { TIPOS_OFERTA } from '@/types'
import { criarLeadPadrao } from '@/types'
import { calcularNota, definirPrioridade } from '@/utils/scoring'
import { Button } from './ui/Button'
import { Input, Select, Textarea } from './ui/Input'
import { QualificationForm } from './QualificationForm'

export function LeadForm({
  inicial,
  onSalvar,
  onCancelar,
}: {
  inicial?: Lead
  onSalvar: (lead: Lead) => void
  onCancelar: () => void
}) {
  const [lead, setLead] = useState<Lead>(() => {
    if (inicial) return { ...inicial }
    return criarLeadPadrao()
  })

  function atualizar(campo: Partial<Lead>) {
    setLead((prev) => ({ ...prev, ...campo, atualizadoEm: Date.now() }))
  }

  const nota = calcularNota(lead.qualification)
  const prioridade = definirPrioridade(nota)

  function submeter(e: React.FormEvent) {
    e.preventDefault()
    if (!lead.nome.trim() || !lead.perfilInstagram.trim()) return
    onSalvar({
      ...lead,
      nota,
      prioridade,
      atualizadoEm: Date.now(),
    })
  }

  return (
    <form onSubmit={submeter} className="flex flex-col gap-5">
      <div className="space-y-4">
        <p className="text-xs text-brand-platinum/50 uppercase tracking-wide font-medium">Dados do lead</p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="block text-sm text-brand-platinum">Nome *</label>
            <Input
              value={lead.nome}
              onChange={(e) => atualizar({ nome: e.target.value })}
              placeholder="Nome completo"
              autoFocus
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm text-brand-platinum">Perfil do Instagram *</label>
            <Input
              value={lead.perfilInstagram}
              onChange={(e) => atualizar({ perfilInstagram: e.target.value.replace('@', '') })}
              placeholder="usuario sem @"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="block text-sm text-brand-platinum">Link do perfil</label>
            <Input
              value={lead.linkPerfil}
              onChange={(e) => atualizar({ linkPerfil: e.target.value })}
              placeholder="https://instagram.com/usuario"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm text-brand-platinum">Seguidores</label>
            <Input
              type="number"
              min="0"
              value={lead.seguidores || ''}
              onChange={(e) => atualizar({ seguidores: Number(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="block text-sm text-brand-platinum">Nicho</label>
            <Input
              value={lead.nicho}
              onChange={(e) => atualizar({ nicho: e.target.value })}
              placeholder="Ex.: Nutrição, Marketing, Psicologia"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm text-brand-platinum">Produto / Oferta</label>
            <Input
              value={lead.produtoOferta}
              onChange={(e) => atualizar({ produtoOferta: e.target.value })}
              placeholder="Ex.: Mentoria para nutricionistas"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="block text-sm text-brand-platinum">Tipo de oferta</label>
            <Select
              value={lead.tipoOferta}
              onChange={(e) => atualizar({ tipoOferta: e.target.value as TipoOferta })}
            >
              {TIPOS_OFERTA.map((t) => (
                <option key={t.valor} value={t.valor}>{t.rotulo}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm text-brand-platinum">Link da oferta</label>
            <Input
              value={lead.linkOferta}
              onChange={(e) => atualizar({ linkOferta: e.target.value })}
              placeholder="URL da página de vendas"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-xs text-brand-platinum/50 uppercase tracking-wide font-medium">Percepções</p>

        <div className="space-y-1.5">
          <label className="block text-sm text-brand-platinum">Sinal de venda percebido</label>
          <Textarea
            value={lead.sinalVendaPercebido}
            onChange={(e) => atualizar({ sinalVendaPercebido: e.target.value })}
            placeholder="O que indica que ele vende? Link na bio, Stories de vendas, depoimentos..."
            rows={2}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="block text-sm text-brand-platinum">Problema visual percebido</label>
            <Textarea
              value={lead.problemaVisualPercebido}
              onChange={(e) => atualizar({ problemaVisualPercebido: e.target.value })}
              placeholder="O que está fraco visualmente?"
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm text-brand-platinum">Ponto positivo do perfil</label>
            <Textarea
              value={lead.pontoPositivo}
              onChange={(e) => atualizar({ pontoPositivo: e.target.value })}
              placeholder="O que já funciona bem?"
              rows={2}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm text-brand-platinum">Oportunidade visual</label>
          <Textarea
            value={lead.oportunidadeVisual}
            onChange={(e) => atualizar({ oportunidadeVisual: e.target.value })}
            placeholder="O que você poderia fazer por ele?"
            rows={2}
          />
        </div>
      </div>

      <QualificationForm
        value={lead.qualification}
        onChange={(q) => setLead((prev) => ({ ...prev, qualification: q }))}
      />

      <div className="space-y-4">
        <p className="text-xs text-brand-platinum/50 uppercase tracking-wide font-medium">Acompanhamento</p>

        <div className="space-y-1.5">
          <label className="block text-sm text-brand-platinum">Próxima ação</label>
          <Input
            value={lead.proximaAcao}
            onChange={(e) => atualizar({ proximaAcao: e.target.value })}
            placeholder="Ex.: Enviar portfólio, marcar call..."
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm text-brand-platinum">Observações</label>
          <Textarea
            value={lead.observacoes}
            onChange={(e) => atualizar({ observacoes: e.target.value })}
            placeholder="Anotações adicionais sobre o lead"
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-brand-deep-hover">
        <Button type="button" variante="secundario" onClick={onCancelar}>Cancelar</Button>
        <Button type="submit">Salvar lead</Button>
      </div>
    </form>
  )
}
